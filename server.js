require('dotenv').config();
const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

// Route imports
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const preferenceRoutes = require('./routes/preferenceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Serverless-optimized MongoDB connection
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
      })
      .then((mongoose) => mongoose);
  }

  try {
    cached.conn = await cached.promise;
    console.log('MongoDB connected successfully');
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB connection error:', e.message);
    throw e;
  }

  return cached.conn;
};

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

// Health check endpoint with DB connection check
app.get('/health', async (req, res) => {
  try {
    await connectDB();
    res.status(200).json({ status: 'OK', db: 'Connected' });
  } catch (err) {
    res.status(500).json({ status: 'DOWN', db: 'Connection failed' });
  }
});

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
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Something went wrong!'
      : err.message;

  if (process.env.NODE_ENV === 'development') {
    console.error('💥 ERROR 💥', err.stack);
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err,
    }),
  });
});

// Serverless configuration
module.exports.handler = serverless(app);

// Local server configuration
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
      );
    });
  });
}
