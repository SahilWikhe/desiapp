import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useCommunity } from '../context/CommunityContext';
import { theme } from '../theme/theme';
import { getNormalizedPhones } from '../lib/contacts';
import { matchContactsByPhone } from '../lib/matchContacts';
import { searchProfilesByName, sendContactRequest } from '../lib/requests';

const FALLBACK_NUMBERS = ['+14155550101', '+14155550102', '+14155550103'];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { conversations, presenceByUserId } = useChat();
  const { joinedCommunities, refreshCommunities, eventsByCommunity, loadCommunityDetails } = useCommunity();
  const [query, setQuery] = useState('');
  const [contactMatches, setContactMatches] = useState([]);
  const [peopleResults, setPeopleResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const phones = await getNormalizedPhones('US');
        const sourceNumbers = phones.length ? phones : FALLBACK_NUMBERS;
        const { matches } = await matchContactsByPhone(sourceNumbers, user?.id);
        if (!cancelled) setContactMatches(matches || []);
      } catch (error) {
        console.warn('Failed to match contacts', error);
        if (!cancelled) setContactMatches([]);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const data = useMemo(
    () => conversations.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [conversations]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((c) => c.title.toLowerCase().includes(q));
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
      try {
        const results = await searchProfilesByName(q, user?.id);
        if (!cancelled) {
          setPeopleResults(results || []);
        }
      } catch (error) {
        console.warn('Search failed', error);
        if (!cancelled) setPeopleResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [query, user?.id]);

  useEffect(() => {
    refreshCommunities();
  }, [refreshCommunities]);

  useEffect(() => {
    joinedCommunities.slice(0, 3).forEach((community) => {
      loadCommunityDetails(community.id);
    });
  }, [joinedCommunities, loadCommunityDetails]);

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

      <View style={styles.quickRow}>
        <TouchableOpacity style={[styles.quickBtn, { backgroundColor: theme.colors.primary }]} onPress={() => navigation.navigate('Communities')}>
          <Text style={styles.quickBtnText}>Communities</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickBtn, styles.quickBtnOutline, { marginRight: 0 }]}
          onPress={() => navigation.navigate('CreateCommunity')}>
          <Text style={styles.quickBtnOutlineText}>Create community</Text>
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
                <View style={styles.chatAvatar}>
                  <View
                    style={[
                      styles.presenceDot,
                      presenceByUserId[item.id] === 'online'
                        ? styles.dotOnline
                        : presenceByUserId[item.id] === 'away'
                          ? styles.dotAway
                          : styles.dotOffline,
                    ]}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.chatTitle}>{item.name || 'Unnamed'}</Text>
                  {item.email ? <Text style={styles.chatSubtitle}>{item.email}</Text> : null}
                </View>
                <TouchableOpacity
                  style={styles.profileBtn}
                  onPress={async () => {
                    const res = await sendContactRequest(item.id, user?.id);
                    if (!res.ok) {
                      Alert.alert('Request failed', res.error || 'Please try again');
                    } else {
                      Alert.alert('Request sent', 'They will see this in their requests list.');
                    }
                  }}
                >
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
              <TouchableOpacity
                style={styles.chatItem}
                onPress={() => navigation.navigate('Chat', { conversationId: `direct-${item.id}`, title: item.name || item.phone })}
              >
                <View style={styles.chatAvatar}>
                  <View
                    style={[
                      styles.presenceDot,
                      presenceByUserId[item.id] === 'online'
                        ? styles.dotOnline
                        : presenceByUserId[item.id] === 'away'
                          ? styles.dotAway
                          : styles.dotOffline,
                    ]}
                  />
                </View>
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

      {joinedCommunities.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Your communities</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Communities')}>
              <Text style={styles.linkText}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={joinedCommunities.slice(0, 5)}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            contentContainerStyle={{ paddingVertical: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.communityCard, { borderColor: item.bannerColor || theme.colors.primary }]}
                onPress={() => navigation.navigate('CommunityDetail', { communityId: item.id })}>
                <Text style={styles.communityName}>{item.name}</Text>
                <Text style={styles.communityMeta}>{item.memberCount} members</Text>
                {item.description ? (
                  <Text style={styles.communityDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {joinedCommunities.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Community spotlight</Text>
          </View>
          {joinedCommunities.slice(0, 3).map((community) => {
            const events = eventsByCommunity[community.id] || [];
            const nextEvent = events
              .filter((event) => new Date(event.startsAt) >= new Date())
              .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))[0];
            return (
              <TouchableOpacity
                key={community.id}
                style={styles.spotlightCard}
                onPress={() => navigation.navigate('CommunityDetail', { communityId: community.id })}>
                <Text style={styles.spotlightCommunity}>{community.name}</Text>
                <Text style={styles.spotlightMembers}>{community.memberCount} members</Text>
                {nextEvent ? (
                  <Text style={styles.spotlightEvent}>
                    Next: {nextEvent.title} • {new Date(nextEvent.startsAt).toLocaleString()}
                  </Text>
                ) : (
                  <Text style={styles.spotlightEvent}>No events scheduled</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
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
            <Text style={styles.chatTime}>
              {new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    marginBottom: 16,
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
  quickRow: { flexDirection: 'row', marginBottom: 16 },
  quickBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginRight: 12 },
  quickBtnText: { color: 'white', fontWeight: '700' },
  quickBtnOutline: { backgroundColor: 'white', borderWidth: 1, borderColor: theme.colors.primary },
  quickBtnOutlineText: { color: theme.colors.primary, fontWeight: '700' },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  linkText: { color: theme.colors.primary, fontWeight: '700' },
  chatItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8 },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    marginRight: 12,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: 4,
  },
  chatTitle: { fontSize: 16, fontWeight: '700' },
  chatSubtitle: { color: theme.colors.textMuted, marginTop: 2 },
  chatTime: { color: theme.colors.textMuted, marginLeft: 8 },
  separator: { height: 1, backgroundColor: theme.colors.border },
  communityCard: {
    width: 200,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'white',
  },
  communityName: { fontSize: 16, fontWeight: '700' },
  communityMeta: { color: theme.colors.textMuted, marginTop: 4 },
  communityDescription: { color: theme.colors.textMuted, marginTop: 6 },
  spotlightCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
  },
  spotlightCommunity: { fontSize: 16, fontWeight: '700' },
  spotlightMembers: { color: theme.colors.textMuted, marginTop: 4 },
  spotlightEvent: { color: theme.colors.textMuted, marginTop: 6 },
  presenceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'white',
  },
  dotOnline: { backgroundColor: '#22c55e' },
  dotAway: { backgroundColor: '#fbbf24' },
  dotOffline: { backgroundColor: '#d1d5db' },
});
