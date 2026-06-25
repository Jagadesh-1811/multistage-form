import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only JPG, PNG, and PDF files are allowed!'));
  }
});

// In-memory User and Session database
const users = [];
const activeSessions = new Map(); // Maps token -> userId

// Authentication Middleware to secure routes
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
  }

  const token = authHeader.split(' ')[1];
  const userId = activeSessions.get(token);
  
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
  }

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found.' });
  }

  // Attach user and token to request
  req.user = user;
  req.token = token;
  next();
};

/* --- AUTHENTICATION ENDPOINTS --- */

// POST /auth/signup
app.post('/auth/signup', (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const emailNormalized = email.trim().toLowerCase();
    const userExists = users.some(u => u.email === emailNormalized);
    
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    // Create user and initialize registrationSession
    const newUser = {
      id: 'usr_' + Date.now(),
      name: name.trim(),
      email: emailNormalized,
      password: password, // In a real app we would hash this
      registrationSession: {
        currentStage: 1,
        personalInfo: null,
        educationalDetails: null,
        paymentDetails: null
      }
    };

    users.push(newUser);

    // Create session token
    const token = 'tok_' + Math.random().toString(36).substring(2) + Date.now();
    activeSessions.set(token, newUser.id);

    res.status(201).json({
      success: true,
      message: 'Signup successful!',
      token,
      user: {
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /auth/login
app.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const emailNormalized = email.trim().toLowerCase();
    const user = users.find(u => u.email === emailNormalized);

    if (!user || user.password !== password) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    // Create session token
    const token = 'tok_' + Math.random().toString(36).substring(2) + Date.now();
    activeSessions.set(token, user.id);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /auth/logout
app.post('/auth/logout', authenticateUser, (req, res) => {
  activeSessions.delete(req.token);
  res.json({
    success: true,
    message: 'Logged out successfully.'
  });
});

// GET /auth/me
app.get('/auth/me', authenticateUser, (req, res) => {
  res.json({
    success: true,
    user: {
      name: req.user.name,
      email: req.user.email
    }
  });
});

/* --- APPLICATION PROCESS ENDPOINTS (SECURED) --- */

// GET /application/session
app.get('/application/session', authenticateUser, (req, res) => {
  res.json({
    success: true,
    data: req.user.registrationSession
  });
});

// POST /application/stage1
app.post('/application/stage1', authenticateUser, upload.single('govtId'), (req, res) => {
  try {
    const { name, email, phone, dob, address } = req.body;

    if (!name || !email || !phone || !dob || !address) {
      return res.status(400).json({ success: false, message: 'All text fields are required.' });
    }

    let govtIdFile = req.user.registrationSession.personalInfo?.govtIdFile || null;
    if (req.file) {
      govtIdFile = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: `/uploads/${req.file.filename}`,
        size: req.file.size
      };
    } else if (!govtIdFile) {
      return res.status(400).json({ success: false, message: 'Government ID upload is required.' });
    }

    req.user.registrationSession.personalInfo = {
      name,
      email,
      phone,
      dob,
      address,
      govtIdFile
    };
    
    if (req.user.registrationSession.currentStage === 1) {
      req.user.registrationSession.currentStage = 2;
    }

    res.json({
      success: true,
      message: 'Stage 1 (Personal Information) saved successfully.',
      data: req.user.registrationSession
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /application/stage2
app.post('/application/stage2', authenticateUser, upload.single('certificate'), (req, res) => {
  try {
    if (!req.user.registrationSession.personalInfo) {
      return res.status(400).json({ success: false, message: 'Please complete Stage 1 (Personal Information) first.' });
    }

    const { qualification, institution, course, year, grade } = req.body;

    if (!qualification || !institution || !course || !year || !grade) {
      return res.status(400).json({ success: false, message: 'All educational fields are required.' });
    }

    let certificateFile = req.user.registrationSession.educationalDetails?.certificateFile || null;
    if (req.file) {
      certificateFile = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: `/uploads/${req.file.filename}`,
        size: req.file.size
      };
    } else if (!certificateFile) {
      return res.status(400).json({ success: false, message: 'Educational Certificate upload is required.' });
    }

    req.user.registrationSession.educationalDetails = {
      qualification,
      institution,
      course,
      year,
      grade,
      certificateFile
    };

    if (req.user.registrationSession.currentStage === 2) {
      req.user.registrationSession.currentStage = 3;
    }

    res.json({
      success: true,
      message: 'Stage 2 (Educational Details) saved successfully.',
      data: req.user.registrationSession
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /payment/create
app.post('/payment/create', authenticateUser, (req, res) => {
  if (!req.user.registrationSession.personalInfo || !req.user.registrationSession.educationalDetails) {
    return res.status(400).json({ success: false, message: 'Please complete previous stages first.' });
  }

  res.json({
    success: true,
    amount: 110.00,
    currency: 'USD',
    message: 'Payment simulation initiated.'
  });
});

// POST /payment/success
app.post('/payment/success', authenticateUser, (req, res) => {
  if (!req.user.registrationSession.personalInfo || !req.user.registrationSession.educationalDetails) {
    return res.status(400).json({ success: false, message: 'Please complete previous stages first.' });
  }

  const { paymentMethod } = req.body;
  if (!paymentMethod) {
    return res.status(400).json({ success: false, message: 'Payment method is required.' });
  }

  const transactionId = 'txn_' + Math.floor(1000000000 + Math.random() * 9000000000);
  const dateTime = new Date().toISOString();

  req.user.registrationSession.paymentDetails = {
    paymentMethod,
    amount: 110.00,
    currency: 'USD',
    status: 'Paid',
    transactionId,
    dateTime
  };

  req.user.registrationSession.currentStage = 4;

  res.json({
    success: true,
    message: 'Payment mock verification successful.',
    data: req.user.registrationSession.paymentDetails
  });
});

// GET /application/summary
app.get('/application/summary', authenticateUser, (req, res) => {
  if (!req.user.registrationSession.paymentDetails) {
    return res.status(400).json({ success: false, message: 'Application is not completed yet (payment required).' });
  }

  res.json({
    success: true,
    data: req.user.registrationSession
  });
});

// POST /application/reset
app.post('/application/reset', authenticateUser, (req, res) => {
  req.user.registrationSession = {
    currentStage: 1,
    personalInfo: null,
    educationalDetails: null,
    paymentDetails: null
  };
  res.json({
    success: true,
    message: 'Session reset successfully.'
  });
});

// Error handling middleware for Multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File is too large. Maximum size allowed is 5MB.' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Mock backend running on port ${PORT}`);
});
