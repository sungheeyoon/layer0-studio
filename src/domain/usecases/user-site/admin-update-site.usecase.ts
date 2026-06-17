import { IUserSiteRepository } from '../../repositories/user-site.repository';
import { TemplateError } from '../../errors/template.error';
import { UpdateUserSiteDto, validateDomainSlug } from '../../entities/user-site.entity';

export class AdminUpdateSiteUseCase {
  constructor(private userSiteRepo: IUserSiteRepository) {}

  async updateStatus(siteId: string, status: 'draft' | 'active' | 'suspended') {
    const site = await this.userSiteRepo.findById(siteId);
    if (!site) throw new TemplateError('SITE_NOT_FOUND');

    const updateData: UpdateUserSiteDto = { status };
    if (status === 'active') {
      updateData.publishedAt = new Date().toISOString();
    }

    // Admin is a deliberate ownership-bypass tool — force the write past the
    // optimistic-concurrency guard (null = explicit bypass).
    return this.userSiteRepo.update(siteId, updateData, null);
  }

  async updateDomain(siteId: string, domain: string) {
    const site = await this.userSiteRepo.findById(siteId);
    if (!site) throw new TemplateError('SITE_NOT_FOUND');

    let slug: string;
    try {
      slug = validateDomainSlug(domain);
    } catch {
      throw new TemplateError('INVALID_DOMAIN');
    }

    // Check uniqueness
    const existing = await this.userSiteRepo.findByDomain(slug);
    if (existing && existing.id !== siteId) {
      throw new TemplateError('DOMAIN_TAKEN');
    }

    return this.userSiteRepo.update(siteId, { domain: slug }, null);
  }
}
