import { Template, CreateTemplateDto, UpdateTemplateDto } from '../entities/template.entity';

export interface ITemplateRepository {
  findAll(): Promise<Template[]>;
  findActiveTemplates(): Promise<Template[]>;
  findById(id: string): Promise<Template | null>;
  findBySlug(slug: string): Promise<Template | null>;
  create(data: CreateTemplateDto): Promise<Template>;
  update(id: string, data: UpdateTemplateDto): Promise<Template>;
  delete(id: string): Promise<void>;
}
