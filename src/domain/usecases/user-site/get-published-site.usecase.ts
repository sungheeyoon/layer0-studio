import { IUserSiteRepository } from '../../repositories/user-site.repository';
import { TemplateError } from '../../errors/template.error';

export class GetPublishedSiteUseCase {
  constructor(private userSiteRepository: IUserSiteRepository) {}

  async execute(domain: string) {
    const site = await this.userSiteRepository.findByDomain(domain);

    if (!site) {
      throw new TemplateError('SITE_NOT_FOUND');
    }

    if (site.status !== 'active') {
      throw new TemplateError('SITE_NOT_FOUND');
    }

    return site;
  }
}
