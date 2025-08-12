import { supabase, SUPABASE_PUBLIC_URL, SUPABASE_PUBLIC_ANON_KEY } from './supabase';

export async function matchContactsByPhone(numbers) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token || '';

  const res = await fetch(`${SUPABASE_PUBLIC_URL}/functions/v1/match-contacts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: SUPABASE_PUBLIC_ANON_KEY,
    },
    body: JSON.stringify({ numbers }),
  });
  if (!res.ok) return { matches: [] };
  return res.json();
}


