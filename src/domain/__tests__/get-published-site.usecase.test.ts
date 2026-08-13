import { describe, it, expect } from 'vitest';
import { GetPublishedSiteUseCase } from '../usecases/user-site/get-published-site.usecase';
import { SiteWriteUseCase } from '../usecases/user-site/site-write.usecase';
import {
  FakeUserSiteRepo,
  FakeSiteContentValidator,
  FakeAssetUsageCollector,
  makeSite,
  makeContent,
} from './fakes';
import { ContentModel, SingleContent } from '../entities/template.entity';

const asSingle = (json: ContentModel) => json as SingleContent;

function setup() {
  const site = makeSite({ id: 'site-1', userId: 'user-1', domain: 'onyu', status: 'draft' });
  const repo = new FakeUserSiteRepo([site]);
  const write = new SiteWriteUseCase(
    repo,
    new FakeSiteContentValidator(),
    new FakeAssetUsageCollector(),
  );
  return { repo, write, read: new GetPublishedSiteUseCase(repo), token: site.updatedAt };
}

const edited = (key: string): ContentModel => {
  const json = asSingle(makeContent());
  json.templateKey = key;
  return json;
};

describe('GetPublishedSiteUseCase', () => {
  it('404s a Site that has never been published, even with a domain', async () => {
    const { read } = setup();
    await expect(read.execute('onyu')).rejects.toMatchObject({ code: 'SITE_NOT_FOUND' });
  });

  // The regression this whole change exists for: before the split, "publish"
  // only flipped a status flag, so every later save was live the moment it hit
  // the row. A visitor could read half-finished copy the owner never published.
  it('keeps serving the published copy after the owner saves a newer draft', async () => {
    const { read, write, repo, token } = setup();
    await write.saveContent('site-1', 'user-1', edited('published-version'), token);
    await write.publish('site-1', 'user-1', repo.sites[0].updatedAt);

    await write.saveContent('site-1', 'user-1', edited('draft-version'), repo.sites[0].updatedAt);

    const served = await read.execute('onyu');
    expect(asSingle(served.content).templateKey).toBe('published-version');
  });

  it('serves the newer copy once the owner publishes again', async () => {
    const { read, write, repo, token } = setup();
    await write.saveContent('site-1', 'user-1', edited('published-version'), token);
    await write.publish('site-1', 'user-1', repo.sites[0].updatedAt);
    await write.saveContent('site-1', 'user-1', edited('draft-version'), repo.sites[0].updatedAt);

    await write.publish('site-1', 'user-1', repo.sites[0].updatedAt);

    const served = await read.execute('onyu');
    expect(asSingle(served.content).templateKey).toBe('draft-version');
  });

  it('stops serving a Site that was unpublished', async () => {
    const { read, write, repo, token } = setup();
    await write.publish('site-1', 'user-1', token);
    await write.unpublish('site-1', 'user-1', repo.sites[0].updatedAt);

    await expect(read.execute('onyu')).rejects.toMatchObject({ code: 'SITE_NOT_FOUND' });
  });
});
