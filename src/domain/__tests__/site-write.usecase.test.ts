import { describe, it, expect } from 'vitest';
import { SiteWriteUseCase } from '../usecases/user-site/site-write.usecase';
import {
  FakeUserSiteRepo,
  FakeSiteContentValidator,
  FakeAssetUsageCollector,
  makeSite,
  makeContent,
} from './fakes';
import {
  ArrayItem,
  ContentModel,
  SingleContent,
} from '../entities/template.entity';
import { SiteContentValidationIssue } from '../usecases/ports/site-content-validator.port';
import { AssetUsage } from '../usecases/ports/asset-usage-collector.port';
import { UserSite } from '../entities/user-site.entity';

const asSingle = (json: ContentModel) => json as SingleContent;

/** Build a use case + repo around a single owned site, returning its fresh token. */
function setup(
  siteOverrides: Partial<UserSite> = {},
  validatorErrors: SiteContentValidationIssue[] = [],
  usages: AssetUsage[] = [],
) {
  const site = makeSite({ id: 'site-1', userId: 'user-1', ...siteOverrides });
  const repo = new FakeUserSiteRepo([site]);
  const collector = new FakeAssetUsageCollector(usages);
  const uc = new SiteWriteUseCase(repo, new FakeSiteContentValidator(validatorErrors), collector);
  return { uc, repo, collector, token: site.updatedAt };
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
      const uc = new SiteWriteUseCase(repo, new FakeSiteContentValidator(), new FakeAssetUsageCollector());
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
// --- Draft / published split (ADR-0017) --------------------------------------
//
// The behaviour these cover is the one the old model got wrong: a save used to
// be visible to the world the moment the Site was `active`.
describe('SiteWriteUseCase — draft and published copies', () => {
  const edited = (): ContentModel => {
    const json = asSingle(makeContent());
    json.templateKey = 'edited-key';
    return json;
  };

  it('saveContent leaves the published copy alone', async () => {
    const { uc, repo, token } = setup({ status: 'active' });
    await uc.publish('site-1', 'user-1', token);
    const published = repo.sites[0].publishedContent;
    const afterPublish = repo.sites[0].updatedAt;

    const saved = await uc.saveContent('site-1', 'user-1', edited(), afterPublish);

    expect(asSingle(saved.content).templateKey).toBe('edited-key');
    expect(saved.publishedContent).toEqual(published);
  });

  it('publish promotes the current draft to the published copy', async () => {
    const { uc, token } = setup({ status: 'draft' });
    const saved = await uc.saveContent('site-1', 'user-1', edited(), token);

    const result = await uc.publish('site-1', 'user-1', saved.updatedAt);

    expect(result.status).toBe('active');
    expect(result.publishedContent).toEqual(result.content);
    expect(asSingle(result.publishedContent!).templateKey).toBe('edited-key');
  });

  it('discardDraft restores the published copy and re-derives its usages', async () => {
    const usages: AssetUsage[] = [{ assetId: 'asset-1', slotKey: 'hero.image' }];
    const { uc, repo, collector, token } = setup({ status: 'active' }, [], usages);
    await uc.publish('site-1', 'user-1', token);
    const publishedCopy = repo.sites[0].publishedContent;
    const saved = await uc.saveContent('site-1', 'user-1', edited(), repo.sites[0].updatedAt);

    const result = await uc.discardDraft('site-1', 'user-1', saved.updatedAt);

    expect(result.content).toEqual(publishedCopy);
    // The restored content is validated and re-collected like any other write —
    // not written straight through as trusted.
    expect(collector.collected.at(-1)).toEqual(publishedCopy);
    expect(repo.lastUsages).toEqual(usages);
  });

  it('discardDraft falls back to the creation snapshot when never published', async () => {
    const { uc, repo, token } = setup({ status: 'draft' });
    const snapshot = repo.sites[0].snapshot;
    const saved = await uc.saveContent('site-1', 'user-1', edited(), token);

    const result = await uc.discardDraft('site-1', 'user-1', saved.updatedAt);

    expect(result.content).toEqual(snapshot);
  });

  it('discardDraft: stale token throws STALE_VERSION', async () => {
    const { uc, token } = setup({ status: 'draft' });
    await uc.saveContent('site-1', 'user-1', edited(), token);
    await expect(uc.discardDraft('site-1', 'user-1', token))
      .rejects.toMatchObject({ code: 'STALE_VERSION' });
  });
});

describe('SiteWriteUseCase.saveContent — validation gate', () => {
  it('rejects with INVALID_TEMPLATE_JSON and attaches the issues', async () => {
    const issues = [{ code: 'INVALID_COLOR_FIELD', message: 'not hex', path: 'sections[0].fields.accent' }];
    const { uc, token } = setup({}, issues as never);
    await expect(uc.saveContent('site-1', 'user-1', makeContent(), token))
      .rejects.toMatchObject({ code: 'INVALID_TEMPLATE_JSON', issues });
  });

  it('preserves array fields when valid', async () => {
    // An array Value: a plain array of `{ id, fields }` items (ADR-0016 §4-3).
    // The `id` is a sibling of `fields`, so nothing the use case does may fold
    // it in — it is the asset slot key and React's reconciliation key.
    const json = makeContent({
      blocks: [
        {
          id: 'section-1',
          type: 'menu',
          visible: true,
          fields: {
            items: [{ id: 'item-1', fields: { title: 'Item 1' } }],
          },
        },
      ],
    });
    const { uc, token } = setup();
    const result = await uc.saveContent('site-1', 'user-1', json, token);
    const items = asSingle(result.content).blocks[0].fields.items as Array<
      ArrayItem<{ title: { type: 'text'; label: string } }>
    >;
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({ id: 'item-1', fields: { title: 'Item 1' } });
  });
});

// --- saveContent asset-usage collection (#128 / ADR-0016 §5) -----------------
//
// Usage collection used to happen inside `SupabaseUserSiteRepositoryImpl`. It
// moved here because the schema-driven collector ADR-0016 §5 introduces needs
// the Template library, and a repository that loads the library inverts the
// layering ADR-0008 fixes. These tests pin the *order* and the *hand-off*, which
// is the whole content of the move.
describe('SiteWriteUseCase.saveContent — asset usages', () => {
  const usages = [
    { assetId: 'asset-a', slotKey: 'section-1.logo' },
    { assetId: 'asset-b', slotKey: 'section-1.items[item-1].image' },
  ];

  it('collects usages from the content being saved and hands them to the repository', async () => {
    const { uc, repo, collector, token } = setup({}, [], usages);
    const json = makeContent();

    await uc.saveContent('site-1', 'user-1', json, token);

    expect(collector.collected).toEqual([json]);
    // The repository does not derive these — it receives them. That is the
    // signature change #128 exists for.
    expect(repo.lastUsages).toEqual(usages);
  });

  it('does not collect usages for content the validator rejected', async () => {
    // Collection walks the whole content; running it for a save that is about to
    // be refused is wasted work, and after ADR-0016 §5 it would also load a
    // Template library for nothing.
    const issues = [{ code: 'UNKNOWN_COMPONENT_KEY', message: 'nope', path: 'sections[0]' }];
    const { uc, repo, collector, token } = setup({}, issues, usages);

    await expect(uc.saveContent('site-1', 'user-1', makeContent(), token))
      .rejects.toMatchObject({ code: 'INVALID_TEMPLATE_JSON' });

    expect(collector.collected).toEqual([]);
    expect(repo.lastUsages).toBeNull();
  });

  it('passes an empty list through rather than skipping the argument', async () => {
    // Content that references no assets still has to reach the RPC as `[]`: the
    // save diffs old against new usages, so "no usages" is what releases the
    // assets a Site has just stopped using (ADR-0003).
    const { uc, repo, token } = setup();
    await uc.saveContent('site-1', 'user-1', makeContent(), token);
    expect(repo.lastUsages).toEqual([]);
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
    const uc = new SiteWriteUseCase(repo, new FakeSiteContentValidator(), new FakeAssetUsageCollector());
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
