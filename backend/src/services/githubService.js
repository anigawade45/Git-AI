import axios from 'axios';
import { cacheService } from './cacheService.js';

const GITHUB_API_BASE = 'https://api.github.com';

export const githubService = {
  /**
   * Parse owner and repo name from GitHub URL or repo identifier
   */
  parseRepoUrl(urlOrName) {
    if (!urlOrName) return { owner: 'facebook', repo: 'react' };
    const sanitized = String(urlOrName).replace(/\.\./g, '').replace(/[^a-zA-Z0-9_\-\.\:\/]/g, '');
    const match = sanitized.match(/github\.com\/([a-zA-Z0-9_\-]+)\/([a-zA-Z0-9_\-]+)/);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
    }
    const parts = sanitized.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[parts.length - 2], repo: parts[parts.length - 1].replace(/\.git$/, '') };
    }
    return { owner: 'facebook', repo: sanitized || 'react' };
  },

  /**
   * Helper to resolve default branch for a repository (cached 15m)
   */
  async getDefaultBranch(owner, repo) {
    try {
      const meta = await this.getRepoMetadata(owner, repo);
      return meta?.defaultBranch || 'main';
    } catch {
      return 'main';
    }
  },

  /**
   * Fetch a user's public repositories directly from GitHub REST API (cached 10m)
   */
  async getUserPublicRepos(usernameOrQuery) {
    if (!usernameOrQuery) return [];
    const cacheKey = cacheService.generateKey('gh:user_repos', usernameOrQuery.toLowerCase().trim());

    return (await cacheService.getOrSet(cacheKey, async () => {
      let targetUsername = usernameOrQuery.trim();

      const headers = {
        'User-Agent': 'GitHub-Knowledge-Assistant',
        Accept: 'application/json',
        ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}),
      };

      if (targetUsername.includes(' ')) {
        try {
          const searchRes = await axios.get(
            `${GITHUB_API_BASE}/search/users?q=${encodeURIComponent(targetUsername)}`,
            { headers }
          );
          if (searchRes.data?.items?.length > 0) {
            targetUsername = searchRes.data.items[0].login;
          }
        } catch (searchErr) {
          console.warn(`[GitHub User Search Warning] ${searchErr.message}`);
        }
      }

      let response;
      try {
        response = await axios.get(
          `${GITHUB_API_BASE}/users/${targetUsername}/repos?sort=updated&per_page=30`,
          { headers }
        );
      } catch (directErr) {
        if (directErr.response?.status === 404 && !targetUsername.includes(' ')) {
          const searchRes = await axios.get(
            `${GITHUB_API_BASE}/search/users?q=${encodeURIComponent(targetUsername)}`,
            { headers }
          );
          if (searchRes.data?.items?.length > 0) {
            targetUsername = searchRes.data.items[0].login;
            response = await axios.get(
              `${GITHUB_API_BASE}/users/${targetUsername}/repos?sort=updated&per_page=30`,
              { headers }
            );
          } else {
            throw directErr;
          }
        } else {
          throw directErr;
        }
      }

      if (!Array.isArray(response.data)) {
        console.warn(`[GitHub API User Repos Warning] Response for ${targetUsername} is not an array.`);
        return [];
      }

      return response.data.map((repo) => ({
        id: `${repo.owner.login}/${repo.name}`,
        repoId: `${repo.owner.login}/${repo.name}`,
        name: repo.name,
        owner: repo.owner.login,
        url: repo.html_url,
        description: repo.description || `Public GitHub repository ${repo.owner.login}/${repo.name}`,
        language: repo.language || 'JavaScript',
        technologies: [repo.language || 'JavaScript'].filter(Boolean),
        stars: repo.stargazers_count >= 1000 ? `${(repo.stargazers_count / 1000).toFixed(1)}k` : `${repo.stargazers_count}`,
        forks: `${repo.forks_count}`,
        defaultBranch: repo.default_branch || 'main',
        status: 'Analyzed',
        lastAnalyzed: 'Just now',
      }));
    }, 600)).value;
  },

  /**
   * Fetch repository metadata from GitHub REST API (cached 15m)
   */
  async getRepoMetadata(owner, repo) {
    const cacheKey = cacheService.generateKey('gh:metadata', owner.toLowerCase(), repo.toLowerCase());

    return (await cacheService.getOrSet(cacheKey, async () => {
      const headers = {
        'User-Agent': 'GitHub-Knowledge-Assistant',
        Accept: 'application/json',
        ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}),
      };

      try {
        const response = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, { headers });
        const data = response.data;

        return {
          id: data.name,
          name: data.name,
          owner: data.owner.login,
          url: data.html_url,
          description: data.description || 'GitHub repository imported and indexed for AI code chat.',
          language: data.language || 'JavaScript',
          technologies: [data.language || 'JavaScript'].filter(Boolean),
          stars: data.stargazers_count >= 1000 ? `${(data.stargazers_count / 1000).toFixed(1)}k` : `${data.stargazers_count}`,
          forks: `${data.forks_count}`,
          defaultBranch: data.default_branch || 'main',
          status: 'Analyzed',
          lastAnalyzed: 'Just now',
        };
      } catch (error) {
        const errMsg = error.response?.data?.message || error.message;
        throw new Error(`Failed to fetch GitHub repository metadata for '${owner}/${repo}': ${errMsg}`);
      }
    }, 900)).value;
  },

  /**
   * Fetch repository directory tree structure (cached 15m)
   */
  async getRepoTree(owner, repo, branch = null) {
    const targetBranch = branch || (await this.getDefaultBranch(owner, repo));
    const cacheKey = cacheService.generateKey('gh:tree', owner.toLowerCase(), repo.toLowerCase(), targetBranch);

    return (await cacheService.getOrSet(cacheKey, async () => {
      const headers = {
        'User-Agent': 'GitHub-Knowledge-Assistant',
        Accept: 'application/json',
        ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}),
      };

      try {
        const response = await axios.get(
          `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${encodeURIComponent(targetBranch)}?recursive=1`,
          { headers }
        );
        if (!response.data?.tree || !Array.isArray(response.data.tree)) {
          throw new Error('Invalid or empty tree payload returned by GitHub API');
        }
        return this.transformGitTree(response.data.tree);
      } catch (error) {
        const errMsg = error.response?.data?.message || error.message;
        throw new Error(`Failed to fetch GitHub repository tree for '${owner}/${repo}' (branch: ${targetBranch}): ${errMsg}`);
      }
    }, 900)).value;
  },

  /**
   * Transform flat GitHub git tree into nested JSON folder hierarchy (unbounded file tree mapping)
   */
  transformGitTree(treeArray = []) {
    const root = [];
    const map = {};

    treeArray.forEach((item) => {
      const parts = item.path.split('/');
      const fileName = parts[parts.length - 1];
      const isFolder = item.type === 'tree';

      const node = {
        id: `node-${item.sha ? item.sha.substring(0, 8) : Math.random().toString(36).substring(2, 8)}`,
        name: fileName,
        type: isFolder ? 'folder' : 'file',
        path: item.path,
        language: fileName.endsWith('.js') ? 'javascript' : fileName.endsWith('.json') ? 'json' : 'plaintext',
        size: item.size ? `${(item.size / 1024).toFixed(1)} KB` : '1.0 KB',
      };

      if (isFolder) node.children = [];
      map[item.path] = node;

      if (parts.length === 1) {
        root.push(node);
      } else {
        const parentPath = parts.slice(0, -1).join('/');
        if (map[parentPath] && map[parentPath].children) {
          map[parentPath].children.push(node);
        } else {
          root.push(node);
        }
      }
    });

    return root;
  },

  /**
   * Fetch raw source code file content from GitHub REST API and decode Base64 (cached 10m)
   */
  async getRawFileContent(owner, repo, filePath, ref = null) {
    if (!owner || !repo || !filePath) {
      throw new Error('Owner, repository name, and file path are required');
    }

    const targetRef = ref || (await this.getDefaultBranch(owner, repo));
    const cacheKey = cacheService.generateKey('gh:file', owner.toLowerCase(), repo.toLowerCase(), targetRef, filePath);

    return (await cacheService.getOrSet(cacheKey, async () => {
      const headers = {
        'User-Agent': 'GitHub-Knowledge-Assistant',
        Accept: 'application/json',
        ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}),
      };

      const encodedPath = filePath.split('/').map(encodeURIComponent).join('/');
      const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(targetRef)}`;

      try {
        const response = await axios.get(url, { headers });
        const data = response.data;

        if (Array.isArray(data)) {
          throw new Error(`Requested path '${filePath}' is a directory, not a file`);
        }

        let contentStr = '';
        if (data.encoding === 'base64' && data.content) {
          const cleanedBase64 = data.content.replace(/\s/g, '');
          contentStr = Buffer.from(cleanedBase64, 'base64').toString('utf-8');
        } else if (data.content) {
          contentStr = data.content;
        }

        return {
          path: data.path || filePath,
          name: data.name || filePath.split('/').pop(),
          content: contentStr,
          encoding: 'utf-8',
          size: data.size || contentStr.length,
          sha: data.sha || '',
        };
      } catch (error) {
        if (error.response?.status === 404) {
          throw new Error(`File not found on GitHub repository: ${filePath}`);
        }
        const errMsg = error.response?.data?.message || error.message;
        throw new Error(`GitHub API file fetch error: ${errMsg}`);
      }
    }, 600)).value;
  },

  /**
   * Fetch latest commit SHA for a branch (cached 10m)
   */
  async getLatestCommitSha(owner, repo, branch = null) {
    const targetBranch = branch || (await this.getDefaultBranch(owner, repo));
    const cacheKey = cacheService.generateKey('gh:commit', owner.toLowerCase(), repo.toLowerCase(), targetBranch);

    return (await cacheService.getOrSet(cacheKey, async () => {
      try {
        const headers = {
          'User-Agent': 'GitHub-Knowledge-Assistant',
          Accept: 'application/json',
          ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}),
        };
        const response = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/commits/${encodeURIComponent(targetBranch)}`, { headers });
        return response.data?.sha || response.data?.commit?.sha || null;
      } catch (err) {
        console.warn(`[GitHub API Commit SHA Warning] ${err.message}`);
        return null;
      }
    }, 600)).value;
  },
};
