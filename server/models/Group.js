import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Trip', 'Home', 'Office', 'Other'],
      default: 'Other',
    },
    icon: {
      type: String,
      default: '👥',
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['admin', 'member'],
          default: 'member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalExpenses: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Group = mongoose.model('Group', groupSchema);
export default Group;