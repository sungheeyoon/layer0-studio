import { IUserSiteRepository } from '../../repositories/user-site.repository';
import { TemplateError } from '../../errors/template.error';

export class DeleteUserSiteUseCase {
  constructor(private userSiteRepository: IUserSiteRepository) {}

  /**
   * 유저 본인이 자신의 사이트를 삭제
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
   * 관리자가 강제로 사이트를 삭제 (소유권 체크 우회)
   */
  async executeAsAdmin(id: string) {
    const existing = await this.userSiteRepository.findById(id);
    if (!existing) {
      throw new TemplateError('SITE_NOT_FOUND');
    }
    await this.userSiteRepository.delete(id);
  }
}
