import { getIO } from '../socket/io.js';
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
    throw new Error('Not authorized to view expenses for this group');
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
  const groups = await Group.find({ 'members.user': req.user._id }).select('_id');
  const groupIds = groups.map((g) => g._id);

  const expenses = await Expense.find({
    group: { $in: groupIds },
    $or: [{ 'splits.user': req.user._id }, { paidBy: req.user._id }],
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

  const group = await Group.findById(expense.group._id || expense.group);
  const isMember = group?.members.some(
    (m) => m.user.toString() === req.user._id.toString()
  );
  if (!isMember) {
    res.status(403);
    throw new Error('Not authorized to view this expense');
  }

  res.json(expense);
});

// @desc    Add expense
// @route   POST /api/expenses
// @access  Private
export const addExpense = asyncHandler(async (req, res) => {
  const title = req.body.title || req.body.description;
  const amount = req.body.amount;
  const category = req.body.category;
  const paidBy = req.body.paidBy || req.body.paid_by;
  const groupId = req.body.groupId || req.body.group_id;
  const splitType =
    req.body.splitType || req.body.split_type || 'equal';
  const normalizedSplitType = splitType === 'percent' ? 'percentage' : splitType;
  const splitBetween = req.body.splitBetween || req.body.split_between;
  const customSplits = req.body.customSplits || req.body.custom_splits || {};
  const { note, date } = req.body;

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

  const memberIds = group.members.map((m) => m.user.toString());
  if (!memberIds.includes(paidBy?.toString())) {
    res.status(400);
    throw new Error('Paid by user must be a group member');
  }

  const participants = Array.isArray(splitBetween) && splitBetween.length
    ? splitBetween.map((id) => id.toString())
    : memberIds;

  const invalidParticipant = participants.find((id) => !memberIds.includes(id));
  if (invalidParticipant) {
    res.status(400);
    throw new Error('Split participant must be a group member');
  }

  if (!participants.length) {
    res.status(400);
    throw new Error('At least one split participant is required');
  }

  const numericAmount = parseFloat(amount);
  if (!title?.trim() || !numericAmount || numericAmount <= 0) {
    res.status(400);
    throw new Error('Valid title and amount are required');
  }

  // Calculate splits
  const splits = calculateSplits(
    numericAmount,
    participants,
    normalizedSplitType,
    customSplits
  );

  const splitTotal = splits.reduce((sum, split) => sum + Number(split.amount || 0), 0);
  if (
    normalizedSplitType === 'exact' &&
    Math.abs(splitTotal - numericAmount) > 0.01
  ) {
    res.status(400);
    throw new Error('Exact splits must add up to the expense amount');
  }

  if (
    normalizedSplitType === 'percentage' &&
    Math.abs(splitTotal - numericAmount) > 0.01
  ) {
    res.status(400);
    throw new Error('Percentages must add up to 100%');
  }

  // Mark paidBy user's split as paid
  const splitsWithPaid = splits.map((split) => ({
    ...split,
    isPaid: split.user.toString() === paidBy.toString(),
  }));

  // Create expense
  const expense = await Expense.create({
    title: title.trim(),
    amount: numericAmount,
    category: category || 'general',
    paidBy,
    group: groupId,
    splits: splitsWithPaid,
    splitType: normalizedSplitType,
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
      message: `${req.user.name} added ₹${numericAmount} for "${title}" in ${group.name}`,
      group: groupId,
      io: getIO(),
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

  // Allow paidBy user OR group creator to delete
  const group = await Group.findById(expense.group);
  const isGroupCreator = group && group.createdBy.toString() === req.user._id.toString();

  if (
    expense.paidBy.toString() !== req.user._id.toString() &&
    !isGroupCreator
  ) {
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
