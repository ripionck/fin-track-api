const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// Helper function to validate and update budget
const validateAndUpdateBudget = async (userId, category, amount) => {
  const budget = await Budget.findOne({ user: userId, category });

  if (budget) {
    const absoluteAmount = Math.abs(amount);
    const potentialSpent = budget.spent + absoluteAmount;

    if (potentialSpent > budget.limit) {
      throw new Error(
        `Expense exceeds budget limit for ${category}. Remaining: $${budget.remaining}`,
      );
    }

    budget.spent = potentialSpent;
    budget.remaining = budget.limit - potentialSpent;
    await budget.save();
  }
};

// Helper to reverse budget changes
const reverseBudgetUpdate = async (userId, category, amount) => {
  const budget = await Budget.findOne({ user: userId, category });
  if (budget) {
    const absoluteAmount = Math.abs(amount);
    budget.spent = Math.max(0, budget.spent - absoluteAmount);
    budget.remaining = budget.limit - budget.spent;
    await budget.save();
  }
};

const createTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  console.log('Request Body:', req.body);

  try {
    const { date, description, category, type, amount } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!date || !description || !category || !type || amount === undefined) {
      throw new Error('Missing required fields');
    }

    if (typeof amount !== 'number') {
      throw new Error('Invalid amount format');
    }

    // Normalize type to lowercase
    const normalizedType = type.toLowerCase();

    // Check budget only for expenses
    if (normalizedType === 'expense') {
      await validateAndUpdateBudget(userId, category, amount);
    }

    const newTransaction = new Transaction({
      user: userId,
      date,
      description,
      category,
      type: normalizedType,
      amount:
        normalizedType === 'expense' ? -Math.abs(amount) : Math.abs(amount),
    });

    await newTransaction.save({ session });

    await session.commitTransaction();
    res.status(201).json({
      success: true,
      data: newTransaction,
    });
  } catch (error) {
    await session.abortTransaction();
    const statusCode = error.message.includes('exceeds') ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  } finally {
    session.endSession();
  }
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ date: -1 })
      .populate('category', 'name')
      .lean();

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch transactions: ${error.message}`,
    });
  }
};

const updateTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const oldTransaction = await Transaction.findOne({
      _id: id,
      user: userId,
    }).session(session);

    if (!oldTransaction) {
      throw new Error('Transaction not found');
    }

    // Reverse budget update for old transaction if it was an expense
    if (oldTransaction.type === 'expense') {
      await reverseBudgetUpdate(
        userId,
        oldTransaction.category,
        oldTransaction.amount,
      );
    }

    // Validate new amount if present
    if (updates.amount && typeof updates.amount !== 'number') {
      throw new Error('Invalid amount format');
    }

    // Apply updates
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        oldTransaction[key] = updates[key];
      }
    });

    // Normalize type to lowercase
    if (updates.type) {
      oldTransaction.type = updates.type.toLowerCase();
    }

    // Validate and update budget for new transaction if it's an expense
    if (oldTransaction.type === 'expense') {
      await validateAndUpdateBudget(
        userId,
        oldTransaction.category,
        oldTransaction.amount,
      );
    }

    await oldTransaction.save({ session });
    await session.commitTransaction();

    // Populate after committing and before sending the response
    const updatedTransaction = await Transaction.findById(id)
      .populate('category', 'name')
      .lean();

    res.json({
      success: true,
      data: updatedTransaction,
    });
  } catch (error) {
    await session.abortTransaction();
    const statusCode = error.message.includes('exceeds') ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  } finally {
    session.endSession();
  }
};

const deleteTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const userId = req.user.id;

    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      user: userId,
    }).session(session);

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Reverse budget update if the transaction was an expense
    if (transaction.type === 'expense') {
      await reverseBudgetUpdate(
        userId,
        transaction.category,
        transaction.amount,
      );
    }

    await session.commitTransaction();
    res.json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    session.endSession();
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
};
