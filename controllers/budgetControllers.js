const Budget = require('../models/Budget');

const createBudget = async (req, res) => {
  try {
    const { category, limit } = req.body;
    const existingBudget = await Budget.findOne({ category });

    if (existingBudget) {
      return res
        .status(400)
        .json({ message: 'Budget for this category already exists' });
    }

    const newBudget = new Budget({ category, limit });
    await newBudget.save();
    res.status(201).json(newBudget);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find();
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit } = req.body;

    const updatedBudget = await Budget.findByIdAndUpdate(
      id,
      { limit },
      { new: true },
    );

    if (!updatedBudget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json(updatedBudget);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBudget = await Budget.findByIdAndDelete(id);

    if (!deletedBudget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getBudgets, updateBudget, createBudget, deleteBudget };
