const Budget = require('../models/Budget');

const getAllBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user }).populate(
      'categoryId',
    );
    res.json(budgets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createBudget = async (req, res) => {
  try {
    const { categoryId, amountLimit, startDate, endDate } = req.body;

    if (!amountLimit) {
      return res.status(400).json({ message: 'Amount limit is required' });
    }
    if (!startDate) {
      return res.status(400).json({ message: 'Start date is required' });
    }
    if (!endDate) {
      return res.status(400).json({ message: 'End date is required' });
    }
    if (!categoryId) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const newBudget = new Budget({
      userId: req.user,
      categoryId,
      amountLimit,
      startDate,
      endDate,
    });

    await newBudget.save();
    res.status(201).json(newBudget);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateBudget = async (req, res) => {
  try {
    const { categoryId, amountLimit, startDate, endDate } = req.body;
    const budget = await Budget.findByIdAndUpdate(
      req.params.id,
      { categoryId, amountLimit, startDate, endDate },
      { new: true },
    );

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json(budget);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findByIdAndDelete(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.status(204).json();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};
