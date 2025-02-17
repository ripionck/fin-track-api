const Budget = require('../models/Budget');
const { createNotification } = require('./notificationControllers');

const getAllBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user }).populate(
      'categoryId',
    );
    res.json({ message: 'Budgets retrieved successfully', budgets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createBudget = async (req, res) => {
  try {
    const { categoryId, amountLimit, startDate } = req.body;

    if (!amountLimit) {
      return res.status(400).json({ message: 'Amount limit is required' });
    }
    if (!startDate) {
      return res.status(400).json({ message: 'Start date is required' });
    }
    if (!categoryId) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const newBudget = new Budget({
      userId: req.user,
      categoryId,
      amountLimit,
      startDate,
    });

    await newBudget.save();
    createNotification(
      req.user,
      'budgetCreated',
      'A new budget has been created.',
    );
    res
      .status(201)
      .json({ message: 'Budget created successfully', budget: newBudget });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateBudget = async (req, res) => {
  try {
    const { categoryId, amountLimit, startDate } = req.body;
    const budget = await Budget.findByIdAndUpdate(
      req.params.id,
      { categoryId, amountLimit, startDate },
      { new: true },
    );

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json({ message: 'Budget updated successfully', budget });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findByIdAndDelete(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.status(204).json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};
