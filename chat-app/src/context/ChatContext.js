import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ChatContext = createContext(null);

// In-memory chat model: conversations + messages per conversation
export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([
    { id: 'c1', title: 'General', updatedAt: new Date().toISOString(), lastMessage: 'Welcome to the chat!' },
    { id: 'c2', title: 'Support', updatedAt: new Date().toISOString(), lastMessage: 'How can we help you today?' },
  ]);

  const [messagesByConversationId, setMessagesByConversationId] = useState({
    c1: [
      { id: 'm1', text: 'Welcome to the chat!', createdAt: new Date().toISOString(), userId: 'system' },
    ],
    c2: [
      { id: 'm2', text: 'How can we help you today?', createdAt: new Date().toISOString(), userId: 'system' },
    ],
  });

  const getMessages = useCallback((conversationId) => {
    return messagesByConversationId[conversationId] || [];
  }, [messagesByConversationId]);

  const sendMessage = useCallback((conversationId, text, userId) => {
    const trimmed = text?.trim();
    if (!trimmed) return;
    setMessagesByConversationId(prev => {
      const existing = prev[conversationId] || [];
      const nextMessage = {
        id: `${conversationId}-${existing.length + 1}`,
        text: trimmed,
        createdAt: new Date().toISOString(),
        userId,
      };
      const next = { ...prev, [conversationId]: [...existing, nextMessage] };
      return next;
    });
    setConversations(prev => {
      const updated = prev.map(c => c.id === conversationId ? {
        ...c,
        lastMessage: trimmed,
        updatedAt: new Date().toISOString(),
      } : c);
      // sort by updatedAt desc
      return updated.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    });
  }, []);

  const value = useMemo(() => ({
    conversations,
    getMessages,
    sendMessage,
  }), [conversations, getMessages, sendMessage]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
