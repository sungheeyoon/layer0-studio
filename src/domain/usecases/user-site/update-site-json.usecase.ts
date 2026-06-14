import { IUserSiteRepository } from '../../repositories/user-site.repository';
import { TemplateJson, allSections } from '../../entities/template.entity';
import { TemplateError } from '../../errors/template.error';

export class UpdateSiteJsonUseCase {
  constructor(private userSiteRepository: IUserSiteRepository) {}

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

    // Validate JSON structure
    this.validateJson(siteJson);

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

    // Validate JSON structure
    this.validateJson(siteJson);

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

    return this.userSiteRepository.updateSiteJson(siteId, updatedJson);
  }

  private validateJson(siteJson: TemplateJson) {
    if (siteJson.mode === 'single') {
      if (!Array.isArray(siteJson.sections) || siteJson.sections.length === 0) {
        throw new TemplateError('INVALID_TEMPLATE_JSON');
      }
    } else if (siteJson.mode === 'multi') {
      if (!Array.isArray(siteJson.pages) || siteJson.pages.length === 0) {
        throw new TemplateError('INVALID_TEMPLATE_JSON');
      }
    } else {
      throw new TemplateError('INVALID_TEMPLATE_JSON');
    }

    if (!siteJson.globalStyles) {
      throw new TemplateError('INVALID_TEMPLATE_JSON');
    }
  }
}
