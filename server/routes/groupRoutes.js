import express from 'express';
import {
  getGroups,
  createGroup,
  updateGroup,
  getGroupById,
  getGroupMembers,
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
router.put('/:id', updateGroup);
router.get('/:id/members', getGroupMembers);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);
router.delete('/:id', deleteGroup);

export default router;
