import express from 'express';
import {
  getGroups,
  createGroup,
  getGroupById,
  addMember,
  removeMember,
  deleteGroup,
} from '../controllers/groupController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); 

router.get('/', getGroups);
router.post('/', createGroup);
router.get('/:id', getGroupById);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);
router.delete('/:id', deleteGroup);

export default router;