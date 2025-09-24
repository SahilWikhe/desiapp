import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { listMyRequests, respondToRequest } from '../lib/requests';
import { useCommunity } from '../context/CommunityContext';
import { useTheme } from '../context/ThemeContext';

function RequestRow({ label, status, onAccept, onDecline }) {
  const showActions = status === 'pending' && onAccept && onDecline;
  const badgeStyle =
    status === 'accepted'
      ? styles.badgeAccepted
      : status === 'declined'
        ? styles.badgeDeclined
        : styles.badgePending;

  return (
    <View style={styles.itemRow}>
      <View style={styles.avatar} />
      <Text style={styles.name} numberOfLines={1}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
        {showActions ? (
          <>
            <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={onAccept}>
              <Text style={styles.actionText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.declineBtn]} onPress={onDecline}>
              <Text style={styles.actionText}>Decline</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={[styles.badge, badgeStyle]}>
            <Text style={styles.badgeText}>{status}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function RequestsScreen() {
  const { user } = useAuth();
  const { myCommunityRequests, respondToJoin, refreshCommunities } = useCommunity();
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await listMyRequests(user.id);
      setIncoming(data.incoming || []);
      setOutgoing(data.outgoing || []);
    } catch (error) {
      console.warn('Failed to load requests', error);
      Alert.alert('Error', 'Unable to load requests right now.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRespond = useCallback(
    async (requestId, action) => {
      const res = await respondToRequest(requestId, action);
      if (!res.ok) {
        Alert.alert('Update failed', res.error || 'Please try again');
      } else {
        load();
      }
    },
    [load]
  );

  const handleRespondCommunity = useCallback(
    async (requestId, action, communityId) => {
      const res = await respondToJoin({ requestId, action, communityId });
      if (!res.ok) {
        Alert.alert('Update failed', res.error || 'Please try again');
      } else {
        refreshCommunities();
      }
    },
    [refreshCommunities, respondToJoin]
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
      <Text style={styles.sectionTitle}>Incoming</Text>
      {incoming.length === 0 ? (
        <Text style={styles.emptyText}>No pending requests right now.</Text>
      ) : (
        incoming.map((req) => (
          <View key={req.id} style={styles.card}>
            <Text style={styles.metaText}>
              {req.requester?.name || 'Unknown'} • {new Date(req.createdAt).toLocaleString()}
            </Text>
            <RequestRow
              label={req.requester?.name || req.requester?.email || 'Unknown'}
              status={req.status}
              onAccept={() => handleRespond(req.id, 'accept')}
              onDecline={() => handleRespond(req.id, 'decline')}
            />
          </View>
        ))
      )}

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Outgoing</Text>
      {outgoing.length === 0 ? (
        <Text style={styles.emptyText}>You have not sent any requests yet.</Text>
      ) : (
        outgoing.map((req) => (
          <View key={req.id} style={styles.card}>
            <Text style={styles.metaText}>
              To {req.target?.name || req.target?.email || 'Unknown'} • {new Date(req.createdAt).toLocaleString()}
            </Text>
            <RequestRow label={req.target?.name || req.target?.email || 'Unknown'} status={req.status} />
          </View>
        ))
      )}

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Community approvals</Text>
      {myCommunityRequests.incoming.length === 0 ? (
        <Text style={styles.emptyText}>No community join requests to review.</Text>
      ) : (
        myCommunityRequests.incoming.map((req) => (
          <View key={req.id} style={styles.card}>
            <Text style={styles.metaText}>
              {req.user?.name || req.user?.email || 'Unknown'} wants to join {req.community?.name || 'Community'} • {new Date(req.createdAt).toLocaleString()}
            </Text>
            <RequestRow
              label={req.user?.name || req.user?.email || 'Unknown'}
              status={req.status}
              onAccept={() => handleRespondCommunity(req.id, 'accept', req.communityId)}
              onDecline={() => handleRespondCommunity(req.id, 'decline', req.communityId)}
            />
          </View>
        ))
      )}

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>My community requests</Text>
      {myCommunityRequests.outgoing.length === 0 ? (
        <Text style={styles.emptyText}>You have not requested to join any communities yet.</Text>
      ) : (
        myCommunityRequests.outgoing.map((req) => (
          <View key={req.id} style={styles.card}>
            <Text style={styles.metaText}>
              {req.community?.name || 'Community'} • {new Date(req.createdAt).toLocaleString()}
            </Text>
            <RequestRow label={req.community?.name || 'Community'} status={req.status} />
          </View>
        ))
      )}
    </ScrollView>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, padding: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: theme.colors.text },
    card: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: 12,
      marginBottom: 12,
    },
    itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceMuted,
      marginRight: 12,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
    },
    name: { fontSize: 16, fontWeight: '600', flexShrink: 1, color: theme.colors.text },
    actionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginLeft: 8 },
    acceptBtn: { backgroundColor: '#22c55e' },
    declineBtn: { backgroundColor: '#ef4444' },
    actionText: { color: '#FFFFFF', fontWeight: '700' },
    emptyText: { color: theme.colors.textMuted },
    metaText: { color: theme.colors.textMuted, marginBottom: 8 },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      alignSelf: 'center',
    },
    badgeAccepted: { backgroundColor: 'rgba(34, 197, 94, 0.15)' },
    badgeDeclined: { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
    badgePending: { backgroundColor: 'rgba(59, 130, 246, 0.15)' },
    badgeText: { textTransform: 'capitalize', fontWeight: '700', color: theme.colors.text },
  });
}
