const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const FormProgress = require('../models/formmodel');

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
      currency: 'USD',
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

    // Set payment details
    progress.paymentDetails = {
      amount: 110.00,
      currency: 'USD',
      status: 'Success',
      transactionId: transactionId || 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      paymentMethod: paymentMethod || 'Google Pay',
      dateTime: new Date()
    };

    // Mark application as fully complete
    progress.isComplete = true;

    await progress.save();

    res.status(200).json({
      success: true,
      data: progress,
      message: 'Payment processed and saved successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
