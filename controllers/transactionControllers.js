const Transaction = require('../models/Transaction');
const { createNotification } = require('./notificationControllers');

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user }).populate(
      'categoryId',
    );
    res.json({ message: 'Transactions retrieved successfully', transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createTransaction = async (req, res) => {
  try {
    const { date, description, amount, categoryId, type } = req.body;
    const newTransaction = new Transaction({
      userId: req.user,
      date,
      description,
      amount,
      categoryId,
      type,
    });
    await newTransaction.save();
    createNotification(
      req.user,
      'transactionCreated',
      `New transaction: ${newTransaction.description} (${newTransaction.amount})`,
    );
    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: newTransaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { date, description, amount, categoryId, type } = req.body;
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { date, description, amount, categoryId, type },
      { new: true },
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction updated successfully', transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(204).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
