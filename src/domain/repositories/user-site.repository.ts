import { TemplateJson } from '../entities/template.entity';
import { UserSite, CreateUserSiteDto, UpdateUserSiteDto } from '../entities/user-site.entity';

export interface IUserSiteRepository {
  findByUserId(userId: string): Promise<UserSite[]>;
  findById(id: string): Promise<UserSite | null>;
  findAll(): Promise<UserSite[]>;
  create(data: CreateUserSiteDto): Promise<UserSite>;
  update(id: string, data: UpdateUserSiteDto): Promise<UserSite>;
  updateSiteJson(id: string, siteJson: TemplateJson): Promise<UserSite>;
  delete(id: string): Promise<void>;
  findByDomain(domain: string): Promise<UserSite | null>;
  findByUserIdAndName(userId: string, name: string): Promise<UserSite | null>;
}
