import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = useCallback(async ({ email, password }) => {
    if (email && password) {
      const fakeUser = { 
        id: 'u1', 
        name: email.split('@')[0] || 'User', 
        email,
        about: 'Hey there! I am using DesiApp.',
        phone: '+1 (555) 123-4567',
        links: [],
        profilePicture: null
      };
      setUser(fakeUser);
      return { ok: true };
    }
    return { ok: false, error: 'Invalid credentials' };
  }, []);

  const signup = useCallback(async ({ name, email, password }) => {
    if (name && email && password) {
      const fakeUser = { 
        id: 'u1', 
        name, 
        email,
        about: 'Hey there! I am using DesiApp.',
        phone: '+1 (555) 123-4567',
        links: [],
        profilePicture: null
      };
      setUser(fakeUser);
      return { ok: true };
    }
    return { ok: false, error: 'Fill all fields' };
  }, []);

  const updateProfile = useCallback((updates) => {
    setUser(prevUser => prevUser ? { ...prevUser, ...updates } : null);
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const value = useMemo(() => ({ user, login, signup, logout, updateProfile }), [user, login, signup, logout, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
