import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
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
import { theme } from '../theme/theme';

function MessageItem({ item, isSelf }) {
  return (
    <View style={[styles.messageRow, isSelf ? styles.rowSelf : styles.rowOther]}>
      <View style={[styles.bubble, isSelf ? styles.bubbleSelf : styles.bubbleOther]}>
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
  const [text, setText] = useState('');
  const { conversationId, title } = route?.params || {};
  const headerHeight = useHeaderHeight();
  const listRef = useRef(null);

  // newest first for inverted list
  const data = useMemo(
    () => getMessages(conversationId).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [getMessages, conversationId]
  );

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    await sendMessage(conversationId, trimmed, user?.id);
    setText('');
    // scroll to bottom (offset 0 in inverted list)
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset?.({ offset: 0, animated: true });
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: title || 'Chat',
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Profile</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, title]);

  const isSendDisabled = text.trim().length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
        keyboardVerticalOffset={headerHeight}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.flex1}>
            <FlatList
              ref={listRef}
              data={data}
              inverted
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16, paddingTop: 8 }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <MessageItem item={item} isSelf={item.userId === user?.id} />
              )}
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
  time: { fontSize: 10, color: '#777', marginTop: 4, alignSelf: 'flex-end' },
  timeSelf: { color: 'rgba(255,255,255,0.85)' },
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
