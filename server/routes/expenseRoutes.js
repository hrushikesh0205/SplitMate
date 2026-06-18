import express from 'express';
import {
  getExpenses,
  getAllExpenses,
  getExpenseById,
  addExpense,
  deleteExpense,
} from '../controllers/expenseController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getExpenses);
router.get('/all', getAllExpenses);
router.get('/:id', getExpenseById);
router.post('/', addExpense);
router.delete('/:id', deleteExpense);

export default router;