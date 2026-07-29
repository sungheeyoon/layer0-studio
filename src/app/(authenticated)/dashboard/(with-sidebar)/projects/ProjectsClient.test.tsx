// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserSite } from '@/domain/entities/user-site.entity';

// ---------------------------------------------------------------------------
// Regression cover for the "second delete hangs on 삭제 중…" bug.
//
// The in-flight flags used to be hand-rolled `useState` booleans, and the delete
// one was cleared only in the handled-error branch. A *successful* delete closes
// the settings dialog, so the stale `true` was invisible — until the next site's
// dialog opened with its confirm button already disabled and reading "삭제 중…",
// which meant the click never fired and no request was ever sent.
//
// These tests drive the real component through the real dialog, because the bug
// lived precisely in the wiring between them: every layer in isolation was fine.
// ---------------------------------------------------------------------------

const deleteSiteAction = vi.fn();
const refresh = vi.fn();
const removeSite = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh, push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('@/app/(authenticated)/dashboard/editor/actions', () => ({
  deleteSiteAction: (...args: unknown[]) => deleteSiteAction(...args),
  updateSiteDomainAction: vi.fn(),
  updateSiteNameAction: vi.fn(),
  publishSiteAction: vi.fn(),
  unpublishSiteAction: vi.fn(),
}));

const site = (id: string, siteName: string): UserSite => ({
  id,
  userId: 'user-1',
  templateId: 'tpl-1',
  siteName,
  domain: null,
  status: 'draft',
  content: { mode: 'single', templateKey: 'cafe-default', globalStyles: {} as never, sections: [] },
  snapshot: { mode: 'single', templateKey: 'cafe-default', globalStyles: {} as never, sections: [] },
  publishedAt: null,
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt: '2026-07-01T00:00:00.000Z',
});

let sites: UserSite[] = [];

vi.mock('../DashboardDataProvider', () => ({
  useDashboardData: () => ({
    user: { id: 'user-1' },
    sites,
    patchSite: vi.fn(),
    removeSite: (id: string) => {
      removeSite(id);
      sites = sites.filter((s) => s.id !== id);
    },
    setSites: vi.fn(),
  }),
}));

import ProjectsClient from './ProjectsClient';
import { I18nProvider } from '@/lib/i18n/provider';
import { ko } from '@/lib/i18n/messages/ko';

/**
 * The real dictionary, not a stub: the labels below ("삭제 확인", "삭제 중…")
 * are what the user reads, and a stub would let a wording change silently
 * decouple the test from the screen.
 */
const renderProjects = () =>
  render(
    <I18nProvider locale="ko" dictionary={ko}>
      <ProjectsClient />
    </I18nProvider>,
  );

/**
 * Open a site's settings dialog and step to the delete confirmation. Rows are
 * addressed through the gear button's accessible name, which is the same handle
 * a user (or a screen reader) has.
 */
async function openDeleteConfirm(user: ReturnType<typeof userEvent.setup>, siteName: string) {
  const gears = screen.getAllByRole('button', { name: ko.dashboard.projects.configuration });
  const index = sites.findIndex((s) => s.siteName === siteName);
  await user.click(gears[index]);

  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByText(siteName)).toBeInTheDocument();

  await user.click(within(dialog).getByRole('button', { name: ko.dashboard.projects.deleteSite }));
  return dialog;
}

beforeEach(() => {
  vi.clearAllMocks();
  sites = [site('site-1', 'First Site'), site('site-2', 'Second Site')];
  deleteSiteAction.mockResolvedValue({ success: true });
});

// Explicit, because @testing-library's auto-cleanup only registers itself when
// vitest runs with `globals: true` — which this repo does not. Without it each
// test's markup stays in the document and `getAllByRole` starts matching the
// previous test's buttons.
afterEach(cleanup);

describe('ProjectsClient — deleting a site twice', () => {
  it('leaves the confirm button usable for the next site after a successful delete', async () => {
    const user = userEvent.setup();
    renderProjects();

    // First delete — the one that always worked.
    let dialog = await openDeleteConfirm(user, 'First Site');
    await user.click(within(dialog).getByRole('button', { name: '삭제 확인' }));
    await waitFor(() => expect(deleteSiteAction).toHaveBeenCalledWith('site-1'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    // Second delete — this is what used to be dead on arrival.
    dialog = await openDeleteConfirm(user, 'Second Site');
    const confirm = within(dialog).getByRole('button', { name: '삭제 확인' });
    expect(confirm).toBeEnabled();

    await user.click(confirm);
    await waitFor(() => expect(deleteSiteAction).toHaveBeenCalledWith('site-2'));
    expect(deleteSiteAction).toHaveBeenCalledTimes(2);
  });

  it('re-enables the confirm button when the action rejects', async () => {
    const user = userEvent.setup();
    // A Server Action can reject outright — a mid-deploy network drop, say. The
    // old code caught neither branch here, so the flag stayed set with no dialog
    // close to hide it: the button froze within the same panel session.
    deleteSiteAction.mockRejectedValueOnce(new Error('network'));
    renderProjects();

    const dialog = await openDeleteConfirm(user, 'First Site');
    const confirm = within(dialog).getByRole('button', { name: '삭제 확인' });
    await user.click(confirm);

    await waitFor(() => expect(screen.getByText('삭제에 실패했습니다. 다시 시도해주세요.')).toBeInTheDocument());
    expect(within(dialog).getByRole('button', { name: '삭제 확인' })).toBeEnabled();

    // And the retry actually reaches the server.
    deleteSiteAction.mockResolvedValue({ success: true });
    await user.click(within(dialog).getByRole('button', { name: '삭제 확인' }));
    await waitFor(() => expect(deleteSiteAction).toHaveBeenCalledTimes(2));
  });

  it('re-enables the confirm button when the action returns a handled error', async () => {
    const user = userEvent.setup();
    deleteSiteAction.mockResolvedValueOnce({ error: 'SITE_NOT_FOUND' });
    renderProjects();

    const dialog = await openDeleteConfirm(user, 'First Site');
    await user.click(within(dialog).getByRole('button', { name: '삭제 확인' }));

    await waitFor(() => expect(screen.getByText('삭제에 실패했습니다. 다시 시도해주세요.')).toBeInTheDocument());
    expect(within(dialog).getByRole('button', { name: '삭제 확인' })).toBeEnabled();
  });
});
