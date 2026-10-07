import { aiEngine } from '../services/aiEngine.js';
import Documentation from '../models/Documentation.js';
import Repository from '../models/Repository.js';

const safeDecode = (str) => {
  if (!str) return '';
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str;
  }
};

const parseRepoId = (params) => {
  const rawId = params.repoId || (params.owner && params.repo ? `${params.owner}/${params.repo}` : '');
  return safeDecode(rawId);
};

// @desc    Get repository documentation by type (tenant-scoped)
// @route   GET /api/docs/:repoId
// @access  Private
export const getDocumentation = async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const repoId = parseRepoId(req.params);
  if (!repoId) {
    return res.status(400).json({ success: false, message: 'Repository ID is required' });
  }

  const { type = 'readme' } = req.query;

  // Validate repository ownership
  const repoRecord = await Repository.findOne({ repoId, userId });
  if (!repoRecord) {
    return res.status(404).json({ success: false, message: 'Repository not found or access denied' });
  }

  try {
    const doc = await Documentation.findOne({ repoId, userId, docType: type });
    if (doc) {
      return res.json({ success: true, documentation: doc });
    }
  } catch (err) {
    console.warn(`[Documentation DB Warning] ${err.message}`);
  }

  const generated = await aiEngine.generateDocumentationContent({ repoId, userId, docType: type });

  const newDoc = {
    id: `doc_${Date.now()}`,
    userId,
    repoId,
    repositoryId: repoId,
    repositoryName: repoId.split('/')[1] || repoId,
    owner: repoId.split('/')[0] || 'github',
    type,
    docType: type,
    title: generated.title,
    status: 'completed',
    lastGenerated: 'Just now',
    metadata: {
      version: 1,
      language: 'English',
      tone: 'Professional',
      detailLevel: 'Detailed',
      scope: 'Entire Repository',
      generatedAt: new Date().toISOString(),
    },
    content: generated.content,
    sections: generated.sections,
  };

  try {
    await Documentation.findOneAndUpdate(
      { repoId, userId, docType: type },
      newDoc,
      { upsert: true, new: true }
    );
  } catch (dbErr) {
    console.warn(`[Documentation DB Save Warning] ${dbErr.message}`);
  }

  return res.json({ success: true, documentation: newDoc });
};

// @desc    Generate / regenerate repository documentation (tenant-scoped)
// @route   POST /api/docs/:repoId/generate
// @access  Private
export const generateDocumentation = async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const repoId = parseRepoId(req.params);
  if (!repoId) {
    return res.status(400).json({ success: false, message: 'Repository ID is required' });
  }

  const { type = 'readme', options = {} } = req.body;

  // Validate repository ownership
  const repoRecord = await Repository.findOne({ repoId, userId });
  if (!repoRecord) {
    return res.status(404).json({ success: false, message: 'Repository not found or access denied' });
  }

  const generated = await aiEngine.generateDocumentationContent({ repoId, userId, docType: type, options });

  const newDoc = {
    id: `doc_${Date.now()}`,
    userId,
    repoId,
    repositoryId: repoId,
    repositoryName: repoId.split('/')[1] || repoId,
    owner: repoId.split('/')[0] || 'github',
    type,
    docType: type,
    title: generated.title,
    status: 'completed',
    lastGenerated: 'Just now',
    metadata: {
      version: 1,
      language: options.language || 'English',
      tone: options.tone || 'Professional',
      detailLevel: options.detailLevel || 'Detailed',
      scope: options.scope || 'Entire Repository',
      generatedAt: new Date().toISOString(),
    },
    content: generated.content,
    sections: generated.sections,
  };

  try {
    await Documentation.findOneAndUpdate(
      { repoId, userId, docType: type },
      newDoc,
      { upsert: true, new: true }
    );
  } catch (dbErr) {
    console.warn(`[Documentation DB Save Warning] ${dbErr.message}`);
  }

  return res.status(201).json({ success: true, documentation: newDoc });
};
