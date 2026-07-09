import { ITemplateRepository } from '../../repositories/template.repository';
import { ContentModel } from '../../entities/template.entity';
import { TemplateError } from '../../errors/template.error';
import { SiteContentValidator } from '../ports/site-content-validator.port';

interface CreateTemplateInput {
  name: string;
  description: string | null;
  slug: string;
  category: string;
  status: 'draft' | 'active' | 'archived';
  thumbnailUrl: string | null;
  content: ContentModel;
  version: string;
  createdBy: string;
}

export class CreateTemplateUseCase {
  constructor(
    private templateRepository: ITemplateRepository,
    private validator: SiteContentValidator,
  ) {}

  async execute(input: CreateTemplateInput) {
    // Validate slug uniqueness
    const existing = await this.templateRepository.findBySlug(input.slug);
    if (existing) {
      throw new TemplateError('TEMPLATE_SLUG_EXISTS');
    }

    // Validate content against the Template library (single source of truth)
    const { errors } = await this.validator.validate(input.content);
    if (errors.length > 0) {
      throw new TemplateError('INVALID_TEMPLATE_JSON', errors);
    }

    return this.templateRepository.create(input);
  }
}
