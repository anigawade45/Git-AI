import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  logoutUser,
  githubAuthUrl,
  githubCallback,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/github', githubAuthUrl);
router.get('/github/callback', githubCallback);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;