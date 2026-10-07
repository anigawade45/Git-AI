import express from 'express';
import {
  getRepositories,
  importRepository,
  getRepositoryById,
  deleteRepository,
  getRepositoryFileContent,
  getUserGitHubRepos,
  indexRepository,
  getIndexingStatus,
} from '../controllers/repositoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getRepositories);
router.get('/user-repos', protect, getUserGitHubRepos);
router.post('/import', protect, importRepository);

router.post('/:id/index', protect, indexRepository);
router.get('/:id/index/status', protect, getIndexingStatus);

router.post('/:owner/:repo/index', protect, indexRepository);
router.get('/:owner/:repo/index/status', protect, getIndexingStatus);

router.get('/:id/files/content', protect, getRepositoryFileContent);
router.get('/:id', protect, getRepositoryById);
router.delete('/:id', protect, deleteRepository);

router.get('/:owner/:repo/files/content', protect, getRepositoryFileContent);
router.get('/:owner/:repo', protect, getRepositoryById);
router.delete('/:owner/:repo', protect, deleteRepository);

export default router;
