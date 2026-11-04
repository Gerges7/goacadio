import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** Publishable/anon credentials are public by design. Never put a service_role key here. */
const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
export const isSupabaseConfigured = Boolean(url && publishableKey);
let browserClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (typeof window === 'undefined' || !url || !publishableKey) return null;
  if (!browserClient) {
    browserClient = createClient(url, publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' },
    });
  }
  return browserClient;
}
