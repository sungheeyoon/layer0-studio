import { ContentModel } from './template.entity';

export interface UserSite {
  id: string;
  userId: string;
  templateId: string | null; // null = custom site
  siteName: string;
  domain: string | null;
  status: 'draft' | 'active' | 'suspended';
  /**
   * The working copy. Changes only when the owner saves, and is never served to
   * a visitor — the public renderer reads `publishedContent` (migration 029).
   */
  content: ContentModel;
  /**
   * The public copy. Changes only when the owner publishes. `null` = the Site
   * has never been published, so there is nothing to serve and nothing for a
   * discarded draft to fall back to except `snapshot`.
   */
  publishedContent: ContentModel | null;
  // Immutable snapshot of the original template JSON at site creation time.
  // Also the discard-draft baseline for a Site that has never been published.
  snapshot: ContentModel;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * What the public renderer is allowed to see.
 *
 * A separate read model rather than a `UserSite` because the draft must not be
 * reachable from a public request *by construction* — with one type carrying
 * both copies, serving the wrong one is a one-character mistake. The repository
 * fills this from the `published_sites` view, which does not select `content`
 * at all, so the draft never leaves Postgres on this path.
 */
export interface PublishedSite {
  id: string;
  siteName: string;
  domain: string;
  content: ContentModel; // the published copy — there is no other here
  publishedAt: string | null;
  updatedAt: string;
}

/**
 * What the editor client receives.
 *
 * `snapshot` and `publishedContent` are deliberately absent: both are whole
 * ContentModels the browser has no use for, and shipping them tripled the
 * editor's payload. What the editor actually needs from the published copy is
 * one bit — whether a save is sitting unpublished — plus a server action to act
 * on it.
 */
export type EditorSite = Omit<UserSite, 'snapshot' | 'publishedContent'> & {
  hasUnpublishedChanges: boolean;
};

/**
 * Does the working copy differ from what visitors currently see?
 *
 * Never published counts as "has changes" only once something exists to
 * publish; a Site sitting on its untouched template preset should not nag.
 *
 * Stringify comparison is sound here because both sides are stored as `jsonb`,
 * which normalises key order on write — two structurally equal ContentModels
 * always come back with the same serialisation. It would not be sound on
 * in-memory objects that never went through Postgres.
 */
export function hasUnpublishedChanges(site: UserSite): boolean {
  const baseline = site.publishedContent ?? site.snapshot;
  return JSON.stringify(site.content) !== JSON.stringify(baseline);
}

/**
 * What "discard my saved draft" restores: the live copy if the Site has been
 * published, otherwise the Template preset it was created from.
 */
export function draftBaseline(site: UserSite): ContentModel {
  return site.publishedContent ?? site.snapshot;
}

export function toEditorSite(site: UserSite): EditorSite {
  const { snapshot: _snapshot, publishedContent: _publishedContent, ...rest } = site;
  return { ...rest, hasUnpublishedChanges: hasUnpublishedChanges(site) };
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
