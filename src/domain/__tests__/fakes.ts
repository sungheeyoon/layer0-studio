import { IUserSiteRepository } from '../repositories/user-site.repository';
import { UserSite, CreateUserSiteDto, UpdateUserSiteDto } from '../entities/user-site.entity';
import { TemplateJson, SinglePageTemplate } from '../entities/template.entity';

export function makeTemplateJson(overrides: Partial<SinglePageTemplate> = {}): TemplateJson {
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
        data: {
          title: { type: 'text', label: 'Title', value: 'Hello', editable: true },
        },
      },
    ],
    ...overrides,
  };
}

export function makeSite(overrides: Partial<UserSite> = {}): UserSite {
  const json = makeTemplateJson();
  return {
    id: 'site-1',
    userId: 'user-1',
    templateId: 'tmpl-1',
    siteName: 'My Site',
    domain: null,
    status: 'draft',
    siteJson: json,
    templateSnapshot: json,
    publishedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
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

  async create(data: CreateUserSiteDto): Promise<UserSite> {
    const site: UserSite = {
      ...data,
      id: `new-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.sites.push(site);
    return site;
  }

  async update(id: string, data: UpdateUserSiteDto): Promise<UserSite> {
    const idx = this.sites.findIndex(s => s.id === id);
    this.sites[idx] = { ...this.sites[idx], ...data, updatedAt: new Date().toISOString() };
    return this.sites[idx];
  }

  async updateSiteJson(id: string, siteJson: TemplateJson): Promise<UserSite> {
    const idx = this.sites.findIndex(s => s.id === id);
    this.sites[idx] = { ...this.sites[idx], siteJson, updatedAt: new Date().toISOString() };
    return this.sites[idx];
  }

  async delete(id: string) {
    this.sites = this.sites.filter(s => s.id !== id);
  }
}
