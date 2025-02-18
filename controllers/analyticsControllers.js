const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// Helper functions
const getDateRange = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getCurrentYearStart = () => {
  const date = new Date();
  date.setMonth(0, 1);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getPreviousPeriodDateRange = (currentStartDate, days) => {
  const previousEndDate = new Date(currentStartDate);
  previousEndDate.setDate(previousEndDate.getDate() - 1);
  const previousStartDate = new Date(previousEndDate);
  previousStartDate.setDate(previousStartDate.getDate() - days);
  return { previousStartDate, previousEndDate };
};

const calculatePercentageChange = (currentValue, previousValue) => {
  if (previousValue === 0) return currentValue === 0 ? 0 : 100;
  return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
};

// Common analytics processor
const processAnalyticsData = async (userId, startDate) => {
  const transactionResult = await Transaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryDetails',
      },
    },
    { $unwind: '$categoryDetails' },
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              totalIncome: {
                $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
              },
              totalExpenses: {
                $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
              },
            },
          },
        ],
        monthlyData: [
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
              income: {
                $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
              },
              expenses: {
                $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
              },
            },
          },
          {
            $project: {
              _id: 0,
              month: '$_id',
              income: 1,
              expenses: 1,
              savings: { $subtract: ['$income', '$expenses'] },
            },
          },
          { $sort: { month: 1 } },
        ],
        spendingByCategory: [
          {
            $match: { type: 'expense' },
          },
          {
            $group: {
              _id: '$categoryDetails.name',
              total: { $sum: '$amount' },
              color: { $first: '$categoryDetails.color' },
            },
          },
          {
            $project: {
              _id: 0,
              name: '$_id',
              value: '$total',
              color: 1,
            },
          },
        ],
      },
    },
  ]);

  const budgets = await Budget.find({ user: userId }).populate('category');
  return {
    totals: transactionResult[0].totals[0] || {},
    monthlyData: transactionResult[0].monthlyData,
    spendingByCategory: transactionResult[0].spendingByCategory,
    budgets,
  };
};

// Generate analytics response with changes
const generateResponse = (currentData, previousData) => {
  const { totals, monthlyData, spendingByCategory, budgets } = currentData;
  const previousTotals = previousData?.totals || {};

  const totalIncome = totals.totalIncome || 0;
  const totalExpenses = Math.abs(totals.totalExpenses) || 0;
  const previousIncome = previousTotals.totalIncome || 0;
  const previousExpenses = Math.abs(previousTotals.totalExpenses) || 0;

  // Calculate KPIs with changes
  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const previousSavingsRate =
    previousIncome > 0
      ? ((previousIncome - previousExpenses) / previousIncome) * 100
      : 0;

  const budgetAdherence =
    budgets.length > 0
      ? budgets.reduce((sum, budget) => {
          const adherence =
            budget.limit > 0
              ? Math.min((budget.spent / budget.limit) * 100, 100)
              : 0;
          return sum + adherence;
        }, 0) / budgets.length
      : 0;

  return {
    monthlySavings: monthlyData.map((m) => ({
      month: m.month,
      savings: m.savings,
    })),
    budgetVsActual: budgets.map((budget) => ({
      category: budget.category.name,
      budget: budget.limit,
      actual: budget.spent,
    })),
    topSpending: spendingByCategory
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .map((cat) => ({
        category: cat.name,
        amount: Math.abs(cat.value),
        percentage: ((Math.abs(cat.value) / totalExpenses) * 100).toFixed(1),
      })),
    kpis: {
      totalIncome: {
        value: totalIncome,
        change: calculatePercentageChange(totalIncome, previousIncome).toFixed(
          1,
        ),
      },
      totalExpenses: {
        value: totalExpenses,
        change: calculatePercentageChange(
          totalExpenses,
          previousExpenses,
        ).toFixed(1),
      },
      savingsRate: {
        value: savingsRate.toFixed(1),
        change: calculatePercentageChange(
          savingsRate,
          previousSavingsRate,
        ).toFixed(1),
      },
      budgetAdherence: {
        value: budgetAdherence.toFixed(1),
        change: 0, // Requires historical budget data
      },
    },
    monthlyData,
    spendingByCategory,
  };
};

// Analytics controllers
const getLast30DaysAnalytics = async (req, res) => {
  try {
    const currentStart = getDateRange(30);
    const currentData = await processAnalyticsData(req.user.id, currentStart);

    const { previousStartDate } = getPreviousPeriodDateRange(currentStart, 30);
    const previousData = await processAnalyticsData(
      req.user.id,
      previousStartDate,
    );

    res.json(generateResponse(currentData, previousData));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLast90DaysAnalytics = async (req, res) => {
  try {
    const currentStart = getDateRange(90);
    const currentData = await processAnalyticsData(req.user.id, currentStart);

    const { previousStartDate } = getPreviousPeriodDateRange(currentStart, 90);
    const previousData = await processAnalyticsData(
      req.user.id,
      previousStartDate,
    );

    res.json(generateResponse(currentData, previousData));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCurrentYearAnalytics = async (req, res) => {
  try {
    const currentData = await processAnalyticsData(
      req.user.id,
      getCurrentYearStart(),
    );
    res.json(generateResponse(currentData, {}));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getLast30DaysAnalytics,
  getLast90DaysAnalytics,
  getCurrentYearAnalytics,
};
