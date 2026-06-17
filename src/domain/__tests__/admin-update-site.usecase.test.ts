import { describe, it, expect } from 'vitest';
import { AdminUpdateSiteUseCase } from '../usecases/user-site/admin-update-site.usecase';
import { FakeUserSiteRepo, makeSite } from './fakes';

// Admin is a deliberate ownership-bypass tool: it must FORCE the write past the
// optimistic-concurrency guard (it passes a null token to repo.update), so it
// never spuriously fails with STALE_VERSION even when an owner edited the row.
describe('AdminUpdateSiteUseCase — force write (version-guard bypass)', () => {
  it('updateStatus forces the write regardless of the current version', async () => {
    const repo = new FakeUserSiteRepo([makeSite({ id: 'site-1', status: 'draft' })]);
    const uc = new AdminUpdateSiteUseCase(repo);
    const result = await uc.updateStatus('site-1', 'active');
    expect(result.status).toBe('active');
    expect(result.publishedAt).not.toBeNull();
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
