import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';
import { FakeUserSiteRepo, makeContent } from './fakes';
import { UserSite } from '../entities/user-site.entity';

/**
 * The dashboard list must not receive a ContentModel.
 *
 * Three of them used to ride along in the RSC payload per site — `content`,
 * `publishedContent`, `snapshot` — and no list component read any of them. The
 * guarantee is split across two places, so this checks both: the read model's
 * shape (type level) and the query's column list (source level). A test that
 * only exercised the in-memory fake would pass while `select('*')` kept
 * shipping the columns in production.
 */

const site = (id: string): UserSite => ({
  id,
  userId: 'user-1',
  templateId: 'tpl-1',
  siteName: `site ${id}`,
  domain: null,
  status: 'draft',
  content: makeContent(),
  publishedContent: null,
  snapshot: makeContent(),
  publishedAt: null,
  createdAt: '2026-08-14T00:00:00.000Z',
  updatedAt: '2026-08-14T00:00:00.000Z',
});

describe('SiteSummary — the list read model carries no ContentModel', () => {
  it('drops all three content copies from a list read', async () => {
    const repo = new FakeUserSiteRepo([site('a'), site('b')]);

    const listed = await repo.findByUserId('user-1');

    expect(listed).toHaveLength(2);
    for (const summary of listed) {
      expect(Object.keys(summary).sort()).toEqual([
        'createdAt',
        'domain',
        'id',
        'publishedAt',
        'siteName',
        'status',
        'templateId',
        'updatedAt',
        'userId',
      ]);
    }
  });

  it('does not expose the copies to a caller that asks for them', async () => {
    const [summary] = await new FakeUserSiteRepo([site('a')]).findByUserId('user-1');

    // Type-level half of the guard: re-widening `SiteSummary` back to `UserSite`
    // makes these accesses legal, the suppressions unused, and `tsc` fail.
    // @ts-expect-error — a summary has no working copy
    expect(summary.content).toBeUndefined();
    // @ts-expect-error — a summary has no public copy
    expect(summary.publishedContent).toBeUndefined();
    // @ts-expect-error — a summary has no creation snapshot
    expect(summary.snapshot).toBeUndefined();
  });

  it('selects explicit columns for the list queries, never *', () => {
    const source = readFileSync(
      path.join(process.cwd(), 'src/data/repositories/supabase-user-site.repository.impl.ts'),
      'utf8',
    );

    for (const method of ['findByUserId', 'findAll']) {
      const body = source.slice(source.indexOf(`async ${method}(`));
      const query = body.slice(0, body.indexOf('if (error)'));
      expect(query, `${method} must not select('*')`).not.toContain(".select('*')");
      expect(query, `${method} must select the summary columns`).toContain('SUMMARY_COLUMNS');
    }
  });
});
