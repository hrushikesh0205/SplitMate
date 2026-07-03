import asyncHandler from 'express-async-handler';
import Group from '../models/Group.js';
import User from '../models/User.js';
import Expense from '../models/Expense.js';
import Settlement from '../models/Settlement.js';

// @desc    Get all groups for logged in user
// @route   GET /api/groups
// @access  Private
export const getGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({
    'members.user': req.user._id,
  })
    .populate('members.user', 'name email avatar')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.json(groups);
});

// @desc    Create a group
// @route   POST /api/groups
// @access  Private
export const createGroup = asyncHandler(async (req, res) => {
  const { name, type, icon, description, cover_color } = req.body;

  const group = await Group.create({
    name,
    type: type || 'Other',
    icon: icon || '👥',
    description: description || '',
    cover_color: cover_color || 'indigo',
    createdBy: req.user._id,
    members: [
      {
        user: req.user._id,
        role: 'admin',
      },
    ],
  });

  await group.populate('members.user', 'name email avatar');
  await group.populate('createdBy', 'name email');

  res.status(201).json(group);
});

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private
export const updateGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  if (group.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only group creator can edit the group');
  }

  group.name = req.body.name?.trim() || group.name;
  group.description =
    typeof req.body.description === 'string'
      ? req.body.description.trim()
      : group.description;
  group.cover_color = req.body.cover_color || group.cover_color;
  group.type = req.body.type || group.type;
  group.icon = req.body.icon || group.icon;

  await group.save();
  await group.populate('members.user', 'name email avatar');
  await group.populate('createdBy', 'name email');

  res.json(group);
});

// @desc    Get single group by ID
// @route   GET /api/groups/:id
// @access  Private
export const getGroupById = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate('members.user', 'name email avatar')
    .populate('createdBy', 'name email');

  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  // Check if user is a member
  const isMember = group.members.some(
    (m) => m.user._id.toString() === req.user._id.toString()
  );

  if (!isMember) {
    res.status(403);
    throw new Error('Not authorized to view this group');
  }

  res.json(group);
});

// @desc    Get group members
// @route   GET /api/groups/:id/members
// @access  Private
export const getGroupMembers = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id).populate(
    'members.user',
    'name email avatar'
  );

  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  const isMember = group.members.some(
    (m) => m.user._id.toString() === req.user._id.toString()
  );

  if (!isMember) {
    res.status(403);
    throw new Error('Not authorized to view this group');
  }

  res.json(group.members);
});

// @desc    Add member to group
// @route   POST /api/groups/:id/members
// @access  Private
export const addMember = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const group = await Group.findById(req.params.id);
  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  if (group.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only group creator can add members');
  }

  // Find user by email
  const userToAdd = await User.findOne({ email });
  if (!userToAdd) {
    res.status(404);
    throw new Error('User not found with this email');
  }

  // Check if already a member
  const alreadyMember = group.members.some(
    (m) => m.user.toString() === userToAdd._id.toString()
  );

  if (alreadyMember) {
    res.status(400);
    throw new Error('User is already a member');
  }

  group.members.push({ user: userToAdd._id, role: 'member' });
  await group.save();
  await group.populate('members.user', 'name email avatar');

  res.json(group);
});

// @desc    Remove member from group
// @route   DELETE /api/groups/:id/members/:userId
// @access  Private
export const removeMember = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  if (group.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only group creator can remove members');
  }

  if (group.createdBy.toString() === req.params.userId) {
    res.status(400);
    throw new Error('Group creator cannot be removed');
  }

  group.members = group.members.filter(
    (m) => m.user.toString() !== req.params.userId
  );

  await group.save();
  await group.populate('members.user', 'name email avatar');
  await group.populate('createdBy', 'name email');
  res.json(group);
});

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private
export const deleteGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  // Only admin can delete
  if (group.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only group creator can delete the group');
  }

  await group.deleteOne();
  await Expense.deleteMany({ group: group._id });
  await Settlement.deleteMany({ group: group._id });
  res.json({ message: 'Group deleted successfully' });
});
