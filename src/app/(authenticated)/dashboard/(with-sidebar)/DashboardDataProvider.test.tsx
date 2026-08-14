// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import type { SiteSummary } from '@/domain/entities/user-site.entity';
import { DashboardDataProvider, useDashboardData } from './DashboardDataProvider';

const makeSite = (siteName: string, updatedAt: string): SiteSummary => ({
  id: 'site-1',
  userId: 'user-1',
  templateId: 'tpl-1',
  siteName,
  domain: null,
  status: 'draft',
  publishedAt: null,
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt,
});

afterEach(cleanup);

describe('DashboardDataProvider', () => {
  it('renders a fresh server snapshot without an intermediate stale client frame', () => {
    const renderedSiteNames: string[] = [];

    function Probe() {
      const { sites, patchSite } = useDashboardData();
      const [draft, setDraft] = useState('Keep me');
      renderedSiteNames.push(sites[0]?.siteName ?? 'empty');

      return (
        <>
          <span>{sites[0]?.siteName}</span>
          <input aria-label="Child draft" value={draft} onChange={(event) => setDraft(event.target.value)} />
          <button type="button" onClick={() => patchSite('site-1', { siteName: 'Local edit' })}>
            Patch
          </button>
        </>
      );
    }

    const user = { id: 'user-1' } as User;
    const { rerender } = render(
      <DashboardDataProvider
        user={user}
        initialSites={[makeSite('Initial server value', '2026-07-01T00:00:00.000Z')]}
      >
        <Probe />
      </DashboardDataProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Patch' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Child draft' }), { target: { value: 'Unsaved query' } });
    expect(screen.getByText('Local edit')).toBeInTheDocument();

    renderedSiteNames.length = 0;
    rerender(
      <DashboardDataProvider
        user={user}
        initialSites={[makeSite('Fresh server value', '2026-07-01T00:01:00.000Z')]}
      >
        <Probe />
      </DashboardDataProvider>,
    );

    expect(screen.getByText('Fresh server value')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Child draft' })).toHaveValue('Unsaved query');
    expect(renderedSiteNames).toEqual(['Fresh server value']);
  });
});
