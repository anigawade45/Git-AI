import { fetchApi } from './api';

export const aiService = {
  async getConversations(repoId) {
    if (!repoId) {
      throw new Error('Repository ID is required to fetch conversations.');
    }

    const query = `?repoId=${encodeURIComponent(repoId)}`;
    const data = await fetchApi(`/ai/conversations${query}`);

    if (!data || !Array.isArray(data.conversations)) {
      throw new Error('Invalid response for conversations.');
    }

    return data.conversations.map((c) => ({
      ...c,
      id: c.convId || c.id || c._id,
    }));
  },


  async createConversation(title = 'New Conversation', repoId) {
    if (!repoId) {
      throw new Error('Repository ID is required to create a conversation.');
    }

    const data = await fetchApi('/ai/conversations', {
      method: 'POST',
      body: JSON.stringify({ title, repoId }),
    });

    if (!data || !data.conversation) {
      throw new Error('Failed to create conversation.');
    }

    const conv = data.conversation;
    return {
      ...conv,
      id: conv.convId || conv.id || conv._id,
    };
  },

  async sendMessage(convId, prompt, contextFile = null, repoId) {
    if (!repoId) {
      throw new Error('Repository ID is required to send message.');
    }
    if (!prompt || !prompt.trim()) {
      throw new Error('Prompt is required.');
    }

    const data = await fetchApi('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        conversationId: convId,
        prompt,
        contextFile,
        repoId,
      }),
    });

    if (!data || !data.message) {
      throw new Error('AI response message was not returned.');
    }

    return data.message;
  },

  async streamMessage({
    conversationId,
    prompt,
    contextFile,
    repoId,
    onTitle,
    onSources,
    onToken,
    onComplete,
    onError,
    signal,
  }) {
    if (!repoId) {
      if (onError) onError('Repository ID is required.');
      return;
    }

    if (!prompt || !prompt.trim()) {
      if (onError) onError('Prompt is required.');
      return;
    }

    const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

    try {
      const response = await fetch(`${BASE_URL}/ai/chat/stream`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationId, prompt, contextFile, repoId }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Streaming response body is unavailable.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let completed = false;
      let failed = false;

      const processLine = (line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) return false;

        if (trimmed.startsWith('data: ')) {
          const rawData = trimmed.slice(6);
          if (rawData === '[DONE]') {
            completed = true;
            onComplete?.();
            return true;
          }
          try {
            const parsed = JSON.parse(rawData);
            if (parsed.type === 'title') {
              onTitle?.(parsed.title, parsed.conversationId);
            } else if (parsed.type === 'sources' || parsed.type === 'retrieval_sources' || parsed.type === 'verified_sources') {
              onSources?.(parsed.sources || []);
            } else if (parsed.type === 'token') {
              onToken?.(parsed.token || '');
            } else if (parsed.type === 'error') {
              failed = true;
              onError?.(parsed.message || 'Streaming failed');
              return true;
            }
          } catch (err) {
            console.warn('[aiService] Invalid SSE event data:', rawData);
          }
        }
        return false;
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          buffer += decoder.decode();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const isFinished = processLine(part);
          if (isFinished) return;
        }
      }

      // Process any remaining data in the buffer after reader finishes
      if (buffer.trim()) {
        const isFinished = processLine(buffer);
        if (isFinished) return;
      }

      if (!completed && !failed) {
        onComplete?.();
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.info('[aiService] Streaming request cancelled.');
        return;
      }
      console.warn('[aiService] Streaming request failed:', err.message);
      onError?.(err.message);
    }
  },


  async deleteConversation(id) {
    if (!id) {
      throw new Error('Conversation ID is required.');
    }

    const data = await fetchApi(`/ai/conversations/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });

    return data || { success: true };
  },

  async renameConversation(id, newTitle) {
    if (!id) {
      throw new Error('Conversation ID is required.');
    }
    if (!newTitle || !newTitle.trim()) {
      throw new Error('New conversation title is required.');
    }

    const data = await fetchApi(`/ai/conversations/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ title: newTitle.trim() }),
    });

    if (!data || !data.conversation) {
      throw new Error('Failed to rename conversation.');
    }

    const conv = data.conversation;
    return {
      ...conv,
      id: conv.convId || conv.id || conv._id,
    };
  },
};
