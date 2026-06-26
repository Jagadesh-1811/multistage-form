const FormProgress = require('../models/formmodel');
const path = require('path');

// Helper to generate S3 view URLs dynamically by calling your Lambda URL from .env
const getPresignedViewUrl = async (s3Key) => {
  try {
    if (!process.env.LAMBDA_PRESIGN_URL) return '';
    
    const lambdaResponse = await fetch(process.env.LAMBDA_PRESIGN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'view',
        s3_key: s3Key
      })
    });

    if (!lambdaResponse.ok) return '';
    const result = await lambdaResponse.json();

    // Parse stringified body wrapper if present (API Gateway Proxy Integration)
    let parsedBody = result;
    if (result.body && typeof result.body === 'string') {
      try {
        parsedBody = JSON.parse(result.body);
      } catch (err) {}
    }

    return parsedBody.presigned_url || parsedBody.view_url || result.presigned_url || '';
  } catch (error) {
    console.error('Error generating view URL:', error);
    return '';
  }
};

// @desc    Get or create active user's form progress
// @route   GET /api/application/session
// @access  Private
const getSession = async (req, res) => {
  try {
    let progress = await FormProgress.findOne({ userId: req.user.id });

    if (!progress) {
      progress = await FormProgress.create({
        userId: req.user.id,
        currentStage: 1,
      });
    }

    const progressObj = progress.toObject();

    // Dynamically inject temporary view URLs for S3 files if they exist
    if (progressObj.personalInfo?.govtIdFile?.s3Key) {
      progressObj.personalInfo.govtIdFile.viewUrl = await getPresignedViewUrl(
        progressObj.personalInfo.govtIdFile.s3Key
      );
    }
    if (progressObj.educationalDetails?.certificateFile?.s3Key) {
      progressObj.educationalDetails.certificateFile.viewUrl = await getPresignedViewUrl(
        progressObj.educationalDetails.certificateFile.s3Key
      );
    }

    res.status(200).json({ success: true, data: progressObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get S3 presigned PUT URL from AWS Lambda
// @route   POST /api/application/presign-upload
// @access  Private
const getPresignedUploadUrl = async (req, res) => {
  try {
    const { fileName, fileType, documentType } = req.body;

    if (!fileName || !fileType || !documentType) {
      return res.status(400).json({ success: false, message: 'Missing: fileName, fileType, documentType' });
    }

    const allowedDocTypes = {
      govtId: 'govt_id',
      certificate: 'certificate'
    };

    const mappedDocType = allowedDocTypes[documentType];
    if (!mappedDocType) {
      return res.status(400).json({ success: false, message: 'Invalid document type' });
    }

    if (!process.env.LAMBDA_PRESIGN_URL) {
      return res.status(500).json({ success: false, message: 'LAMBDA_PRESIGN_URL is not configured in .env' });
    }

    // Generate unique name to prevent collisions: <userId>-<timestamp>-<name>
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e4);
    const fileExtension = path.extname(fileName);
    const baseName = path.basename(fileName, fileExtension).replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueFileName = `${req.user.id}-${uniqueSuffix}${fileExtension}`;

    // Query your AWS Lambda for the presigned URL
    const lambdaResponse = await fetch(process.env.LAMBDA_PRESIGN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_name: uniqueFileName,
        file_type: fileType,
        document_type: mappedDocType
      })
    });

    const result = await lambdaResponse.json();

    if (!lambdaResponse.ok) {
      return res.status(lambdaResponse.status).json({
        success: false,
        message: result.error || 'Failed to generate presigned URL from Lambda'
      });
    }

    // Parse stringified body wrapper if present (API Gateway Proxy Integration)
    let parsedBody = result;
    if (result.body && typeof result.body === 'string') {
      try {
        parsedBody = JSON.parse(result.body);
      } catch (err) {}
    }

    const presignedUrl = parsedBody.presigned_url || result.presigned_url;
    if (!presignedUrl) {
      return res.status(500).json({
        success: false,
        message: 'No presigned URL returned from Lambda'
      });
    }

    // Map folders to match Lambda FOLDERS:
    // const FOLDERS = { govt_id: "documents/govt-ids", certificate: "documents/certificates" };
    const folder = mappedDocType === 'govt_id' ? 'documents/govt-ids' : 'documents/certificates';
    const s3Key = `${folder}/${uniqueFileName}`;

    res.status(200).json({
      success: true,
      data: {
        presignedUrl,
        s3Key: s3Key
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save Stage 1: Personal Details & Govt ID Reference
// @route   POST /api/application/stage1
// @access  Private
const saveStage1 = async (req, res) => {
  try {
    const { name, email, phone, dob, address, govtIdFile } = req.body;
    let progress = await FormProgress.findOne({ userId: req.user.id });

    if (!progress) {
      progress = new FormProgress({ userId: req.user.id });
    }

    const personalInfo = {
      name,
      email,
      phone,
      dob,
      address,
    };

    // Store S3 keys
    if (govtIdFile && govtIdFile.s3Key) {
      personalInfo.govtIdFile = {
        s3Key: govtIdFile.s3Key,
        originalName: govtIdFile.originalName,
        size: govtIdFile.size,
      };
    } else if (progress.personalInfo?.govtIdFile?.s3Key) {
      // Keep existing
      personalInfo.govtIdFile = progress.personalInfo.govtIdFile;
    } else {
      return res.status(400).json({ success: false, message: 'Government ID document is required' });
    }

    progress.personalInfo = personalInfo;
    if (progress.currentStage === 1) {
      progress.currentStage = 2;
    }

    await progress.save();
    
    // Return with viewUrl
    const progressObj = progress.toObject();
    if (progressObj.personalInfo?.govtIdFile?.s3Key) {
      progressObj.personalInfo.govtIdFile.viewUrl = await getPresignedViewUrl(progressObj.personalInfo.govtIdFile.s3Key);
    }

    res.status(200).json({ success: true, data: progressObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save Stage 2: Educational Details & Certificate Reference
// @route   POST /api/application/stage2
// @access  Private
const saveStage2 = async (req, res) => {
  try {
    const { qualification, institution, course, year, grade, certificateFile } = req.body;
    let progress = await FormProgress.findOne({ userId: req.user.id });

    if (!progress) {
      return res.status(400).json({ success: false, message: 'Application session not found' });
    }

    const educationalDetails = {
      qualification,
      institution,
      course,
      year,
      grade,
    };

    // Store S3 keys
    if (certificateFile && certificateFile.s3Key) {
      educationalDetails.certificateFile = {
        s3Key: certificateFile.s3Key,
        originalName: certificateFile.originalName,
        size: certificateFile.size,
      };
    } else if (progress.educationalDetails?.certificateFile?.s3Key) {
      // Keep existing
      educationalDetails.certificateFile = progress.educationalDetails.certificateFile;
    } else {
      return res.status(400).json({ success: false, message: 'Educational certificate document is required' });
    }

    progress.educationalDetails = educationalDetails;
    if (progress.currentStage === 2) {
      progress.currentStage = 3;
    }

    await progress.save();

    // Return with viewUrl
    const progressObj = progress.toObject();
    if (progressObj.educationalDetails?.certificateFile?.s3Key) {
      progressObj.educationalDetails.certificateFile.viewUrl = await getPresignedViewUrl(progressObj.educationalDetails.certificateFile.s3Key);
    }

    res.status(200).json({ success: true, data: progressObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get summary of application for confirmation
// @route   GET /api/application/summary
// @access  Private
const getSummary = async (req, res) => {
  try {
    const progress = await FormProgress.findOne({ userId: req.user.id });
    if (!progress) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const progressObj = progress.toObject();
    if (progressObj.personalInfo?.govtIdFile?.s3Key) {
      progressObj.personalInfo.govtIdFile.viewUrl = await getPresignedViewUrl(progressObj.personalInfo.govtIdFile.s3Key);
    }
    if (progressObj.educationalDetails?.certificateFile?.s3Key) {
      progressObj.educationalDetails.certificateFile.viewUrl = await getPresignedViewUrl(progressObj.educationalDetails.certificateFile.s3Key);
    }

    res.status(200).json({ success: true, data: progressObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset/clear form progress draft
// @route   POST /api/application/reset
// @access  Private
const resetSession = async (req, res) => {
  try {
    await FormProgress.findOneAndDelete({ userId: req.user.id });
    res.status(200).json({ success: true, message: 'Application session reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSession,
  getPresignedUploadUrl,
  saveStage1,
  saveStage2,
  getSummary,
  resetSession,
};
