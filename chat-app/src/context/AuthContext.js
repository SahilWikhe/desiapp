import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const loadAvatarFor = useCallback(async (userId) => {
    try {
      const uri = await AsyncStorage.getItem(`avatar:${userId}`);
      if (uri) {
        setUser((prev) => (prev && prev.id === userId ? { ...prev, avatarUri: uri } : prev));
      }
    } catch {}
  }, []);

  const login = useCallback(async ({ email, password }) => {
    if (email && password) {
      const fakeUser = { id: 'u1', name: email.split('@')[0] || 'User', email, avatarUri: null };
      setUser(fakeUser);
      await loadAvatarFor(fakeUser.id);
      return { ok: true };
    }
    return { ok: false, error: 'Invalid credentials' };
  }, [loadAvatarFor]);

  const signup = useCallback(async ({ name, email, password }) => {
    if (name && email && password) {
      const fakeUser = { id: 'u1', name, email, avatarUri: null };
      setUser(fakeUser);
      await loadAvatarFor(fakeUser.id);
      return { ok: true };
    }
    return { ok: false, error: 'Fill all fields' };
  }, [loadAvatarFor]);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const setAvatarUri = useCallback(async (uri) => {
    if (!user?.id) return;
    try {
      await AsyncStorage.setItem(`avatar:${user.id}`, uri);
    } catch {}
    setUser((prev) => (prev ? { ...prev, avatarUri: uri } : prev));
  }, [user?.id]);

  const value = useMemo(() => ({ user, login, signup, logout, setAvatarUri }), [user, login, signup, logout, setAvatarUri]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
