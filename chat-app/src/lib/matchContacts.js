import { matchContacts } from './mockBackend';

export async function matchContactsByPhone(numbers, viewerId) {
  try {
    const result = await matchContacts(numbers, viewerId);
    return result || { matches: [] };
  } catch (error) {
    console.warn('matchContactsByPhone failed', error);
    return { matches: [] };
  }
}

