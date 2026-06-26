const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const FormProgress = require('../models/formmodel');
const supabase = require('../config/supabase');
const User = require('../models/User');

const router = express.Router();

// @desc    Initiate payment (get amount details)
// @route   POST /api/payment/create
// @access  Private
router.post('/create', protect, async (req, res) => {
  try {
    const progress = await FormProgress.findOne({ userId: req.user.id });
    if (!progress) {
      return res.status(400).json({ success: false, message: 'Application session not found' });
    }

    res.status(200).json({
      success: true,
      amount: 110.00,
      currency: 'INR',
      message: 'Payment intent created successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Confirm successful payment
// @route   POST /api/payment/success
// @access  Private
router.post('/success', protect, async (req, res) => {
  try {
    const { paymentMethod, transactionId } = req.body;
    const progress = await FormProgress.findOne({ userId: req.user.id });

    if (!progress) {
      return res.status(400).json({ success: false, message: 'Application session not found' });
    }

    // Set stage details only
    progress.isComplete = true;
    progress.currentStage = 4;
    
    // Explicitly clear payment details from MongoDB if any exists
    progress.paymentDetails = undefined;

    await progress.save();

    // Prepare payment details for Supabase
    const paymentDetails = {
      amount: 110.00,
      currency: 'INR',
      status: 'Success',
      transactionId: transactionId || 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      paymentMethod: paymentMethod || 'Google Pay',
      dateTime: new Date()
    };

    // Store complete details in Supabase
    try {
      const user = await User.findById(req.user.id);
      const email = user ? user.email : (progress.personalInfo?.email || '');
      const name = user ? user.name : (progress.personalInfo?.name || '');

      const { data, error } = await supabase
        .from('applications')
        .insert([
          {
            user_id: req.user.id.toString(),
            name: name,
            email: email,
            phone: progress.personalInfo?.phone || '',
            dob: progress.personalInfo?.dob || '',
            address: progress.personalInfo?.address || '',
            govt_id_filename: progress.personalInfo?.govtIdFile?.filename || '',
            govt_id_path: progress.personalInfo?.govtIdFile?.path || '',
            qualification: progress.educationalDetails?.qualification || '',
            institution: progress.educationalDetails?.institution || '',
            course: progress.educationalDetails?.course || '',
            year: progress.educationalDetails?.year || '',
            grade: progress.educationalDetails?.grade || '',
            certificate_filename: progress.educationalDetails?.certificateFile?.filename || '',
            certificate_path: progress.educationalDetails?.certificateFile?.path || '',
            amount: paymentDetails.amount,
            currency: paymentDetails.currency,
            payment_status: paymentDetails.status,
            transaction_id: paymentDetails.transactionId,
            payment_method: paymentDetails.paymentMethod,
            payment_date_time: paymentDetails.dateTime
          }
        ])
        .select();

      if (error) {
        console.error('Error inserting complete details into Supabase (applications table):', error);
      } else {
        console.log('Successfully saved complete details to Supabase:', data);
      }
    } catch (supabaseErr) {
      console.error('Failed to store complete details in Supabase:', supabaseErr);
    }

    res.status(200).json({
      success: true,
      data: progress,
      message: 'Payment processed and saved successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Handle failed payment
// @route   POST /api/payment/failure
// @access  Private
router.post('/failure', protect, async (req, res) => {
  try {
    const progress = await FormProgress.findOne({ userId: req.user.id });

    if (!progress) {
      return res.status(400).json({ success: false, message: 'Application session not found' });
    }

    // Ensure application is not complete and remains in stage 3
    progress.isComplete = false;
    progress.currentStage = 3;
    
    // Explicitly clear payment details from MongoDB if any exists
    progress.paymentDetails = undefined;

    await progress.save();

    res.status(200).json({
      success: true,
      data: progress,
      message: 'Payment failure recorded successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
