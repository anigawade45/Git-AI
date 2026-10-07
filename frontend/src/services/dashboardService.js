import { fetchApi } from './api';

export const dashboardService = {
  async getDashboardData() {
    const data = await fetchApi('/dashboard');

    if (!data?.success) {
      throw new Error(data?.message || 'Unable to load dashboard data.');
    }

    return {
      stats: data.stats || [],
      repositories: data.repositories || [],
      activities: data.activities || [],
    };
  },

  async importRepository(url) {
    const res = await fetchApi('/repositories/import', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });

    if (!res?.repository) {
      throw new Error(res?.message || 'Repository import failed.');
    }

    return res.repository;
  },

  async removeRepository(repoId) {
    const res = await fetchApi(
      `/repositories/${encodeURIComponent(repoId)}`,
      {
        method: 'DELETE',
      }
    );

    if (res?.success === false) {
      throw new Error(res?.message || 'Repository deletion failed.');
    }

    return {
      success: true,
      repoId,
    };
  },
};
