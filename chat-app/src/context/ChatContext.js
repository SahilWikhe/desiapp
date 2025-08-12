import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id, content, sender_id, created_at')
        .order('created_at', { ascending: true })
        .limit(200);
      if (!error && data) {
        setMessages(
          data.map(m => ({ id: m.id, text: m.content, createdAt: m.created_at, userId: m.sender_id }))
        );
      }
    };
    load();

    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const m = payload.new;
        setMessages(prev => [
          ...prev,
          { id: m.id, text: m.content, createdAt: m.created_at, userId: m.sender_id },
        ]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sendMessage = useCallback(async (text) => {
    const trimmed = text?.trim();
    if (!trimmed || !user?.id) return;
    await supabase.from('messages').insert({ content: trimmed, sender_id: user.id });
  }, [user?.id]);

  const value = useMemo(() => ({ messages, sendMessage }), [messages, sendMessage]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
