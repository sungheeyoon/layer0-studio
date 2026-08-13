import { ITemplateRepository } from '../../repositories/template.repository';
import { IUserSiteRepository } from '../../repositories/user-site.repository';
import { ContentModel } from '../../entities/template.entity';
import { TemplateError } from '../../errors/template.error';

interface CreateSiteFromTemplateInput {
  userId: string;
  templateId: string;
  siteName: string;
}

interface CreateCustomSiteInput {
  userId: string;
  siteName: string;
  content: ContentModel;
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

    // Deep copy template content to user's site
    const content: ContentModel = structuredClone(template.content);

    return this.userSiteRepository.create({
      userId: input.userId,
      templateId: input.templateId,
      siteName: input.siteName,
      domain: null,
      status: 'draft',
      content,
      // Nothing is public until the owner publishes — see ADR-0017.
      publishedContent: null,
      snapshot: template.content, // Original template snapshot
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
      content: input.content,
      publishedContent: null,
      snapshot: input.content, // For custom sites, use initial JSON as snapshot
      publishedAt: null,
    });
  }
}
