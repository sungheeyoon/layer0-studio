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
  content: { mode: 'single', templateKey: 'cafe-default', globalStyles: {} as never, blocks: [] },
  publishedContent: null,
  snapshot: { mode: 'single', templateKey: 'cafe-default', globalStyles: {} as never, blocks: [] },
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

  // The dialog's state used to be cleared by a hand-maintained list in an effect
  // on the parent; it now simply dies with the dialog, which the parent unmounts
  // on close. These two pin the behaviour that list existed to provide, so it
  // cannot quietly grow back — and they fail if the state ever moves back up to
  // a scope that outlives the dialog.
  //
  // Note they do *not* exercise the `key={site.id}` prop: with the dialog behind
  // a `{settingsSite && …}` guard there is always an unmount between two sites,
  // so these still pass with the key removed. The key covers a case the UI does
  // not currently offer (switching sites without closing) and is documented as
  // insurance, not as what fixes this.
  it('does not carry one site\'s draft edits into the next site\'s dialog', async () => {
    const user = userEvent.setup();
    renderProjects();

    const gears = screen.getAllByRole('button', { name: ko.dashboard.projects.configuration });
    await user.click(gears[0]);
    let dialog = await screen.findByRole('dialog');

    const nameInput = within(dialog).getByLabelText(ko.dashboard.projects.siteName);
    await user.clear(nameInput);
    await user.type(nameInput, 'Half-typed rename');
    await user.click(within(dialog).getByRole('button', { name: ko.dashboard.projects.close }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await user.click(screen.getAllByRole('button', { name: ko.dashboard.projects.configuration })[1]);
    dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByLabelText(ko.dashboard.projects.siteName)).toHaveValue('Second Site');
  });

  it('does not carry one site\'s delete confirmation into the next site\'s dialog', async () => {
    const user = userEvent.setup();
    renderProjects();

    // Step site 1 into its confirmation state, then leave without deleting.
    const dialog = await openDeleteConfirm(user, 'First Site');
    expect(within(dialog).getByRole('button', { name: ko.dashboard.projects.confirmDelete })).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: ko.dashboard.projects.close }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    // Site 2 must open on the safe step, not armed to delete.
    await user.click(screen.getAllByRole('button', { name: ko.dashboard.projects.configuration })[1]);
    const next = await screen.findByRole('dialog');
    expect(within(next).getByRole('button', { name: ko.dashboard.projects.deleteSite })).toBeInTheDocument();
    expect(within(next).queryByRole('button', { name: ko.dashboard.projects.confirmDelete })).not.toBeInTheDocument();
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

// While a request is in flight the dialog is the only surface that will report
// its outcome, and every action in it writes the same site row under the same
// `expectedUpdatedAt`. So it goes fully inert: dismissing it would drop the
// result on the floor (a failed delete would leave the user believing the site
// was gone), and a second concurrent write would collide with the first.
describe('ProjectsClient — the dialog is inert while a request is in flight', () => {
  /** Start a delete that never settles, leaving the dialog mid-flight. */
  async function beginHangingDelete(user: ReturnType<typeof userEvent.setup>) {
    deleteSiteAction.mockReturnValue(new Promise(() => {}));
    renderProjects();
    const dialog = await openDeleteConfirm(user, 'First Site');
    await user.click(within(dialog).getByRole('button', { name: ko.dashboard.projects.confirmDelete }));
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: ko.dashboard.projects.deleting })).toBeInTheDocument(),
    );
    return dialog;
  }

  it('cannot be dismissed — no close button, and Escape is ignored', async () => {
    const user = userEvent.setup();
    const dialog = await beginHangingDelete(user);

    // The close button is removed rather than disabled: a visible control that
    // silently ignores clicks reads as a broken dialog.
    expect(within(dialog).queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: ko.dashboard.projects.close })).toBeDisabled();

    await user.keyboard('{Escape}');
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('disables every other action, so nothing else can be sent for the same site', async () => {
    const user = userEvent.setup();
    const dialog = await beginHangingDelete(user);
    const p = ko.dashboard.projects;

    expect(within(dialog).getByLabelText(p.siteName)).toBeDisabled();
    expect(within(dialog).getByLabelText(p.primaryDomain)).toBeDisabled();
    expect(within(dialog).getByRole('button', { name: p.verify })).toBeDisabled();
    expect(within(dialog).getByRole('button', { name: p.publish })).toBeDisabled();
    expect(within(dialog).getByRole('button', { name: p.cancel })).toBeDisabled();
    expect(within(dialog).getByRole('button', { name: p.commit })).toBeDisabled();

    // The action that is actually running still names itself, so the user can
    // tell which one is holding the dialog.
    expect(within(dialog).getByRole('button', { name: p.deleting })).toBeDisabled();
  });
});
