'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { account } from '@/lib/appwrite';
import { AppwriteUser } from '@/types';
import { login, logout, register } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: AppwriteUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    account.get()
      .then((u) => setUser(u as unknown as AppwriteUser))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    const u = await account.get();
    setUser(u as unknown as AppwriteUser);
    router.push('/');
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    await register(name, email, password);
    const u = await account.get();
    setUser(u as unknown as AppwriteUser);
    router.push('/');
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    router.push('/login');
  };

  const isAdmin = user?.labels?.includes('admin') ?? false;

  return (
    <AuthContext.Provider value={{ user, loading, login: handleLogin, register: handleRegister, logout: handleLogout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
