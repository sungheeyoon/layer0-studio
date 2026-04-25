import { IUserSiteRepository } from '../../repositories/user-site.repository';
import { TemplateError } from '../../errors/template.error';
import { validateDomainSlug } from '../../entities/user-site.entity';

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

    // domain slug validation
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

    return this.userSiteRepo.update(siteId, {
      domain: slug,
    });
  }
}
