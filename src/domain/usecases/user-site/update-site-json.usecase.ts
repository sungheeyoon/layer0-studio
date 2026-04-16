import { IUserSiteRepository } from '../../repositories/user-site.repository';
import { TemplateJson } from '../../entities/template.entity';
import { TemplateError } from '../../errors/template.error';

export class UpdateSiteJsonUseCase {
  constructor(private userSiteRepository: IUserSiteRepository) {}

  /**
   * 유저 본인이 자신의 사이트 JSON 교체 (소유권 체크 필수)
   */
  async execute(siteId: string, siteJson: TemplateJson, userId: string) {
    const existing = await this.userSiteRepository.findById(siteId);
    if (!existing) {
      throw new TemplateError('SITE_NOT_FOUND');
    }
    if (existing.userId !== userId) {
      throw new TemplateError('SITE_ACCESS_DENIED');
    }

    // Validate JSON structure
    this.validateJson(siteJson);

    return this.userSiteRepository.updateSiteJson(siteId, siteJson);
  }

  /**
   * 관리자가 사이트 JSON 교체 (소유권 체크 우회)
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
   * 개별 section의 개별 필드만 업데이트
   */
  async executeFieldUpdate(
    siteId: string,
    sectionId: string,
    fieldKey: string,
    value: string,
    userId: string,
  ) {
    const site = await this.userSiteRepository.findById(siteId);
    if (!site) {
      throw new TemplateError('SITE_NOT_FOUND');
    }

    if (site.userId !== userId) {
      throw new TemplateError('SITE_ACCESS_DENIED');
    }

    // Deep copy current JSON
    const updatedJson: TemplateJson = JSON.parse(JSON.stringify(site.siteJson));

    // Find the section and update the field
    const section = updatedJson.sections.find((s) => s.id === sectionId);
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
    if (!siteJson.sections || !Array.isArray(siteJson.sections)) {
      throw new TemplateError('INVALID_TEMPLATE_JSON');
    }

    if (!siteJson.globalStyles) {
      throw new TemplateError('INVALID_TEMPLATE_JSON');
    }
  }
}
