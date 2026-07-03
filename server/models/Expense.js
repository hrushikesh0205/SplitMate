import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    category: {
      type: String,
      enum: [
        'food',
        'transport',
        'rent',
        'utilities',
        'entertainment',
        'shopping',
        'travel',
        'health',
        'education',
        'gift',
        'general',
        'other',
      ],
      default: 'general',
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    splits: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        amount: {
          type: Number,
          required: true,
        },
        isPaid: {
          type: Boolean,
          default: false,
        },
      },
    ],
    splitType: {
      type: String,
      enum: ['equal', 'percentage', 'exact'],
      default: 'equal',
    },
    note: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
