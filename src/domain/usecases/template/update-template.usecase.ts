import { ITemplateRepository } from '../../repositories/template.repository';
import { UpdateTemplateDto } from '../../entities/template.entity';
import { TemplateError } from '../../errors/template.error';

export class UpdateTemplateUseCase {
  constructor(private templateRepository: ITemplateRepository) {}

  async execute(id: string, data: UpdateTemplateDto) {
    // Check template exists
    const existing = await this.templateRepository.findById(id);
    if (!existing) {
      throw new TemplateError('TEMPLATE_NOT_FOUND');
    }

    // If slug is being changed, check uniqueness
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await this.templateRepository.findBySlug(data.slug);
      if (slugExists) {
        throw new TemplateError('TEMPLATE_SLUG_EXISTS');
      }
    }

    // Validate JSON if provided
    if (data.templateJson) {
      if (!data.templateJson.sections || !Array.isArray(data.templateJson.sections)) {
        throw new TemplateError('INVALID_TEMPLATE_JSON');
      }
      if (!data.templateJson.globalStyles) {
        throw new TemplateError('INVALID_TEMPLATE_JSON');
      }
    }

    return this.templateRepository.update(id, data);
  }
}
