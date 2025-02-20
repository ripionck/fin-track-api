const Budget = require('../models/Budget');
const Category = require('../models/Category');

const createBudget = async (req, res) => {
  try {
    const { category, limit, startDate } = req.body;
    const userId = req.user.id;
    const foundCategory = await Category.findById(category);

    if (!foundCategory) {
      return res.status(400).json({ message: 'Category not found' });
    }

    const newBudget = new Budget({
      user: userId,
      category,
      limit,
      startDate,
    });
    await newBudget.save();
    const populatedBudget = await Budget.findById(newBudget._id).populate(
      'category',
    );

    res.status(201).json(populatedBudget);
  } catch (error) {
    console.error('Error creating budget:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: error.message });
    } else if (
      error.code === 11000 &&
      error.keyPattern &&
      error.keyPattern.user === 1 &&
      error.keyPattern.category === 1
    ) {
      res
        .status(400)
        .json({ message: 'Budget for this user and category already exists' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

const getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    const budgets = await Budget.find({ user: userId }).populate('category');
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit } = req.body;
    const userId = req.user.id;

    const updatedBudget = await Budget.findOneAndUpdate(
      { _id: id, user: userId },
      { limit },
      { new: true, runValidators: true },
    ).populate('category');

    if (!updatedBudget) {
      return res
        .status(404)
        .json({ message: 'Budget not found or not authorized' });
    }

    res.json(updatedBudget);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deletedBudget = await Budget.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!deletedBudget) {
      return res
        .status(404)
        .json({ message: 'Budget not found or not authorized' });
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getBudgets,
  updateBudget,
  createBudget,
  deleteBudget,
};
