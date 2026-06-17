import { ITemplateRepository } from '../../repositories/template.repository';
import { UpdateTemplateDto } from '../../entities/template.entity';
import { TemplateError } from '../../errors/template.error';
import { SiteContentValidator } from '../ports/site-content-validator.port';

export class UpdateTemplateUseCase {
  constructor(
    private templateRepository: ITemplateRepository,
    private validator: SiteContentValidator,
  ) {}

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

    // Validate content against the Template library (single source of truth)
    if (data.templateJson) {
      const { errors } = await this.validator.validate(data.templateJson);
      if (errors.length > 0) {
        throw new TemplateError('INVALID_TEMPLATE_JSON', errors);
      }
    }

    return this.templateRepository.update(id, data);
  }
}
