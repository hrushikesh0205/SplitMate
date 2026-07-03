import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { register as apiRegister, login as apiLogin, logout as apiLogout, getMe, getToken } from '../lib/authService.jsx';
import { updateProfile as apiUpdateProfile } from '../lib/profileService.jsx';

const AuthContext = createContext(null);

/**
 * Normalises the API user object into the shape the UI expects:
 *   user.id         — consistent id field
 *   profile.full_name, profile.avatar_url, profile.currency
 */
function normaliseUser(raw) {
  if (!raw) return null;
  return {
    id: raw._id || raw.id,
    _id: raw._id || raw.id,
    email: raw.email,
    name: raw.name,
    avatar: raw.avatar,
    totalOwed: raw.totalOwed || 0,
    totalOwe: raw.totalOwe || 0,
  };
}

function userToProfile(raw) {
  if (!raw) return null;
  return {
    id: raw._id || raw.id,
    full_name: raw.name || '',
    avatar_url: raw.avatar || '',
    currency: raw.currency || 'USD',
    created_at: raw.createdAt || raw.created_at || null,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: if there is a stored token, try to restore the session
  useEffect(() => {
    let mounted = true;
    async function restore() {
      const token = getToken();
      if (!token) { setLoading(false); return; }
      try {
        const raw = await getMe();
        if (!mounted) return;
        const u = normaliseUser(raw);
        setUser(u);
        setProfile(userToProfile(raw));
      } catch {
        apiLogout();
      } finally {
        if (mounted) setLoading(false);
      }
    }
    restore();
    return () => { mounted = false; };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const raw = await apiLogin(email, password);
    const u = normaliseUser(raw);
    setUser(u);
    setProfile(userToProfile(raw));
    return u;
  }, []);

  const signUp = useCallback(async (email, password, fullName) => {
    const raw = await apiRegister(fullName, email, password);
    const u = normaliseUser(raw);
    setUser(u);
    setProfile(userToProfile(raw));
    return u;
  }, []);

  const signOut = useCallback(() => {
    apiLogout();
    setUser(null);
    setProfile(null);
  }, []);

  const updateProfile = useCallback(async (patch) => {
    const raw = await apiUpdateProfile(patch);
    const updated = userToProfile(raw);
    setProfile((prev) => ({ ...prev, ...updated }));
    return updated;
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const raw = await getMe();
      const u = normaliseUser(raw);
      setUser(u);
      setProfile(userToProfile(raw));
    } catch {}
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile,
      refreshProfile,
      // kept for any code that still references session
      session: user ? { user } : null,
    }),
    [user, profile, loading, signIn, signUp, signOut, updateProfile, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
