import { IUserSiteRepository } from '../../repositories/user-site.repository';
import { TemplateError } from '../../errors/template.error';

export class PublishSiteUseCase {
  constructor(private userSiteRepo: IUserSiteRepository) {}

  async execute(siteId: string, userId: string) {
    const site = await this.userSiteRepo.findById(siteId);

    if (!site) {
      throw new TemplateError('SITE_NOT_FOUND');
    }

    if (site.userId !== userId) {
      throw new TemplateError('SITE_ACCESS_DENIED');
    }

    return this.userSiteRepo.update(siteId, {
      status: 'active',
      publishedAt: new Date().toISOString(),
    });
  }
}
