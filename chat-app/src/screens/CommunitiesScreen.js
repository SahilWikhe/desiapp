import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCommunity } from '../context/CommunityContext';
import { theme } from '../theme/theme';

export default function CommunitiesScreen() {
  const navigation = useNavigation();
  const {
    joinedCommunities,
    discoverCommunities,
    eventsByCommunity,
    loadingCommunities,
    refreshCommunities,
    loadCommunityDetails,
  } = useCommunity();

  useEffect(() => {
    joinedCommunities.forEach((community) => {
      loadCommunityDetails(community.id);
    });
  }, [joinedCommunities, loadCommunityDetails]);

  const upcomingEvents = useMemo(() => {
    const events = [];
    joinedCommunities.forEach((community) => {
      const list = eventsByCommunity[community.id] || [];
      list.forEach((event) => {
        events.push({ ...event, community });
      });
    });
    return events
      .filter((event) => new Date(event.startsAt) >= new Date())
      .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
      .slice(0, 4);
  }, [eventsByCommunity, joinedCommunities]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 48 }}
      refreshControl={<RefreshControl refreshing={loadingCommunities} onRefresh={refreshCommunities} />}>
      <Text style={styles.title}>Your communities</Text>
      {joinedCommunities.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>You have not joined any communities yet</Text>
          <Text style={styles.emptySubtitle}>Discover groups to talk, learn, and plan events together.</Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('CommunityExplore')}>
            <Text style={styles.primaryBtnText}>Explore communities</Text>
          </TouchableOpacity>
        </View>
      ) : (
        joinedCommunities.map((community) => (
          <TouchableOpacity
            key={community.id}
            style={[styles.card, { borderLeftColor: community.bannerColor || theme.colors.primary }]}
            onPress={() => navigation.navigate('CommunityDetail', { communityId: community.id })}
            activeOpacity={0.8}>
            <Text style={styles.communityName}>{community.name}</Text>
            <Text style={styles.communityMeta}>{community.memberCount} members</Text>
            {community.description ? (
              <Text style={styles.communityDescription} numberOfLines={2}>
                {community.description}
              </Text>
            ) : null}
            {community.hasPendingRequest && (
              <Text style={styles.pendingBadge}>Join request pending</Text>
            )}
          </TouchableOpacity>
        ))
      )}

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.secondaryBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('CreateCommunity')}>
          <Text style={styles.secondaryBtnText}>Create community</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryOutline} onPress={() => navigation.navigate('CommunityExplore')}>
          <Text style={styles.secondaryOutlineText}>Browse all</Text>
        </TouchableOpacity>
      </View>

      {upcomingEvents.length > 0 && (
        <View style={{ marginTop: 32 }}>
          <Text style={styles.title}>Upcoming events</Text>
          {upcomingEvents.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <Text style={styles.eventCommunity}>{event.community.name}</Text>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventMeta}>
                {new Date(event.startsAt).toLocaleString()} • {event.location}
              </Text>
              {event.description ? (
                <Text style={styles.eventDescription} numberOfLines={2}>
                  {event.description}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      )}

      <View style={{ marginTop: 32 }}>
        <Text style={styles.title}>Communities you might like</Text>
        {discoverCommunities
          .filter((community) => !community.isMember)
          .slice(0, 4)
          .map((community) => (
            <TouchableOpacity
              key={community.id}
              style={[styles.card, styles.discoveryCard]}
              onPress={() => navigation.navigate('CommunityDetail', { communityId: community.id })}>
              <Text style={styles.communityName}>{community.name}</Text>
              <Text style={styles.communityMeta}>{community.memberCount} members</Text>
              <Text style={styles.communityDescription} numberOfLines={2}>
                {community.description || 'No description yet'}
              </Text>
            </TouchableOpacity>
          ))}
      </View>
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
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 4,
  },
  communityName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  communityMeta: { color: theme.colors.textMuted, marginBottom: 8 },
  communityDescription: { color: theme.colors.textMuted },
  pendingBadge: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignSelf: 'flex-start',
    borderRadius: 999,
    fontWeight: '600',
    color: theme.colors.text,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { color: theme.colors.textMuted, marginBottom: 16 },
  primaryBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryBtnText: { color: 'white', fontWeight: '700' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  secondaryBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginRight: 8 },
  secondaryBtnText: { color: 'white', fontWeight: '700' },
  secondaryOutline: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  secondaryOutlineText: { color: theme.colors.primary, fontWeight: '700' },
  discoveryCard: { borderLeftWidth: 1 },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  eventCommunity: { color: theme.colors.primary, fontWeight: '700', marginBottom: 4 },
  eventTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  eventMeta: { color: theme.colors.textMuted, marginBottom: 8 },
  eventDescription: { color: theme.colors.textMuted },
});

