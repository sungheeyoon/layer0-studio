import { describe, it, expect } from 'vitest';
import { PublishSiteUseCase } from '../usecases/user-site/publish-site.usecase';
import { FakeUserSiteRepo, makeSite } from './fakes';

describe('PublishSiteUseCase', () => {
  it('throws SITE_NOT_FOUND when site does not exist', async () => {
    const uc = new PublishSiteUseCase(new FakeUserSiteRepo([]));
    await expect(uc.execute('missing', 'user-1')).rejects.toMatchObject({ code: 'SITE_NOT_FOUND' });
  });

  it('throws SITE_ACCESS_DENIED when caller is not the owner', async () => {
    const repo = new FakeUserSiteRepo([makeSite({ id: 'site-1', userId: 'user-1' })]);
    const uc = new PublishSiteUseCase(repo);
    await expect(uc.execute('site-1', 'user-2')).rejects.toMatchObject({ code: 'SITE_ACCESS_DENIED' });
  });

  it('sets status to active and records publishedAt', async () => {
    const before = Date.now();
    const repo = new FakeUserSiteRepo([makeSite({ id: 'site-1', userId: 'user-1', status: 'draft' })]);
    const uc = new PublishSiteUseCase(repo);
    const result = await uc.execute('site-1', 'user-1');
    expect(result.status).toBe('active');
    expect(result.publishedAt).not.toBeNull();
    expect(new Date(result.publishedAt!).getTime()).toBeGreaterThanOrEqual(before);
  });

  it('allows re-publishing an already active site', async () => {
    const repo = new FakeUserSiteRepo([
      makeSite({ id: 'site-1', userId: 'user-1', status: 'active', publishedAt: '2020-01-01T00:00:00Z' }),
    ]);
    const uc = new PublishSiteUseCase(repo);
    const result = await uc.execute('site-1', 'user-1');
    expect(result.status).toBe('active');
  });
});
