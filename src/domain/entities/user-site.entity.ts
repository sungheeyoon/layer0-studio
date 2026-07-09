import { ContentModel } from './template.entity';

export interface UserSite {
  id: string;
  userId: string;
  templateId: string | null; // null = custom site
  siteName: string;
  domain: string | null;
  status: 'draft' | 'active' | 'suspended';
  siteJson: ContentModel;
  // Immutable snapshot of the original template JSON at site creation time.
  // Intended for future "reset to template" / diff features — not yet consumed by any UI.
  templateSnapshot: ContentModel;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateUserSiteDto = Omit<UserSite, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserSiteDto = Partial<Omit<UserSite, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>;

export const RESERVED_DOMAINS = [
  'admin', 
  'api', 
  'dashboard', 
  'site', 
  'preview', 
  'login', 
  'signup', 
  'templates',
  'www',
  'root',
  'assets',
  'static',
  'public'
];

export function validateDomainSlug(domain: string): string {
  const slug = domain.toLowerCase().trim();
  
  // Basic format: letters, numbers, hyphens. No leading/trailing hyphens.
  const formatRegex = /^[a-z0-9](-?[a-z0-9])*$/;
  
  if (
    slug.length < 3 || 
    slug.length > 50 || 
    !formatRegex.test(slug) || 
    RESERVED_DOMAINS.includes(slug)
  ) {
    throw new Error('INVALID_DOMAIN');
  }
  
  return slug;
}
