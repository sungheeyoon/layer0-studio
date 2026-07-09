import { describe, it, expect } from 'vitest';
import { SiteWriteUseCase } from '../usecases/user-site/site-write.usecase';
import { FakeUserSiteRepo, FakeSiteContentValidator, makeSite, makeContent } from './fakes';
import {
  ContentModel,
  SingleContent,
  ArrayField,
} from '../entities/template.entity';
import { SiteContentValidationIssue } from '../usecases/ports/site-content-validator.port';
import { UserSite } from '../entities/user-site.entity';

const asSingle = (json: ContentModel) => json as SingleContent;

/** Build a use case + repo around a single owned site, returning its fresh token. */
function setup(siteOverrides: Partial<UserSite> = {}, validatorErrors: SiteContentValidationIssue[] = []) {
  const site = makeSite({ id: 'site-1', userId: 'user-1', ...siteOverrides });
  const repo = new FakeUserSiteRepo([site]);
  const uc = new SiteWriteUseCase(repo, new FakeSiteContentValidator(validatorErrors));
  return { uc, repo, token: site.updatedAt };
}

// --- Ownership matrix (shared across every method) ---------------------------
//
// Each guarded write must reject a missing site (SITE_NOT_FOUND) and a non-owner
// (SITE_ACCESS_DENIED) before touching the repo.
describe('SiteWriteUseCase — ownership guard', () => {
  const callers: Array<[string, (uc: SiteWriteUseCase, siteId: string, userId: string, token: string) => Promise<unknown>]> = [
    ['saveContent', (uc, id, u, t) => uc.saveContent(id, u, makeContent(), t)],
    ['rename', (uc, id, u, t) => uc.rename(id, u, 'New Name', t)],
    ['publish', (uc, id, u, t) => uc.publish(id, u, t)],
    ['unpublish', (uc, id, u, t) => uc.unpublish(id, u, t)],
    ['setDomain', (uc, id, u, t) => uc.setDomain(id, u, 'myshop', t)],
  ];

  for (const [name, call] of callers) {
    it(`${name}: throws SITE_NOT_FOUND when the site is missing`, async () => {
      const repo = new FakeUserSiteRepo([]);
      const uc = new SiteWriteUseCase(repo, new FakeSiteContentValidator());
      await expect(call(uc, 'missing', 'user-1', 'whatever')).rejects.toMatchObject({ code: 'SITE_NOT_FOUND' });
    });

    it(`${name}: throws SITE_ACCESS_DENIED for a non-owner`, async () => {
      const { uc, token } = setup();
      await expect(call(uc, 'site-1', 'user-2', token)).rejects.toMatchObject({ code: 'SITE_ACCESS_DENIED' });
    });
  }
});

// --- Version guard matrix ----------------------------------------------------
//
// The owner succeeds with a fresh token and is rejected with STALE_VERSION when
// the token no longer matches the stored row.
describe('SiteWriteUseCase — version guard', () => {
  it('saveContent: fresh token succeeds, stale token throws STALE_VERSION', async () => {
    const { uc, token } = setup();
    await uc.saveContent('site-1', 'user-1', makeContent(), token);
    // The first write advanced the version; reusing the original token is stale.
    await expect(uc.saveContent('site-1', 'user-1', makeContent(), token))
      .rejects.toMatchObject({ code: 'STALE_VERSION' });
  });

  it('rename: fresh token applies the new name', async () => {
    const { uc, token } = setup();
    const result = await uc.rename('site-1', 'user-1', 'Renamed', token);
    expect(result.siteName).toBe('Renamed');
  });

  it('rename: stale token throws STALE_VERSION', async () => {
    const { uc, token } = setup();
    await uc.rename('site-1', 'user-1', 'Once', token);
    await expect(uc.rename('site-1', 'user-1', 'Twice', token))
      .rejects.toMatchObject({ code: 'STALE_VERSION' });
  });

  it('publish: fresh token sets status active + publishedAt', async () => {
    const before = Date.now();
    const { uc, token } = setup({ status: 'draft' });
    const result = await uc.publish('site-1', 'user-1', token);
    expect(result.status).toBe('active');
    expect(result.publishedAt).not.toBeNull();
    expect(new Date(result.publishedAt!).getTime()).toBeGreaterThanOrEqual(before);
  });

  it('publish: stale token throws STALE_VERSION', async () => {
    const { uc, token } = setup({ status: 'draft' });
    await uc.publish('site-1', 'user-1', token);
    await expect(uc.publish('site-1', 'user-1', token))
      .rejects.toMatchObject({ code: 'STALE_VERSION' });
  });

  it('unpublish: fresh token sets status draft; stale token throws', async () => {
    const { uc, token } = setup({ status: 'active' });
    const result = await uc.unpublish('site-1', 'user-1', token);
    expect(result.status).toBe('draft');
    await expect(uc.unpublish('site-1', 'user-1', token))
      .rejects.toMatchObject({ code: 'STALE_VERSION' });
  });

  it('setDomain: stale token throws STALE_VERSION', async () => {
    const { uc, token } = setup({ domain: null });
    await uc.setDomain('site-1', 'user-1', 'first-shop', token);
    await expect(uc.setDomain('site-1', 'user-1', 'second-shop', token))
      .rejects.toMatchObject({ code: 'STALE_VERSION' });
  });
});

// --- saveContent validation gate (#56) ------------------------------------------
describe('SiteWriteUseCase.saveContent — validation gate', () => {
  it('rejects with INVALID_TEMPLATE_JSON and attaches the issues', async () => {
    const issues = [{ code: 'INVALID_COLOR_FIELD', message: 'not hex', path: 'sections[0].fields.accent' }];
    const { uc, token } = setup({}, issues as never);
    await expect(uc.saveContent('site-1', 'user-1', makeContent(), token))
      .rejects.toMatchObject({ code: 'INVALID_TEMPLATE_JSON', issues });
  });

  it('preserves array fields when valid', async () => {
    const json = makeContent({
      sections: [
        {
          id: 'section-1',
          type: 'menu',
          visible: true,
          nav: { visible: false, label: 'Menu' },
          fields: {
            items: {
              type: 'array',
              label: 'Items',
              items: [{ title: { type: 'text', label: 'Title', value: 'Item 1' } }],
            },
          },
        },
      ],
    });
    const { uc, token } = setup();
    const result = await uc.saveContent('site-1', 'user-1', json, token);
    const items = asSingle(result.content).sections[0].fields.items as ArrayField;
    expect(items.type).toBe('array');
    expect(items.items).toHaveLength(1);
  });
});

// --- setDomain validation ----------------------------------------------------
describe('SiteWriteUseCase.setDomain — validation', () => {
  it('throws INVALID_DOMAIN for a reserved slug', async () => {
    const { uc, token } = setup();
    await expect(uc.setDomain('site-1', 'user-1', 'admin', token))
      .rejects.toMatchObject({ code: 'INVALID_DOMAIN' });
  });

  it('throws INVALID_DOMAIN for a slug that is too short', async () => {
    const { uc, token } = setup();
    await expect(uc.setDomain('site-1', 'user-1', 'ab', token))
      .rejects.toMatchObject({ code: 'INVALID_DOMAIN' });
  });

  it('throws DOMAIN_TAKEN when the slug belongs to another site', async () => {
    const site1 = makeSite({ id: 'site-1', userId: 'user-1', domain: null });
    const site2 = makeSite({ id: 'site-2', userId: 'user-2', domain: 'taken-shop' });
    const repo = new FakeUserSiteRepo([site1, site2]);
    const uc = new SiteWriteUseCase(repo, new FakeSiteContentValidator());
    await expect(uc.setDomain('site-1', 'user-1', 'taken-shop', site1.updatedAt))
      .rejects.toMatchObject({ code: 'DOMAIN_TAKEN' });
  });

  it('lowercases and trims the slug before saving', async () => {
    const { uc, token } = setup({ domain: null });
    const result = await uc.setDomain('site-1', 'user-1', '  My-New-Shop  ', token);
    expect(result.domain).toBe('my-new-shop');
  });

  it('allows a site to reclaim its own current domain', async () => {
    const { uc, token } = setup({ domain: 'myshop' });
    const result = await uc.setDomain('site-1', 'user-1', 'myshop', token);
    expect(result.domain).toBe('myshop');
  });
});
