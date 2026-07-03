import { io } from '../server.js';
import { createNotification } from '../utils/createNotification.js';
import asyncHandler from 'express-async-handler';
import Settlement from '../models/Settlement.js';
import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import { simplifyDebts } from '../utils/debtSimplifier.js';

// @desc    Get balances for a group
// @route   GET /api/settlements/balances/:groupId
// @access  Private
export const getGroupBalances = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const group = await Group.findById(groupId)
    .populate('members.user', 'name email avatar');
  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  const isMember = group.members.some(
    (m) => m.user._id.toString() === req.user._id.toString()
  );
  if (!isMember) {
    res.status(403);
    throw new Error('Not authorized to view balances for this group');
  }

  const expenses = await Expense.find({ group: groupId })
    .populate('paidBy', 'name email avatar')
    .populate('splits.user', 'name email avatar');

  const settlements = await Settlement.find({ group: groupId })
    .populate('from', 'name email avatar')
    .populate('to', 'name email avatar');

  const rawBalances = [];

  expenses.forEach((expense) => {
    expense.splits.forEach((split) => {
      if (
        split.user._id.toString() !== expense.paidBy._id.toString() &&
        !split.isPaid
      ) {
        rawBalances.push({
          from: split.user._id.toString(),
          to: expense.paidBy._id.toString(),
          amount: split.amount,
          fromUser: split.user,
          toUser: expense.paidBy,
        });
      }
    });
  });

  settlements.forEach((s) => {
    rawBalances.push({
      from: s.to._id.toString(),
      to: s.from._id.toString(),
      amount: s.amount,
      fromUser: s.to,
      toUser: s.from,
    });
  });


  const simplified = simplifyDebts(
    rawBalances.map((b) => ({
      from: b.from,
      to: b.to,
      amount: b.amount,
    }))
  );

  const memberMap = {};
  group.members.forEach((m) => {
    memberMap[m.user._id.toString()] = m.user;
  });

  // Attach user info to simplified transactions
  const result = simplified.map((t) => ({
    from: memberMap[t.from] || { _id: t.from, name: 'Unknown' },
    to: memberMap[t.to] || { _id: t.to, name: 'Unknown' },
    amount: t.amount,
  }));

  res.json({
    balances: result,
    totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
    settlementsCount: settlements.length,
  });
});

// @desc    Settle up
// @route   POST /api/settlements
// @access  Private
export const settleUp = asyncHandler(async (req, res) => {
  const toUserId = req.body.toUserId || req.body.payee;
  const groupId = req.body.groupId || req.body.group_id;
  const { amount, note } = req.body;

  const group = await Group.findById(groupId);
  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  const memberIds = group.members.map((m) => m.user.toString());
  if (!toUserId) {
    res.status(400);
    throw new Error('Payee is required');
  }

  if (
    !memberIds.includes(req.user._id.toString()) ||
    !memberIds.includes(toUserId?.toString())
  ) {
    res.status(403);
    throw new Error('Both settlement users must be group members');
  }

  if (req.user._id.toString() === toUserId.toString()) {
    res.status(400);
    throw new Error('Payer and payee must differ');
  }

  const numericAmount = parseFloat(amount);
  if (!numericAmount || numericAmount <= 0) {
    res.status(400);
    throw new Error('Valid settlement amount is required');
  }

  const settlement = await Settlement.create({
    from: req.user._id,
    to: toUserId,
    amount: numericAmount,
    group: groupId,
    note: note || '',
  });

  await settlement.populate('from', 'name email avatar');
  await settlement.populate('to', 'name email avatar');

  // Notify the person who received the settlement
  await createNotification({
    recipients: [toUserId],
    sender: req.user._id,
    type: 'settled_up',
    message: `${req.user.name} settled ₹${amount} with you`,
    group: groupId,
    io,
  });

  res.status(201).json(settlement);
});

// @desc    Get settlement history for all groups current user belongs to
// @route   GET /api/settlements
// @access  Private
export const getAllSettlementHistory = asyncHandler(async (req, res) => {
  const groups = await Group.find({ 'members.user': req.user._id }).select('_id');
  const groupIds = groups.map((g) => g._id);

  const settlements = await Settlement.find({ group: { $in: groupIds } })
    .populate('from', 'name email avatar')
    .populate('to', 'name email avatar')
    .populate('group', 'name icon')
    .sort({ settledAt: -1 });

  res.json(settlements);
});

// @desc    Get settlement history for a group
// @route   GET /api/settlements/history/:groupId
// @access  Private
export const getSettlementHistory = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.groupId);
  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  const isMember = group.members.some(
    (m) => m.user.toString() === req.user._id.toString()
  );
  if (!isMember) {
    res.status(403);
    throw new Error('Not authorized to view settlements for this group');
  }

  const settlements = await Settlement.find({ group: req.params.groupId })
    .populate('from', 'name email avatar')
    .populate('to', 'name email avatar')
    .sort({ settledAt: -1 });

  res.json(settlements);
});
