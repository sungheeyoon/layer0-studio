import { ContentModel } from '@/domain/entities/template.entity';

export type TemplateRow = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  category: string;
  status: 'draft' | 'active' | 'archived';
  thumbnail_url: string | null;
  content: ContentModel;
  version: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type UserSiteRow = {
  id: string;
  user_id: string;
  template_id: string | null;
  site_name: string;
  domain: string | null;
  status: 'draft' | 'active' | 'suspended';
  content: ContentModel;
  published_content: ContentModel | null;
  snapshot: ContentModel;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * What the list `select` asks for — `UserSiteRow` minus the three ContentModel
 * columns. Not a view: a column list, kept as a type so the mapper cannot read
 * a field the query never fetched.
 */
export type SiteSummaryRow = Omit<UserSiteRow, 'content' | 'published_content' | 'snapshot'>;

/**
 * The `published_sites` view (migration 029) — the only shape an anonymous
 * visitor can read. `content` and `snapshot` are not columns of it.
 */
export type PublishedSiteRow = {
  id: string;
  site_name: string;
  domain: string;
  published_content: ContentModel;
  published_at: string | null;
  updated_at: string;
};

export type AssetRow = {
  id: string;
  user_id: string;
  filename: string;
  mime_type: string;
  size: number;
  status: 'pending' | 'active';
  created_at: string;
  updated_at: string;
};
