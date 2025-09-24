import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  authenticateUser,
  bootstrapMockBackend,
  getUserById,
  registerUser,
  setUserAvatar,
  setUserPhone,
  updateUserProfile,
} from '../lib/mockBackend';

const AuthContext = createContext(null);
const SESSION_KEY = 'chat-app:session-user-id';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const restore = async () => {
      try {
        await bootstrapMockBackend();
        const storedId = await AsyncStorage.getItem(SESSION_KEY);
        if (storedId) {
          const existing = await getUserById(storedId);
          if (existing && isMounted) {
            setUser(existing);
          } else if (!existing) {
            await AsyncStorage.removeItem(SESSION_KEY);
          }
        }
      } catch (error) {
        console.warn('Auth bootstrap failed', error);
        await AsyncStorage.removeItem(SESSION_KEY);
      } finally {
        if (isMounted) setInitializing(false);
      }
    };
    restore();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const res = await authenticateUser({ email, password });
    if (res.ok && res.user) {
      setUser(res.user);
      await AsyncStorage.setItem(SESSION_KEY, res.user.id);
    }
    return res;
  }, []);

  const signup = useCallback(async ({ name, email, password }) => {
    const res = await registerUser({ name, email, password });
    if (res.ok && res.user) {
      setUser(res.user);
      await AsyncStorage.setItem(SESSION_KEY, res.user.id);
    }
    return res;
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!user?.id) return;
    const latest = await getUserById(user.id);
    if (latest) setUser(latest);
  }, [user?.id]);

  const setAvatarUri = useCallback(async (uri) => {
    if (!user?.id) return;
    await setUserAvatar(user.id, uri);
    await refreshUser();
  }, [refreshUser, user?.id]);

  const updatePhone = useCallback(async (phone) => {
    if (!user?.id) return { ok: false, error: 'Not authenticated' };
    const res = await setUserPhone(user.id, phone);
    if (res.ok && res.user) setUser(res.user);
    return res;
  }, [user?.id]);

  const updateProfileDetails = useCallback(
    async (patch) => {
      if (!user?.id) return { ok: false, error: 'Not authenticated' };
      const res = await updateUserProfile(user.id, patch);
      if (res.ok && res.user) setUser(res.user);
      return res;
    },
    [user?.id]
  );

  const value = useMemo(
    () => ({ user, initializing, login, signup, logout, setAvatarUri, updatePhone, refreshUser, updateProfileDetails }),
    [user, initializing, login, signup, logout, setAvatarUri, updatePhone, refreshUser, updateProfileDetails]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
