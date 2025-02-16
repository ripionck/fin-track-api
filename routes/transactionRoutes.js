const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getTransactions,
  createTransaction,
} = require('../controllers/transactionController');

router
  .route('/')
  .get(protect, getTransactions)
  .post(protect, createTransaction);

module.exports = router;
