import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  searchUser,
} from '../controllers/userController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.put('/change-password', changePassword);
router.get('/search', searchUser);

export default router;