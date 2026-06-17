import { IUserSiteRepository } from '../../repositories/user-site.repository';
import { TemplateJson, allSections } from '../../entities/template.entity';
import { TemplateError } from '../../errors/template.error';
import { SiteContentValidator } from '../ports/site-content-validator.port';

export class UpdateSiteJsonUseCase {
  constructor(
    private userSiteRepository: IUserSiteRepository,
    private validator: SiteContentValidator,
  ) {}

  /**
   * Replace the site's JSON (Ownership check required)
   */
  async execute(siteId: string, siteJson: TemplateJson, userId: string, expectedUpdatedAt?: string) {
    const existing = await this.userSiteRepository.findById(siteId);
    if (!existing) {
      throw new TemplateError('SITE_NOT_FOUND');
    }
    if (existing.userId !== userId) {
      throw new TemplateError('SITE_ACCESS_DENIED');
    }

    // Validate content against the Template library (single source of truth)
    await this.validate(siteJson);

    return this.userSiteRepository.updateSiteJson(siteId, siteJson, expectedUpdatedAt);
  }

  /**
   * Replace the site's JSON by an Admin (Bypassing ownership check)
   */
  async executeAsAdmin(siteId: string, siteJson: TemplateJson) {
    const existing = await this.userSiteRepository.findById(siteId);
    if (!existing) {
      throw new TemplateError('SITE_NOT_FOUND');
    }

    // Validate content against the Template library (single source of truth)
    await this.validate(siteJson);

    return this.userSiteRepository.updateSiteJson(siteId, siteJson);
  }

  /**
   * Update an individual field in an individual section
   */
  async executeFieldUpdate(
    siteId: string,
    sectionId: string,
    fieldKey: string,
    value: string,
    userId: string,
    pageId?: string,
  ) {
    const site = await this.userSiteRepository.findById(siteId);
    if (!site) {
      throw new TemplateError('SITE_NOT_FOUND');
    }

    if (site.userId !== userId) {
      throw new TemplateError('SITE_ACCESS_DENIED');
    }

    // Deep copy current JSON
    const updatedJson: TemplateJson = structuredClone(site.siteJson);

    // Find the section by id. Section ids are unique across the whole template
    // (Single: sections[]; Multi: shared + every page) so a flat lookup is safe.
    // pageId remains a (Multi-only) hint and is not required for the lookup.
    void pageId;
    const section = allSections(updatedJson).find(s => s.id === sectionId);

    if (!section) {
      throw new TemplateError('UNKNOWN');
    }

    if (!section.data[fieldKey]) {
      throw new TemplateError('UNKNOWN');
    }

    const field = section.data[fieldKey];
    if (field.type === 'array') {
      // For now, we don't support partial array updates via this method
      throw new TemplateError('UNSUPPORTED_FIELD_TYPE');
    }

    field.value = value;

    // Validate the resulting content too — the partial path must not be able to
    // introduce invalid data (e.g. a non-hex color field value).
    await this.validate(updatedJson);

    return this.userSiteRepository.updateSiteJson(siteId, updatedJson);
  }

  /**
   * Run the library-aware validator and reject the save if there are any blocking
   * errors. Warnings do not block (matches the Sync pipeline). The structured
   * issues ride along on the error for server-side logging.
   */
  private async validate(siteJson: TemplateJson) {
    const { errors } = await this.validator.validate(siteJson);
    if (errors.length > 0) {
      throw new TemplateError('INVALID_TEMPLATE_JSON', errors);
    }
  }
}
