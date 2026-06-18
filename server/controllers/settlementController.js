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

  // Get group members for user info
  const group = await Group.findById(groupId)
    .populate('members.user', 'name email avatar');

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
  const { toUserId, amount, groupId, note } = req.body;

  const settlement = await Settlement.create({
    from: req.user._id,
    to: toUserId,
    amount: parseFloat(amount),
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

// @desc    Get settlement history for a group
// @route   GET /api/settlements/history/:groupId
// @access  Private
export const getSettlementHistory = asyncHandler(async (req, res) => {
  const settlements = await Settlement.find({ group: req.params.groupId })
    .populate('from', 'name email avatar')
    .populate('to', 'name email avatar')
    .sort({ settledAt: -1 });

  res.json(settlements);
});