const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const {
  getSession,
  saveStage1,
  saveStage2,
  getSummary,
  resetSession,
} = require('../controllers/applicationController');

const router = express.Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (JPEG/JPG/PNG) and PDF files are allowed!'));
    }
  },
});

router.get('/session', protect, getSession);
router.post('/stage1', protect, upload.single('govtId'), saveStage1);
router.post('/stage2', protect, upload.single('certificate'), saveStage2);
router.get('/summary', protect, getSummary);
router.post('/reset', protect, resetSession);

module.exports = router;
