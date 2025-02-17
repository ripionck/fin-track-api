const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// Helper function to validate and update budget
const validateAndUpdateBudget = async (category, amount) => {
  const budget = await Budget.findOne({ category });

  if (!budget) {
    throw new Error('Budget for this category does not exist');
  }

  const absoluteAmount = Math.abs(amount);
  const potentialSpent = budget.spent + absoluteAmount;

  if (potentialSpent > budget.limit) {
    throw new Error(
      `Expense exceeds budget limit. Remaining: $${budget.remaining}`,
    );
  }

  budget.spent = potentialSpent;
  budget.remaining = budget.limit - potentialSpent;
  await budget.save();

  return budget;
};

// Helper to reverse budget changes
const reverseBudgetUpdate = async (category, amount) => {
  const budget = await Budget.findOne({ category });
  if (budget) {
    const absoluteAmount = Math.abs(amount);
    budget.spent = Math.max(0, budget.spent - absoluteAmount);
    budget.remaining = budget.limit - budget.spent;
    await budget.save();
  }
};

const createTransaction = async (req, res) => {
  try {
    const { date, description, category, type, amount } = req.body;

    if (type === 'Expense') {
      await validateAndUpdateBudget(category, amount);
    }

    const newTransaction = new Transaction({
      date,
      description,
      category,
      type,
      amount,
    });

    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    const statusCode = error.message.includes('budget') ? 400 : 500;
    res.status(statusCode).json({
      message: error.message,
      error: error.message,
    });
  }
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

const updateTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const oldTransaction = await Transaction.findById(id).session(session);

    if (!oldTransaction) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Reverse old budget impact if it was an expense
    if (oldTransaction.type === 'Expense') {
      await reverseBudgetUpdate(oldTransaction.category, oldTransaction.amount);
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      req.body,
      { new: true, session },
    );

    // Validate and update new budget if expense
    if (updatedTransaction.type === 'Expense') {
      await validateAndUpdateBudget(
        updatedTransaction.category,
        updatedTransaction.amount,
      ).session(session);
    }

    await session.commitTransaction();
    res.json(updatedTransaction);
  } catch (error) {
    await session.abortTransaction();
    const statusCode = error.message.includes('budget') ? 400 : 500;
    res.status(statusCode).json({
      message: error.message,
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTransaction = await Transaction.findByIdAndDelete(id);

    if (!deletedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (deletedTransaction.type === 'Expense') {
      await reverseBudgetUpdate(
        deletedTransaction.category,
        deletedTransaction.amount,
      );
    }

    res.json({
      message: 'Transaction deleted successfully',
      deletedTransaction,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
};
