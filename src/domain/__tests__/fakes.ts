import { IUserSiteRepository } from '../repositories/user-site.repository';
import { UserSite, CreateUserSiteDto, UpdateUserSiteDto } from '../entities/user-site.entity';
import { ContentModel, SingleContent } from '../entities/template.entity';
import { TemplateError } from '../errors/template.error';
import {
  SiteContentValidator,
  SiteContentValidationIssue,
} from '../usecases/ports/site-content-validator.port';
import {
  AssetUsage,
  AssetUsageCollector,
} from '../usecases/ports/asset-usage-collector.port';
import { IAccountErasureRepository } from '../repositories/account-erasure.repository';

export function makeContent(overrides: Partial<SingleContent> = {}): ContentModel {
  return {
    mode: 'single',
    templateKey: 'corporate',
    globalStyles: {
      primaryColor: '#000',
      secondaryColor: '#fff',
      backgroundColor: '#ffffff',
      fontFamily: 'sans-serif',
      fontSize: '16px',
      layout: 'default',
    },
    blocks: [
      {
        id: 'section-1',
        type: 'hero',
        visible: true,
        fields: {
          // A Value, not a `{ type, label, value }` wrapper (ADR-0016 §4-2).
          title: 'Hello',
        },
      },
    ],
    ...overrides,
  };
}

export function makeSite(overrides: Partial<UserSite> = {}): UserSite {
  const json = makeContent();
  return {
    id: 'site-1',
    userId: 'user-1',
    templateId: 'tmpl-1',
    siteName: 'My Site',
    domain: null,
    status: 'draft',
    content: json,
    snapshot: json,
    publishedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Fake validator for use-case tests. Defaults to "always valid"; pass errors to
 * simulate the library-aware validator rejecting content. Records each json it
 * was asked to validate so tests can assert the partial-update path validates too.
 */
export class FakeSiteContentValidator implements SiteContentValidator {
  validated: ContentModel[] = [];

  constructor(private errors: SiteContentValidationIssue[] = []) {}

  async validate(json: ContentModel) {
    this.validated.push(json);
    return { errors: this.errors, warnings: [] };
  }
}

/**
 * Fake asset-usage collector. Returns whatever it is seeded with and records
 * each content it was asked about, so a test can assert that the write path
 * collects usages and hands them to the repository (rather than the repository
 * deriving them itself — the layering ADR-0008 restores).
 */
export class FakeAssetUsageCollector implements AssetUsageCollector {
  collected: ContentModel[] = [];

  constructor(private usages: AssetUsage[] = []) {}

  async collect(content: ContentModel): Promise<AssetUsage[]> {
    this.collected.push(content);
    return this.usages;
  }
}

export class FakeUserSiteRepo implements IUserSiteRepository {
  sites: UserSite[];
  /** Usages handed to the last `updateContent` call, for write-path assertions. */
  lastUsages: AssetUsage[] | null = null;

  constructor(initial: UserSite[] = []) {
    this.sites = [...initial];
  }

  async findById(id: string) {
    return this.sites.find(s => s.id === id) ?? null;
  }

  async findByUserId(userId: string) {
    return this.sites.filter(s => s.userId === userId);
  }

  async findAll() {
    return [...this.sites];
  }

  async findByDomain(domain: string) {
    return this.sites.find(s => s.domain === domain) ?? null;
  }

  async findByUserIdAndName(userId: string, name: string) {
    return this.sites.find(s => s.userId === userId && s.siteName === name) ?? null;
  }

  async create(dto: CreateUserSiteDto): Promise<UserSite> {
    const site: UserSite = {
      ...dto,
      id: `new-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.sites.push(site);
    return site;
  }

  async update(id: string, dto: UpdateUserSiteDto, expectedUpdatedAt: string | null): Promise<UserSite> {
    const idx = this.guardVersion(id, expectedUpdatedAt);
    this.sites[idx] = { ...this.sites[idx], ...dto, updatedAt: this.nextUpdatedAt() };
    return this.sites[idx];
  }

  async updateContent(
    id: string,
    content: ContentModel,
    usages: AssetUsage[],
    expectedUpdatedAt: string,
  ): Promise<UserSite> {
    const idx = this.guardVersion(id, expectedUpdatedAt);
    this.lastUsages = usages;
    this.sites[idx] = { ...this.sites[idx], content, updatedAt: this.nextUpdatedAt() };
    return this.sites[idx];
  }

  /**
   * Mirror the real repo's guarded write: a missing row throws SITE_NOT_FOUND;
   * a token that no longer matches throws STALE_VERSION. `null` is an explicit
   * force (no version check). Returns the matched index on success.
   */
  private guardVersion(id: string, expectedUpdatedAt: string | null): number {
    const idx = this.sites.findIndex(s => s.id === id);
    if (idx === -1) {
      throw new TemplateError('SITE_NOT_FOUND');
    }
    if (expectedUpdatedAt !== null && this.sites[idx].updatedAt !== expectedUpdatedAt) {
      throw new TemplateError('STALE_VERSION');
    }
    return idx;
  }

  /** Always advance the version so a reused token becomes stale on the next write. */
  private nextUpdatedAt() {
    return new Date(Date.now() + ++this.tick).toISOString();
  }

  private tick = 0;

  async delete(id: string) {
    this.sites = this.sites.filter(s => s.id !== id);
  }
}

/**
 * Fake account-erasure repo for DeleteAccountUseCase tests. Records the call
 * order (and the paths handed to drainStorage) so tests can assert the
 * storage-before-auth business rule without a real DB/storage backend.
 */
export class FakeAccountErasureRepository implements IAccountErasureRepository {
  calls: string[] = [];
  drainedPaths: string[] = [];
  tombstonePaths: string[];

  /** Name of a post-commit step to throw from, to test the durability boundary. */
  constructor(
    tombstonePaths: string[] = ['user-1/asset-1/photo.png'],
    private failStep?: 'markDeleted' | 'drainStorage' | 'deleteAuthUser',
  ) {
    this.tombstonePaths = tombstonePaths;
  }

  async requestErasure(_userId: string) {
    this.calls.push('requestErasure');
    return this.tombstonePaths;
  }

  async markDeleted(_userId: string) {
    this.calls.push('markDeleted');
    if (this.failStep === 'markDeleted') throw new Error('markDeleted failed');
  }

  async drainStorage(paths: string[]) {
    this.calls.push('drainStorage');
    this.drainedPaths = paths;
    if (this.failStep === 'drainStorage') throw new Error('drainStorage failed');
  }

  async deleteAuthUser(_userId: string) {
    this.calls.push('deleteAuthUser');
    if (this.failStep === 'deleteAuthUser') throw new Error('deleteAuthUser failed');
  }
}
