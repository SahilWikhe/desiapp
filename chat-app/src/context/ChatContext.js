import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([
    { id: 'm1', text: 'Welcome to the chat!', createdAt: new Date().toISOString(), userId: 'system' },
  ]);

  const sendMessage = useCallback((text, userId) => {
    const trimmed = text?.trim();
    if (!trimmed) return;
    setMessages(prev => [
      ...prev,
      { id: String(prev.length + 1), text: trimmed, createdAt: new Date().toISOString(), userId },
    ]);
  }, []);

  const value = useMemo(() => ({ messages, sendMessage }), [messages, sendMessage]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
