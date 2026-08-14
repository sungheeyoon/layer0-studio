'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { SiteSummary } from '@/domain/entities/user-site.entity';

interface DashboardData {
  user: User;
  sites: SiteSummary[];
  patchSite: (id: string, partial: Partial<SiteSummary>) => void;
  removeSite: (id: string) => void;
  setSites: React.Dispatch<React.SetStateAction<SiteSummary[]>>;
}

const Ctx = createContext<DashboardData | null>(null);

interface ProviderProps {
  user: User;
  initialSites: SiteSummary[];
  children: React.ReactNode;
}

export function DashboardDataProvider({ user, initialSites, children }: ProviderProps) {
  const [sites, setSites] = useState<SiteSummary[]>(initialSites);
  const [serverSites, setServerSites] = useState(initialSites);

  // A refresh can deliver a newer server snapshot after local patch/remove
  // updates. Adjust before rendering consumers so they never see a stale frame.
  // Keeping the reset here (instead of keying the provider) also preserves
  // descendant UI state such as an open settings dialog or a search query.
  if (initialSites !== serverSites) {
    setServerSites(initialSites);
    setSites(initialSites);
  }

  const patchSite = useCallback((id: string, partial: Partial<SiteSummary>) => {
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
