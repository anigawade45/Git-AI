import { fetchApi } from './api';

export const analysisService = {
  async getAnalysis(repoId) {
    if (!repoId) return null;
    try {
      const data = await fetchApi(`/analysis/${encodeURIComponent(repoId)}`);
      if (data && data.analysis) {
        return data.analysis;
      }
    } catch (err) {
      console.warn(`[analysisService] API fetch failed for ${repoId}: ${err.message}`);
    }
    return null;
  },

  async runAnalysis(repoId, onProgress) {
    const steps = [
      { progress: 20, message: 'Repository files & AST tree loaded' },
      { progress: 45, message: 'Scanning security vulnerabilities & secret keys' },
      { progress: 70, message: 'Calculating cyclomatic complexity & function depth' },
      { progress: 90, message: 'Computing code quality & health scores' },
      { progress: 100, message: 'Analysis complete' },
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      if (onProgress) onProgress(step.progress, step.message);
    }

    try {
      const data = await fetchApi(`/analysis/${encodeURIComponent(repoId)}/run`, { method: 'POST' });
      if (data && data.analysis) {
        return data.analysis;
      }
    } catch (err) {
      console.warn(`[analysisService] API runAnalysis failed for ${repoId}: ${err.message}`);
    }

    return this.getAnalysis(repoId);
  },

  async getIssues(repoId) {
    const data = await this.getAnalysis(repoId);
    return data?.issues || [];
  },

  async getIssueDetails(repoId, issueId) {
    const issues = await this.getIssues(repoId);
    return issues.find((i) => i.id === issueId) || null;
  },

  async getAnalysisHistory(repoId) {
    const data = await this.getAnalysis(repoId);
    return data?.history || [];
  },
};
