const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/application', require('./routes/applicationRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// Serve uploaded files statically
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Base Route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to MERN Authentication API' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Return 400 Bad Request for file validation / Multer upload errors
  if (err.name === 'MulterError' || err.message.includes('allowed') || err.message.includes('only')) {
    statusCode = 400;
  }

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});