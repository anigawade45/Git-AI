import axios from 'axios';

export const ERROR_TYPES = {
  MODEL_UNAVAILABLE: 'MODEL_UNAVAILABLE',
  RATE_LIMITED: 'RATE_LIMITED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  TEMPORARY_UNAVAILABLE: 'TEMPORARY_UNAVAILABLE',
  AUTH_ERROR: 'AUTH_ERROR',
  INVALID_REQUEST: 'INVALID_REQUEST',
  UNKNOWN: 'UNKNOWN',
};

export const classifyProviderError = (error) => {
  if (error.name === 'AbortError') {
    return 'ABORTED';
  }

  const status = error?.response?.status;
  const message =
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    '';

  const authPattern = /invalid.*api.*key|invalid.*key|api.?key.*invalid|unauthorized|authentication failed|permission denied/i;
  if (status === 401 || status === 403 || authPattern.test(message)) {
    return ERROR_TYPES.AUTH_ERROR;
  }

  if (status === 404 || /not found|no longer available|unsupported|does not exist/i.test(message)) {
    return ERROR_TYPES.MODEL_UNAVAILABLE;
  }

  // Check QUOTA_EXCEEDED before generic 429 RATE_LIMITED
  if (/quota exceeded|free.?tier|generate_content_free_tier_requests|resource_exhausted|credit limit/i.test(message)) {
    return ERROR_TYPES.QUOTA_EXCEEDED;
  }

  if (status === 429 || /rate.?limit|too many requests/i.test(message)) {
    return ERROR_TYPES.RATE_LIMITED;
  }

  if (status >= 500 || /overloaded|temporarily unavailable|no capacity available|unavailable|timeout/i.test(message)) {
    return ERROR_TYPES.TEMPORARY_UNAVAILABLE;
  }

  if (status === 400 || /context_length_exceeded|invalid request/i.test(message)) {
    return ERROR_TYPES.INVALID_REQUEST;
  }

  return ERROR_TYPES.UNKNOWN;
};

export const geminiProvider = {
  name: 'Gemini',
  models: [
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
  ],

  async generate({ systemPrompt, userPrompt, apiKey, signal }) {
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

    let lastError = null;

    for (const model of this.models) {
      if (signal?.aborted) {
        const err = new Error('Request aborted');
        err.name = 'AbortError';
        throw err;
      }

      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { temperature: 0.2 },
          },
          { headers: { 'Content-Type': 'application/json' }, timeout: 20000, signal }
        );

        const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return { content: text, provider: 'Gemini', model };
        }
      } catch (err) {
        if (err.name === 'AbortError' || signal?.aborted) {
          throw err;
        }
        const errorType = classifyProviderError(err);
        lastError = err;
        console.warn(`[Gemini Provider] Model '${model}' failed with ${errorType}: ${err.message}`);

        if (
          errorType === ERROR_TYPES.QUOTA_EXCEEDED ||
          errorType === ERROR_TYPES.AUTH_ERROR ||
          errorType === ERROR_TYPES.INVALID_REQUEST
        ) {
          break;
        }
      }
    }

    throw lastError || new Error('All Gemini models failed');
  },
};

export const groqProvider = {
  name: 'Groq',
  models: [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'meta-llama/llama-4-scout-17b',
    'openai-gpt-oss-120b',
    'openai-gpt-oss-20b',
    'mixtral-8x7b-32768',
  ],

  async generate({ systemPrompt, userPrompt, apiKey, signal }) {
    if (!apiKey) throw new Error('GROQ_API_KEY is not configured');

    let lastError = null;

    for (const model of this.models) {
      if (signal?.aborted) {
        const err = new Error('Request aborted');
        err.name = 'AbortError';
        throw err;
      }

      try {
        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.2,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 20000,
            signal,
          }
        );

        const text = response.data.choices?.[0]?.message?.content;
        if (text) {
          return { content: text, provider: 'Groq', model };
        }
      } catch (err) {
        if (err.name === 'AbortError' || signal?.aborted) {
          throw err;
        }
        const errorType = classifyProviderError(err);
        lastError = err;
        console.warn(`[Groq Provider] Model '${model}' failed with ${errorType}: ${err.message}`);

        if (
          errorType === ERROR_TYPES.QUOTA_EXCEEDED ||
          errorType === ERROR_TYPES.AUTH_ERROR ||
          errorType === ERROR_TYPES.INVALID_REQUEST
        ) {
          break;
        }
      }
    }

    throw lastError || new Error('All Groq models failed');
  },
};

export const aiGateway = {
  async processPrompt({ systemPrompt, userPrompt, signal }) {
    if (signal?.aborted) {
      const err = new Error('Request aborted');
      err.name = 'AbortError';
      throw err;
    }

    const providers = [];

    if (process.env.GEMINI_API_KEY) {
      providers.push({ provider: geminiProvider, apiKey: process.env.GEMINI_API_KEY });
    }
    if (process.env.GROQ_API_KEY) {
      providers.push({ provider: groqProvider, apiKey: process.env.GROQ_API_KEY });
    }

    if (providers.length === 0) {
      throw new Error('No LLM API keys configured (GEMINI_API_KEY or GROQ_API_KEY)');
    }

    for (const item of providers) {
      if (signal?.aborted) {
        const err = new Error('Request aborted');
        err.name = 'AbortError';
        throw err;
      }

      try {
        const result = await item.provider.generate({
          systemPrompt,
          userPrompt,
          apiKey: item.apiKey,
          signal,
        });

        console.log(`[AI Gateway Success] Request served by ${result.provider} (${result.model})`);
        return result;
      } catch (providerErr) {
        if (providerErr.name === 'AbortError' || signal?.aborted) {
          throw providerErr;
        }
        const errorType = classifyProviderError(providerErr);
        console.warn(`[AI Gateway Failover] Provider ${item.provider.name} failed with ${errorType}. Trying next provider...`);
      }
    }

    throw new Error('All AI Providers in Gateway chain failed to respond.');
  },
};
