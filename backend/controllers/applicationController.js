const FormProgress = require('../models/formmodel');

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

    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save Stage 1: Personal Details & Govt ID
// @route   POST /api/application/stage1
// @access  Private
const saveStage1 = async (req, res) => {
  try {
    const { name, email, phone, dob, address } = req.body;
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

    // If a new file is uploaded
    if (req.file) {
      personalInfo.govtIdFile = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: `/uploads/${req.file.filename}`,
        size: req.file.size,
      };
    } else if (req.body.govtIdDeleted === 'true') {
      // User explicitly deleted the file and did not upload a new one
      return res.status(400).json({ success: false, message: 'Government ID document is required' });
    } else if (progress.personalInfo?.govtIdFile?.filename) {
      // Keep existing file if no new file is uploaded
      const file = progress.personalInfo.govtIdFile;
      personalInfo.govtIdFile = {
        filename: file.filename,
        originalName: file.originalName,
        path: file.path,
        size: file.size,
      };
    } else {
      return res.status(400).json({ success: false, message: 'Government ID document is required' });
    }

    progress.personalInfo = personalInfo;
    // Update stage if currently on stage 1
    if (progress.currentStage === 1) {
      progress.currentStage = 2;
    }

    await progress.save();
    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save Stage 2: Educational Details & Certificate
// @route   POST /api/application/stage2
// @access  Private
const saveStage2 = async (req, res) => {
  try {
    const { qualification, institution, course, year, grade } = req.body;
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

    // If a new file is uploaded
    if (req.file) {
      educationalDetails.certificateFile = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: `/uploads/${req.file.filename}`,
        size: req.file.size,
      };
    } else if (req.body.certificateDeleted === 'true') {
      // User explicitly deleted the file and did not upload a new one
      return res.status(400).json({ success: false, message: 'Educational certificate document is required' });
    } else if (progress.educationalDetails?.certificateFile?.filename) {
      // Keep existing file if no new file is uploaded
      const file = progress.educationalDetails.certificateFile;
      educationalDetails.certificateFile = {
        filename: file.filename,
        originalName: file.originalName,
        path: file.path,
        size: file.size,
      };
    } else {
      return res.status(400).json({ success: false, message: 'Educational certificate document is required' });
    }

    progress.educationalDetails = educationalDetails;
    progress.isComplete = true; // Mark completed as Stage 2 is the final stage

    await progress.save();
    res.status(200).json({ success: true, data: progress });
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
    res.status(200).json({ success: true, data: progress });
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
  saveStage1,
  saveStage2,
  getSummary,
  resetSession,
};
