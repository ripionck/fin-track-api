const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

dotenv.config();

// Import routes
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const preferenceRoutes = require('./routes/preferenceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware

const allowedOrigins = [
  'http://localhost:5173',

  // 'https://your-production-frontend.com',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  }),
);

app.use(express.json());
app.use(helmet());
app.use(morgan('combined'));

/// Test route
app.get('/api/', (req, res) => {
  res.status(200).json({ message: 'API is working!' });
});

// Routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Database connection
mongoose.set('strictQuery', false);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
  });

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Server started on port ${PORT}`),
);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});
