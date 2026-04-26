import { IUserSiteRepository } from '../../repositories/user-site.repository';
import { TemplateJson } from '../../entities/template.entity';
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

    // Find the section and update the field
    let section;
    if (pageId) {
      const page = updatedJson.pages.find(p => p.id === pageId);
      section = page?.sections.find(s => s.id === sectionId);
    } else {
      // Search across all pages when pageId is not provided
      for (const page of updatedJson.pages) {
        section = page.sections.find(s => s.id === sectionId);
        if (section) break;
      }
    }

    if (!section) {
      throw new TemplateError('UNKNOWN');
    }

    if (!section.data[fieldKey]) {
      throw new TemplateError('UNKNOWN');
    }

    section.data[fieldKey].value = value;

    return this.userSiteRepository.updateSiteJson(siteId, updatedJson);
  }

  private validateJson(siteJson: TemplateJson) {
    if (!Array.isArray(siteJson.pages) || siteJson.pages.length === 0) {
      throw new TemplateError('INVALID_TEMPLATE_JSON');
    }

    if (!siteJson.globalStyles) {
      throw new TemplateError('INVALID_TEMPLATE_JSON');
    }
  }
}
