import { IUserSiteRepository } from '../../repositories/user-site.repository';
import { TemplateError } from '../../errors/template.error';

export class GetUserSiteUseCase {
  constructor(private userSiteRepository: IUserSiteRepository) {}

  async execute(id: string) {
    const site = await this.userSiteRepository.findById(id);

    if (!site) {
      throw new TemplateError('SITE_NOT_FOUND');
    }

    return site;
  }
}
