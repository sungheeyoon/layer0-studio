import { ITemplateRepository } from '../../repositories/template.repository';
import { TemplateError } from '../../errors/template.error';

export class DeleteTemplateUseCase {
  constructor(private templateRepository: ITemplateRepository) {}

  async execute(id: string) {
    const existing = await this.templateRepository.findById(id);
    if (!existing) {
      throw new TemplateError('TEMPLATE_NOT_FOUND');
    }

    await this.templateRepository.delete(id);
  }
}
