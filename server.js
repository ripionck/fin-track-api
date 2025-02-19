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
const healthRoutes = require('./routes/health');

const app = express();

// Database connection setup
let cachedDb = null;

const connectToDatabase = async () => {
  if (cachedDb) return cachedDb;

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
      maxPoolSize: 5,
      socketTimeoutMS: 30000,
    });
    cachedDb = conn;
    return conn;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
};

// Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use(
  cors({
    origin: ['https://fin-track-azure.vercel.app', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection middleware
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Routes (Order matters!)
app.get('/', (req, res) =>
  res.json({
    status: 'API Running',
    endpoints: [
      '/health',
      '/api/transactions',
      '/api/budgets',
      '/api/categories',
      '/api/analytics',
      '/api/preferences',
      '/api/notifications',
      '/api/users',
    ],
  }),
);

app.use('/health', healthRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

// Error Handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  return res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Server Error' : err.message,
  });
});

// Serverless export
module.exports.handler = serverless(app);

// Local server
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Local server on port ${PORT}`));
}
