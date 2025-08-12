import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { theme } from '../theme/theme';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { conversations } = useChat();

  const data = useMemo(() => conversations.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [conversations]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.welcome}>Welcome,</Text>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.profileBtnText}>Profile</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Recent chats</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.chatItem} onPress={() => navigation.navigate('Chat', { conversationId: item.id, title: item.title })}>
            <View style={styles.chatAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.chatTitle}>{item.title}</Text>
              <Text style={styles.chatSubtitle} numberOfLines={1}>{item.lastMessage}</Text>
            </View>
            <Text style={styles.chatTime}>{new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 16 },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: theme.colors.primaryLight, borderWidth: 1, borderColor: theme.colors.inputBorder, marginBottom: 16,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'white', borderWidth: 2, borderColor: theme.colors.primary, marginRight: 12 },
  welcome: { color: theme.colors.textMuted, fontSize: 12 },
  name: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  email: { color: theme.colors.textMuted, fontSize: 12 },
  profileBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  profileBtnText: { color: 'white', fontWeight: '700' },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  chatItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8 },
  chatAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primaryLight, borderWidth: 1, borderColor: theme.colors.inputBorder, marginRight: 12 },
  chatTitle: { fontSize: 16, fontWeight: '700' },
  chatSubtitle: { color: theme.colors.textMuted, marginTop: 2 },
  chatTime: { color: theme.colors.textMuted, marginLeft: 8 },
  separator: { height: 1, backgroundColor: theme.colors.border },
});
