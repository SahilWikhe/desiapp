import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createCommunity,
  createCommunityEvent,
  createCommunityThread,
  getThreadById,
  listCommunities,
  listCommunityEvents,
  listCommunityJoinRequests,
  listCommunityMembers,
  listCommunityThreads,
  listJoinedCommunities,
  listThreadMessages,
  leaveCommunity,
  postThreadMessage,
  requestToJoinCommunity,
  respondToCommunityJoinRequest,
  respondToEvent,
  listMyCommunityRequests,
  updateCommunityDetails,
} from '../lib/mockBackend';
import { useAuth } from './AuthContext';

const CommunityContext = createContext(null);

export function CommunityProvider({ children }) {
  const { user } = useAuth();
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [discoverCommunities, setDiscoverCommunities] = useState([]);
  const [threadsByCommunity, setThreadsByCommunity] = useState({});
  const [membersByCommunity, setMembersByCommunity] = useState({});
  const [eventsByCommunity, setEventsByCommunity] = useState({});
  const [joinRequestsByCommunity, setJoinRequestsByCommunity] = useState({});
  const [threadMessages, setThreadMessages] = useState({});
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  const [myCommunityRequests, setMyCommunityRequests] = useState({ incoming: [], outgoing: [] });

  const refreshCommunities = useCallback(async () => {
    if (!user?.id) {
      setJoinedCommunities([]);
      setDiscoverCommunities([]);
      setMyCommunityRequests({ incoming: [], outgoing: [] });
      return;
    }
    setLoadingCommunities(true);
    try {
      const [joined, all, requests] = await Promise.all([
        listJoinedCommunities(user.id),
        listCommunities(user.id),
        listMyCommunityRequests(user.id),
      ]);
      setJoinedCommunities(joined || []);
      setDiscoverCommunities(all || []);
      setMyCommunityRequests(requests || { incoming: [], outgoing: [] });
    } finally {
      setLoadingCommunities(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshCommunities();
  }, [refreshCommunities]);

  const loadCommunityDetails = useCallback(
    async (communityId) => {
      if (!communityId) return;
      const [threads, members, events] = await Promise.all([
        listCommunityThreads(communityId),
        listCommunityMembers(communityId),
        listCommunityEvents(communityId),
      ]);
      setThreadsByCommunity((prev) => ({ ...prev, [communityId]: threads || [] }));
      setMembersByCommunity((prev) => ({ ...prev, [communityId]: members || [] }));
      setEventsByCommunity((prev) => ({ ...prev, [communityId]: events || [] }));

      if (user?.id) {
        const isAdmin = members?.some(
          (member) => member.userId === user.id && (member.role === 'owner' || member.role === 'moderator')
        );
        if (isAdmin) {
          const requests = await listCommunityJoinRequests({ communityId, actorId: user.id });
          setJoinRequestsByCommunity((prev) => ({ ...prev, [communityId]: requests || [] }));
        } else {
          setJoinRequestsByCommunity((prev) => ({ ...prev, [communityId]: [] }));
        }
      }
    },
    [user?.id]
  );

  const ensureThreadMessages = useCallback(async (threadId) => {
    if (!threadId) return [];
    const messages = await listThreadMessages(threadId);
    setThreadMessages((prev) => ({ ...prev, [threadId]: messages || [] }));
    return messages || [];
  }, []);

  const handleCreateCommunity = useCallback(
    async ({ name, description, isPrivate }) => {
      if (!user?.id) return { ok: false, error: 'Not authenticated' };
      const result = await createCommunity({ ownerId: user.id, name, description, isPrivate });
      if (result.ok) {
        await refreshCommunities();
      }
      return result;
    },
    [refreshCommunities, user?.id]
  );

  const requestJoin = useCallback(
    async (communityId) => {
      if (!user?.id) return { ok: false, error: 'Not authenticated' };
      const res = await requestToJoinCommunity({ communityId, userId: user.id });
      await refreshCommunities();
      return res;
    },
    [refreshCommunities, user?.id]
  );

  const respondToJoin = useCallback(
    async ({ requestId, action, communityId }) => {
      if (!user?.id) return { ok: false, error: 'Not authenticated' };
      const res = await respondToCommunityJoinRequest({ requestId, actorId: user.id, action });
      if (res.ok) {
        await loadCommunityDetails(communityId);
        await refreshCommunities();
      }
      return res;
    },
    [loadCommunityDetails, refreshCommunities, user?.id]
  );

  const createThread = useCallback(
    async ({ communityId, name, description, isAnnouncement }) => {
      if (!user?.id) return { ok: false, error: 'Not authenticated' };
      const res = await createCommunityThread({ communityId, userId: user.id, name, description, isAnnouncement });
      if (res.ok) {
        await loadCommunityDetails(communityId);
      }
      return res;
    },
    [loadCommunityDetails, user?.id]
  );

  const sendThreadMessage = useCallback(
    async ({ threadId, text }) => {
      if (!user?.id) return { ok: false, error: 'Not authenticated' };
      const res = await postThreadMessage({ threadId, userId: user.id, text });
      if (res.ok) {
        const messages = await listThreadMessages(threadId);
        setThreadMessages((prev) => ({ ...prev, [threadId]: messages || [] }));
      }
      return res;
    },
    [user?.id]
  );

  const createEvent = useCallback(
    async ({ communityId, title, description, startsAt, location, visibility }) => {
      if (!user?.id) return { ok: false, error: 'Not authenticated' };
      const res = await createCommunityEvent({ communityId, createdBy: user.id, title, description, startsAt, location, visibility });
      if (res.ok) {
        const events = await listCommunityEvents(communityId);
        setEventsByCommunity((prev) => ({ ...prev, [communityId]: events || [] }));
      }
      return res;
    },
    [user?.id]
  );

  const rsvpEvent = useCallback(async ({ eventId, communityId, status }) => {
    if (!user?.id) return { ok: false, error: 'Not authenticated' };
    const res = await respondToEvent({ eventId, userId: user.id, status });
    if (res.ok && communityId) {
      const events = await listCommunityEvents(communityId);
      setEventsByCommunity((prev) => ({ ...prev, [communityId]: events || [] }));
    }
    return res;
  }, [user?.id]);

  const updateCommunity = useCallback(
    async ({ communityId, patch }) => {
      if (!user?.id) return { ok: false, error: 'Not authenticated' };
      const res = await updateCommunityDetails({ communityId, actorId: user.id, patch });
      if (res.ok) {
        await refreshCommunities();
        await loadCommunityDetails(communityId);
      }
      return res;
    },
    [loadCommunityDetails, refreshCommunities, user?.id]
  );

  const leave = useCallback(
    async (communityId) => {
      if (!user?.id) return { ok: false, error: 'Not authenticated' };
      const res = await leaveCommunity({ communityId, userId: user.id });
      if (res.ok) {
        await refreshCommunities();
        setThreadsByCommunity((prev) => {
          const next = { ...prev };
          delete next[communityId];
          return next;
        });
        setMembersByCommunity((prev) => {
          const next = { ...prev };
          delete next[communityId];
          return next;
        });
        setEventsByCommunity((prev) => {
          const next = { ...prev };
          delete next[communityId];
          return next;
        });
        setJoinRequestsByCommunity((prev) => {
          const next = { ...prev };
          delete next[communityId];
          return next;
        });
      }
      return res;
    },
    [refreshCommunities, user?.id]
  );

  const getThreadMeta = useCallback(async (threadId) => {
    const thread = await getThreadById(threadId);
    if (thread?.communityId) {
      await loadCommunityDetails(thread.communityId);
    }
    return thread;
  }, [loadCommunityDetails]);

  const value = useMemo(
    () => ({
      joinedCommunities,
      discoverCommunities,
      loadingCommunities,
      threadsByCommunity,
      membersByCommunity,
      eventsByCommunity,
      joinRequestsByCommunity,
      threadMessages,
      myCommunityRequests,
      refreshCommunities,
      loadCommunityDetails,
      ensureThreadMessages,
      handleCreateCommunity,
      requestJoin,
      respondToJoin,
      createThread,
      sendThreadMessage,
      createEvent,
      rsvpEvent,
      updateCommunity,
      getThreadMeta,
      leave,
    }),
    [
      createEvent,
      createThread,
      discoverCommunities,
      ensureThreadMessages,
      eventsByCommunity,
      getThreadMeta,
      handleCreateCommunity,
      joinedCommunities,
      joinRequestsByCommunity,
      myCommunityRequests,
      loadCommunityDetails,
      loadingCommunities,
      leave,
      membersByCommunity,
      refreshCommunities,
      requestJoin,
      respondToJoin,
      rsvpEvent,
      sendThreadMessage,
      threadMessages,
      threadsByCommunity,
      updateCommunity,
    ]
  );

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error('useCommunity must be used within CommunityProvider');
  return ctx;
}
