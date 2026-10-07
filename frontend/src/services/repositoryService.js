import { fetchApi } from './api';
import { mockRepositoryData } from '@/data/mockRepository';

export const repositoryService = {
  async getRepository(id) {
    try {
      const data = await fetchApi(`/repositories/${encodeURIComponent(id)}`);
      if (data && data.repository) {
        const r = data.repository;
        const actualId = r.id || r.repoId || id;
        return {
          id: actualId,
          repoId: actualId,
          name: r.name || actualId.split('/')[1] || actualId,
          owner: r.owner || actualId.split('/')[0] || 'github',
          url: r.url || `https://github.com/${actualId}`,
          description: r.description || '',
          language: r.language || 'JavaScript',
          technologies: r.technologies || [],
          stars: r.stars || 0,
          forks: r.forks || 0,
          status: r.status || 'INDEXED',
          files: r.files || [],
          stats: r.stats || { files: r.files?.length || 0 },
        };
      }
    } catch (err) {
      console.warn(`[repositoryService] API fetch failed for ${id}: ${err.message}`);
    }
    return {
      ...mockRepositoryData,
      id: id,
      repoId: id,
    };
  },

  async getRepositoryFiles(id) {
    const repo = await this.getRepository(id);
    return repo.files || mockRepositoryData.files;
  },

  async getFileContent(id, filePath) {
    if (!id || !filePath) return null;
    try {
      const data = await fetchApi(`/repositories/${id}/files/content?path=${encodeURIComponent(filePath)}`);
      if (data && data.data) {
        return data.data;
      }
    } catch (err) {
      console.error(`[repositoryService] File fetch error for ${filePath}: ${err.message}`);
      throw err;
    }
    throw new Error(`Unable to fetch file content for ${filePath}`);
  },

  async searchFiles(id, query) {
    if (!query) return [];
    const files = await this.getRepositoryFiles(id);

    const results = [];
    const searchRecursive = (items) => {
      for (const item of items) {
        if (
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.path.toLowerCase().includes(query.toLowerCase())
        ) {
          results.push(item);
        }
        if (item.type === 'folder' && item.children) {
          searchRecursive(item.children);
        }
      }
    };

    searchRecursive(files);
    return results;
  },

  async getUserRepos(username) {
    try {
      const query = username ? `?username=${encodeURIComponent(username)}` : '';
      const data = await fetchApi(`/repositories/user-repos${query}`);
      if (data && data.success === false && data.message) {
        throw new Error(data.message);
      }
      return data?.repositories || [];
    } catch (err) {
      console.warn('[repositoryService] getUserRepos error:', err.message);
      throw err;
    }
  },

  async indexRepository(id) {
    try {
      const data = await fetchApi(`/repositories/${id}/index`, { method: 'POST' });
      return data?.data || data;
    } catch (err) {
      console.error(`[repositoryService] indexRepository error: ${err.message}`);
      throw err;
    }
  },

  async getIndexStatus(id) {
    try {
      const data = await fetchApi(`/repositories/${encodeURIComponent(id)}/index/status?_t=${Date.now()}`);
      return data?.data || data;
    } catch (err) {
      console.warn(`[repositoryService] getIndexStatus error: ${err.message}`);
      return { status: 'NOT_INDEXED', totalChunks: 0 };
    }
  },
};

