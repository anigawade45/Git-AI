import crypto from 'crypto';
import { aiEngine } from '../services/aiEngine.js';
import Conversation from '../models/Conversation.js';
import Repository from '../models/Repository.js';
import { ragService } from '../services/ragService.js';
import { cacheService } from '../services/cacheService.js';

const MAX_PROMPT_LENGTH = 10000;
const MAX_TITLE_LENGTH = 100;

const safeDecode = (value) => {
  if (!value) return '';
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const validatePrompt = (prompt) => {
  if (typeof prompt !== 'string' || !prompt.trim()) {
    return 'Prompt is required and cannot be blank';
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return `Prompt is too long (maximum ${MAX_PROMPT_LENGTH} characters)`;
  }
  return null;
};

const generateAiCacheKey = ({ userId, repoId, repoRecord, prompt, contextFile, filters, conversationId }) => {
  const repoVersion =
    repoRecord?.indexVersion ||
    repoRecord?.commitSha ||
    (repoRecord?.updatedAt ? new Date(repoRecord.updatedAt).getTime() : 'v1');

  const contextKey = contextFile
    ? JSON.stringify({
      filePath: contextFile.filePath || '',
      startLine: contextFile.startLine || null,
      endLine: contextFile.endLine || null,
    })
    : '';

  const normalizedFilters = JSON.stringify({
    language: filters?.language ?? null,
    filePath: filters?.filePath ?? null,
    symbolType: filters?.symbolType ?? null,
  });

  return cacheService.generateKey(
    'ai:chat',
    String(userId),
    repoId,
    String(repoVersion),
    String(conversationId || 'standalone'),
    contextKey,
    normalizedFilters,
    prompt.trim().toLowerCase()
  );
};

// @desc    Get all conversations for authenticated user
// @route   GET /api/ai/conversations
// @access  Private
export const getConversations = async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const { repoId } = req.query;
  const cleanRepoId = safeDecode(repoId);
  const filter = cleanRepoId ? { userId, repoId: cleanRepoId } : { userId };

  try {
    const docs = await Conversation.find(filter).sort({ updatedAt: -1 }).lean();
    const conversations = docs.map((c) => ({
      ...c,
      id: c.convId || c.id || (c._id ? c._id.toString() : ''),
    }));
    return res.json({ success: true, conversations });
  } catch (err) {
    console.warn(`[AI DB Warning] ${err.message}`);
    return res.json({ success: true, conversations: [] });
  }
};

// @desc    Create new chat thread (tenant-scoped)
// @route   POST /api/ai/conversations
// @access  Private
export const createConversation = async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const { title, repoId } = req.body;
  if (!repoId) {
    return res.status(400).json({ success: false, message: 'Repository ID is required' });
  }

  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Title must be a non-empty string',
    });
  }

  const cleanTitle = typeof title === 'string' && title.trim() ? title.trim() : 'New Conversation';
  if (cleanTitle.length > MAX_TITLE_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Title must be ${MAX_TITLE_LENGTH} characters or less`,
    });
  }

  const cleanRepoId = safeDecode(repoId);

  // Validate repository ownership
  const repoRecord = await Repository.findOne({ repoId: cleanRepoId, userId });
  if (!repoRecord) {
    return res.status(404).json({ success: false, message: 'Repository not found or access denied' });
  }

  const newConvId = `conv_${crypto.randomUUID()}`;

  const newConv = {
    id: newConvId,
    convId: newConvId,
    userId,
    title: cleanTitle,
    repoId: cleanRepoId,
    timestamp: 'TODAY',
    updatedAtText: 'Just now',
    messages: [],
  };

  try {
    await Conversation.create(newConv);
  } catch (err) {
    console.warn(`[AI Controller Warning] Conversation create error: ${err.message}`);
    return res.status(500).json({ success: false, message: 'Failed to create conversation' });
  }

  return res.status(201).json({ success: true, conversation: newConv });
};

// @desc    Send prompt to AI Assistant
// @route   POST /api/ai/chat
// @access  Private
export const sendMessage = async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const { conversationId, prompt, contextFile, repoId, filters } = req.body;

  if (!repoId) {
    return res.status(400).json({ success: false, message: 'Repository ID is required' });
  }

  const promptError = validatePrompt(prompt);
  if (promptError) {
    return res.status(400).json({ success: false, message: promptError });
  }

  const cleanRepoId = safeDecode(repoId);

  // 1. Validate repository ownership
  const repoRecord = await Repository.findOne({ repoId: cleanRepoId, userId });
  if (!repoRecord) {
    return res.status(404).json({ success: false, message: 'Repository not found or access denied' });
  }

  // 2. Validate conversation thread ownership & generate semantic title on first user question
  let targetConvId = conversationId;
  let conversationHistory = [];
  let existingConv = null;

  if (targetConvId) {
    existingConv = await Conversation.findOne({ convId: targetConvId, userId, repoId: cleanRepoId });
    if (!existingConv) {
      return res.status(404).json({ success: false, message: 'Conversation not found or access denied' });
    }
    conversationHistory = existingConv.messages || [];
  }

  const isDefaultTitle = !existingConv || !existingConv.title || existingConv.title === 'New Conversation' || existingConv.title === 'New Codebase Query';
  const isFirstMessage = conversationHistory.length === 0;

  let activeTitle = existingConv?.title || 'New Codebase Query';

  if (isFirstMessage || isDefaultTitle) {
    activeTitle = await aiEngine.generateConversationTitle(prompt);
    if (!targetConvId) {
      targetConvId = `conv_${crypto.randomUUID()}`;
      try {
        await Conversation.create({
          id: targetConvId,
          convId: targetConvId,
          userId,
          title: activeTitle,
          repoId: cleanRepoId,
          timestamp: 'TODAY',
          updatedAtText: 'Just now',
          messages: [],
        });
      } catch (convErr) {
        console.error(`[AI Chat Conv Create Error] ${convErr.message}`);
        return res.status(500).json({ success: false, message: 'Failed to initialize conversation thread' });
      }
    } else {
      await Conversation.updateOne(
        { convId: targetConvId, userId },
        { $set: { title: activeTitle } }
      );
    }
  }

  try {
    // Check tenant-scoped AI response cache with version, context, filters, and conversation thread identity
    const cacheKey = generateAiCacheKey({
      userId,
      repoId: cleanRepoId,
      repoRecord,
      prompt,
      contextFile,
      filters,
      conversationId: targetConvId,
    });
    const cachedResponse = cacheService.get(cacheKey);

    if (cachedResponse) {
      console.log(`[AI Cache Hit] Returning cached response for query in repo: ${cleanRepoId} (user: ${userId})`);
      const userMsg = {
        id: `msg_${crypto.randomUUID()}`,
        role: 'user',
        content: prompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const responseMessage = {
        id: `msg_${crypto.randomUUID()}`,
        role: 'assistant',
        content: cachedResponse.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: cachedResponse.sources || [],
        isRagContext: cachedResponse.isRagContext ?? true,
        cached: true,
      };

      await Conversation.updateOne(
        { convId: targetConvId, userId, repoId: cleanRepoId },
        { $push: { messages: { $each: [userMsg, responseMessage] } } }
      );

      return res.json({
        success: true,
        message: responseMessage,
        conversationId: targetConvId,
        ragStatus: cachedResponse.ragStatus || 'INDEXED',
        cached: true,
      });
    }

    // 3. Conversation-Aware Query Rewriting: Resolve ambiguous pronouns using conversation history
    const standaloneSearchQuery = await aiEngine.rewriteQueryWithHistory({
      prompt,
      history: conversationHistory,
    });

    // 4. Build RAG context from indexed codebase using rewritten standalone search query & filters
    const ragResult = await ragService.buildRagContext({
      repositoryId: cleanRepoId,
      userId,
      query: standaloneSearchQuery,
      filters: filters || {},
      topK: 8,
    });

    console.log(
      '[RAG FINAL SOURCES]',
      ragResult.sources?.map((s) => ({
        filePath: s.filePath,
        startLine: s.startLine,
        endLine: s.endLine,
        score: s.score || s.finalScore,
      }))
    );

    // 5. Process chat prompt with RAG context or contextFile
    const aiResult = await aiEngine.processChatPrompt({
      prompt,
      ragContextText: ragResult.contextText,
      sources: ragResult.sources,
      contextFile,
      repoId: cleanRepoId,
    });

    // 6. Strict Source Validation: RAG retrieval & contextFile are the sole authorities for citation sources.
    // AI-generated citations can never introduce unretrieved sources.
    const rawCandidateSources = ragResult.hasContext
      ? ragResult.sources
      : contextFile
        ? [
          {
            fileName: contextFile.name,
            filePath: contextFile.path,
            startLine: contextFile.startLine ?? null,
            endLine: contextFile.endLine ?? null,
            language: contextFile.language || 'plaintext',
          },
        ]
        : [];
    const verifiedSources = await ragService.validateSourcesAgainstRepo({
      repositoryId: cleanRepoId,
      userId,
      sources: rawCandidateSources,
    });

    // Store in AI response cache (2 hour TTL) with full rag metadata
    cacheService.set(
      cacheKey,
      {
        content: aiResult.content,
        sources: verifiedSources,
        isRagContext: ragResult.hasContext,
        ragStatus: ragResult.status,
      },
      7200
    );

    const userMsg = {
      id: `msg_${crypto.randomUUID()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const responseMessage = {
      id: `msg_${crypto.randomUUID()}`,
      role: 'assistant',
      content: aiResult.content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: verifiedSources,
      isRagContext: ragResult.hasContext,
    };

    // 7. Persist user & assistant messages to MongoDB & verify matchedCount
    const updateResult = await Conversation.updateOne(
      { convId: targetConvId, userId, repoId: cleanRepoId },
      { $push: { messages: { $each: [userMsg, responseMessage] } } }
    );

    if (updateResult.matchedCount === 0) {
      console.warn(`[AI Chat DB Update Warning] No matching conversation found for convId: ${targetConvId}`);
    }

    return res.json({
      success: true,
      message: responseMessage,
      conversationId: targetConvId,
      ragStatus: ragResult.status,
    });
  } catch (err) {
    console.error('[AI Chat Error]', err);
    return res.status(500).json({ success: false, message: 'AI chat request failed' });
  }
};

// @desc    Stream prompt completion with real-time SSE tokens
// @route   POST /api/ai/chat/stream
// @access  Private
export const streamMessage = async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const { conversationId, prompt, contextFile, repoId, filters } = req.body;

  if (!repoId) {
    return res.status(400).json({ message: 'Repository ID is required' });
  }

  const promptError = validatePrompt(prompt);
  if (promptError) {
    return res.status(400).json({ message: promptError });
  }

  const cleanRepoId = safeDecode(repoId);

  // 1. Validate repository ownership before flushing SSE headers
  const repoRecord = await Repository.findOne({ repoId: cleanRepoId, userId });
  if (!repoRecord) {
    return res.status(404).json({ message: 'Repository not found or access denied' });
  }

  // 2. Validate conversation thread ownership & generate semantic title on first user question
  let targetConvId = conversationId;
  let conversationHistory = [];
  let existingConv = null;

  if (targetConvId) {
    existingConv = await Conversation.findOne({ convId: targetConvId, userId, repoId: cleanRepoId });
    if (!existingConv) {
      return res.status(404).json({ message: 'Conversation not found or access denied' });
    }
    conversationHistory = existingConv.messages || [];
  }

  const isDefaultTitle = !existingConv || !existingConv.title || existingConv.title === 'New Conversation' || existingConv.title === 'New Codebase Query';
  const isFirstMessage = conversationHistory.length === 0;

  let activeTitle = existingConv?.title || 'New Codebase Query';
  let titleWasUpdated = false;

  if (isFirstMessage || isDefaultTitle) {
    activeTitle = await aiEngine.generateConversationTitle(prompt);
    titleWasUpdated = true;

    if (!targetConvId) {
      targetConvId = `conv_${crypto.randomUUID()}`;
      try {
        await Conversation.create({
          id: targetConvId,
          convId: targetConvId,
          userId,
          title: activeTitle,
          repoId: cleanRepoId,
          timestamp: 'TODAY',
          updatedAtText: 'Just now',
          messages: [],
        });
      } catch (convErr) {
        console.error(`[AI Stream Conv Create Error] ${convErr.message}`);
        return res.status(500).json({ message: 'Failed to initialize conversation thread' });
      }
    } else {
      await Conversation.updateOne(
        { convId: targetConvId, userId },
        { $set: { title: activeTitle } }
      );
    }
  }

  // Listen for client SSE disconnect to abort processing and cancel upstream AI HTTP request
  const abortController = new AbortController();
  req.on('close', () => {
    if (!res.writableEnded) {
      abortController.abort();
    }
  });

  // Set SSE Headers after validation checks pass
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send SSE initial title metadata event if title was created/updated
  if (titleWasUpdated && activeTitle) {
    res.write(`data: ${JSON.stringify({ type: 'title', conversationId: targetConvId, title: activeTitle })}\n\n`);
  }

  try {
    // 3. Conversation-Aware Query Rewriting for Streaming Path
    const standaloneSearchQuery = await aiEngine.rewriteQueryWithHistory({
      prompt,
      history: conversationHistory,
    });

    // 4. Build RAG context with rewritten query & filters
    const ragResult = await ragService.buildRagContext({
      repositoryId: cleanRepoId,
      userId,
      query: standaloneSearchQuery,
      filters: filters || {},
      topK: 8,
    });

    console.log(
      '[RAG FINAL SOURCES]',
      ragResult.sources?.map((s) => ({
        filePath: s.filePath,
        startLine: s.startLine,
        endLine: s.endLine,
        score: s.score || s.finalScore,
      }))
    );

    // 5. Send initial retrieval sources event (retrieval_sources semantics)
    if (!abortController.signal.aborted) {
      res.write(
        `data: ${JSON.stringify({
          type: 'retrieval_sources',
          sources: ragResult.sources || [],
          hasContext: ragResult.hasContext,
          conversationId: targetConvId,
        })}\n\n`
      );
    }

    // 6. Stream tokens from AI Engine with AbortSignal passed upstream
    const aiResult = await aiEngine.streamChatPrompt({
      prompt,
      ragContextText: ragResult.contextText,
      sources: ragResult.sources,
      contextFile,
      repoId: cleanRepoId,
      signal: abortController.signal,
      onToken: (token) => {
        if (!abortController.signal.aborted) {
          res.write(`data: ${JSON.stringify({ type: 'token', token })}\n\n`);
        }
      },
    });

    // 7. Strict Source Validation: RAG retrieval & contextFile are the sole authorities for citation sources.
    // AI-generated citations can never introduce unretrieved sources.
    const rawCandidateSources = ragResult.hasContext
      ? ragResult.sources
      : contextFile
        ? [
          {
            fileName: contextFile.name,
            filePath: contextFile.path,
            startLine: contextFile.startLine ?? null,
            endLine: contextFile.endLine ?? null,
            language: contextFile.language || 'plaintext',
          },
        ]
        : [];
    const verifiedSources = await ragService.validateSourcesAgainstRepo({
      repositoryId: cleanRepoId,
      userId,
      sources: rawCandidateSources,
    });

    // Save completed conversation messages to MongoDB
    const userMsg = {
      id: `msg_${crypto.randomUUID()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const assistantMsg = {
      id: `msg_${crypto.randomUUID()}`,
      role: 'assistant',
      content: aiResult.content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: verifiedSources,
      isRagContext: ragResult.hasContext,
    };

    const updateResult = await Conversation.updateOne(
      { convId: targetConvId, userId, repoId: cleanRepoId },
      { $push: { messages: { $each: [userMsg, assistantMsg] } } }
    );

    if (updateResult.matchedCount === 0) {
      console.warn(`[AI Stream DB Update Warning] No matching conversation found for convId: ${targetConvId}`);
    }

    if (!abortController.signal.aborted) {
      res.write(`data: ${JSON.stringify({ type: 'verified_sources', sources: verifiedSources })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      res.end();
    }
  } catch (err) {
    if (err.name === 'AbortError' || abortController.signal.aborted) {
      console.info('[AI Stream Aborted] Client closed connection; upstream request cancelled.');
      return;
    }
    console.error('[AI Stream Error]', err);
    if (!abortController.signal.aborted) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Stream request failed' })}\n\n`);
      res.end();
    }
  }
};

// @desc    Delete conversation (tenant-scoped)
// @route   DELETE /api/ai/conversations/:id
// @access  Private
export const deleteConversation = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  try {
    const result = await Conversation.deleteOne({ convId: id, userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Conversation not found or access denied' });
    }
    return res.json({ success: true, message: 'Conversation deleted', id });
  } catch (err) {
    console.error('[AI Conversation Delete Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to delete conversation' });
  }
};

// @desc    Rename conversation (tenant-scoped)
// @route   PATCH /api/ai/conversations/:id
// @access  Private
export const renameConversation = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }

  const cleanTitle = title.trim();
  if (cleanTitle.length > MAX_TITLE_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Title must be ${MAX_TITLE_LENGTH} characters or less`,
    });
  }

  try {
    const doc = await Conversation.findOneAndUpdate(
      { convId: id, userId },
      { $set: { title: cleanTitle } },
      { new: true }
    ).lean();

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Conversation not found or access denied' });
    }

    const conversation = {
      ...doc,
      id: doc.convId || doc.id || (doc._id ? doc._id.toString() : ''),
    };

    return res.json({ success: true, conversation });
  } catch (err) {
    console.error('[AI Conversation Rename Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to rename conversation' });
  }
};
