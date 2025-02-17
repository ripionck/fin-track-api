const Transaction = require('../models/Transaction');

const getDateRange = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const getLast30DaysAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = getDateRange(30);

    const data = await Transaction.aggregate([
      {
        $match: {
          date: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', 'Income'] }, '$amount', 0] },
          },
          totalExpenses: {
            $sum: { $cond: [{ $eq: ['$type', 'Expense'] }, '$amount', 0] },
          },
          categories: {
            $push: {
              $cond: [{ $eq: ['$type', 'Expense'] }, '$category', '$$REMOVE'],
            },
          },
          amounts: {
            $push: {
              $cond: [{ $eq: ['$type', 'Expense'] }, '$amount', '$$REMOVE'],
            },
          },
        },
      },
    ]);

    res.json(data[0] || {});
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getLastYearAnalytics = async (req, res) => {
  try {
    const oneYearAgo = getDateRange(365);

    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          date: { $gte: oneYearAgo },
        },
      },
      {
        $group: {
          _id: { $month: '$date' },
          income: {
            $sum: { $cond: [{ $eq: ['$type', 'Income'] }, '$amount', 0] },
          },
          expenses: {
            $sum: { $cond: [{ $eq: ['$type', 'Expense'] }, '$amount', 0] },
          },
        },
      },
      {
        $project: {
          month: '$_id',
          income: 1,
          expenses: 1,
          savings: { $subtract: ['$income', '$expenses'] },
        },
      },
    ]);

    res.json(monthlyData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getLast30DaysAnalytics, getLastYearAnalytics };
