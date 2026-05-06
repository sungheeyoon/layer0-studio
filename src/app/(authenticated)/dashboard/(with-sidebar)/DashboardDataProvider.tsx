'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { UserSite } from '@/domain/entities/user-site.entity';

interface DashboardData {
  user: User;
  sites: UserSite[];
  patchSite: (id: string, partial: Partial<UserSite>) => void;
  removeSite: (id: string) => void;
  setSites: React.Dispatch<React.SetStateAction<UserSite[]>>;
}

const Ctx = createContext<DashboardData | null>(null);

interface ProviderProps {
  user: User;
  initialSites: UserSite[];
  children: React.ReactNode;
}

export function DashboardDataProvider({ user, initialSites, children }: ProviderProps) {
  const [sites, setSites] = useState<UserSite[]>(initialSites);

  // When server re-renders the layout (after revalidatePath/router.refresh),
  // initialSites prop receives fresh data — sync it into client state so
  // optimistic updates merge with the latest server snapshot.
  useEffect(() => {
    setSites(initialSites);
  }, [initialSites]);

  const patchSite = useCallback((id: string, partial: Partial<UserSite>) => {
    setSites(prev => prev.map(s => (s.id === id ? { ...s, ...partial } : s)));
  }, []);

  const removeSite = useCallback((id: string) => {
    setSites(prev => prev.filter(s => s.id !== id));
  }, []);

  return (
    <Ctx.Provider value={{ user, sites, patchSite, removeSite, setSites }}>
      {children}
    </Ctx.Provider>
  );
}

export function useDashboardData(): DashboardData {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error('useDashboardData must be used within <DashboardDataProvider>');
  }
  return ctx;
}
