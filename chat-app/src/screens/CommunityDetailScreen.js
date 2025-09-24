import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function CommunityDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const communityId = route.params?.communityId;
  const {
    joinedCommunities,
    discoverCommunities,
    threadsByCommunity,
    membersByCommunity,
    eventsByCommunity,
    joinRequestsByCommunity,
    requestJoin,
    respondToJoin,
    loadCommunityDetails,
    createThread,
    createEvent,
    leave,
    rsvpEvent,
    refreshCommunities,
  } = useCommunity();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const Section = ({ title, actionLabel, onPressAction, children }) => (
    <View style={{ marginTop: 24 }}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {actionLabel && onPressAction ? (
          <TouchableOpacity onPress={onPressAction}>
            <Text style={styles.sectionAction}>{actionLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {children}
    </View>
  );

  const [showThreadForm, setShowThreadForm] = useState(false);
  const [threadName, setThreadName] = useState('');
  const [threadDescription, setThreadDescription] = useState('');
  const [threadAnnouncement, setThreadAnnouncement] = useState(false);

  const [showEventForm, setShowEventForm] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventStartsAt, setEventStartsAt] = useState('');
  const [eventLocation, setEventLocation] = useState('');

  const community = useMemo(() => {
    return (
      joinedCommunities.find((item) => item.id === communityId) ||
      discoverCommunities.find((item) => item.id === communityId)
    );
  }, [communityId, discoverCommunities, joinedCommunities]);

  const isMember = community?.isMember;
  const isAdmin = useMemo(() => {
    const members = membersByCommunity[communityId] || [];
    return members.some(
      (member) => member.userId === user?.id && (member.role === 'owner' || member.role === 'moderator')
    );
  }, [communityId, membersByCommunity, user?.id]);

  useEffect(() => {
    loadCommunityDetails(communityId);
    refreshCommunities();
  }, [communityId, loadCommunityDetails, refreshCommunities]);

  if (!community) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: theme.colors.textMuted }}>Community not found.</Text>
      </View>
    );
  }

  const threads = threadsByCommunity[communityId] || [];
  const members = membersByCommunity[communityId] || [];
  const events = eventsByCommunity[communityId] || [];
  const joinRequests = joinRequestsByCommunity[communityId] || [];

  const handleJoin = async () => {
    const res = await requestJoin(communityId);
    if (!res.ok) {
      Alert.alert('Unable to join', res.error || 'Please try again');
    } else if (res.joined) {
      Alert.alert('Welcome!', 'You are now part of the community.');
    } else if (res.alreadyPending) {
      Alert.alert('Request pending', 'An admin still needs to review your request.');
    } else {
      Alert.alert('Request sent', community.isPrivate ? 'Admins will review your request.' : 'You are in!');
    }
  };

  const handleLeave = async () => {
    Alert.alert('Leave community', 'Are you sure you want to leave this community?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          const res = await leave(communityId);
          if (!res.ok) {
            Alert.alert('Unable to leave', res.error || 'Please try again later.');
          } else {
            Alert.alert('Left', 'You have left the community.');
            navigation.goBack();
          }
        },
      },
    ]);
  };

  const handleCreateThread = async () => {
    const res = await createThread({
      communityId,
      name: threadName,
      description: threadDescription,
      isAnnouncement: threadAnnouncement,
    });
    if (!res.ok) {
      Alert.alert('Unable to create thread', res.error || 'Please try again');
    } else {
      setThreadName('');
      setThreadDescription('');
      setThreadAnnouncement(false);
      setShowThreadForm(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!eventStartsAt) {
      Alert.alert('Missing date', 'Please provide a start date and time (ISO format).');
      return;
    }
    const res = await createEvent({
      communityId,
      title: eventTitle,
      description: eventDescription,
      startsAt: eventStartsAt,
      location: eventLocation,
    });
    if (!res.ok) {
      Alert.alert('Unable to create event', res.error || 'Please try again');
    } else {
      setEventTitle('');
      setEventDescription('');
      setEventStartsAt('');
      setEventLocation('');
      setShowEventForm(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 48 }}>
      <View style={[styles.hero, { borderColor: community.bannerColor || theme.colors.primary }]}> 
        <Text style={styles.heroTitle}>{community.name}</Text>
        <Text style={styles.heroMeta}>
          {community.memberCount} members • {community.isPrivate ? 'Private' : 'Public'}
        </Text>
        {community.description ? (
          <Text style={styles.heroDescription}>{community.description}</Text>
        ) : null}
        <View style={styles.heroActions}>
          {isMember ? (
            <>
              <TouchableOpacity style={[styles.heroBtn, styles.heroBtnSecondary]} onPress={handleLeave}>
                <Text style={styles.heroBtnTextSecondary}>Leave</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.heroBtn, styles.heroBtnPrimary]}
                onPress={() => setShowThreadForm((prev) => !prev)}>
                <Text style={styles.heroBtnTextPrimary}>{showThreadForm ? 'Close thread form' : 'New thread'}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.heroBtn, styles.heroBtnPrimary]}
              onPress={handleJoin}>
              <Text style={styles.heroBtnTextPrimary}>
                {community.hasPendingRequest ? 'Request pending' : community.isPrivate ? 'Request to join' : 'Join community'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showThreadForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Create a thread</Text>
          <TextInput
            style={styles.input}
            placeholder="Thread name"
            value={threadName}
            onChangeText={setThreadName}
          />
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Description (optional)"
            value={threadDescription}
            onChangeText={setThreadDescription}
            multiline
          />
          {isAdmin ? (
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setThreadAnnouncement((prev) => !prev)}>
              <View style={[styles.checkbox, threadAnnouncement && styles.checkboxChecked]} />
              <Text style={styles.toggleText}>Announcement thread (admins only)</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.submitBtn} onPress={handleCreateThread}>
            <Text style={styles.submitBtnText}>Create thread</Text>
          </TouchableOpacity>
        </View>
      )}

      {isAdmin && (
        <Section
          title="Admin zone"
          actionLabel={showEventForm ? 'Close form' : 'Create event'}
          onPressAction={() => setShowEventForm((prev) => !prev)}>
          {showEventForm && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Schedule an event</Text>
              <TextInput
                style={styles.input}
                placeholder="Event title"
                value={eventTitle}
                onChangeText={setEventTitle}
              />
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Event details"
                value={eventDescription}
                onChangeText={setEventDescription}
                multiline
              />
              <TextInput
                style={styles.input}
                placeholder="Start (e.g. 2024-06-20T19:00:00Z)"
                value={eventStartsAt}
                onChangeText={setEventStartsAt}
              />
              <TextInput
                style={styles.input}
                placeholder="Location (Online, Cafe, etc.)"
                value={eventLocation}
                onChangeText={setEventLocation}
              />
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateEvent}>
                <Text style={styles.submitBtnText}>Create event</Text>
              </TouchableOpacity>
            </View>
          )}
          {joinRequests.length > 0 ? (
            <View style={styles.adminCard}>
              <Text style={styles.adminTitle}>Join requests</Text>
              {joinRequests.map((req) => (
                <View key={req.id} style={styles.requestRow}>
                  <View>
                    <Text style={styles.requestName}>{req.user?.name || req.user?.email}</Text>
                    <Text style={styles.requestMeta}>{new Date(req.createdAt).toLocaleString()}</Text>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                      style={[styles.badgeBtn, styles.acceptBtn]}
                      onPress={() => respondToJoin({ requestId: req.id, action: 'accept', communityId })}>
                      <Text style={styles.badgeBtnText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.badgeBtn, styles.declineBtn]}
                      onPress={() => respondToJoin({ requestId: req.id, action: 'decline', communityId })}>
                      <Text style={styles.badgeBtnText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No pending join requests.</Text>
          )}
        </Section>
      )}

      <Section title="Threads">
        {threads.length === 0 ? (
          <Text style={styles.emptyText}>No threads yet. Start the first conversation!</Text>
        ) : (
          threads.map((thread) => (
            <TouchableOpacity
              key={thread.id}
              style={styles.threadRow}
              onPress={() => navigation.navigate('Chat', {
                conversationId: thread.id,
                title: thread.name,
                kind: 'community-thread',
              })}>
              <View style={styles.threadMeta}>
                <Text style={styles.threadName}>{thread.name}</Text>
                {thread.isAnnouncement ? (
                  <Text style={styles.threadBadge}>Announcement</Text>
                ) : null}
              </View>
              <Text style={styles.threadDescription} numberOfLines={2}>
                {thread.description || 'No description yet'}
              </Text>
              <Text style={styles.threadFooter}>{thread.messageCount} messages</Text>
            </TouchableOpacity>
          ))
        )}
      </Section>

      <Section title="Members" actionLabel="View all" onPressAction={() => {}}>
        {members.slice(0, 6).map((member) => (
          <View key={member.id} style={styles.memberRow}>
            <View style={styles.avatarPlaceholder} />
            <View>
              <Text style={styles.memberName}>{member.user?.name || member.user?.email}</Text>
              <Text style={styles.memberRole}>{member.role}</Text>
            </View>
          </View>
        ))}
        {members.length === 0 && <Text style={styles.emptyText}>No members yet.</Text>}
      </Section>

      <Section title="Events">
        {events.length === 0 ? (
          <Text style={styles.emptyText}>No events scheduled yet.</Text>
        ) : (
          events.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventMeta}>
                {new Date(event.startsAt).toLocaleString()} • {event.location}
              </Text>
              {event.description ? (
                <Text style={styles.eventDescription}>{event.description}</Text>
              ) : null}
              <View style={styles.eventActions}>
                <TouchableOpacity
                  style={[styles.badgeBtn, styles.acceptBtn]}
                  onPress={() => rsvpEvent({ eventId: event.id, communityId, status: 'going' })}>
                  <Text style={styles.badgeBtnText}>Going</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.badgeBtn, styles.declineBtn]}
                  onPress={() => rsvpEvent({ eventId: event.id, communityId, status: 'interested' })}>
                  <Text style={styles.badgeBtnText}>Interested</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </Section>
    </ScrollView>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, padding: 16 },
    hero: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    heroTitle: { fontSize: 24, fontWeight: '800', color: theme.colors.text },
    heroMeta: { color: theme.colors.textMuted, marginTop: 6 },
    heroDescription: { color: theme.colors.textMuted, marginTop: 12 },
    heroActions: { flexDirection: 'row', marginTop: 16 },
    heroBtn: { flex: 1, paddingVertical: 12, borderRadius: 999, alignItems: 'center', marginRight: 12 },
    heroBtnPrimary: { backgroundColor: theme.colors.primary },
    heroBtnSecondary: { borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
    heroBtnTextPrimary: { color: theme.colors.onPrimary, fontWeight: '700' },
    heroBtnTextSecondary: { color: theme.colors.text, fontWeight: '700' },
    formCard: {
      marginTop: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    formTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: theme.colors.text },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 10,
      padding: 12,
      marginBottom: 12,
      backgroundColor: theme.colors.inputBackground,
      color: theme.colors.text,
    },
    toggleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 4,
      marginRight: 10,
      backgroundColor: theme.colors.surface,
    },
    checkboxChecked: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    toggleText: { color: theme.colors.text },
    submitBtn: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
    },
    submitBtnText: { color: theme.colors.onPrimary, fontWeight: '700' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
    sectionAction: { color: theme.colors.primary, fontWeight: '700' },
    emptyText: { color: theme.colors.textMuted, marginTop: 8 },
    threadRow: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginTop: 12,
    },
    threadMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    threadName: { fontSize: 18, fontWeight: '700', marginRight: 8, color: theme.colors.text },
    threadBadge: {
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
      color: theme.colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      fontSize: 12,
      fontWeight: '600',
    },
    threadDescription: { color: theme.colors.textMuted },
    threadFooter: { marginTop: 8, color: theme.colors.textMuted, fontSize: 12 },
    memberRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    avatarPlaceholder: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surfaceMuted,
      marginRight: 12,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
    },
    memberName: { fontWeight: '700', color: theme.colors.text },
    memberRole: { color: theme.colors.textMuted },
    adminCard: {
      marginTop: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    adminTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: theme.colors.text },
    requestRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    requestName: { fontWeight: '700', color: theme.colors.text },
    requestMeta: { color: theme.colors.textMuted },
    badgeBtn: {
      borderRadius: 999,
      paddingVertical: 6,
      paddingHorizontal: 14,
      marginLeft: 8,
    },
    acceptBtn: { backgroundColor: '#22c55e' },
    declineBtn: { backgroundColor: '#ef4444' },
    badgeBtnText: { color: '#FFFFFF', fontWeight: '700' },
    eventCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginTop: 12,
    },
    eventTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
    eventMeta: { color: theme.colors.textMuted, marginTop: 4 },
    eventDescription: { color: theme.colors.textMuted, marginTop: 8 },
    eventActions: { flexDirection: 'row', marginTop: 12 },
  });
}
