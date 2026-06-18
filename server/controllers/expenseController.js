import { io } from '../server.js';
import { createNotification } from '../utils/createNotification.js';
import asyncHandler from 'express-async-handler';
import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import { calculateSplits } from '../utils/splitCalculator.js';

// @desc    Get expenses for a group
// @route   GET /api/expenses?groupId=xxx
// @access  Private
export const getExpenses = asyncHandler(async (req, res) => {
  const { groupId } = req.query;

  if (!groupId) {
    res.status(400);
    throw new Error('Group ID is required');
  }

  const expenses = await Expense.find({ group: groupId })
    .populate('paidBy', 'name email avatar')
    .populate('splits.user', 'name email avatar')
    .sort({ date: -1 });

  res.json(expenses);
});

// @desc    Get all expenses for logged in user
// @route   GET /api/expenses/all
// @access  Private
export const getAllExpenses = asyncHandler(async (req, res) => {
  const expenses = await Expense.find({
    'splits.user': req.user._id,
  })
    .populate('paidBy', 'name email avatar')
    .populate('group', 'name icon')
    .populate('splits.user', 'name email avatar')
    .sort({ date: -1 });

  res.json(expenses);
});

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
export const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id)
    .populate('paidBy', 'name email avatar')
    .populate('splits.user', 'name email avatar')
    .populate('group', 'name icon');

  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }

  res.json(expense);
});

// @desc    Add expense
// @route   POST /api/expenses
// @access  Private
export const addExpense = asyncHandler(async (req, res) => {
  const { title, amount, category, paidBy, groupId,
          splitType, customSplits, note, date } = req.body;

  // Get group and verify membership
  const group = await Group.findById(groupId);
  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  const isMember = group.members.some(
    (m) => m.user.toString() === req.user._id.toString()
  );
  if (!isMember) {
    res.status(403);
    throw new Error('Not a member of this group');
  }

  // Get all member IDs
  const memberIds = group.members.map((m) => m.user.toString());

  // Calculate splits
  const splits = calculateSplits(
    parseFloat(amount),
    memberIds,
    splitType || 'equal',
    customSplits || []
  );

  // Mark paidBy user's split as paid
  const splitsWithPaid = splits.map((split) => ({
    ...split,
    isPaid: split.user.toString() === paidBy,
  }));

  // Create expense
  const expense = await Expense.create({
    title,
    amount: parseFloat(amount),
    category: category || 'Other',
    paidBy,
    group: groupId,
    splits: splitsWithPaid,
    splitType: splitType || 'equal',
    note: note || '',
    date: date || Date.now(),
  });

  // Update group total expenses count
  await Group.findByIdAndUpdate(groupId, {
    $inc: { totalExpenses: 1 },
  });

  await expense.populate('paidBy', 'name email avatar');
  await expense.populate('splits.user', 'name email avatar');

  // Send notifications to all group members except the one who added
  const recipientIds = group.members
    .map((m) => m.user.toString())
    .filter((id) => id !== req.user._id.toString());

  if (recipientIds.length > 0) {
    await createNotification({
      recipients: recipientIds,
      sender: req.user._id,
      type: 'expense_added',
      message: `${req.user.name} added ₹${amount} for "${title}" in ${group.name}`,
      group: groupId,
      io,
    });
  }

  res.status(201).json(expense);
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }

  // Only person who added it can delete
  if (expense.paidBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this expense');
  }

  await expense.deleteOne();

  // Decrease group expense count
  await Group.findByIdAndUpdate(expense.group, {
    $inc: { totalExpenses: -1 },
  });

  res.json({ message: 'Expense deleted successfully' });
});