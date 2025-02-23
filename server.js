require('dotenv').config();
const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

// Route imports
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const preferenceRoutes = require('./routes/preferenceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Database connection
const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};
connectDB();

// Middleware
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://fin-track-azure.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  }),
);

// Health check endpoint
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

// API Routes
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/budgets', budgetRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/preferences', preferenceRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/users', userRoutes);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error stack in development
  if (process.env.NODE_ENV === 'development') {
    console.error('💥 ERROR 💥', err.stack);
  }

  // Handle specific error types
  let error = { ...err };
  error.message = err.message;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    error = handleDuplicateFieldError(err);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }
  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // Multer file upload errors
  if (err instanceof multer.MulterError) {
    error = handleFileUploadError(err);
  }

  // Final error response
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      error: error,
    }),
  });
});

// Error handlers
const handleValidationError = (err) => ({
  statusCode: 400,
  message: `Invalid input data: ${Object.values(err.errors)
    .map((el) => el.message)
    .join('. ')}`,
});

const handleDuplicateFieldError = (err) => ({
  statusCode: 400,
  message: `Duplicate field value: ${
    Object.keys(err.keyValue)[0]
  }. Please use another value!`,
});

const handleJWTError = () => ({
  statusCode: 401,
  message: 'Invalid token! Please log in again.',
});

const handleJWTExpiredError = () => ({
  statusCode: 401,
  message: 'Your token has expired! Please log in again.',
});

const handleFileUploadError = (err) => ({
  statusCode: 400,
  message:
    err.code === 'LIMIT_FILE_SIZE'
      ? 'File too large! Maximum size is 5MB.'
      : 'File upload failed. Please try again.',
});

// Serverless configuration
module.exports.handler = serverless(app);

// Local server
const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
    );
  });
}
