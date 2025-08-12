import { supabase } from './supabase';

export async function searchProfilesByName(query) {
  const q = (query || '').trim();
  if (!q) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, avatar_url')
    .ilike('name', `%${q}%`)
    .limit(20);
  if (error) return [];
  return data || [];
}

export async function sendContactRequest(targetId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id || !targetId || targetId === user.id) return { ok: false, error: 'invalid' };
  const { error } = await supabase.from('contact_requests').insert({ requester_id: user.id, target_id: targetId, status: 'pending' });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function listMyRequests() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) return { incoming: [], outgoing: [] };
  const [{ data: incoming }, { data: outgoing }] = await Promise.all([
    supabase.from('contact_requests').select('id, requester_id, target_id, status, created_at').eq('target_id', user.id).order('created_at', { ascending: false }),
    supabase.from('contact_requests').select('id, requester_id, target_id, status, created_at').eq('requester_id', user.id).order('created_at', { ascending: false }),
  ]);
  return { incoming: incoming || [], outgoing: outgoing || [] };
}

export async function respondToRequest(requestId, action) {
  const status = action === 'accept' ? 'accepted' : 'declined';
  const { error } = await supabase
    .from('contact_requests')
    .update({ status, responded_at: new Date().toISOString() })
    .eq('id', requestId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}


