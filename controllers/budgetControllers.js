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
    const budgets = await Budget.find();
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id).populate('category');
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.json(budget);
  } catch (error) {
    console.error('Error in getBudgetById:', error);
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Invalid Budget ID' });
    }
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

module.exports = {
  getBudgets,
  getBudgetById,
  updateBudget,
  createBudget,
  deleteBudget,
};
