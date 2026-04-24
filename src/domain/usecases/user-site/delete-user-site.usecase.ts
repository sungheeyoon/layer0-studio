import { IUserSiteRepository } from '../../repositories/user-site.repository';
import { TemplateError } from '../../errors/template.error';

export class DeleteUserSiteUseCase {
  constructor(private userSiteRepository: IUserSiteRepository) {}

  /**
   * Delete a site owned by the user
   */
  async execute(id: string, userId: string) {
    const existing = await this.userSiteRepository.findById(id);
    if (!existing) {
      throw new TemplateError('SITE_NOT_FOUND');
    }

    if (existing.userId !== userId) {
      throw new TemplateError('SITE_ACCESS_DENIED');
    }

    await this.userSiteRepository.delete(id);
  }

  /**
   * Admin forces deletion of a site (bypassing ownership check)
   */
  async executeAsAdmin(id: string) {
    const existing = await this.userSiteRepository.findById(id);
    if (!existing) {
      throw new TemplateError('SITE_NOT_FOUND');
    }
    await this.userSiteRepository.delete(id);
  }
}
