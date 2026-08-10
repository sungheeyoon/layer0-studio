import { ContentModel } from '../entities/template.entity';
import { UserSite, CreateUserSiteDto, UpdateUserSiteDto } from '../entities/user-site.entity';
import { AssetUsage } from '../usecases/ports/asset-usage-collector.port';

export interface IUserSiteRepository {
  findByUserId(userId: string): Promise<UserSite[]>;
  findById(id: string): Promise<UserSite | null>;
  findAll(): Promise<UserSite[]>;
  create(data: CreateUserSiteDto): Promise<UserSite>;
  /**
   * Version-guarded metadata write. `expectedUpdatedAt` is required so a silent
   * overwrite cannot be expressed by omitting it; pass `null` to *explicitly*
   * bypass the optimistic-concurrency check (admin force path).
   */
  update(id: string, data: UpdateUserSiteDto, expectedUpdatedAt: string | null): Promise<UserSite>;
  /**
   * Version-guarded content write. `usages` is passed in rather than derived
   * here: computing it requires knowing the Template library, and a repository
   * that imports the Template registry inverts the layering ADR-0008 fixes.
   * The caller (`SiteWriteUseCase`) already holds a library-aware collaborator.
   */
  updateContent(
    id: string,
    content: ContentModel,
    usages: AssetUsage[],
    expectedUpdatedAt: string,
  ): Promise<UserSite>;
  delete(id: string): Promise<void>;
  findByDomain(domain: string): Promise<UserSite | null>;
  findByUserIdAndName(userId: string, name: string): Promise<UserSite | null>;
}
