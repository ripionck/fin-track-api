const Transaction = require('../models/Transaction');

exports.getMonthlySummary = async (req, res) => {
  try {
    const transactions = await Transaction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: { $month: '$date' },
          income: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
          },
          expenses: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
          },
        },
      },
    ]);

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
