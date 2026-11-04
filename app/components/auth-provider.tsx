import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

type AuthState = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signOut: () => Promise<void>;
};
const AuthContext = createContext<AuthState>({
  user: null, loading: true, configured: false, signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const client = getSupabase();
    if (!client) { setLoading(false); return; }
    let active = true;
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (active) { setUser(session?.user ?? null); setLoading(false); }
    });
    void client.auth.getSession().then(({ data, error }) => {
      if (active) { setUser(error ? null : (data.session?.user ?? null)); setLoading(false); }
    }).catch(() => { if (active) setLoading(false); });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  async function signOut() {
    const client = getSupabase();
    if (client) {
      const { error } = await client.auth.signOut();
      if (error) throw error;
    }
    setUser(null);
  }
  return <AuthContext.Provider value={{ user, loading, configured: isSupabaseConfigured, signOut }}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
