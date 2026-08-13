import { describe, it, expect } from 'vitest';
import { AdminUpdateSiteUseCase } from '../usecases/user-site/admin-update-site.usecase';
import { FakeUserSiteRepo, makeSite, makeContent } from './fakes';

// Admin is a deliberate ownership-bypass tool: it must FORCE the write past the
// optimistic-concurrency guard (it passes a null token to repo.update), so it
// never spuriously fails with STALE_VERSION even when an owner edited the row.
describe('AdminUpdateSiteUseCase — force write (version-guard bypass)', () => {
  it('updateStatus forces the write regardless of the current version', async () => {
    const repo = new FakeUserSiteRepo([
      makeSite({ id: 'site-1', status: 'suspended', publishedContent: makeContent() }),
    ]);
    const uc = new AdminUpdateSiteUseCase(repo);
    const result = await uc.updateStatus('site-1', 'active');
    expect(result.status).toBe('active');
  });

  it('updateStatus to suspended does not stamp publishedAt', async () => {
    const repo = new FakeUserSiteRepo([makeSite({ id: 'site-1', status: 'active' })]);
    const uc = new AdminUpdateSiteUseCase(repo);
    const result = await uc.updateStatus('site-1', 'suspended');
    expect(result.status).toBe('suspended');
  });

  it('updateStatus throws SITE_NOT_FOUND for a missing site', async () => {
    const uc = new AdminUpdateSiteUseCase(new FakeUserSiteRepo([]));
    await expect(uc.updateStatus('missing', 'active')).rejects.toMatchObject({ code: 'SITE_NOT_FOUND' });
  });

  // Since migration 029 `active` decides whether the *published copy* is served.
  // Activating a Site that has none used to work only because the public
  // renderer read the draft — now it would read `active` in admin and 404 on
  // the public URL, so the transition is refused instead. See ADR-0017.
  it('updateStatus refuses to activate a Site that has never been published', async () => {
    const repo = new FakeUserSiteRepo([
      makeSite({ id: 'site-1', status: 'draft', publishedContent: null }),
    ]);
    const uc = new AdminUpdateSiteUseCase(repo);
    await expect(uc.updateStatus('site-1', 'active'))
      .rejects.toMatchObject({ code: 'NO_PUBLISHED_CONTENT' });
    expect(repo.sites[0].status).toBe('draft');
  });

  it('updateStatus restores a suspended Site onto its existing published copy', async () => {
    const published = makeContent();
    const repo = new FakeUserSiteRepo([
      makeSite({
        id: 'site-1',
        status: 'active',
        publishedContent: published,
        publishedAt: '2026-01-01T00:00:00.000Z',
      }),
    ]);
    const uc = new AdminUpdateSiteUseCase(repo);

    const down = await uc.updateStatus('site-1', 'suspended');
    // A takedown keeps the published copy — a restore must not need the owner
    // to publish again.
    expect(down.publishedContent).toEqual(published);

    const up = await uc.updateStatus('site-1', 'active');
    expect(up.status).toBe('active');
    expect(up.publishedContent).toEqual(published);
    // Restoring is not republishing: the content going back up is the content
    // that went up originally, so its timestamp must not be rewritten.
    expect(up.publishedAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('updateDomain forces the write and rejects a duplicate slug', async () => {
    const repo = new FakeUserSiteRepo([
      makeSite({ id: 'site-1', domain: null }),
      makeSite({ id: 'site-2', domain: 'taken' }),
    ]);
    const uc = new AdminUpdateSiteUseCase(repo);
    const ok = await uc.updateDomain('site-1', 'my-shop');
    expect(ok.domain).toBe('my-shop');
    await expect(uc.updateDomain('site-1', 'taken')).rejects.toMatchObject({ code: 'DOMAIN_TAKEN' });
  });
});
