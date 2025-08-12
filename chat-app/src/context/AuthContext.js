import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = useCallback(async ({ email, password }) => {
    if (email && password) {
      const fakeUser = { id: 'u1', name: email.split('@')[0] || 'User', email };
      setUser(fakeUser);
      return { ok: true };
    }
    return { ok: false, error: 'Invalid credentials' };
  }, []);

  const signup = useCallback(async ({ name, email, password }) => {
    if (name && email && password) {
      const fakeUser = { id: 'u1', name, email };
      setUser(fakeUser);
      return { ok: true };
    }
    return { ok: false, error: 'Fill all fields' };
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const value = useMemo(() => ({ user, login, signup, logout }), [user, login, signup, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
