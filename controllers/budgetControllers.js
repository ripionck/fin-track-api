const Transaction = require('../models/Transaction');

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user }).populate(
      'categoryId',
    );
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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

    res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(204).json();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
