const Budget = require('../models/Budget');
const { createNotification } = require('./notificationControllers');
const Category = require('../models/Category');

const getAllBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user }).populate(
      'categoryId',
    );

    const formattedBudgets = budgets.map((budget) => ({
      _id: budget._id,
      userId: budget.userId,
      category: budget.categoryId,
      amountLimit: budget.amountLimit,
      startDate: budget.startDate,
    }));

    res.json({
      message: 'Budgets retrieved successfully',
      budgets: formattedBudgets,
    });
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
      return res.status(400).json({ message: 'Category ID is required' });
    }

    const category = await Category.findById(categoryId); // Fetch the category
    if (!category) {
      return res.status(400).json({ message: 'Invalid Category ID' });
    }

    const newBudget = new Budget({
      userId: req.user,
      categoryId, // Store the categoryId
      amountLimit,
      startDate,
    });

    await newBudget.save();

    const populatedBudget = await Budget.findById(newBudget._id).populate(
      'categoryId',
    ); // Populate

    createNotification(
      req.user,
      'budgetCreated',
      'A new budget has been created.',
    );

    res.status(201).json({
      message: 'Budget created successfully',
      budget: {
        // Format the response as you want
        category: populatedBudget.categoryId, // Send the full category object
        amountLimit: populatedBudget.amountLimit,
        startDate: populatedBudget.startDate,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateBudget = async (req, res) => {
  try {
    const { categoryId, amountLimit, startDate } = req.body;
    let updateData = { amountLimit, startDate };

    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(400).json({ message: 'Invalid Category ID' });
      }
      updateData.categoryId = categoryId;
    }

    const budget = await Budget.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).populate('categoryId');

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json({
      message: 'Budget updated successfully',
      budget: {
        category: budget.categoryId,
        amountLimit: budget.amountLimit,
        startDate: budget.startDate,
      },
    });
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
