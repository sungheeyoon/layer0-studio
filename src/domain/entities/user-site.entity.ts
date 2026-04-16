import { TemplateJson } from './template.entity';

export interface UserSite {
  id: string;
  userId: string;
  templateId: string | null; // null = custom site
  siteName: string;
  domain: string | null;
  status: 'draft' | 'active' | 'suspended';
  siteJson: TemplateJson;
  templateSnapshot: TemplateJson; // Snapshot of the template when site was created
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateUserSiteDto = Omit<UserSite, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserSiteDto = Partial<Omit<UserSite, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>;
