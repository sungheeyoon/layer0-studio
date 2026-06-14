import { ITemplateRepository } from '../../repositories/template.repository';
import { TemplateJson } from '../../entities/template.entity';
import { TemplateError } from '../../errors/template.error';

interface CreateTemplateInput {
  name: string;
  description: string | null;
  slug: string;
  category: string;
  status: 'draft' | 'active' | 'archived';
  thumbnailUrl: string | null;
  templateJson: TemplateJson;
  version: string;
  createdBy: string;
}

export class CreateTemplateUseCase {
  constructor(private templateRepository: ITemplateRepository) {}

  async execute(input: CreateTemplateInput) {
    // Validate slug uniqueness
    const existing = await this.templateRepository.findBySlug(input.slug);
    if (existing) {
      throw new TemplateError('TEMPLATE_SLUG_EXISTS');
    }

    // Validate JSON structure (mode-discriminated union)
    const tj = input.templateJson;
    const shapeOk =
      tj.mode === 'single'
        ? Array.isArray(tj.sections) && tj.sections.length > 0
        : tj.mode === 'multi' && Array.isArray(tj.pages) && tj.pages.length > 0;
    if (!shapeOk) {
      throw new TemplateError('INVALID_TEMPLATE_JSON');
    }

    if (!input.templateJson.globalStyles) {
      throw new TemplateError('INVALID_TEMPLATE_JSON');
    }

    return this.templateRepository.create(input);
  }
}
