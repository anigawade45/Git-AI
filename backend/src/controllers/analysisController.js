import Analysis from '../models/Analysis.js';
import Repository from '../models/Repository.js';
import { analysisEngine } from '../services/analysisEngine.js';

const safeDecode = (str) => {
  if (!str) return '';
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str;
  }
};

// @desc    Get codebase health score & vulnerability audit report (tenant-scoped)
// @route   GET /api/analysis/:repoId
// @route   GET /api/analysis/:owner/:repo
// @access  Private
export const getAnalysis = async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const rawId = req.params.repoId || (req.params.owner && req.params.repo ? `${req.params.owner}/${req.params.repo}` : '');
  const repoId = safeDecode(rawId);

  try {
    // 1. Check if repository belongs to authenticated user
    const repo = await Repository.findOne({ repoId, userId });
    if (!repo) {
      return res.status(404).json({ success: false, message: 'Repository not found or access denied.' });
    }

    // 2. Reject analysis if repository is not indexed yet
    if (repo.status !== 'INDEXED') {
      return res.status(400).json({
        success: false,
        status: 'not_indexed',
        message: `Repository is not indexed yet (Current status: ${repo.status || 'INDEXING'}). Please wait for indexing to complete before running analysis.`,
      });
    }

    // 3. Find tenant-scoped analysis
    let analysis = await Analysis.findOne({ repoId, userId });
    if (!analysis) {
      try {
        analysis = await analysisEngine.runAudit({ repositoryId: repoId, userId });
      } catch (auditErr) {
        // Fallback for concurrent execution race conditions
        analysis = await Analysis.findOne({ repoId, userId });
        if (!analysis) throw auditErr;
      }
    }

    return res.json({ success: true, analysis });
  } catch (err) {
    console.error(`[Analysis Controller Error] ${err.message}`);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Run automated codebase health audit (tenant-scoped)
// @route   POST /api/analysis/:repoId/run
// @route   POST /api/analysis/:owner/:repo/run
// @access  Private
export const runAnalysis = async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const rawId = req.params.repoId || (req.params.owner && req.params.repo ? `${req.params.owner}/${req.params.repo}` : '');
  const repoId = safeDecode(rawId);

  try {
    const repo = await Repository.findOne({ repoId, userId });
    if (!repo) {
      return res.status(404).json({ success: false, message: 'Repository not found or access denied.' });
    }

    if (repo.status !== 'INDEXED') {
      return res.status(400).json({
        success: false,
        status: 'not_indexed',
        message: `Repository is not indexed yet (Current status: ${repo.status || 'INDEXING'}). Please wait for indexing to complete before running analysis.`,
      });
    }

    const analysis = await analysisEngine.runAudit({ repositoryId: repoId, userId });
    return res.json({ success: true, analysis });
  } catch (err) {
    console.error(`[Analysis Run Controller Error] ${err.message}`);
    return res.status(500).json({ success: false, message: err.message });
  }
};
