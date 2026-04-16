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
   * 템플릿으로부터 사이트 인스턴스 생성 (JSON 복사)
   */
  async execute(input: CreateSiteFromTemplateInput) {
    const template = await this.templateRepository.findById(input.templateId);

    if (!template) {
      throw new TemplateError('TEMPLATE_NOT_FOUND');
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
   * Admin이 커스텀 사이트를 직접 생성 (template 없이)
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
