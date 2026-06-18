import express from 'express';
import {
  getDashboardStats,
  getSpendingByCategory,
  getMonthlyTrend,
} from '../controllers/statsController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/spending-by-category', getSpendingByCategory);
router.get('/monthly-trend', getMonthlyTrend);

export default router;