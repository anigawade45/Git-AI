import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import AIChatLayout from '@/components/ai/AIChatLayout';
import ChatWindow from '@/components/ai/ChatWindow';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { repositoryService } from '@/services/repositoryService';
import { aiService } from '@/services/aiService';
import { mockAIChatData } from '@/data/mockAIChat';
import { useMeta } from '@/hooks/useMeta';

export default function AIChat() {
  const { id, owner, repo: repoSlug } = useParams();
  const location = useLocation();

  const targetRepoId = id
    ? decodeURIComponent(id)
    : owner && repoSlug
      ? `${owner}/${repoSlug}`
      : null;

  useMeta({
    title: targetRepoId
      ? `AI Assistant - ${targetRepoId} | GitHub Knowledge Assistant`
      : 'AI Assistant | GitHub Knowledge Assistant',
    description: 'Ask natural-language questions about codebase architecture and logic.',
    robots: 'noindex, nofollow',
  });

  const getConversationId = (conv) =>
    conv?.convId || conv?.id || conv?._id;

  const [repo, setRepo] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState('');
  const [messages, setMessages] = useState([]);

  const messagesRef = React.useRef(messages);

  const updateMessages = (updater) => {
    setMessages((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      messagesRef.current = next;
      return next;
    });
  };

  const abortControllerRef = React.useRef(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const [contextFile, setContextFile] = useState(null);
  const [availableFiles, setAvailableFiles] = useState([]);

  const [error, setError] = useState('');
  const [contextModalOpen, setContextModalOpen] = useState(false);
  const [lastRequest, setLastRequest] = useState(null);

  // Handle contextFile passed via location state (e.g. from Explain with AI)
  useEffect(() => {
    if (location.state?.contextFile) {
      setContextFile(location.state.contextFile);
    }
  }, [location.state]);

  // Load repository, available files & conversations on mount or targetRepoId change
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (!targetRepoId) {
        setError('Repository was not specified.');
        return;
      }

      try {
        setError('');
        const repoData = await repositoryService.getRepository(targetRepoId);
        if (cancelled) return;
        setRepo(repoData);

        // Fetch available repository files for the Attach Context dialog
        const filesTree = await repositoryService.getRepositoryFiles(targetRepoId);
        if (cancelled) return;

        const flattenFiles = (items) => {
          let flat = [];
          for (const item of items || []) {
            if (item.type === 'file' || (!item.children && item.path)) {
              flat.push(item);
            }
            if (item.children) {
              flat = flat.concat(flattenFiles(item.children));
            }
          }
          return flat;
        };
        setAvailableFiles(flattenFiles(filesTree));

        // Fetch user conversations for this repo
        const convs = await aiService.getConversations(targetRepoId);
        if (cancelled) return;
        setConversations(convs);

        if (convs.length > 0) {
          const firstConvId = getConversationId(convs[0]);
          setActiveConvId(firstConvId);
          updateMessages(convs[0].messages || []);
        } else {
          // Initialize first conversation if none exist
          const newConv = await aiService.createConversation('New Codebase Query', targetRepoId);
          if (cancelled) return;
          const newConvId = getConversationId(newConv);
          setConversations([newConv]);
          setActiveConvId(newConvId);
          updateMessages(newConv.messages || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to initialize AI Chat workspace.');
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [targetRepoId]);

  const handleSelectConversation = async (convId) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setActiveConvId(convId);
    setError('');
    const conv = conversations.find((c) => getConversationId(c) === convId);
    if (conv) {
      updateMessages(conv.messages || []);
    }
  };

  const handleNewChat = async () => {
    if (!targetRepoId) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    try {
      setError('');
      const newConv = await aiService.createConversation('New Codebase Query', targetRepoId);
      const newConvId = getConversationId(newConv);

      setConversations((prev) => [newConv, ...prev]);
      setActiveConvId(newConvId);
      updateMessages(newConv.messages || []);
    } catch (err) {
      setError(err?.message || 'Failed to create new conversation.');
    }
  };

  const syncActiveConversation = (finalMessages) => {
    setConversations((prevConvs) =>
      prevConvs.map((c) =>
        getConversationId(c) === activeConvId
          ? { ...c, messages: finalMessages }
          : c
      )
    );
  };

  const executeStreamMessage = async ({
    prompt,
    requestContextFile,
    addUserMessage = true,
    replaceAssistantId = null,
  }) => {
    if (!prompt.trim() || !targetRepoId || !activeConvId || isStreaming) {
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setError('');

    const userMsgId = `msg_${crypto.randomUUID()}`;
    const assistantMsgId = `msg_${crypto.randomUUID()}`;

    setLastRequest({
      prompt,
      contextFile: requestContextFile,
      userMsgId,
      assistantMsgId,
    });

    const userMsg = {
      id: userMsgId,
      role: 'user',
      content: prompt,
      contextFile: requestContextFile,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const initialAssistantMsg = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: [],
    };

    let previousAssistantMsg = null;
    if (replaceAssistantId) {
      previousAssistantMsg = messagesRef.current.find((m) => m.id === replaceAssistantId) || null;
    }

    updateMessages((prev) => {
      if (replaceAssistantId) {
        return prev.map((m) => (m.id === replaceAssistantId ? initialAssistantMsg : m));
      }
      return addUserMessage
        ? [...prev, userMsg, initialAssistantMsg]
        : [...prev, initialAssistantMsg];
    });

    setIsThinking(true);
    setIsStreaming(true);

    const handleFailure = (errMessage) => {
      setIsThinking(false);
      setIsStreaming(false);
      setError(errMessage || 'AI failed to stream response. Please try again.');
      updateMessages((prev) => {
        if (previousAssistantMsg) {
          return prev.map((m) => (m.id === assistantMsgId ? previousAssistantMsg : m));
        }
        return prev.filter((m) => m.id !== assistantMsgId);
      });
    };

    try {
      await aiService.streamMessage({
        conversationId: activeConvId,
        prompt,
        contextFile: requestContextFile,
        repoId: targetRepoId,
        signal: abortControllerRef.current.signal,
        onTitle: (newTitle, targetId) => {
          const idToUpdate = targetId || activeConvId;
          setConversations((prevConvs) =>
            prevConvs.map((c) =>
              getConversationId(c) === idToUpdate ? { ...c, title: newTitle } : c
            )
          );
        },
        onSources: (sources) => {
          updateMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, sources } : msg
            )
          );
        },
        onToken: (token) => {
          setIsThinking(false);
          updateMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: msg.content + token } : msg
            )
          );
        },
        onComplete: () => {
          setIsThinking(false);
          setIsStreaming(false);
          syncActiveConversation(messagesRef.current);
        },
        onError: (errMessage) => {
          handleFailure(errMessage);
        },
      });
    } catch (err) {
      handleFailure('AI streaming encountered a network error.');
    } finally {
      setIsThinking(false);
      setIsStreaming(false);
    }
  };



  const handleSendMessage = async (input) => {
    const prompt = typeof input === 'object' ? input?.text || '' : input || '';
    const requestContextFile =
      typeof input === 'object' ? input?.contextFile || null : contextFile;

    await executeStreamMessage({
      prompt,
      requestContextFile,
      addUserMessage: true,
    });
  };

  const handleRetry = async () => {
    if (!lastRequest || !activeConvId || isStreaming) return;

    await executeStreamMessage({
      prompt: lastRequest.prompt,
      requestContextFile: lastRequest.contextFile,
      addUserMessage: false,
      replaceAssistantId: lastRequest.assistantMsgId,
    });
  };

  const handleRegenerate = async (targetAssistantMsgId) => {
    if (!activeConvId || isStreaming) return;

    let userMsgToRegenerate = null;
    let assistantIdToReplace = targetAssistantMsgId;

    if (targetAssistantMsgId) {
      const assistantIdx = messages.findIndex((m) => m.id === targetAssistantMsgId);
      if (assistantIdx > 0 && messages[assistantIdx - 1].role === 'user') {
        userMsgToRegenerate = messages[assistantIdx - 1];
      }
    }

    if (!userMsgToRegenerate) {
      userMsgToRegenerate = [...messages].reverse().find((m) => m.role === 'user');
      if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
        assistantIdToReplace = messages[messages.length - 1].id;
      }
    }

    if (!userMsgToRegenerate) return;

    await executeStreamMessage({
      prompt: userMsgToRegenerate.content,
      requestContextFile: userMsgToRegenerate.contextFile || null,
      addUserMessage: false,
      replaceAssistantId: assistantIdToReplace,
    });
  };

  const handleRenameConversation = async (convId, newTitle) => {
    try {
      await aiService.renameConversation(convId, newTitle);
      setConversations((prev) =>
        prev.map((c) => (getConversationId(c) === convId ? { ...c, title: newTitle } : c))
      );
    } catch (err) {
      setError('Failed to rename conversation.');
    }
  };

  const handleDeleteConversation = async (convId) => {
    try {
      await aiService.deleteConversation(convId);
      const remaining = conversations.filter((c) => getConversationId(c) !== convId);
      setConversations(remaining);

      if (activeConvId === convId && remaining.length > 0) {
        const nextId = getConversationId(remaining[0]);
        setActiveConvId(nextId);
        updateMessages(remaining[0].messages || []);
      } else if (remaining.length === 0) {
        await handleNewChat();
      }
    } catch (err) {
      setError('Failed to delete conversation.');
    }
  };



  const handleSelectContextFile = (file) => {
    setContextFile(file);
    setContextModalOpen(false);
  };

  return (
    <AIChatLayout
      repo={repo}
      conversations={conversations}
      activeConversationId={activeConvId}
      onSelectConversation={handleSelectConversation}
      onNewChat={handleNewChat}
      onRenameConversation={handleRenameConversation}
      onDeleteConversation={handleDeleteConversation}
    >
      <ChatWindow
        repo={repo}
        messages={messages}
        isThinking={isThinking}
        isStreaming={isStreaming}
        error={error}
        suggestedQuestions={mockAIChatData.suggestedQuestions}
        contextFile={contextFile}
        onSendMessage={handleSendMessage}
        onSelectQuestion={(q) => handleSendMessage(q)}
        onRemoveContext={() => setContextFile(null)}
        onToggleContextModal={() => setContextModalOpen(true)}
        onRegenerate={handleRegenerate}
        onRetry={handleRetry}
      />

      {/* Select File Context Modal */}
      <Dialog open={contextModalOpen} onOpenChange={setContextModalOpen}>
        <DialogContent onClose={() => setContextModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Attach File Context</DialogTitle>
            <DialogDescription>
              Select a repository file to attach as active context for your AI questions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar py-2">
            {availableFiles.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No repository files found.
              </p>
            ) : (
              availableFiles.map((file) => (
                <button
                  key={file.path || file.name}
                  type="button"
                  onClick={() => handleSelectContextFile(file)}
                  className="w-full text-left p-3 rounded-xl border border-border/60 hover:border-primary/50 bg-card hover:bg-accent/50 transition-all font-mono text-xs flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <p className="font-bold text-foreground group-hover:text-primary">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground">{file.path}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-muted text-[10px] uppercase text-muted-foreground">
                    {file.language || 'Code'}
                  </span>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AIChatLayout>
  );
}

