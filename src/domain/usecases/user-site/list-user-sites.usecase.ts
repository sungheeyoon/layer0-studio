import { IUserSiteRepository } from '../../repositories/user-site.repository';

export class ListUserSitesUseCase {
  constructor(private userSiteRepository: IUserSiteRepository) {}

  async execute(userId: string) {
    return this.userSiteRepository.findByUserId(userId);
  }

  async executeAll() {
    return this.userSiteRepository.findAll();
  }
}
