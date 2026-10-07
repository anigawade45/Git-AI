import express from 'express';
import { getAnalysis, runAnalysis } from '../controllers/analysisController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:repoId', protect, getAnalysis);
router.post('/:repoId/run', protect, runAnalysis);

router.get('/:owner/:repo', protect, getAnalysis);
router.post('/:owner/:repo/run', protect, runAnalysis);

export default router;
