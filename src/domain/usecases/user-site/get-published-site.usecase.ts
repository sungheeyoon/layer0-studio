import { IUserSiteRepository } from '../../repositories/user-site.repository';
import { TemplateError } from '../../errors/template.error';

export class GetPublishedSiteUseCase {
  constructor(private userSiteRepository: IUserSiteRepository) {}

  /**
   * The `published_sites` view already filters to `status = 'active'` with a
   * domain and a published copy, so the status re-check that used to live here
   * is gone — not relaxed, moved into the query the public read is allowed to
   * make (migration 029). The returned PublishedSite has no draft to leak.
   */
  async execute(domain: string) {
    const site = await this.userSiteRepository.findPublishedByDomain(domain);

    if (!site) {
      throw new TemplateError('SITE_NOT_FOUND');
    }

    return site;
  }
}
