import express from 'express';
import {
  getGroupBalances,
  settleUp,
  getSettlementHistory,
} from '../controllers/settlementController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/balances/:groupId', getGroupBalances);
router.post('/', settleUp);
router.get('/history/:groupId', getSettlementHistory);

export default router;