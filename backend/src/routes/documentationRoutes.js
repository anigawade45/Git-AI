import express from 'express';
import { getDocumentation, generateDocumentation } from '../controllers/documentationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:repoId', protect, getDocumentation);
router.post('/:repoId/generate', protect, generateDocumentation);

router.get('/:owner/:repo', protect, getDocumentation);
router.post('/:owner/:repo/generate', protect, generateDocumentation);

export default router;
