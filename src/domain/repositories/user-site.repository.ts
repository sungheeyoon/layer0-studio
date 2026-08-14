import { ContentModel } from '../entities/template.entity';
import {
  UserSite,
  PublishedSite,
  SiteSummary,
  CreateUserSiteDto,
  UpdateUserSiteDto,
} from '../entities/user-site.entity';
import { AssetUsage } from '../usecases/ports/asset-usage-collector.port';

export interface IUserSiteRepository {
  /** List read model — no ContentModel. See `SiteSummary`. */
  findByUserId(userId: string): Promise<SiteSummary[]>;
  findById(id: string): Promise<UserSite | null>;
  /** Admin list, same read model as `findByUserId`. */
  findAll(): Promise<SiteSummary[]>;
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
  /**
   * Version-guarded promotion of the working copy to the public copy. Atomic by
   * necessity: the content copy and the swap of published asset references have
   * to land together, or a visitor can catch the new JSON pointing at binaries
   * the cleanup queue has already claimed (migration 029).
   */
  publishContent(id: string, expectedUpdatedAt: string): Promise<UserSite>;
  delete(id: string): Promise<void>;
  /** Owner-scoped lookup — carries the draft. Used for domain-uniqueness checks. */
  findByDomain(domain: string): Promise<UserSite | null>;
  /** Public read path. Reads the `published_sites` view, which has no draft column. */
  findPublishedByDomain(domain: string): Promise<PublishedSite | null>;
  findByUserIdAndName(userId: string, name: string): Promise<UserSite | null>;
}
