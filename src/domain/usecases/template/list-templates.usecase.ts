import { ITemplateRepository } from '../../repositories/template.repository';

export class ListTemplatesUseCase {
  constructor(private templateRepository: ITemplateRepository) {}

  async execute() {
    return this.templateRepository.findAll();
  }

  async executeActive() {
    return this.templateRepository.findActiveTemplates();
  }
}
