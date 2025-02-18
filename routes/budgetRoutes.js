const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetControllers');
const authMiddleware = require('../middleware/auth');

router.get('', authMiddleware, budgetController.getBudgets);
router.get('/:id', authMiddleware, budgetController.getBudgets);
router.post('', authMiddleware, budgetController.createBudget);
router.put('/:id', authMiddleware, budgetController.updateBudget);
router.delete('/:id', authMiddleware, budgetController.deleteBudget);

module.exports = router;
