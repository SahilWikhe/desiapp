import React, { useLayoutEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

function MessageItem({ item, isSelf }) {
  return (
    <View style={[styles.messageRow, isSelf ? styles.rowSelf : styles.rowOther]}>
      <View style={[styles.bubble, isSelf ? styles.bubbleSelf : styles.bubbleOther]}>
        <Text style={[styles.messageText, isSelf && { color: 'white' }]}>{item.text}</Text>
      </View>
    </View>
  );
}

export default function ChatScreen({ navigation }) {
  const { messages, sendMessage } = useChat();
  const { user } = useAuth();
  const [text, setText] = useState('');

  const data = useMemo(() => messages.slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt)), [messages]);

  const handleSend = async () => {
    await sendMessage(text);
    setText('');
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Profile</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <MessageItem item={item} isSelf={item.userId === user?.id} />
        )}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message"
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={{ color: 'white', fontWeight: '700' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  messageRow: { marginBottom: 8, flexDirection: 'row' },
  rowSelf: { justifyContent: 'flex-end' },
  rowOther: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', padding: 10, borderRadius: 12 },
  bubbleSelf: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: theme.colors.bubbleOther, borderBottomLeftRadius: 4 },
  messageText: { color: '#333' },
  inputRow: {
    flexDirection: 'row', padding: 8, borderTopWidth: 1, borderColor: theme.colors.border,
  },
  textInput: { flex: 1, borderWidth: 1, borderColor: theme.colors.inputBorder, backgroundColor: theme.colors.primaryLight, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, marginRight: 8 },
  sendButton: { backgroundColor: theme.colors.primary, borderRadius: 999, paddingHorizontal: 16, justifyContent: 'center' },
});
