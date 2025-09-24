import { createContactRequest, listContactRequests, respondToContactRequest, searchProfiles } from './mockBackend';

export async function searchProfilesByName(query, viewerId) {
  try {
    return await searchProfiles(query, viewerId);
  } catch (error) {
    console.warn('searchProfilesByName failed', error);
    return [];
  }
}

export async function sendContactRequest(targetId, requesterId) {
  try {
    if (!requesterId) {
      return { ok: false, error: 'Not authenticated' };
    }
    return await createContactRequest({ requesterId, targetId });
  } catch (error) {
    console.warn('sendContactRequest failed', error);
    return { ok: false, error: 'Unable to send request' };
  }
}

export async function listMyRequests(userId) {
  try {
    return await listContactRequests(userId);
  } catch (error) {
    console.warn('listMyRequests failed', error);
    return { incoming: [], outgoing: [] };
  }
}

export async function respondToRequest(requestId, action) {
  try {
    return await respondToContactRequest(requestId, action);
  } catch (error) {
    console.warn('respondToRequest failed', error);
    return { ok: false, error: 'Unable to update request' };
  }
}

