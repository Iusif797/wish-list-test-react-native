import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';
import { saveBiometricCredentials, clearBiometricCredentials } from './biometric';

export interface User {
  id: string;
  email: string;
  name: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  loginWithOAuth: (accessToken: string, user: User) => Promise<void>;
  loginWithBiometrics: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const t = await AsyncStorage.getItem('token');
      if (!t) {
        setLoading(false);
        return;
      }
      setToken(t);
      setLoading(true);
      const u = await api<User>('/auth/me');
      setUser(u);
    } catch {
      await AsyncStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const persist = useCallback(async (accessToken: string) => {
    try {
      await AsyncStorage.setItem('token', accessToken);
    } catch {
      // Ignore storage errors, memory state will still work
    }
    await saveBiometricCredentials(accessToken);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api<{ access_token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      await persist(res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    },
    [persist],
  );

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const res = await api<{ access_token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });
      await persist(res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    },
    [persist],
  );

  const loginWithOAuth = useCallback(
    async (accessToken: string, u: User) => {
      await persist(accessToken);
      setToken(accessToken);
      setUser(u);
    },
    [persist],
  );

  const loginWithBiometrics = useCallback(async () => {
    const { authenticateWithBiometrics, getBiometricToken } = await import('./biometric');
    const ok = await authenticateWithBiometrics();
    if (!ok) return;
    const t = await getBiometricToken();
    if (!t) {
      throw new Error('Нет сохранённых учётных данных');
    }
    try {
      await AsyncStorage.setItem('token', t);
    } catch {
      // Ignore
    }
    const u = await api<User>('/auth/me');
    setToken(t);
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('token');
    } catch {
      // Ignore
    }
    await clearBiometricCredentials();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, loginWithOAuth, loginWithBiometrics, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
