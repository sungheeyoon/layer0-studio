import { ContentModel } from '../../entities/template.entity';

/**
 * A single validation finding against a Site's content (`ContentModel`).
 * `code` is a stable identifier (see the catalog in docs/TEMPLATE_SYSTEM.md §6);
 * `path` points at the offending location (e.g. `blocks[id=hero].fields.title`).
 */
export interface SiteContentValidationIssue {
  code: string;
  message: string;
  path?: string;
}

export interface SiteContentValidationResult {
  errors: SiteContentValidationIssue[];
  warnings: SiteContentValidationIssue[];
}

/**
 * Domain port for "is this Site content valid against its Template library, and why".
 *
 * The single source of truth for Site-content validity. Both the Sync pipeline
 * (code→DB) and the Editor save path route through the same underlying rules; the
 * concrete adapter (src/lib/template) loads the Template library by `templateKey`
 * and delegates to `validateContent`. Domain stays unaware of how the library
 * is loaded — it only depends on this contract.
 */
export interface SiteContentValidator {
  validate(json: ContentModel): Promise<SiteContentValidationResult>;
}
