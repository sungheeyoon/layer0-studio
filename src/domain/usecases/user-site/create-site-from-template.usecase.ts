import { ITemplateRepository } from '../../repositories/template.repository';
import { IUserSiteRepository } from '../../repositories/user-site.repository';
import { TemplateJson } from '../../entities/template.entity';
import { TemplateError } from '../../errors/template.error';

interface CreateSiteFromTemplateInput {
  userId: string;
  templateId: string;
  siteName: string;
}

interface CreateCustomSiteInput {
  userId: string;
  siteName: string;
  siteJson: TemplateJson;
  domain?: string;
}

export class CreateSiteFromTemplateUseCase {
  constructor(
    private templateRepository: ITemplateRepository,
    private userSiteRepository: IUserSiteRepository,
  ) {}

  /**
   * Create a site instance from a template (Copy JSON)
   */
  async execute(input: CreateSiteFromTemplateInput) {

    const template = await this.templateRepository.findById(input.templateId);

    if (!template) {
      throw new TemplateError('TEMPLATE_NOT_FOUND');
    }

    // Check for duplicate site name
    const existing = await this.userSiteRepository.findByUserIdAndName(input.userId, input.siteName);
    if (existing) {
      throw new TemplateError('NAME_TAKEN');
    }

    // Deep copy template JSON to user's site
    const siteJson: TemplateJson = JSON.parse(JSON.stringify(template.templateJson));

    return this.userSiteRepository.create({
      userId: input.userId,
      templateId: input.templateId,
      siteName: input.siteName,
      domain: null,
      status: 'draft',
      siteJson,
      templateSnapshot: template.templateJson, // Original template snapshot
      publishedAt: null,
    });
  }

  /**
   * Admin direct creation of custom site (without template)
   */
  async executeCustom(input: CreateCustomSiteInput) {
    return this.userSiteRepository.create({
      userId: input.userId,
      templateId: null,
      siteName: input.siteName,
      domain: input.domain ?? null,
      status: 'draft',
      siteJson: input.siteJson,
      templateSnapshot: input.siteJson, // For custom sites, use initial JSON as snapshot
      publishedAt: null,
    });
  }
}
