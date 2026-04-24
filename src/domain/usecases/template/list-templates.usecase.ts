import { ITemplateRepository } from '../../repositories/template.repository';

export class ListTemplatesUseCase {
  constructor(private templateRepository: ITemplateRepository) {}

  async execute() {
    return this.templateRepository.findAll();
  }

  async executeActive() {
    return this.templateRepository.findActiveTemplates();
  }

  async executeByCategory(category: string) {
    return this.templateRepository.findActiveByCategory(category);
  }

  async executePaginated(page: number, limit: number, category?: string | null) {
    return this.templateRepository.findActivePaginated(page, limit, category);
  }

  async executeCategories() {
    return this.templateRepository.getDistinctCategories();
  }
}
