const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getSession,
  getPresignedUploadUrl,
  saveStage1,
  saveStage2,
  getSummary,
  resetSession,
} = require('../controllers/applicationController');

const router = express.Router();

router.get('/session', protect, getSession);
router.post('/presign-upload', protect, getPresignedUploadUrl);
router.post('/stage1', protect, saveStage1);
router.post('/stage2', protect, saveStage2);
router.get('/summary', protect, getSummary);
router.post('/reset', protect, resetSession);

module.exports = router;
