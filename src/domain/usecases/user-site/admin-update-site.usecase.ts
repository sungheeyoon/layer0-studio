import { IUserSiteRepository } from '../../repositories/user-site.repository';
import { TemplateError } from '../../errors/template.error';
import { UpdateUserSiteDto } from '../../entities/user-site.entity';

export class AdminUpdateSiteUseCase {
  constructor(private userSiteRepo: IUserSiteRepository) {}

  async updateStatus(siteId: string, status: 'draft' | 'active' | 'suspended') {
    const site = await this.userSiteRepo.findById(siteId);
    if (!site) throw new TemplateError('SITE_NOT_FOUND');

    const updateData: UpdateUserSiteDto = { status };
    if (status === 'active') {
      updateData.publishedAt = new Date().toISOString();
    }

    return this.userSiteRepo.update(siteId, updateData);
  }

  async updateDomain(siteId: string, domain: string) {
    const site = await this.userSiteRepo.findById(siteId);
    if (!site) throw new TemplateError('SITE_NOT_FOUND');

    return this.userSiteRepo.update(siteId, { domain });
  }
}
