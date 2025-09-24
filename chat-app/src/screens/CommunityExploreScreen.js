import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { useCommunity } from '../context/CommunityContext';
import { theme } from '../theme/theme';

export default function CommunityExploreScreen() {
  const {
    discoverCommunities,
    loadingCommunities,
    refreshCommunities,
    requestJoin,
    loadCommunityDetails,
  } = useCommunity();

  useEffect(() => {
    refreshCommunities();
  }, [refreshCommunities]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 48 }}
      refreshControl={<RefreshControl refreshing={loadingCommunities} onRefresh={refreshCommunities} />}>
      <Text style={styles.title}>Discover communities</Text>
      {discoverCommunities.map((community) => (
        <View key={community.id} style={styles.card}>
          <Text style={styles.name}>{community.name}</Text>
          <Text style={styles.meta}>
            {community.memberCount} members • {community.isPrivate ? 'Private' : 'Public'}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {community.description || 'No description yet'}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                (community.isMember || community.hasPendingRequest) && styles.disabledBtn,
              ]}
              onPress={async () => {
                if (community.isMember) {
                  loadCommunityDetails(community.id);
                  return;
                }
                const res = await requestJoin(community.id);
                if (!res.ok) {
                  Alert.alert('Unable to join', res.error || 'Please try again');
                } else if (res.joined) {
                  Alert.alert('Welcome!', 'You are now a member of this community.');
                } else if (res.alreadyPending) {
                  Alert.alert('Pending', 'Your join request is awaiting review.');
                } else {
                  Alert.alert('Request sent', community.isPrivate ? 'Admins will review your request.' : 'You have joined!');
                }
              }}
              disabled={community.isMember || community.hasPendingRequest}>
              <Text style={styles.primaryBtnText}>
                {community.isMember
                  ? 'View details'
                  : community.hasPendingRequest
                    ? 'Request pending'
                    : community.isPrivate
                      ? 'Request to join'
                      : 'Join community'}
              </Text>
            </TouchableOpacity>
          </View>
          {community.hasPendingRequest && (
            <Text style={styles.pendingText}>Awaiting approval</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
  },
  name: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  meta: { color: theme.colors.textMuted, marginBottom: 8 },
  description: { color: theme.colors.textMuted, marginBottom: 16 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
  primaryBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  primaryBtnText: { color: 'white', fontWeight: '700' },
  disabledBtn: { backgroundColor: theme.colors.border },
  pendingText: { marginTop: 12, color: theme.colors.textMuted },
});
