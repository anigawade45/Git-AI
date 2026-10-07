import axios from 'axios';
import { aiGateway } from './aiGateway.js';
import { ragService } from './ragService.js';

const GEMINI_TEXT_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
];

const classifyGeminiError = (error) => {
  if (error.name === 'AbortError') {
    return 'ABORTED';
  }

  const status = error?.response?.status;
  const message =
    error?.response?.data?.error?.message ||
    error?.message ||
    '';

  if (
    status === 404 ||
    /not found|no longer available|unsupported/i.test(message)
  ) {
    return 'MODEL_UNAVAILABLE';
  }

  if (
    /quota exceeded|free.?tier|generate_content_free_tier_requests|resource_exhausted/i.test(
      message
    )
  ) {
    return 'QUOTA_EXCEEDED';
  }

  if (
    status === 429 ||
    /rate.?limit|too many requests/i.test(message)
  ) {
    return 'RATE_LIMITED';
  }

  if (
    status === 503 ||
    /overloaded|temporarily unavailable|no capacity available|unavailable/i.test(message)
  ) {
    return 'TEMPORARY_UNAVAILABLE';
  }

  return 'UNKNOWN';
};

const safeDecode = (value) => {
  if (!value) return '';
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const getContextFileSources = (contextFile) => {
  if (!contextFile) return [];
  return [
    {
      fileName: contextFile.name,
      filePath: contextFile.path,
      startLine: contextFile.startLine ?? null,
      endLine: contextFile.endLine ?? null,
      language: contextFile.language || 'plaintext',
    },
  ];
};

const parseLineRangesForFile = (aiText, fileName, filePath) => {
  const identifiers = new Set();
  if (filePath) identifiers.add(filePath.toLowerCase());
  if (fileName) identifiers.add(fileName.toLowerCase());
  if (filePath && filePath.includes('/')) {
    identifiers.add(filePath.split('/').pop().toLowerCase());
  }

  const ranges = [];

  for (const id of identifiers) {
    if (!id || id.length < 2) continue;
    const escaped = id.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

    // Matches: filename lines X-Y, filename:X-Y, filename (lines X to Y), filename L30-L40, etc.
    const rangeRegex = new RegExp(
      `${escaped}[\\\`\\)\\]\\s\\:,]*(?:(?:lines?|l)\\s*)?:?\\s*(\\d+)\\s*(?:-|to|–|—)\\s*(?:l|lines?)?\\s*(\\d+)`,
      'gi'
    );
    let match;
    while ((match = rangeRegex.exec(aiText)) !== null) {
      const s = parseInt(match[1], 10);
      const e = parseInt(match[2], 10);
      if (!isNaN(s) && !isNaN(e)) {
        ranges.push({ start: Math.min(s, e), end: Math.max(s, e) });
      }
    }

    // Matches single line: filename line X, filename:X, filename (line X)
    const singleRegex = new RegExp(
      `${escaped}[\\\`\\)\\]\\s\\:,]*(?:(?:lines?|l)\\s*|:)\\s*(\\d+)(?!\\s*(?:-|to|–|—|\\d))`,
      'gi'
    );
    while ((match = singleRegex.exec(aiText)) !== null) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num)) {
        ranges.push({ start: num, end: num });
      }
    }
  }

  return ranges;
};

const validateCitations = (aiText, activeSources) => {
  if (!aiText || !activeSources || activeSources.length === 0) return [];

  const validSources = activeSources.filter((src) => {
    const fileNameLower = (src.fileName || '').toLowerCase();
    const filePathLower = (src.filePath || '').toLowerCase();
    const textLower = aiText.toLowerCase();

    // 1. Must explicitly mention filename or path
    const isFileMentioned =
      (fileNameLower && textLower.includes(fileNameLower)) ||
      (filePathLower && textLower.includes(filePathLower));

    if (!isFileMentioned) return false;

    // 2. Parse cited line ranges for this file
    const citedRanges = parseLineRangesForFile(aiText, src.fileName, src.filePath);

    // If no specific line numbers/ranges were cited, but the file was explicitly mentioned in text, confirm file mention
    if (citedRanges.length === 0) {
      return true;
    }

    // 3. If line ranges were cited, verify overlap with source chunk range
    if (src.startLine !== null && src.endLine !== null && src.startLine !== undefined && src.endLine !== undefined) {
      const hasOverlap = citedRanges.some(
        (range) => range.start <= src.endLine && range.end >= src.startLine
      );
      return hasOverlap;
    }

    return true;
  });

  // Strict Rule: Return ONLY sources that were explicitly cited in text with verified range overlap.
  // DO NOT fall back to activeSources if no citations were present!
  return validSources;
};

export const aiEngine = {
  /**
   * Conversation-Aware Query Rewriter:
   * Rewrites conversational follow-up questions into a fully qualified standalone search query.
   * Uses Gemini model chain with AbortSignal support.
   */
  async rewriteQueryWithHistory({ prompt, history = [], signal }) {
    if (!prompt || !Array.isArray(history) || history.length === 0) {
      return prompt;
    }

    if (signal?.aborted) {
      return prompt;
    }

    const lowerPrompt = prompt.toLowerCase();
    // Exclude 'this repository', 'this repo', 'this project', 'this codebase' from triggering ambiguous pronoun rewriting
    const cleanedForCheck = lowerPrompt.replace(/\bthis\s+(?:repository|repo|project|codebase|app|folder)\b/g, '');
    const hasAmbiguousPronouns = /\b(it|that|they|them|there|the function|the file|the class|same|again|how does it|where is it)\b/i.test(cleanedForCheck);

    if (!hasAmbiguousPronouns && prompt.trim().split(/\s+/).length > 5) {
      return prompt;
    }

    const recentTurns = history.slice(-4);
    const turnSummary = recentTurns
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content.slice(0, 250)}`)
      .join('\n');

    const rewritePrompt = `Given the conversation history and a new follow-up question, rewrite the follow-up question into a single concise standalone codebase search query. Make sure to replace any ambiguous pronouns (like 'it', 'that', 'the file', 'the function') with the actual file names, function names, or code concepts discussed in the history. Do NOT explain, output ONLY the rewritten search query.

Conversation History:
${turnSummary}

New Question: ${prompt}

Standalone Search Query:`;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      for (const model of GEMINI_TEXT_MODELS) {
        if (signal?.aborted) return prompt;
        try {
          const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
            {
              contents: [{ role: 'user', parts: [{ text: rewritePrompt }] }],
              generationConfig: { temperature: 0.0, maxOutputTokens: 60 },
            },
            { headers: { 'Content-Type': 'application/json' }, timeout: 3000, signal }
          );

          const rewrittenText = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (rewrittenText && rewrittenText.length > 3) {
            console.log(`[Query Rewriter] Original: "${prompt}" -> Rewritten: "${rewrittenText}"`);
            return rewrittenText;
          }
        } catch (err) {
          if (err.name === 'AbortError' || signal?.aborted) return prompt;
          const errorType = classifyGeminiError(err);
          if (errorType === 'QUOTA_EXCEEDED') {
            console.warn(`[Query Rewriter Gemini Quota Exceeded] Breaking model loop early.`);
            break;
          }
        }
      }
    }

    try {
      if (!signal?.aborted) {
        const result = await aiGateway.processPrompt({
          systemPrompt: 'You are a query rewriter. Output ONLY the rewritten search query without explanation or quotes.',
          userPrompt: rewritePrompt,
          signal,
        });
        const text = result?.content?.trim();
        if (text && text.length > 3) {
          return text;
        }
      }
    } catch (gwErr) {
      // ignore
    }

    // Safe Fallback: Return original prompt if LLM rewriter is unavailable to prevent search query contamination
    return prompt;
  },

  cleanRuleBasedTitle(prompt = '') {
    if (!prompt || typeof prompt !== 'string') return 'New Codebase Query';

    let cleaned = prompt.trim().replace(/[?!=`"']/g, '').trim();

    // 1. Strip common question prefixes & leading articles
    cleaned = cleaned.replace(/^(which\s+file\s+(contains|has|includes|is)|where\s+is|where\s+are|how\s+does|how\s+do|show\s+me\s+the|explain\s+the|can\s+you\s+show|find\s+the|search\s+for|what\s+is|what\s+are|tell\s+me\s+about|is\s+there\s+a|are\s+there\s+any|does\s+this\s+(repository|repo|project|codebase)\s+(contain|have|include|support)?)\s*/i, '');
    cleaned = cleaned.replace(/^(the|a|an)\s+/i, '');

    // 2. Specific domain replacements
    if (/authentication\s*(work|flow|logic|system)?/i.test(cleaned)) {
      cleaned = cleaned.replace(/authentication\s*(work|logic|system)?/i, 'Authentication Flow');
    }

    cleaned = cleaned.replace(/\b(solution\s+for|implementation\s+of)\b/gi, '');
    cleaned = cleaned.replace(/\b(configured|implemented|defined|located|created|built)\b/gi, '');
    cleaned = cleaned.replace(/^(the|a|an)\s+/i, '');

    const words = cleaned.trim().split(/\s+/).filter((w) => w.length > 0);
    if (words.length === 0) return 'New Codebase Query';

    const titleWords = words.slice(0, 5).map((w) => w.charAt(0).toUpperCase() + w.slice(1));
    let title = titleWords.join(' ');

    if (prompt.toLowerCase().includes('solution') && !title.toLowerCase().includes('solution')) {
      title += ' Solution';
    } else if ((prompt.toLowerCase().includes('trie') || prompt.toLowerCase().includes('implementation')) && !title.toLowerCase().includes('implementation') && !title.toLowerCase().includes('flow')) {
      title += ' Implementation';
    }

    return title.slice(0, 45).trim() || 'New Codebase Query';
  },

  async generateConversationTitle(prompt = '') {
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return 'New Codebase Query';
    }

    const titlePrompt = `Summarize this user question into a short 3 to 5 word semantic title. Capitalize key words. Output ONLY the title text without quotes, markdown, or punctuation.

Examples:
Question: "Which file contains the HashMap solution for Two Sum?"
Title: HashMap Two Sum Solution

Question: "Where is the MongoDB connection configured?"
Title: MongoDB Connection

Question: "How does authentication work?"
Title: Authentication Flow

Question: "Show me the Binary Search implementation"
Title: Binary Search Implementation

Question: "Does this repo contain a Trie?"
Title: Trie Implementation

Question: "Explain the repository architecture"
Title: Repository Architecture

Question: "${prompt.trim()}"
Title:`;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      const titleModels = ['gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.5-flash-lite'];
      for (const model of titleModels) {
        try {
          const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
            {
              contents: [{ role: 'user', parts: [{ text: titlePrompt }] }],
              generationConfig: { temperature: 0.2, maxOutputTokens: 25 },
            },
            { headers: { 'Content-Type': 'application/json' }, timeout: 2500 }
          );

          const llmTitle = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
            .replace(/[#*`"']/g, '')
            .replace(/\s+/g, ' ');

          if (llmTitle && llmTitle.length >= 3 && llmTitle.length <= 50) {
            console.log(`[Semantic Title Generator LLM Success (${model})] Title: "${llmTitle}"`);
            return llmTitle;
          }
        } catch (err) {
          const errorType = classifyGeminiError(err);
          if (errorType === 'QUOTA_EXCEEDED') {
            console.warn(`[Semantic Title Generator Gemini Quota Exceeded] Breaking model loop early.`);
            break;
          }
        }
      }
    }

    return this.cleanRuleBasedTitle(prompt);
  },

  async processChatPrompt({ prompt, ragContextText, sources = [], contextFile, repoId, signal }) {
    if (signal?.aborted) {
      const err = new Error('Request aborted');
      err.name = 'AbortError';
      throw err;
    }

    const systemPrompt = `You are an expert AI Software Engineer assisting with codebase Q&A for repository: '${repoId}'.

MANDATORY ANSWER GROUNDING RULES:
1. Base your answer STRICTLY on the provided retrieved codebase context below.
2. Do NOT invent implementation details, files, or functions that are not explicitly present in the context.
3. Cite exact file paths and line ranges (e.g., \`path/to/file.js\` lines X-Y) when referencing code.
4. If the provided codebase context does not contain enough evidence to answer the question, explicitly state: "The retrieved repository context is insufficient to answer this query."
5. Distinguish observed codebase implementation from general technical inference.
6. Do not claim a feature exists merely because it is a common software development convention.
7. Never fabricate or hallucinate source citations.`;

    const userPrompt = ragContextText
      ? `RETRIEVED CODEBASE CONTEXT:\n${ragContextText}\n\nUSER QUESTION:\n${prompt}`
      : contextFile
        ? `FILE CONTEXT: ${contextFile.name} (${contextFile.path})\n\nUSER QUESTION:\n${prompt}`
        : `USER QUESTION:\n${prompt}`;

    const activeSources = sources.length > 0 ? sources : getContextFileSources(contextFile);

    // AI Gateway Multi-Provider Chain (Gemini -> Groq) with AbortSignal
    try {
      const gatewayResult = await aiGateway.processPrompt({ systemPrompt, userPrompt, signal });
      if (gatewayResult?.content) {
        return {
          content: gatewayResult.content,
          provider: gatewayResult.provider,
          model: gatewayResult.model,
          sources: validateCitations(gatewayResult.content, activeSources),
        };
      }
    } catch (gatewayErr) {
      if (gatewayErr.name === 'AbortError' || signal?.aborted) {
        throw gatewayErr;
      }
      console.warn(`[AI Engine Gateway Warning] ${gatewayErr.message}`);
    }

    const fallbackText = activeSources.length > 0
      ? `AI synthesis service is currently unavailable. However, relevant codebase context was retrieved from the following files:\n` +
      activeSources.map((s, i) => `${i + 1}. \`${s.filePath || s.fileName}\`${s.startLine ? ` (Lines ${s.startLine}-${s.endLine})` : ''}`).join('\n') +
      `\n\n*Please verify API key configuration in \`backend/.env\`.*`
      : `AI synthesis service is currently unavailable and no relevant codebase context was found for this query.`;

    return {
      content: fallbackText,
      provider: 'SystemFallback',
      model: 'None',
      sources: validateCitations(fallbackText, activeSources),
    };
  },

  /**
   * Stream prompt completion tokens with code context citations
   * Supports High-Availability Chain for Google Gemini API models and AbortSignal propagation
   */
  async streamChatPrompt({ prompt, ragContextText, sources = [], contextFile, repoId, onToken, signal }) {
    const geminiApiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = `You are an expert AI Software Engineer assisting with codebase Q&A for repository: '${repoId}'.

MANDATORY ANSWER GROUNDING RULES:
1. Base your answer STRICTLY on the provided retrieved codebase context below.
2. Do NOT invent implementation details, files, or functions that are not explicitly present in the context.
3. Cite exact file paths and line ranges (e.g., \`path/to/file.js\` lines X-Y) when referencing code.
4. If the provided codebase context does not contain enough evidence to answer the question, explicitly state: "The retrieved repository context is insufficient to answer this query."
5. Distinguish observed codebase implementation from general technical inference.
6. Do not claim a feature exists merely because it is a common software development convention.
7. Never fabricate or hallucinate source citations.`;

    const userPrompt = ragContextText
      ? `RETRIEVED CODEBASE CONTEXT:\n${ragContextText}\n\nUSER QUESTION:\n${prompt}`
      : contextFile
        ? `FILE CONTEXT: ${contextFile.name} (${contextFile.path})\n\nUSER QUESTION:\n${prompt}`
        : `USER QUESTION:\n${prompt}`;

    const activeSources = sources.length > 0 ? sources : getContextFileSources(contextFile);

    // 1. Gemini Streaming High-Availability Chain
    if (geminiApiKey) {
      let quotaExceeded = false;
      let quotaMessage = '';

      for (const model of GEMINI_TEXT_MODELS) {
        if (signal?.aborted) {
          const abortErr = new Error('Streaming aborted');
          abortErr.name = 'AbortError';
          throw abortErr;
        }

        let emittedTokens = false;
        try {
          const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${geminiApiKey}`,
            {
              contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
              systemInstruction: { parts: [{ text: systemPrompt }] },
              generationConfig: { temperature: 0.2 },
            },
            {
              headers: { 'Content-Type': 'application/json' },
              responseType: 'stream',
              timeout: 30000,
              signal,
            }
          );

          let fullContent = '';
          let buffer = '';

          const result = await new Promise((resolve, reject) => {
            const onAbort = () => {
              if (response.data && typeof response.data.destroy === 'function') {
                response.data.destroy();
              }
              const err = new Error('Streaming aborted');
              err.name = 'AbortError';
              reject(err);
            };

            if (signal) {
              if (signal.aborted) return onAbort();
              signal.addEventListener('abort', onAbort, { once: true });
            }

            response.data.on('data', (chunk) => {
              if (signal?.aborted) return;
              buffer += chunk.toString();
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('data: ')) {
                  try {
                    const parsed = JSON.parse(trimmed.replace('data: ', ''));
                    const token = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (token) {
                      fullContent += token;
                      emittedTokens = true;
                      if (!signal?.aborted) onToken(token);
                    }
                  } catch (e) {
                    // ignore incomplete chunk parse warning
                  }
                }
              }
            });

            response.data.on('end', () => {
              if (signal?.aborted) {
                const err = new Error('Streaming aborted');
                err.name = 'AbortError';
                return reject(err);
              }
              if (buffer.trim()) {
                const trimmed = buffer.trim();
                if (trimmed.startsWith('data: ')) {
                  try {
                    const parsed = JSON.parse(trimmed.replace('data: ', ''));
                    const token = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (token) {
                      fullContent += token;
                      emittedTokens = true;
                      if (!signal?.aborted) onToken(token);
                    }
                  } catch (e) {
                    // ignore incomplete final chunk parse warning
                  }
                }
              }
              resolve({ content: fullContent, sources: validateCitations(fullContent, activeSources) });
            });
            response.data.on('error', (err) => reject(err));
          });

          if (result && result.content) {
            return result;
          }
        } catch (err) {
          if (err.name === 'AbortError' || signal?.aborted) {
            throw err;
          }
          if (emittedTokens) {
            console.warn(`[Gemini Stream Interrupted]: Mid-generation error after tokens emitted.`);
            throw err;
          }
          const errMsg = err.response?.data?.error?.message || err.message;
          const errorType = classifyGeminiError(err);
          console.warn(`[Gemini Stream Model '${model}' Warning] (${errorType}): ${errMsg}`);

          if (errorType === 'QUOTA_EXCEEDED') {
            quotaExceeded = true;
            quotaMessage = errMsg;
            break; // Stop cascading through remaining Gemini models immediately!
          }
        }
      }

      if (quotaExceeded) {
        console.warn(`[Gemini Stream Quota Warning]: ${quotaMessage || 'Gemini API free tier quota limit reached.'}`);
      }
    }

    // 2. Fallback AI Gateway / Synthesis Engine
    if (signal?.aborted) {
      const abortErr = new Error('Streaming aborted');
      abortErr.name = 'AbortError';
      throw abortErr;
    }

    const result = await this.processChatPrompt({ prompt, ragContextText, sources: activeSources, contextFile, repoId, signal });
    const text = result.content;
    const words = text.split(' ');

    for (let i = 0; i < words.length; i++) {
      if (signal?.aborted) {
        const abortErr = new Error('Streaming aborted');
        abortErr.name = 'AbortError';
        throw abortErr;
      }
      const wordToken = (i === 0 ? '' : ' ') + words[i];
      onToken(wordToken);
      await new Promise((resolve) => setTimeout(resolve, 15));
    }

    return result;
  },

  /**
   * Generate Markdown Documentation for repository using indexed codebase RAG data (tenant-scoped)
   */
  async generateDocumentationContent({ repoId, userId, docType = 'readme', options = {} }) {
    const rawRepoId = safeDecode(repoId);
    const repoName = rawRepoId.split('/')[1] || rawRepoId;

    const ALLOWED_DOC_TYPES = ['readme', 'api', 'architecture', 'technical'];
    const ALLOWED_TONES = ['Professional', 'Technical', 'Simple', 'Executive'];
    const ALLOWED_DETAIL_LEVELS = ['Brief', 'Detailed', 'Comprehensive'];
    const ALLOWED_LANGUAGES = ['English', 'Hindi', 'Marathi', 'Spanish', 'French', 'German'];

    const cleanDocType = ALLOWED_DOC_TYPES.includes((docType || '').toLowerCase())
      ? docType.toLowerCase()
      : 'readme';

    const cleanTone = ALLOWED_TONES.includes(options?.tone) ? options.tone : 'Professional';
    const cleanDetailLevel = ALLOWED_DETAIL_LEVELS.includes(options?.detailLevel) ? options.detailLevel : 'Detailed';
    const cleanLanguage = ALLOWED_LANGUAGES.includes(options?.language) ? options.language : 'English';

    const title = `${repoName.toUpperCase()} - ${cleanDocType.toUpperCase()} Technical Documentation`;

    let ragContextText = '';
    let sources = [];

    // 1. Build RAG context from indexed codebase if userId is provided
    if (userId) {
      try {
        const ragResult = await ragService.buildRagContext({
          repositoryId: rawRepoId,
          userId,
          query: `Generate comprehensive technical ${cleanDocType} documentation, architecture breakdown, API routes, and configuration for repository '${rawRepoId}'`,
          topK: 12,
        });
        if (ragResult.hasContext) {
          ragContextText = ragResult.contextText;
          sources = ragResult.sources;
        }
      } catch (ragErr) {
        console.warn(`[Doc RAG Context Warning] ${ragErr.message}`);
      }
    }

    if (!ragContextText) {
      return {
        title,
        content: `# ${repoName} - ${cleanDocType.toUpperCase()} Documentation\n\n> No codebase context available to generate repository-specific documentation. Please ensure the repository is indexed first.`,
        sections: [
          { id: 'overview', title: 'Overview', content: `Documentation overview for ${repoName}.` },
          { id: 'status', title: 'Indexing Status', content: 'Repository codebase context not available.' },
        ],
      };
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const groqApiKey = process.env.GROQ_API_KEY;

    if (geminiApiKey || groqApiKey) {
      try {
        const prompt = `Generate comprehensive, production-grade ${cleanDocType.toUpperCase()} markdown documentation for repository '${rawRepoId}'.
Tone: ${cleanTone}. Detail level: ${cleanDetailLevel}. Language: ${cleanLanguage}.
Base your response strictly on the retrieved codebase context below. Include overview, tech stack, architecture, installation steps, and key code entry points.`;

        const res = await this.processChatPrompt({
          prompt,
          ragContextText,
          sources,
          repoId: rawRepoId,
        });

        if (res.content && !res.content.includes('AI synthesis service is currently unavailable')) {
          return {
            title,
            content: res.content,
            sections: [
              { id: 'overview', title: 'Overview', content: `High level documentation for ${repoName}.` },
              { id: 'details', title: 'Details', content: 'Comprehensive technical specification.' },
            ],
          };
        }
      } catch (err) {
        console.warn(`[Doc AI Generation Warning] AI documentation generation failed: ${err.message}`);
      }
    }

    // Grounded Fallback: Transparent status instead of fake endpoint templates
    let content = `# ${repoName} - ${cleanDocType.toUpperCase()} Documentation\n\n> AI documentation synthesis is currently unavailable.\n\n### Retrieved Repository References\n`;
    if (sources.length > 0) {
      sources.forEach((s, idx) => {
        const linesStr = s.startLine && s.endLine ? ` (Lines ${s.startLine}-${s.endLine})` : '';
        content += `${idx + 1}. **${s.filePath || s.fileName}**${linesStr}\n`;
      });
    } else {
      content += `No indexed codebase context available to generate documentation.\n`;
    }
    content += `\n*Please ensure \`GEMINI_API_KEY\` or \`GROQ_API_KEY\` is configured in \`backend/.env\` to enable AI synthesis.*`;

    const sections = [
      { id: 'overview', title: 'Overview', content: `Documentation overview for ${repoName}.` },
      { id: 'references', title: 'Retrieved References', content: 'Indexed repository source references.' },
    ];

    return {
      title,
      content,
      sections,
    };
  },
};
