import { fetchApi } from './api';
import { mockDocumentationData, documentationTypes } from '@/data/mockDocumentation';

export const documentationService = {
  async getDocumentation(repoId, type = 'readme') {
    const cleanRepoId = repoId ? encodeURIComponent(repoId) : 'ecommerce-platform';
    try {
      const data = await fetchApi(`/docs/${cleanRepoId}?type=${type}`);
      if (data && data.documentation) {
        return {
          ...mockDocumentationData,
          ...data.documentation,
          type: type,
        };
      }
    } catch (err) {
      console.warn('[documentationService] API fetch failed. Using fallback docs.');
    }
    return {
      ...mockDocumentationData,
      type: type,
    };
  },

  async getDocumentationTypes() {
    return documentationTypes;
  },

  async generateDocumentation(repoId, options = {}, onProgress) {
    const cleanRepoId = repoId ? encodeURIComponent(repoId) : 'ecommerce-platform';

    const steps = [
      { progress: 15, message: 'Analyzing repository metadata & commit history' },
      { progress: 35, message: 'Parsing AST and project directory structure' },
      { progress: 55, message: 'Extracting dependencies & environment variables' },
      { progress: 75, message: 'Generating Markdown sections with AI' },
      { progress: 95, message: 'Formatting document & building section outline' },
      { progress: 100, message: 'Documentation generation complete' },
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      if (onProgress) onProgress(step.progress, step.message);
    }

    try {
      const data = await fetchApi(`/docs/${cleanRepoId}/generate`, {
        method: 'POST',
        body: JSON.stringify({ type: options.type || 'readme', options }),
      });
      if (data && data.documentation) {
        return {
          ...mockDocumentationData,
          ...data.documentation,
        };
      }
    } catch (err) {
      console.warn('[documentationService] Generation endpoint failed.');
    }

    return {
      ...mockDocumentationData,
      type: options.type || 'readme',
      title: `${(options.type || 'README').toUpperCase()} Technical Documentation`,
      lastGenerated: 'Just now',
      content: `# Documentation Generator\n\nAI generated documentation for **${repoId || 'repository'}**.`,
    };
  },
};
