import { ITemplateRepository } from '../../repositories/template.repository';
import { TemplateError } from '../../errors/template.error';

export class GetTemplateUseCase {
  constructor(private templateRepository: ITemplateRepository) {}

  async execute(id: string) {
    const template = await this.templateRepository.findById(id);

    if (!template) {
      throw new TemplateError('TEMPLATE_NOT_FOUND');
    }

    return template;
  }

  async executeBySlug(slug: string) {
    const template = await this.templateRepository.findBySlug(slug);

    if (!template) {
      throw new TemplateError('TEMPLATE_NOT_FOUND');
    }

    return template;
  }
}
