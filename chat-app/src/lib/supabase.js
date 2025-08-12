import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://efdjffhagxlnykdgrgra.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZGpmZmhhZ3hsbnlrZGdyZ3JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjg2NzcsImV4cCI6MjA3MDYwNDY3N30.gp4miXONE0kzlfQxe8AveN70XWS-xESf1H8yNKFpo_0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});


