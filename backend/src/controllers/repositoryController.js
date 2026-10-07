import { githubService } from '../services/githubService.js';
import { vectorService } from '../services/vectorService.js';
import Repository from '../models/Repository.js';

/**
 * Helper to ensure authenticated user presence
 */
const getAuthenticatedUserId = (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401).json({ success: false, message: 'Not authorized, user missing' });
    return null;
  }
  return String(req.user._id);
};

// @desc    Index repository code for RAG semantic search
// @route   POST /api/repositories/:id/index
// @access  Private
export const indexRepository = async (req, res) => {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) return;

  const repoId = req.params.id || (req.params.owner && req.params.repo ? `${req.params.owner}/${req.params.repo}` : '');

  try {
    const result = await vectorService.indexRepository({
      repositoryId: repoId,
      userId,
    });
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error(`[Index Repository Error] ${err.stack || err.message}`);
    return res.status(500).json({ success: false, message: 'Failed to index repository' });
  }
};

// @desc    Get indexing status of a repository
// @route   GET /api/repositories/:id/index/status
// @access  Private
export const getIndexingStatus = async (req, res) => {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) return;

  const repoId = req.params.id || (req.params.owner && req.params.repo ? `${req.params.owner}/${req.params.repo}` : '');

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const result = await vectorService.getIndexingStatus(repoId, userId);
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error(`[Indexing Status Error] ${err.stack || err.message}`);
    return res.status(500).json({ success: false, message: 'Failed to retrieve indexing status' });
  }
};

// @desc    Get all repositories for the authenticated user
// @route   GET /api/repositories
// @access  Private
export const getRepositories = async (req, res) => {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) return;

  try {
    const dbRepos = await Repository.find({ userId })
      .select('-files')
      .sort({ updatedAt: -1 })
      .lean();

    const repoMap = new Map();
    dbRepos.forEach((r) => {
      const id = r.repoId || `${r.owner}/${r.name}`;
      if (!repoMap.has(id)) {
        repoMap.set(id, {
          id,
          repoId: id,
          name: r.name,
          owner: r.owner,
          url: r.url,
          description: r.description || '',
          language: r.language || 'Unknown',
          technologies: Array.isArray(r.technologies) ? r.technologies : [],
          stars: typeof r.stars === 'number' ? r.stars : 0,
          forks: typeof r.forks === 'number' ? r.forks : 0,
          defaultBranch: r.defaultBranch || 'main',
          status: r.status || 'IMPORTED',
        });
      }
    });

    const combinedRepos = Array.from(repoMap.values()).filter((item) => typeof item === 'object');
    return res.json({ success: true, repositories: combinedRepos });
  } catch (err) {
    console.error(`[Get Repositories DB Error] ${err.stack || err.message}`);
    return res.status(500).json({ success: false, message: 'Failed to fetch repositories' });
  }
};

// @desc    Fetch public GitHub repositories for a specific user
// @route   GET /api/repositories/user-repos
// @access  Private
export const getUserGitHubRepos = async (req, res) => {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) return;

  try {
    const username = req.query.username || req.user?.githubUsername;
    if (!username) {
      return res.status(400).json({ success: false, message: 'GitHub username is required', repositories: [] });
    }

    const repos = await githubService.getUserPublicRepos(username);
    return res.json({ success: true, username, repositories: repos });
  } catch (err) {
    console.error(`[Get User GitHub Repos Error] ${err.stack || err.message}`);
    return res.status(400).json({ success: false, message: 'Failed to fetch user repositories from GitHub', repositories: [] });
  }
};

// @desc    Import repository via GitHub URL
// @route   POST /api/repositories/import
// @access  Private
export const importRepository = async (req, res) => {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) return;

  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ success: false, message: 'Please provide a valid GitHub repository URL' });
  }

  try {
    const { owner, repo } = githubService.parseRepoUrl(url);
    const metadata = await githubService.getRepoMetadata(owner, repo);
    const gitTree = await githubService.getRepoTree(owner, repo, metadata.defaultBranch);

    const fullRepoId = `${metadata.owner}/${metadata.name}`;

    let existingRepo = await Repository.findOne({
      repoId: fullRepoId,
      userId,
    });

    if (!existingRepo) {
      existingRepo = await Repository.create({
        repoId: fullRepoId,
        name: metadata.name,
        owner: metadata.owner,
        url: metadata.url,
        description: metadata.description || '',
        language: metadata.language || 'Unknown',
        technologies: metadata.technologies || [],
        stars: metadata.stars || 0,
        forks: metadata.forks || 0,
        defaultBranch: metadata.defaultBranch || 'main',
        status: 'INDEXING',
        files: gitTree || [],
        userId,
      });
    } else {
      existingRepo.status = 'INDEXING';
      existingRepo.files = gitTree || existingRepo.files;
      existingRepo.stars = metadata.stars || existingRepo.stars;
      existingRepo.forks = metadata.forks || existingRepo.forks;
      existingRepo.defaultBranch = metadata.defaultBranch || existingRepo.defaultBranch || 'main';
      await existingRepo.save();
    }

    // Trigger automated background RAG indexing pipeline asynchronously
    vectorService.indexRepository({ repositoryId: fullRepoId, userId }).catch((err) => {
      console.error(`[Background Indexing Error] ${err.stack || err.message}`);
    });

    return res.status(201).json({ success: true, repository: existingRepo });
  } catch (err) {
    console.error(`[Import Repo Error] ${err.stack || err.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to import repository.',
    });
  }
};

// @desc    Get single repository by ID
// @route   GET /api/repositories/:id
// @route   GET /api/repositories/:owner/:repo
// @access  Private
export const getRepositoryById = async (req, res) => {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) return;

  const id = req.params.id || (req.params.owner && req.params.repo ? `${req.params.owner}/${req.params.repo}` : '');

  try {
    // 1. Check user-isolated DB records first
    let repo = await Repository.findOne({ repoId: id, userId });
    if (!repo && req.params.owner && req.params.repo) {
      repo = await Repository.findOne({ owner: req.params.owner, name: req.params.repo, userId });
    }
    if (!repo && id.match(/^[0-9a-fA-F]{24}$/)) {
      repo = await Repository.findOne({ _id: id, userId });
    }

    if (repo) {
      return res.json({ success: true, repository: repo });
    }

    // 2. Fetch live data from GitHub if not imported yet
    const { owner, repo: repoName } = githubService.parseRepoUrl(id);
    const metadata = await githubService.getRepoMetadata(owner, repoName);
    const gitTree = await githubService.getRepoTree(owner, repoName, metadata.defaultBranch);

    return res.json({
      success: true,
      repository: {
        id: id || `${metadata.owner}/${metadata.name}`,
        repoId: `${metadata.owner}/${metadata.name}`,
        name: metadata.name,
        owner: metadata.owner,
        url: metadata.url,
        description: metadata.description || '',
        language: metadata.language || 'Unknown',
        stars: metadata.stars || 0,
        forks: metadata.forks || 0,
        defaultBranch: metadata.defaultBranch || 'main',
        branches: metadata.defaultBranch ? [metadata.defaultBranch] : ['main'],
        files: gitTree || [],
        stats: {
          files: gitTree?.length || 0,
        },
      },
    });
  } catch (err) {
    console.error(`[Get Repository By ID Error] ${err.stack || err.message}`);
    return res.status(404).json({ success: false, message: 'Repository not found or failed to load' });
  }
};

// @desc    Remove repository
// @route   DELETE /api/repositories/:id
// @route   DELETE /api/repositories/:owner/:repo
// @access  Private
export const deleteRepository = async (req, res) => {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) return;

  const rawId = req.params.id || (req.params.owner && req.params.repo ? `${req.params.owner}/${req.params.repo}` : '');
  const id = decodeURIComponent(rawId);

  try {
    let deleteQuery = { repoId: id, userId };
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      deleteQuery = { $or: [{ repoId: id, userId }, { _id: id, userId }] };
    }

    const deleteResult = await Repository.deleteOne(deleteQuery);
    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Repository not found or unauthorized' });
    }

    return res.json({ success: true, message: `Repository ${id} removed successfully`, repoId: id });
  } catch (err) {
    console.error(`[Delete Repository Error] ${err.stack || err.message}`);
    return res.status(500).json({ success: false, message: 'Failed to delete repository' });
  }
};

// @desc    Get raw file content for a repository file
// @route   GET /api/repositories/:id/files/content
// @route   GET /api/repositories/:owner/:repo/files/content
// @access  Private
export const getRepositoryFileContent = async (req, res) => {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) return;

  const id = req.params.id || (req.params.owner && req.params.repo ? `${req.params.owner}/${req.params.repo}` : '');
  const filePath = req.query.path;
  const ref = req.query.ref;

  if (!filePath || typeof filePath !== 'string') {
    return res.status(400).json({ success: false, message: 'File path query parameter (?path=...) is required' });
  }

  try {
    let owner = req.params.owner || '';
    let repoName = req.params.repo || '';
    let targetBranch = ref || 'main';

    let repo = await Repository.findOne({ repoId: id, userId });
    if (!repo && id.match(/^[0-9a-fA-F]{24}$/)) {
      repo = await Repository.findOne({ _id: id, userId });
    }
    if (!repo && req.params.owner && req.params.repo) {
      repo = await Repository.findOne({ owner: req.params.owner, name: req.params.repo, userId });
    }

    if (repo) {
      owner = repo.owner;
      repoName = repo.name;
      if (!ref) {
        targetBranch = repo.defaultBranch || 'main';
      }
    } else if (!owner || !repoName) {
      const parsed = githubService.parseRepoUrl(id);
      owner = parsed.owner;
      repoName = parsed.repo;
    }

    const fileData = await githubService.getRawFileContent(owner, repoName, filePath, targetBranch);

    return res.json({
      success: true,
      data: fileData,
    });
  } catch (err) {
    console.error(`[Repository File Error] ${err.stack || err.message}`);
    return res.status(404).json({
      success: false,
      message: 'Unable to fetch file content from GitHub',
    });
  }
};
