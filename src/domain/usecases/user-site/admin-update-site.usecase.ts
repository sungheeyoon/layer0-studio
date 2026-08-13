import { IUserSiteRepository } from '../../repositories/user-site.repository';
import { TemplateError } from '../../errors/template.error';
import { UpdateUserSiteDto, validateDomainSlug } from '../../entities/user-site.entity';

export class AdminUpdateSiteUseCase {
  constructor(private userSiteRepo: IUserSiteRepository) {}

  /**
   * Move a Site between draft / active / suspended.
   *
   * Since migration 029 this is a **moderation** control, not a publish button.
   * What visitors see lives in `published_content`, and only the owner's
   * `publish_site_content` writes it; flipping `status` decides whether that
   * copy is served at all. So:
   *
   * - `active` with a published copy → restore. Serving resumes immediately.
   * - `active` with no published copy → refused. Before 029 this "worked"
   *   because the public renderer read the draft, so activating a Site
   *   published it as a side effect. Reinstating that would mean admin
   *   publishing someone else's unfinished draft on their behalf — an
   *   authoring power the role never deliberately had, and one that ADR-0006's
   *   split (admin ≠ publish rights) argues against. Without the refusal the
   *   Site reads `active` in the admin view and 404s on its public URL.
   * - `suspended` / `draft` → takedown. The published copy is kept, so a
   *   restore does not need the owner to publish again.
   */
  async updateStatus(siteId: string, status: 'draft' | 'active' | 'suspended') {
    const site = await this.userSiteRepo.findById(siteId);
    if (!site) throw new TemplateError('SITE_NOT_FOUND');

    if (status === 'active' && site.publishedContent === null) {
      throw new TemplateError('NO_PUBLISHED_CONTENT');
    }

    // `publishedAt` is left alone. Restoring a Site does not republish it —
    // the content going back up is the same content that went up originally,
    // and overwriting the timestamp would misdate it.
    const updateData: UpdateUserSiteDto = { status };

    // Admin is a deliberate ownership-bypass tool — force the write past the
    // optimistic-concurrency guard (null = explicit bypass).
    return this.userSiteRepo.update(siteId, updateData, null);
  }

  async updateDomain(siteId: string, domain: string) {
    const site = await this.userSiteRepo.findById(siteId);
    if (!site) throw new TemplateError('SITE_NOT_FOUND');

    let slug: string;
    try {
      slug = validateDomainSlug(domain);
    } catch {
      throw new TemplateError('INVALID_DOMAIN');
    }

    // Check uniqueness
    const existing = await this.userSiteRepo.findByDomain(slug);
    if (existing && existing.id !== siteId) {
      throw new TemplateError('DOMAIN_TAKEN');
    }

    return this.userSiteRepo.update(siteId, { domain: slug }, null);
  }
}
