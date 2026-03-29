'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, LoginRequest, RegisterRequest } from '../types/index';
import { apiClient } from '../service/api.service';
import { API_ENDPOINTS, TOKEN_KEY, USER_KEY } from '../configs/config';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeUser(jwt: string, fallbackName = ''): User {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    return { name: payload.name || fallbackName, email: payload.sub || '' };
  } catch {
    return { name: fallbackName, email: '' };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistSession = useCallback((jwt: string, userObj: User | null) => {
    localStorage.setItem(TOKEN_KEY, jwt);
    if (userObj) localStorage.setItem(USER_KEY, JSON.stringify(userObj));
    setToken(jwt);
    setUser(userObj);
  }, []);

  useEffect(() => {
    // ── 1. Check for OAuth2 redirect token in URL ──────────────────────────
    // Handles: http://localhost:3000/oauth2/redirect?token=xxx
    //      or: http://localhost:3000/?token=xxx
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');

    if (urlToken) {
      const userObj = decodeUser(urlToken);
      persistSession(urlToken, userObj);
      // Clean URL → redirect to root
      window.history.replaceState({}, '', '/');
      setIsLoading(false);
      return;
    }

    // ── 2. Restore existing session from localStorage ──────────────────────
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } finally {
      setIsLoading(false);
    }
  }, [persistSession]);

  const login = useCallback(async (data: LoginRequest) => {
    const res = await apiClient.post<{ token: string }>(API_ENDPOINTS.AUTH.LOGIN, data);
    const jwt = res.data!.token;
    persistSession(jwt, decodeUser(jwt));
  }, [persistSession]);

  const register = useCallback(async (data: RegisterRequest) => {
    const res = await apiClient.post<{ token: string }>(API_ENDPOINTS.AUTH.REGISTER, data);
    const jwt = res.data!.token;
    persistSession(jwt, decodeUser(jwt, data.name));
  }, [persistSession]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}