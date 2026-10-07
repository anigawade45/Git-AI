import axios from 'axios';
import { cacheService } from './cacheService.js';

// Gemini embedding model locked strictly to gemini-embedding-001
const GEMINI_EMBEDDING_MODEL = 'gemini-embedding-001';

/**
 * L2 Normalization for truncated Gemini embedding vectors
 */
const normalizeEmbedding = (values) => {
  const magnitude = Math.sqrt(values.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) {
    throw new Error('Cannot normalize zero-length embedding vector');
  }
  return values.map((val) => val / magnitude);
};

const classifyEmbeddingError = (error) => {
  if (error.name === 'AbortError') return 'ABORTED';

  const status = error?.response?.status;
  const message =
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    '';

  const authPattern = /invalid.*api.*key|invalid.*key|api.?key.*invalid|unauthorized|authentication failed|permission denied/i;
  if (status === 401 || status === 403 || authPattern.test(message)) {
    return 'AUTH_ERROR';
  }

  if (status === 429 || /quota|free.?tier|resource_exhausted|credit limit/i.test(message)) {
    return 'QUOTA_EXCEEDED';
  }

  if (status === 400 || /invalid request/i.test(message)) {
    return 'INVALID_REQUEST';
  }

  if (status === 404 || /not found|unsupported|does not exist/i.test(message)) {
    return 'MODEL_NOT_FOUND';
  }

  return 'UNKNOWN';
};

/**
 * Execute Gemini API request with automatic exponential backoff + jitter for transient HTTP 429 Rate Limits
 */
const callGeminiWithRetry = async (fn, maxRetries = 3, signal = null) => {
  let attempt = 0;
  while (true) {
    if (signal?.aborted) {
      const err = new Error('Embedding generation aborted');
      err.name = 'AbortError';
      throw err;
    }
    try {
      return await fn();
    } catch (err) {
      if (err.name === 'AbortError' || signal?.aborted) throw err;
      const status = err?.response?.status;
      const message = err?.response?.data?.error?.message || err?.message || '';

      const isQuotaExceeded = /quota|free.?tier|resource_exhausted|credit limit/i.test(message);
      if (isQuotaExceeded) {
        const quotaError = new Error(
          'Gemini embedding API quota exceeded. Please wait for quota reset or check API tier limits.'
        );
        quotaError.name = 'EmbeddingQuotaError';
        throw quotaError;
      }

      const isRateLimited = status === 429 || /rate limit/i.test(message);
      if (isRateLimited && attempt < maxRetries) {
        attempt++;
        const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 500, 15000);
        console.warn(`[Gemini Rate Limit 429] Retrying request (Attempt ${attempt}/${maxRetries}) in ${Math.round(delay)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
};

const ALLOWED_TASK_TYPES = [
  'RETRIEVAL_DOCUMENT',
  'RETRIEVAL_QUERY',
  'CODE_RETRIEVAL_QUERY',
  'SEMANTIC_SIMILARITY',
  'CLASSIFICATION',
  'CLUSTERING',
  'QUESTION_ANSWERING',
  'FACT_VERIFICATION',
];

export const embeddingService = {
  /**
   * Get active default embedding model
   */
  getActiveEmbeddingModel() {
    return GEMINI_EMBEDDING_MODEL;
  },

  /**
   * Format input text for embedding with contextual metadata
   */
  formatEmbeddingInput(chunk) {
    if (typeof chunk === 'string') return chunk;
    const { repositoryId, filePath, language, symbolName, content } = chunk;
    return `Repo: ${repositoryId || 'unknown'}\nFile: ${filePath || 'unknown'}\nLanguage: ${language || 'plaintext'}\nSymbol: ${symbolName || 'N/A'}\n\n${content}`;
  },

  /**
   * Check if active embedding provider is configured
   */
  hasEmbeddingProvider() {
    return Boolean(process.env.GEMINI_API_KEY);
  },

  /**
   * Generate vector embeddings for chunks with configurable options
   */
  async generateEmbeddings(chunks, options = {}) {
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      throw new Error('No AI embedding API key configured. Please add GEMINI_API_KEY in backend/.env');
    }

    const chunkArray = Array.isArray(chunks) ? chunks : [chunks];
    if (chunkArray.length === 0) return [];

    const inputTexts = chunkArray.map((chunk) => this.formatEmbeddingInput(chunk));
    return this._generateGeminiEmbeddings(inputTexts, geminiKey, options);
  },

  async _generateGeminiEmbeddings(inputTexts, apiKey, options = {}) {
    const modelName = GEMINI_EMBEDDING_MODEL;
    if (options.model && options.model !== modelName) {
      throw new Error(
        `Unsupported embedding model: '${options.model}'. This application is locked to ${modelName}.`
      );
    }

    const expectedDimension = options.expectedDimension !== undefined ? Number(options.expectedDimension) : 768;
    if (expectedDimension !== 768) {
      throw new Error(
        `Unsupported embedding dimension: ${expectedDimension}. This application is locked to 768-dimensional embeddings.`
      );
    }

    const taskType = options.taskType || 'RETRIEVAL_DOCUMENT';
    if (!ALLOWED_TASK_TYPES.includes(taskType)) {
      throw new Error(`Unsupported embedding task type: '${taskType}'. Allowed values: ${ALLOWED_TASK_TYPES.join(', ')}`);
    }

    const timeout = options.timeout || 15000;
    const signal = options.signal;
    const batchSize = Math.min(Math.max(Number(options.batchSize) || 3, 1), 10);

    if (signal?.aborted) {
      const err = new Error('Embedding generation aborted');
      err.name = 'AbortError';
      throw err;
    }

    const allEmbeddings = [];

    // Process inputTexts in parallel batches with rate-limit retry & backoff
    for (let i = 0; i < inputTexts.length; i += batchSize) {
      if (signal?.aborted) {
        const err = new Error('Embedding generation aborted');
        err.name = 'AbortError';
        throw err;
      }

      const batchTexts = inputTexts.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batchTexts.map(async (text) => {
          return callGeminiWithRetry(async () => {
            const requestBody = {
              model: `models/${modelName}`,
              content: { parts: [{ text }] },
              output_dimensionality: expectedDimension,
              taskType,
            };

            const response = await axios.post(
              `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:embedContent?key=${apiKey}`,
              requestBody,
              { headers: { 'Content-Type': 'application/json' }, timeout, signal }
            );

            let values = response.data?.embedding?.values;
            if (!values || !Array.isArray(values) || values.length === 0) {
              throw new Error(`Empty embedding vector returned for text chunk by model '${modelName}'`);
            }

            if (values.length !== expectedDimension) {
              throw new Error(
                `Embedding vector dimension mismatch for model '${modelName}': expected ${expectedDimension}, got ${values.length}`
              );
            }

            // L2 Normalize gemini-embedding-001 768-dimensional vector
            return normalizeEmbedding(values);
          }, 4, signal);
        })
      );

      allEmbeddings.push(...batchResults);
    }

    if (allEmbeddings.length !== inputTexts.length) {
      throw new Error(`Embedding batch count mismatch: expected ${inputTexts.length}, got ${allEmbeddings.length}`);
    }

    // Attach metadata properties to returned array
    allEmbeddings.model = modelName;
    allEmbeddings.dimension = expectedDimension;

    return allEmbeddings;
  },

  async generateQueryEmbedding(queryText, options = {}) {
    if (!queryText || !queryText.trim()) {
      throw new Error('Query text is required for query embedding generation');
    }
    const cleanQuery = queryText.trim().toLowerCase();
    const activeModel = GEMINI_EMBEDDING_MODEL;
    const expectedDimension = 768;
    const taskType = options.taskType || 'CODE_RETRIEVAL_QUERY';
    const cacheKey = cacheService.generateKey('embed:query', activeModel, String(expectedDimension), taskType, cleanQuery);

    return (await cacheService.getOrSet(cacheKey, async () => {
      const res = await this.generateEmbeddings([queryText.trim()], {
        ...options,
        model: activeModel,
        expectedDimension: 768,
        taskType,
      });
      return Array.isArray(res) ? res[0] : res;
    }, 7200)).value;
  },
};
