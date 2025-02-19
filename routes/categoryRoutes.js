const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryControllers');
const authMiddleware = require('../middleware/auth');

router.get('', authMiddleware, categoryController.getAllCategories);
router.post('', authMiddleware, categoryController.createCategory);
router.put('/:id', authMiddleware, categoryController.updateCategory);
router.delete('/:id', authMiddleware, categoryController.deleteCategory);

module.exports = router;
