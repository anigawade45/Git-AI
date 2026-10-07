import express from 'express';
import {
  getConversations,
  createConversation,
  sendMessage,
  streamMessage,
  deleteConversation,
  renameConversation,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.post('/conversations', protect, createConversation);
router.patch('/conversations/:id', protect, renameConversation);
router.post('/chat', protect, sendMessage);
router.post('/chat/stream', protect, streamMessage);
router.delete('/conversations/:id', protect, deleteConversation);

export default router;

