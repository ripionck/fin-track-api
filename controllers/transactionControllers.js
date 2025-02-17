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

  try {
    const { date, description, category, type, amount } = req.body;
    const userId = req.user.id;

    // Validate transaction type
    if (!['income', 'expense'].includes(type)) {
      throw new Error('Invalid transaction type');
    }

    // Validate amount
    if (typeof amount !== 'number' || amount === 0) {
      throw new Error('Invalid transaction amount');
    }

    // Check budget only for expenses
    if (type === 'expense') {
      await validateAndUpdateBudget(userId, category, amount);
    }

    const newTransaction = await Transaction.create(
      [
        {
          user: userId,
          date,
          description,
          category,
          type,
          amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
        },
      ],
      { session },
    );

    await session.commitTransaction();
    res.status(201).json(newTransaction[0]);
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
      .lean();

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
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

    // Get existing transaction
    const oldTransaction = await Transaction.findOne({
      _id: id,
      user: userId,
    }).session(session);
    if (!oldTransaction) {
      throw new Error('Transaction not found');
    }

    // Reverse old budget impact if it was an expense
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
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: id, user: userId },
      updates,
      { new: true, session },
    );

    // Validate and update new budget if expense
    if (updatedTransaction.type === 'expense') {
      await validateAndUpdateBudget(
        userId,
        updatedTransaction.category,
        updatedTransaction.amount,
      );
    }

    await session.commitTransaction();
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
