const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes below this line will require authentication
router.get('/', authMiddleware, transactionController.getAllTransactions);
router.post('/', authMiddleware, transactionController.createTransaction);

module.exports = router;
