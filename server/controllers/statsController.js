import asyncHandler from 'express-async-handler';
import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import Settlement from '../models/Settlement.js';

// @desc    Get dashboard stats
// @route   GET /api/stats/dashboard
// @access  Private
export const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get all groups user is in
  const groups = await Group.find({ 'members.user': userId });
  const groupIds = groups.map((g) => g._id);

  // Get all expenses where user is involved
  const expenses = await Expense.find({
    group: { $in: groupIds },
    'splits.user': userId,
  }).populate('paidBy', 'name');

  // Calculate total owed to user
  let totalOwed = 0;
  let totalOwe = 0;

  expenses.forEach((expense) => {
    const mySplit = expense.splits.find(
      (s) => s.user.toString() === userId.toString()
    );
    if (!mySplit) return;

    const paidByMe = expense.paidBy._id.toString() === userId.toString();

    if (paidByMe) {
      // Others owe me
      expense.splits.forEach((split) => {
        if (
          split.user.toString() !== userId.toString() &&
          !split.isPaid
        ) {
          totalOwed += split.amount;
        }
      });
    } else if (!mySplit.isPaid) {
      // I owe someone
      totalOwe += mySplit.amount;
    }
  });

  // Subtract settlements
  const settlementsReceived = await Settlement.find({ to: userId });
  const settlementsPaid = await Settlement.find({ from: userId });

  settlementsReceived.forEach((s) => { totalOwed -= s.amount; });
  settlementsPaid.forEach((s) => { totalOwe -= s.amount; });

  totalOwed = Math.max(0, totalOwed);
  totalOwe = Math.max(0, totalOwe);

  // Recent activity
  const recentExpenses = await Expense.find({
    group: { $in: groupIds },
  })
    .populate('paidBy', 'name')
    .populate('group', 'name icon')
    .sort({ createdAt: -1 })
    .limit(5);

  const activity = recentExpenses.map((e) => ({
    action: `${e.paidBy?.name === req.user.name ? 'You' : e.paidBy?.name} added ₹${e.amount} in ${e.group?.icon} ${e.group?.name}`,
    createdAt: e.createdAt,
  }));

  res.json({
    totalOwed: parseFloat(totalOwed.toFixed(2)),
    totalOwe: parseFloat(totalOwe.toFixed(2)),
    totalGroups: groups.length,
    totalExpenses: expenses.length,
    activity,
  });
});

// @desc    Get spending by category
// @route   GET /api/stats/spending-by-category
// @access  Private
export const getSpendingByCategory = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const groups = await Group.find({ 'members.user': userId });
  const groupIds = groups.map((g) => g._id);

  const expenses = await Expense.find({
    group: { $in: groupIds },
    'splits.user': userId,
  });

  // Group by category
  const categoryTotals = {};
  expenses.forEach((expense) => {
    const mySplit = expense.splits.find(
      (s) => s.user.toString() === userId.toString()
    );
    if (!mySplit) return;

    const cat = expense.category || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + mySplit.amount;
  });

  const result = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
  }));

  res.json(result);
});

// @desc    Get monthly spending trend
// @route   GET /api/stats/monthly-trend
// @access  Private
export const getMonthlyTrend = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const groups = await Group.find({ 'members.user': userId });
  const groupIds = groups.map((g) => g._id);

  // Get expenses for last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const expenses = await Expense.find({
    group: { $in: groupIds },
    'splits.user': userId,
    date: { $gte: sixMonthsAgo },
  });

  // Group by month
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun',
                      'Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthlyData = {};

  // Initialize last 6 months with 0
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthlyData[key] = {
      month: monthNames[d.getMonth()],
      amount: 0,
    };
  }

  expenses.forEach((expense) => {
    const mySplit = expense.splits.find(
      (s) => s.user.toString() === userId.toString()
    );
    if (!mySplit) return;

    const d = new Date(expense.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (monthlyData[key]) {
      monthlyData[key].amount += mySplit.amount;
    }
  });

  const result = Object.values(monthlyData).map((d) => ({
    month: d.month,
    amount: parseFloat(d.amount.toFixed(2)),
  }));

  res.json(result);
});