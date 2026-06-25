const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const FormProgress = require('../models/formmodel');

// @desc    Initiate payment (Get amount and details)
// @route   POST /api/payment/create
// @access  Private
router.post('/create', protect, async (req, res) => {
  try {
    let form = await FormProgress.findOne({ userId: req.user._id });
    if (!form) {
      form = await FormProgress.create({ userId: req.user._id, currentStage: 3 });
    }
    
    res.status(200).json({
      success: true,
      amount: 110.00,
      currency: 'INR'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Save successful payment details to DB
// @route   POST /api/payment/success
// @access  Private
router.post('/success', protect, async (req, res) => {
  try {
    const { upiId, transactionId } = req.body;
    
    let form = await FormProgress.findOne({ userId: req.user._id });
    if (!form) {
      return res.status(404).json({ success: false, message: 'Application draft not found' });
    }

    // Save payment details to Mongoose Model
    form.paymentDetails = {
      paymentMethod: 'UPI / Google Pay',
      amount: 110.00,
      currency: 'INR',
      status: 'Paid',
      transactionId: transactionId || `gpay_mock_${Date.now()}`,
      dateTime: new Date().toISOString()
    };
    
    // Move to next stage and mark form as complete
    form.currentStage = 4;
    form.isComplete = true;
    
    await form.save();

    res.status(200).json({
      success: true,
      message: 'Payment saved successfully',
      data: form
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
