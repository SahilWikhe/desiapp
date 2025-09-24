import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'chat-app:mock-backend';

const DEFAULT_STATE = {
  users: [
    {
      id: 'user-aisha',
      name: 'Aisha Khan',
      email: 'aisha@example.com',
      password: 'password123',
      phone: '+14155550101',
      avatarUri: null,
      bio: 'Community organizer and chai enthusiast.',
      interests: ['community', 'chai', 'travel'],
      createdAt: new Date(2024, 0, 2, 9, 30, 0).toISOString(),
    },
    {
      id: 'user-rohan',
      name: 'Rohan Patel',
      email: 'rohan@example.com',
      password: 'password123',
      phone: '+14155550102',
      avatarUri: null,
      bio: 'Product designer exploring social apps.',
      interests: ['design', 'music'],
      createdAt: new Date(2024, 1, 14, 14, 15, 0).toISOString(),
    },
    {
      id: 'user-sofia',
      name: 'Sofia Das',
      email: 'sofia@example.com',
      password: 'password123',
      phone: '+14155550103',
      avatarUri: null,
      bio: 'Engineer by day, foodie by night.',
      interests: ['engineering', 'food', 'travel'],
      createdAt: new Date(2024, 3, 8, 19, 5, 0).toISOString(),
    },
  ],
  contactRequests: [],
  communities: [
    {
      id: 'community-desi-foodies',
      name: 'Desi Foodies',
      description: 'Swap recipes, recommend restaurants, and plan food crawls.',
      ownerId: 'user-sofia',
      isPrivate: false,
      createdAt: new Date(2024, 2, 10, 12, 0, 0).toISOString(),
      bannerColor: '#f97316',
    },
    {
      id: 'community-product-makers',
      name: 'Product Makers',
      description: 'A hangout for designers and builders to jam on ideas.',
      ownerId: 'user-rohan',
      isPrivate: true,
      createdAt: new Date(2024, 4, 5, 18, 30, 0).toISOString(),
      bannerColor: '#6366f1',
    },
  ],
  communityMembers: [
    { id: 'cm-1', communityId: 'community-desi-foodies', userId: 'user-sofia', role: 'owner', joinedAt: new Date(2024, 2, 10, 12, 5, 0).toISOString() },
    { id: 'cm-2', communityId: 'community-desi-foodies', userId: 'user-aisha', role: 'moderator', joinedAt: new Date(2024, 2, 10, 13, 0, 0).toISOString() },
    { id: 'cm-3', communityId: 'community-product-makers', userId: 'user-rohan', role: 'owner', joinedAt: new Date(2024, 4, 5, 18, 31, 0).toISOString() },
  ],
  communityJoinRequests: [
    {
      id: 'cjr-1',
      communityId: 'community-product-makers',
      userId: 'user-aisha',
      status: 'pending',
      createdAt: new Date(2024, 5, 1, 9, 45, 0).toISOString(),
    },
  ],
  communityThreads: [
    {
      id: 'thread-foodies-general',
      communityId: 'community-desi-foodies',
      name: 'General',
      description: 'Daily chatter and introductions.',
      createdBy: 'user-sofia',
      createdAt: new Date(2024, 2, 10, 12, 15, 0).toISOString(),
      isAnnouncement: false,
    },
    {
      id: 'thread-foodies-recipes',
      communityId: 'community-desi-foodies',
      name: 'Recipes',
      description: 'Share and request recipes.',
      createdBy: 'user-aisha',
      createdAt: new Date(2024, 2, 11, 9, 0, 0).toISOString(),
      isAnnouncement: false,
    },
    {
      id: 'thread-makers-announcements',
      communityId: 'community-product-makers',
      name: 'Announcements',
      description: 'Important updates from the team.',
      createdBy: 'user-rohan',
      createdAt: new Date(2024, 4, 5, 18, 35, 0).toISOString(),
      isAnnouncement: true,
    },
  ],
  threadMessages: [
    {
      id: 'msg-1',
      threadId: 'thread-foodies-general',
      userId: 'user-sofia',
      text: 'Welcome to Desi Foodies! Drop your favorite recipes.',
      createdAt: new Date(2024, 2, 10, 12, 16, 0).toISOString(),
    },
    {
      id: 'msg-2',
      threadId: 'thread-foodies-general',
      userId: 'user-aisha',
      text: 'Hi all! Planning a Mumbai street food crawl this weekend if anyone wants in.',
      createdAt: new Date(2024, 2, 12, 10, 10, 0).toISOString(),
    },
    {
      id: 'msg-3',
      threadId: 'thread-foodies-recipes',
      userId: 'user-aisha',
      text: 'Sharing my quick pav bhaji recipe—perfect for a rainy day!',
      createdAt: new Date(2024, 2, 12, 11, 45, 0).toISOString(),
    },
  ],
  communityEvents: [
    {
      id: 'event-1',
      communityId: 'community-desi-foodies',
      title: 'Virtual Thali Night',
      description: 'Cook together over a video call and compare plates.',
      startsAt: new Date(2024, 6, 15, 19, 0, 0).toISOString(),
      createdBy: 'user-aisha',
      createdAt: new Date(2024, 5, 20, 9, 0, 0).toISOString(),
      location: 'Online',
      visibility: 'public',
    },
  ],
  communityEventResponses: [],
};

const cloneDefaultState = () => JSON.parse(JSON.stringify(DEFAULT_STATE));

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return {
    ...rest,
    interests: Array.isArray(rest.interests) ? rest.interests : [],
  };
}

function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildCommunitySummary(community, state, viewerId) {
  if (!community) return null;
  const membership = state.communityMembers.find(
    (member) => member.communityId === community.id && member.userId === viewerId
  );
  const pendingRequest = state.communityJoinRequests.find(
    (req) => req.communityId === community.id && req.userId === viewerId && req.status === 'pending'
  );
  const memberCount = state.communityMembers.filter((m) => m.communityId === community.id).length;
  return {
    ...community,
    memberCount,
    isMember: Boolean(membership),
    myRole: membership?.role || null,
    hasPendingRequest: Boolean(pendingRequest),
  };
}

function getCommunityById(state, communityId) {
  return state.communities.find((community) => community.id === communityId) || null;
}

function assertMembership(state, communityId, userId) {
  return state.communityMembers.find(
    (member) => member.communityId === communityId && member.userId === userId
  );
}

function isCommunityAdmin(member) {
  return member?.role === 'owner' || member?.role === 'moderator';
}

async function readState() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Failed to parse mock backend state, resetting', error);
    return null;
  }
}

async function writeState(state) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function ensureStateLoaded() {
  let state = await readState();
  if (!state) {
    state = cloneDefaultState();
    await writeState(state);
    return state;
  }
  const defaults = cloneDefaultState();
  let patched = false;
  for (const key of Object.keys(defaults)) {
    if (state[key] === undefined) {
      state[key] = defaults[key];
      patched = true;
    }
  }
  if (patched) {
    await writeState(state);
  }
  return state;
}

async function mutateState(mutator) {
  const state = await ensureStateLoaded();
  const result = await mutator(state);
  await writeState(state);
  return result;
}

function sortByCreatedDesc(a, b) {
  return (b.createdAt || '').localeCompare(a.createdAt || '');
}

export async function bootstrapMockBackend() {
  await ensureStateLoaded();
}

export async function clearMockBackend() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function getUserById(userId) {
  if (!userId) return null;
  const state = await ensureStateLoaded();
  const user = state.users.find((u) => u.id === userId);
  return sanitizeUser(user);
}

export async function registerUser({ name, email, password }) {
  const trimmedEmail = (email || '').trim().toLowerCase();
  const trimmedName = (name || '').trim();
  const safePassword = (password || '').trim();
  if (!trimmedEmail || !safePassword) {
    return { ok: false, error: 'Email and password required' };
  }
  return mutateState((state) => {
    if (state.users.some((u) => u.email === trimmedEmail)) {
      return { ok: false, error: 'Email already in use' };
    }
    const user = {
      id: createId('user'),
      name: trimmedName || trimmedEmail.split('@')[0] || 'User',
      email: trimmedEmail,
      password: safePassword,
      phone: '',
      avatarUri: null,
      createdAt: new Date().toISOString(),
    };
    state.users.push(user);
    return { ok: true, user: sanitizeUser(user) };
  });
}

export async function authenticateUser({ email, password }) {
  const trimmedEmail = (email || '').trim().toLowerCase();
  const safePassword = (password || '').trim();
  if (!trimmedEmail || !safePassword) {
    return { ok: false, error: 'Invalid credentials' };
  }
  const state = await ensureStateLoaded();
  const user = state.users.find((u) => u.email === trimmedEmail && u.password === safePassword);
  if (!user) {
    return { ok: false, error: 'Invalid credentials' };
  }
  return { ok: true, user: sanitizeUser(user) };
}

export async function updateUser(userId, patch) {
  if (!userId) return { ok: false, error: 'Missing user' };
  return mutateState((state) => {
    const user = state.users.find((u) => u.id === userId);
    if (!user) {
      return { ok: false, error: 'User not found' };
    }
    Object.assign(user, patch, { updatedAt: new Date().toISOString() });
    return { ok: true, user: sanitizeUser(user) };
  });
}

export async function setUserAvatar(userId, avatarUri) {
  return updateUser(userId, { avatarUri: avatarUri || null });
}

export async function setUserPhone(userId, phone) {
  return updateUser(userId, { phone: (phone || '').trim() });
}

export async function searchProfiles(query, viewerId) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return [];
  const state = await ensureStateLoaded();
  return state.users
    .filter((user) => user.id !== viewerId)
    .filter((user) => {
      const haystack = `${user.name || ''} ${user.email || ''}`.toLowerCase();
      return haystack.includes(q);
    })
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .slice(0, 20)
    .map(sanitizeUser);
}

export async function matchContacts(numbers, viewerId) {
  const set = new Set((numbers || []).map((value) => value?.trim()).filter(Boolean));
  if (set.size === 0) {
    return { matches: [] };
  }
  const state = await ensureStateLoaded();
  const matches = state.users
    .filter((user) => user.id !== viewerId && user.phone && set.has(user.phone))
    .map((user) => ({ id: user.id, name: user.name, phone: user.phone, avatarUri: user.avatarUri }))
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  return { matches };
}

export async function listProfiles() {
  const state = await ensureStateLoaded();
  return state.users.map(sanitizeUser).sort((a, b) => sortByCreatedDesc(a, b));
}

export async function createContactRequest({ requesterId, targetId }) {
  if (!requesterId || !targetId || requesterId === targetId) {
    return { ok: false, error: 'Invalid request' };
  }
  return mutateState((state) => {
    const requester = state.users.find((user) => user.id === requesterId);
    const target = state.users.find((user) => user.id === targetId);
    if (!requester || !target) {
      return { ok: false, error: 'User not found' };
    }
    const existingPending = state.contactRequests.find(
      (req) => req.requesterId === requesterId && req.targetId === targetId && req.status === 'pending'
    );
    if (existingPending) {
      return { ok: false, error: 'Request already sent' };
    }
    const request = {
      id: createId('req'),
      requesterId,
      targetId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    state.contactRequests.push(request);
    return { ok: true, request };
  });
}

export async function listContactRequests(userId) {
  if (!userId) return { incoming: [], outgoing: [] };
  const state = await ensureStateLoaded();
  const attachUser = (req) => ({
    ...req,
    requester: sanitizeUser(state.users.find((u) => u.id === req.requesterId)),
    target: sanitizeUser(state.users.find((u) => u.id === req.targetId)),
  });
  const incoming = state.contactRequests
    .filter((req) => req.targetId === userId)
    .map(attachUser)
    .sort(sortByCreatedDesc);
  const outgoing = state.contactRequests
    .filter((req) => req.requesterId === userId)
    .map(attachUser)
    .sort(sortByCreatedDesc);
  return { incoming, outgoing };
}

export async function respondToContactRequest(requestId, action) {
  const status = action === 'accept' ? 'accepted' : 'declined';
  return mutateState((state) => {
    const request = state.contactRequests.find((req) => req.id === requestId);
    if (!request) {
      return { ok: false, error: 'Request not found' };
    }
    request.status = status;
    request.respondedAt = new Date().toISOString();
    return { ok: true, request };
  });
}

export async function listCommunities(viewerId) {
  const state = await ensureStateLoaded();
  return state.communities
    .map((community) => buildCommunitySummary(community, state, viewerId))
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function listJoinedCommunities(userId) {
  const state = await ensureStateLoaded();
  const memberships = state.communityMembers.filter((member) => member.userId === userId);
  return memberships
    .map((membership) => buildCommunitySummary(getCommunityById(state, membership.communityId), state, userId))
    .filter(Boolean)
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export async function listCommunityMembers(communityId) {
  const state = await ensureStateLoaded();
  return state.communityMembers
    .filter((member) => member.communityId === communityId)
    .map((member) => ({
      ...member,
      user: sanitizeUser(state.users.find((user) => user.id === member.userId)),
    }))
    .sort((a, b) => {
      const roleOrder = { owner: 0, moderator: 1, member: 2 };
      return (roleOrder[a.role] || 9) - (roleOrder[b.role] || 9);
    });
}

export async function createCommunity({ ownerId, name, description, isPrivate }) {
  if (!ownerId || !name?.trim()) {
    return { ok: false, error: 'Name is required' };
  }
  return mutateState((state) => {
    const owner = state.users.find((user) => user.id === ownerId);
    if (!owner) {
      return { ok: false, error: 'Owner not found' };
    }
    const community = {
      id: createId('community'),
      name: name.trim(),
      description: (description || '').trim(),
      ownerId,
      isPrivate: Boolean(isPrivate),
      bannerColor: ['#f97316', '#22c55e', '#3b82f6', '#e11d48', '#6366f1'][
        Math.floor(Math.random() * 5)
      ],
      createdAt: new Date().toISOString(),
    };
    state.communities.push(community);
    state.communityMembers.push({
      id: createId('cm'),
      communityId: community.id,
      userId: ownerId,
      role: 'owner',
      joinedAt: new Date().toISOString(),
    });
    return { ok: true, community };
  });
}

export async function updateCommunityDetails({ communityId, actorId, patch }) {
  if (!communityId || !actorId) {
    return { ok: false, error: 'Missing ids' };
  }
  const allowedFields = ['name', 'description', 'isPrivate', 'bannerColor'];
  return mutateState((state) => {
    const community = getCommunityById(state, communityId);
    if (!community) {
      return { ok: false, error: 'Community not found' };
    }
    const membership = assertMembership(state, communityId, actorId);
    if (!isCommunityAdmin(membership)) {
      return { ok: false, error: 'Only admins can update community' };
    }
    const safePatch = Object.fromEntries(
      Object.entries(patch || {}).filter(([key, value]) => allowedFields.includes(key) && value !== undefined)
    );
    Object.assign(community, safePatch, { updatedAt: new Date().toISOString() });
    return { ok: true, community };
  });
}

export async function requestToJoinCommunity({ communityId, userId }) {
  if (!communityId || !userId) {
    return { ok: false, error: 'Missing ids' };
  }
  return mutateState((state) => {
    const community = getCommunityById(state, communityId);
    if (!community) {
      return { ok: false, error: 'Community not found' };
    }
    const existingMember = assertMembership(state, communityId, userId);
    if (existingMember) {
      return { ok: true, alreadyMember: true };
    }
    if (!community.isPrivate) {
      state.communityMembers.push({
        id: createId('cm'),
        communityId,
        userId,
        role: 'member',
        joinedAt: new Date().toISOString(),
      });
      return { ok: true, joined: true };
    }
    const existingRequest = state.communityJoinRequests.find(
      (req) => req.communityId === communityId && req.userId === userId && req.status === 'pending'
    );
    if (existingRequest) {
      return { ok: true, alreadyPending: true };
    }
    const request = {
      id: createId('cjr'),
      communityId,
      userId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    state.communityJoinRequests.push(request);
    return { ok: true, request };
  });
}

export async function listCommunityJoinRequests({ communityId, actorId }) {
  const state = await ensureStateLoaded();
  const membership = assertMembership(state, communityId, actorId);
  if (!isCommunityAdmin(membership)) {
    return [];
  }
  return state.communityJoinRequests
    .filter((req) => req.communityId === communityId)
    .map((req) => ({
      ...req,
      user: sanitizeUser(state.users.find((user) => user.id === req.userId)),
    }))
    .sort(sortByCreatedDesc);
}

export async function respondToCommunityJoinRequest({ requestId, actorId, action }) {
  if (!requestId || !actorId) {
    return { ok: false, error: 'Missing ids' };
  }
  const isAccept = action === 'accept';
  return mutateState((state) => {
    const request = state.communityJoinRequests.find((req) => req.id === requestId);
    if (!request) {
      return { ok: false, error: 'Request not found' };
    }
    const community = getCommunityById(state, request.communityId);
    if (!community) {
      return { ok: false, error: 'Community missing' };
    }
    const actorMembership = assertMembership(state, community.id, actorId);
    if (!isCommunityAdmin(actorMembership)) {
      return { ok: false, error: 'Only admins can respond' };
    }
    request.status = isAccept ? 'accepted' : 'declined';
    request.respondedAt = new Date().toISOString();
    if (isAccept) {
      const alreadyMember = assertMembership(state, community.id, request.userId);
      if (!alreadyMember) {
        state.communityMembers.push({
          id: createId('cm'),
          communityId: community.id,
          userId: request.userId,
          role: 'member',
          joinedAt: new Date().toISOString(),
        });
      }
    }
    return { ok: true };
  });
}

export async function listMyCommunityRequests(userId) {
  if (!userId) return { incoming: [], outgoing: [] };
  const state = await ensureStateLoaded();
  const adminCommunities = new Set(
    state.communityMembers
      .filter((member) => member.userId === userId && (member.role === 'owner' || member.role === 'moderator'))
      .map((member) => member.communityId)
  );
  const attach = (req) => ({
    ...req,
    user: sanitizeUser(state.users.find((user) => user.id === req.userId)),
    community: getCommunityById(state, req.communityId),
  });
  const incoming = state.communityJoinRequests
    .filter((req) => adminCommunities.has(req.communityId))
    .map(attach)
    .sort(sortByCreatedDesc);
  const outgoing = state.communityJoinRequests
    .filter((req) => req.userId === userId)
    .map(attach)
    .sort(sortByCreatedDesc);
  return { incoming, outgoing };
}

export async function leaveCommunity({ communityId, userId }) {
  if (!communityId || !userId) {
    return { ok: false, error: 'Missing ids' };
  }
  return mutateState((state) => {
    const membership = assertMembership(state, communityId, userId);
    if (!membership) {
      return { ok: false, error: 'You are not a member' };
    }
    if (membership.role === 'owner') {
      return { ok: false, error: 'Owners must transfer ownership before leaving' };
    }
    state.communityMembers = state.communityMembers.filter((member) => member.id !== membership.id);
    state.communityThreads = state.communityThreads.map((thread) => {
      if (thread.communityId !== communityId) return thread;
      return thread;
    });
    return { ok: true };
  });
}

export async function createCommunityThread({ communityId, userId, name, description, isAnnouncement }) {
  if (!communityId || !userId || !name?.trim()) {
    return { ok: false, error: 'Thread name is required' };
  }
  return mutateState((state) => {
    const membership = assertMembership(state, communityId, userId);
    if (!membership) {
      return { ok: false, error: 'Join the community first' };
    }
    if (isAnnouncement && !isCommunityAdmin(membership)) {
      return { ok: false, error: 'Only admins can post announcements' };
    }
    const thread = {
      id: createId('thread'),
      communityId,
      name: name.trim(),
      description: (description || '').trim(),
      createdBy: userId,
      createdAt: new Date().toISOString(),
      isAnnouncement: Boolean(isAnnouncement),
    };
    state.communityThreads.push(thread);
    return { ok: true, thread };
  });
}

export async function listCommunityThreads(communityId) {
  const state = await ensureStateLoaded();
  return state.communityThreads
    .filter((thread) => thread.communityId === communityId)
    .map((thread) => ({
      ...thread,
      messageCount: state.threadMessages.filter((msg) => msg.threadId === thread.id).length,
    }))
    .sort((a, b) => {
      if (a.isAnnouncement !== b.isAnnouncement) {
        return a.isAnnouncement ? -1 : 1;
      }
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });
}

export async function listThreadMessages(threadId) {
  const state = await ensureStateLoaded();
  return state.threadMessages
    .filter((message) => message.threadId === threadId)
    .map((message) => ({
      ...message,
      user: sanitizeUser(state.users.find((user) => user.id === message.userId)),
    }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function postThreadMessage({ threadId, userId, text }) {
  if (!threadId || !userId || !text?.trim()) {
    return { ok: false, error: 'Message required' };
  }
  return mutateState((state) => {
    const thread = state.communityThreads.find((item) => item.id === threadId);
    if (!thread) {
      return { ok: false, error: 'Thread not found' };
    }
    const membership = assertMembership(state, thread.communityId, userId);
    if (!membership) {
      return { ok: false, error: 'Join the community to participate' };
    }
    const message = {
      id: createId('msg'),
      threadId,
      userId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    state.threadMessages.push(message);
    return { ok: true, message };
  });
}

export async function createCommunityEvent({ communityId, createdBy, title, description, startsAt, location, visibility }) {
  if (!communityId || !createdBy || !title?.trim() || !startsAt) {
    return { ok: false, error: 'Missing required fields' };
  }
  return mutateState((state) => {
    const membership = assertMembership(state, communityId, createdBy);
    if (!isCommunityAdmin(membership)) {
      return { ok: false, error: 'Only admins can create events' };
    }
    const event = {
      id: createId('event'),
      communityId,
      createdBy,
      title: title.trim(),
      description: (description || '').trim(),
      startsAt,
      location: (location || '').trim() || 'TBD',
      visibility: visibility || 'public',
      createdAt: new Date().toISOString(),
    };
    state.communityEvents.push(event);
    return { ok: true, event };
  });
}

export async function listCommunityEvents(communityId) {
  const state = await ensureStateLoaded();
  return state.communityEvents
    .filter((event) => event.communityId === communityId)
    .map((event) => ({
      ...event,
      createdByUser: sanitizeUser(state.users.find((user) => user.id === event.createdBy)),
      attendees: state.communityEventResponses
        .filter((resp) => resp.eventId === event.id && resp.status === 'going')
        .map((resp) => sanitizeUser(state.users.find((user) => user.id === resp.userId))),
    }))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export async function respondToEvent({ eventId, userId, status }) {
  if (!eventId || !userId || !status) {
    return { ok: false, error: 'Missing data' };
  }
  return mutateState((state) => {
    const event = state.communityEvents.find((item) => item.id === eventId);
    if (!event) {
      return { ok: false, error: 'Event not found' };
    }
    const membership = assertMembership(state, event.communityId, userId);
    if (!membership) {
      return { ok: false, error: 'Join the community first' };
    }
    const existing = state.communityEventResponses.find(
      (resp) => resp.eventId === eventId && resp.userId === userId
    );
    if (existing) {
      existing.status = status;
      existing.updatedAt = new Date().toISOString();
      return { ok: true };
    }
    state.communityEventResponses.push({
      id: createId('event-rsvp'),
      eventId,
      userId,
      status,
      createdAt: new Date().toISOString(),
    });
    return { ok: true };
  });
}

export async function updateUserProfile(userId, patch) {
  const allowed = ['bio', 'interests', 'name'];
  return updateUser(userId, Object.fromEntries(
    Object.entries(patch || {}).filter(([key]) => allowed.includes(key))
  ));
}

export async function getThreadById(threadId) {
  const state = await ensureStateLoaded();
  return state.communityThreads.find((thread) => thread.id === threadId) || null;
}
