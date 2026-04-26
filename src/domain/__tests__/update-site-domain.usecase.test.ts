import { describe, it, expect } from 'vitest';
import { UpdateSiteDomainUseCase } from '../usecases/user-site/update-site-domain.usecase';
import { FakeUserSiteRepo, makeSite } from './fakes';

describe('UpdateSiteDomainUseCase', () => {
  it('throws SITE_NOT_FOUND when site does not exist', async () => {
    const uc = new UpdateSiteDomainUseCase(new FakeUserSiteRepo([]));
    await expect(uc.execute('missing', 'myshop', 'user-1')).rejects.toMatchObject({ code: 'SITE_NOT_FOUND' });
  });

  it('throws SITE_ACCESS_DENIED for non-owner', async () => {
    const repo = new FakeUserSiteRepo([makeSite({ id: 'site-1', userId: 'user-1' })]);
    const uc = new UpdateSiteDomainUseCase(repo);
    await expect(uc.execute('site-1', 'myshop', 'user-2')).rejects.toMatchObject({ code: 'SITE_ACCESS_DENIED' });
  });

  it('throws INVALID_DOMAIN for reserved domain name', async () => {
    const repo = new FakeUserSiteRepo([makeSite({ id: 'site-1', userId: 'user-1' })]);
    const uc = new UpdateSiteDomainUseCase(repo);
    await expect(uc.execute('site-1', 'admin', 'user-1')).rejects.toMatchObject({ code: 'INVALID_DOMAIN' });
  });

  it('throws INVALID_DOMAIN for slug that is too short', async () => {
    const repo = new FakeUserSiteRepo([makeSite({ id: 'site-1', userId: 'user-1' })]);
    const uc = new UpdateSiteDomainUseCase(repo);
    await expect(uc.execute('site-1', 'ab', 'user-1')).rejects.toMatchObject({ code: 'INVALID_DOMAIN' });
  });

  it('throws DOMAIN_TAKEN when domain belongs to another site', async () => {
    const repo = new FakeUserSiteRepo([
      makeSite({ id: 'site-1', userId: 'user-1', domain: null }),
      makeSite({ id: 'site-2', userId: 'user-2', domain: 'taken-shop' }),
    ]);
    const uc = new UpdateSiteDomainUseCase(repo);
    await expect(uc.execute('site-1', 'taken-shop', 'user-1')).rejects.toMatchObject({ code: 'DOMAIN_TAKEN' });
  });

  it('allows a site to reclaim its own current domain', async () => {
    const repo = new FakeUserSiteRepo([makeSite({ id: 'site-1', userId: 'user-1', domain: 'myshop' })]);
    const uc = new UpdateSiteDomainUseCase(repo);
    const result = await uc.execute('site-1', 'myshop', 'user-1');
    expect(result.domain).toBe('myshop');
  });

  it('lowercases and trims the domain slug before saving', async () => {
    const repo = new FakeUserSiteRepo([makeSite({ id: 'site-1', userId: 'user-1', domain: null })]);
    const uc = new UpdateSiteDomainUseCase(repo);
    const result = await uc.execute('site-1', '  My-New-Shop  ', 'user-1');
    expect(result.domain).toBe('my-new-shop');
  });
});
