import { IUserSiteRepository } from '../../repositories/user-site.repository';
import { TemplateError } from '../../errors/template.error';

export class UpdateSiteDomainUseCase {
  constructor(private userSiteRepo: IUserSiteRepository) {}

  async execute(siteId: string, domain: string, userId: string) {
    const site = await this.userSiteRepo.findById(siteId);

    if (!site) {
      throw new TemplateError('SITE_NOT_FOUND');
    }

    if (site.userId !== userId) {
      throw new TemplateError('SITE_ACCESS_DENIED');
    }

    // domain slug validation (can also be done in entity/usecase)
    const slug = domain.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 50);
    if (!slug) {
      throw new Error('INVALID_DOMAIN');
    }

    // Check uniqueness
    const existing = await this.userSiteRepo.findByDomain(slug);
    if (existing && existing.id !== siteId) {
      throw new Error('DOMAIN_TAKEN');
    }

    return this.userSiteRepo.update(siteId, {
      domain: slug,
    });
  }
}
