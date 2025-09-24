import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useCommunity } from '../context/CommunityContext';
import { theme } from '../theme/theme';

function MessageItem({ item, isSelf, showAuthor }) {
  return (
    <View style={[styles.messageRow, isSelf ? styles.rowSelf : styles.rowOther]}>
      <View style={[styles.bubble, isSelf ? styles.bubbleSelf : styles.bubbleOther]}>
        {showAuthor && !isSelf && item.user?.name ? (
          <Text style={styles.author}>{item.user.name}</Text>
        ) : null}
        <Text style={[styles.messageText, isSelf && { color: 'white' }]}>{item.text}</Text>
        <Text style={[styles.time, isSelf && styles.timeSelf]}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}

export default function ChatScreen({ navigation, route }) {
  const { getMessages, sendMessage } = useChat();
  const { user } = useAuth();
  const {
    ensureThreadMessages,
    threadMessages,
    sendThreadMessage,
    getThreadMeta,
    loadCommunityDetails,
    joinedCommunities,
    discoverCommunities,
  } = useCommunity();
  const [text, setText] = useState('');
  const { conversationId, title, kind } = route?.params || {};
  const headerHeight = useHeaderHeight();
  const listRef = useRef(null);
  const [threadMeta, setThreadMeta] = useState(null);

  // newest first for inverted list
  const directMessages = useMemo(
    () => getMessages(conversationId).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [getMessages, conversationId]
  );

  const threadMessageList = useMemo(() => {
    if (kind !== 'community-thread') return [];
    const list = threadMessages[conversationId] || [];
    return list.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [conversationId, kind, threadMessages]);

  const communitySummary = useMemo(() => {
    if (!threadMeta?.communityId) return null;
    return (
      joinedCommunities.find((community) => community.id === threadMeta.communityId) ||
      discoverCommunities.find((community) => community.id === threadMeta.communityId)
    );
  }, [discoverCommunities, joinedCommunities, threadMeta?.communityId]);

  useEffect(() => {
    let cancelled = false;
    const fetchThread = async () => {
      if (kind !== 'community-thread' || !conversationId) return;
      const meta = await getThreadMeta(conversationId);
      if (!cancelled) setThreadMeta(meta);
      if (meta?.communityId) {
        await loadCommunityDetails(meta.communityId);
      }
      await ensureThreadMessages(conversationId);
    };
    fetchThread();
    return () => {
      cancelled = true;
    };
  }, [conversationId, ensureThreadMessages, getThreadMeta, kind, loadCommunityDetails]);

  const data = kind === 'community-thread' ? threadMessageList : directMessages;

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (kind === 'community-thread') {
      await sendThreadMessage({ threadId: conversationId, text: trimmed });
    } else {
      await sendMessage(conversationId, trimmed, user?.id);
    }
    setText('');
    // scroll to bottom (offset 0 in inverted list)
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset?.({ offset: 0, animated: true });
    });
  };

  useLayoutEffect(() => {
    const headerTitle = () => {
      if (kind === 'community-thread' && threadMeta) {
        return `${threadMeta.name || title || 'Thread'}`;
      }
      return title || 'Chat';
    };

    navigation.setOptions({
      headerTitle: headerTitle(),
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Profile</Text>
        </TouchableOpacity>
      ),
    });
  }, [kind, navigation, threadMeta, title]);

  const isSendDisabled = text.trim().length === 0;
  const showAuthor = kind === 'community-thread';

  const renderItem = ({ item }) => (
    <MessageItem item={item} isSelf={item.userId === user?.id} showAuthor={showAuthor} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
        keyboardVerticalOffset={headerHeight}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.flex1}>
            {kind === 'community-thread' && threadMeta ? (
              <View style={styles.threadHeaderCard}>
                <Text style={styles.threadHeaderTitle}>{threadMeta.name}</Text>
                {communitySummary ? (
                  <Text style={styles.threadHeaderSubtitle}>
                    {communitySummary.name} • {communitySummary.memberCount} members
                  </Text>
                ) : null}
                {threadMeta.description ? (
                  <Text style={styles.threadHeaderDescription}>{threadMeta.description}</Text>
                ) : null}
              </View>
            ) : null}
            <FlatList
              ref={listRef}
              data={data}
              inverted
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16, paddingTop: 8 }}
              keyboardShouldPersistTaps="handled"
              renderItem={renderItem}
            />
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Type a message"
                placeholderTextColor={theme.colors.textMuted}
                value={text}
                onChangeText={setText}
                multiline
                maxLength={1000}
              />
              <TouchableOpacity
                style={[styles.sendButton, isSendDisabled && { opacity: 0.5 }]}
                onPress={handleSend}
                disabled={isSendDisabled}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  flex1: { flex: 1 },
  messageRow: { marginBottom: 8, flexDirection: 'row' },
  rowSelf: { justifyContent: 'flex-end' },
  rowOther: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '78%', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  bubbleSelf: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 6 },
  bubbleOther: { backgroundColor: theme.colors.bubbleOther, borderBottomLeftRadius: 6 },
  messageText: { color: '#333', fontSize: 16 },
  author: { color: theme.colors.primary, fontWeight: '700', marginBottom: 4 },
  time: { fontSize: 10, color: '#777', marginTop: 4, alignSelf: 'flex-end' },
  timeSelf: { color: 'rgba(255,255,255,0.85)' },
  threadHeaderCard: {
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
    backgroundColor: theme.colors.background,
  },
  threadHeaderTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  threadHeaderSubtitle: { color: theme.colors.textMuted, marginTop: 4 },
  threadHeaderDescription: { color: theme.colors.textMuted, marginTop: 6 },
  inputRow: {
    flexDirection: 'row', padding: 8, borderTopWidth: 1, borderColor: theme.colors.border, alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 120,
  },
  sendButton: { backgroundColor: theme.colors.primary, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10, justifyContent: 'center' },
});
