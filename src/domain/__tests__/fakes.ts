import { IUserSiteRepository } from '../repositories/user-site.repository';
import { UserSite, CreateUserSiteDto, UpdateUserSiteDto } from '../entities/user-site.entity';
import { ContentModel, SingleContent } from '../entities/template.entity';
import { TemplateError } from '../errors/template.error';
import {
  SiteContentValidator,
  SiteContentValidationIssue,
} from '../usecases/ports/site-content-validator.port';

export function makeContent(overrides: Partial<SingleContent> = {}): ContentModel {
  return {
    mode: 'single',
    templateKey: 'corporate',
    globalStyles: {
      primaryColor: '#000',
      secondaryColor: '#fff',
      fontFamily: 'sans-serif',
      fontSize: '16px',
      layout: 'default',
    },
    sections: [
      {
        id: 'section-1',
        type: 'hero',
        visible: true,
        nav: { visible: false, label: 'Hero' },
        fields: {
          title: { type: 'text', label: 'Title', value: 'Hello', editable: true },
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

export class FakeUserSiteRepo implements IUserSiteRepository {
  sites: UserSite[];

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

  async updateContent(id: string, content: ContentModel, expectedUpdatedAt: string): Promise<UserSite> {
    const idx = this.guardVersion(id, expectedUpdatedAt);
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
