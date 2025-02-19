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

// CORS Configuration
app.use(
  cors({
    origin: ['https://fin-track-azure.vercel.app', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => res.json({ status: 'API Running' }));
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Error:', err));

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error:
      process.env.NODE_ENV === 'development' ? err.message : 'Server Error',
  });
});

// Serverless Configuration
module.exports.handler = serverless(app);

// Local Development
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Local server on port ${PORT}`));
}
