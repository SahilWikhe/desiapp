import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { theme } from '../theme/theme';
import { getNormalizedPhones } from '../lib/contacts';
import { matchContactsByPhone } from '../lib/matchContacts';
import { searchProfilesByName, sendContactRequest } from '../lib/requests';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { conversations } = useChat();
  const [query, setQuery] = useState('');
  const [contactMatches, setContactMatches] = useState([]);
  const [peopleResults, setPeopleResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const run = async () => {
      const phones = await getNormalizedPhones('US');
      if (phones.length === 0) return;
      const { matches } = await matchContactsByPhone(phones);
      setContactMatches(matches || []);
    };
    run();
  }, []);

  const data = useMemo(() => conversations.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [conversations]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(c => c.title.toLowerCase().includes(q));
  }, [data, query]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const q = query.trim();
      if (!q) {
        setPeopleResults([]);
        return;
      }
      setSearching(true);
      const data = await searchProfilesByName(q);
      if (!cancelled) setPeopleResults((data || []).filter(r => r.id !== user?.id));
      setSearching(false);
    };
    run();
    return () => { cancelled = true; };
  }, [query, user?.id]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search people or chats"
        placeholderTextColor={theme.colors.textMuted}
        value={query}
        onChangeText={setQuery}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} activeOpacity={0.7}>
          {user?.avatarUri ? (
            <Image source={{ uri: user.avatarUri }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatar} />
          )}
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.welcome}>Welcome,</Text>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Requests')}>
          <Ionicons name="notifications-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {query.trim() ? (
        <>
          <Text style={styles.sectionTitle}>People {searching ? '(searching...)' : ''}</Text>
          <FlatList
            data={peopleResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.chatItem}>
                <View style={styles.chatAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.chatTitle}>{item.name || 'Unnamed'}</Text>
                </View>
                <TouchableOpacity style={styles.profileBtn} onPress={async () => { await sendContactRequest(item.id); }}>
                  <Text style={styles.profileBtnText}>Request</Text>
                </TouchableOpacity>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={{ paddingBottom: 12 }}
          />
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Contacts on app</Text>
          <FlatList
            data={contactMatches}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.chatItem} onPress={() => navigation.navigate('Chat', { conversationId: `direct-${item.id}`, title: item.name || item.phone })}>
                <View style={styles.chatAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.chatTitle}>{item.name || item.phone}</Text>
                  <Text style={styles.chatSubtitle} numberOfLines={1}>{item.phone}</Text>
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={{ paddingBottom: 12 }}
          />
        </>
      )}

      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Recent chats</Text>
      <FlatList
        data={filtered}
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
  avatarImg: { width: 56, height: 56, borderRadius: 28, marginRight: 12, borderWidth: 2, borderColor: theme.colors.primary },
  welcome: { color: theme.colors.textMuted, fontSize: 12 },
  name: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  email: { color: theme.colors.textMuted, fontSize: 12 },
  search: {
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    backgroundColor: 'white',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    color: theme.colors.text,
  },
  profileBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  profileBtnText: { color: 'white', fontWeight: '700' },
  iconBtn: { backgroundColor: theme.colors.primary, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  chatItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8 },
  chatAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primaryLight, borderWidth: 1, borderColor: theme.colors.inputBorder, marginRight: 12 },
  chatTitle: { fontSize: 16, fontWeight: '700' },
  chatSubtitle: { color: theme.colors.textMuted, marginTop: 2 },
  chatTime: { color: theme.colors.textMuted, marginLeft: 8 },
  separator: { height: 1, backgroundColor: theme.colors.border },
});
