import { IUserSiteRepository } from '../../repositories/user-site.repository';
import { ContentModel } from '../../entities/template.entity';
import { UserSite, draftBaseline, validateDomainSlug } from '../../entities/user-site.entity';
import { TemplateError } from '../../errors/template.error';
import { SiteContentValidator } from '../ports/site-content-validator.port';
import { AssetUsageCollector } from '../ports/asset-usage-collector.port';

/**
 * The single guarded door for owner-initiated Site mutations (#58).
 *
 * Every method:
 *   1. loads the Site and enforces ownership (loadOwned),
 *   2. performs a version-guarded write — `expectedUpdatedAt` is *required*, so a
 *      silent overwrite cannot be expressed by omitting it (ADR-0004 hardened
 *      from a convention into a structural invariant).
 *
 * The repository writes (`update` / `updateContent`) throw STALE_VERSION when the
 * token no longer matches the stored row. Admin (ownership-bypass) writes live in
 * AdminUpdateSiteUseCase; create/delete are not version-guarded mutations and stay
 * in their own use cases.
 */
export class SiteWriteUseCase {
  constructor(
    private userSiteRepo: IUserSiteRepository,
    private validator: SiteContentValidator,
    private assetUsageCollector: AssetUsageCollector,
  ) {}

  /** Load a Site and assert the caller owns it. Single source of the ownership check. */
  private async loadOwned(siteId: string, userId: string): Promise<UserSite> {
    const site = await this.userSiteRepo.findById(siteId);
    if (!site) {
      throw new TemplateError('SITE_NOT_FOUND');
    }
    if (site.userId !== userId) {
      throw new TemplateError('SITE_ACCESS_DENIED');
    }
    return site;
  }

  /**
   * Replace the Site's content.
   *
   * Asset usages are collected *here*, next to validation, rather than inside
   * the repository. Both answers come from reading the content against its
   * Template library, and only this layer is allowed to know the library exists
   * (ADR-0008); a repository that loaded it would put the Template registry on
   * every read path that happens to share the module. See ADR-0016 §5.
   */
  async saveContent(
    siteId: string,
    userId: string,
    content: ContentModel,
    expectedUpdatedAt: string,
  ): Promise<UserSite> {
    await this.loadOwned(siteId, userId);
    await this.validate(content);
    const usages = await this.assetUsageCollector.collect(content);
    return this.userSiteRepo.updateContent(siteId, content, usages, expectedUpdatedAt);
  }

  /** Rename the Site. */
  async rename(
    siteId: string,
    userId: string,
    siteName: string,
    expectedUpdatedAt: string,
  ): Promise<UserSite> {
    await this.loadOwned(siteId, userId);
    return this.userSiteRepo.update(siteId, { siteName }, expectedUpdatedAt);
  }

  /**
   * Publish: copy the working content to the public copy (status → active).
   *
   * Before migration 029 this only flipped `status`, which meant the *first*
   * publish was the only one that did anything — after it, every save was
   * already live. Promotion is now the whole operation, and it is the only
   * write that touches `publishedContent`.
   */
  async publish(
    siteId: string,
    userId: string,
    expectedUpdatedAt: string,
  ): Promise<UserSite> {
    await this.loadOwned(siteId, userId);
    return this.userSiteRepo.publishContent(siteId, expectedUpdatedAt);
  }

  /**
   * Throw the saved-but-unpublished draft away and reset the working copy to
   * what visitors currently see (or to the Template preset, for a Site that has
   * never been published).
   *
   * Deliberately routed through the normal content write rather than a bespoke
   * RPC: the restored content still has to be validated and still has to
   * re-derive asset usages, and duplicating that would be a second way to write
   * content — the exact thing ADR-0015 §1 says not to build.
   */
  async discardDraft(
    siteId: string,
    userId: string,
    expectedUpdatedAt: string,
  ): Promise<UserSite> {
    const site = await this.loadOwned(siteId, userId);
    const baseline = draftBaseline(site);
    await this.validate(baseline);
    const usages = await this.assetUsageCollector.collect(baseline);
    return this.userSiteRepo.updateContent(siteId, baseline, usages, expectedUpdatedAt);
  }

  /** Unpublish the Site (status → draft). */
  async unpublish(
    siteId: string,
    userId: string,
    expectedUpdatedAt: string,
  ): Promise<UserSite> {
    await this.loadOwned(siteId, userId);
    return this.userSiteRepo.update(siteId, { status: 'draft' }, expectedUpdatedAt);
  }

  /** Assign the Site's public path slug (validated + unique). */
  async setDomain(
    siteId: string,
    userId: string,
    domain: string,
    expectedUpdatedAt: string,
  ): Promise<UserSite> {
    await this.loadOwned(siteId, userId);

    let slug: string;
    try {
      slug = validateDomainSlug(domain);
    } catch {
      throw new TemplateError('INVALID_DOMAIN');
    }

    const existing = await this.userSiteRepo.findByDomain(slug);
    if (existing && existing.id !== siteId) {
      throw new TemplateError('DOMAIN_TAKEN');
    }

    return this.userSiteRepo.update(siteId, { domain: slug }, expectedUpdatedAt);
  }

  /**
   * Run the library-aware validator and reject the save if there are any blocking
   * errors. Warnings do not block (matches the Sync pipeline). The structured
   * issues ride along on the error for server-side logging.
   */
  private async validate(content: ContentModel) {
    const { errors } = await this.validator.validate(content);
    if (errors.length > 0) {
      throw new TemplateError('INVALID_TEMPLATE_JSON', errors);
    }
  }
}
