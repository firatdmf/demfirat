'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/*
 * Lightweight client-side auth: a user object held in localStorage
 * + React state. The server-side trust boundary still lives in
 * Django (login_web_client returns a user payload after verifying
 * the hashed password); this context just remembers who's signed in
 * across page loads. No JWT cookies for now — when we add server-
 * side actions that need authorization, we can move to httpOnly
 * cookies + per-request validation.
 */

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  name: string | null;
};

type LoginResult = { ok: true } | { ok: false; error: string };

type AuthContextType = {
  user: AuthUser | null;
  ready: boolean; // true once we've checked localStorage on mount
  signIn: (username: string, password: string) => Promise<LoginResult>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);
const STORAGE_KEY = 'demfirat:user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as AuthUser);
    } catch {}
    setReady(true);
  }, []);

  const signIn = async (username: string, password: string): Promise<LoginResult> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, error: data?.error ?? 'Giriş başarısız.' };
      }
      const u: AuthUser = data.user;
      setUser(u);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      } catch {}
      return { ok: true };
    } catch {
      return { ok: false, error: 'Ağ hatası — tekrar deneyin.' };
    }
  };

  const signOut = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, ready, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
