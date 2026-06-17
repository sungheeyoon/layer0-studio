export type TemplateErrorCode =
  | 'TEMPLATE_NOT_FOUND'
  | 'TEMPLATE_SLUG_EXISTS'
  | 'INVALID_TEMPLATE_JSON'
  | 'SITE_NOT_FOUND'
  | 'SITE_ACCESS_DENIED'
  | 'STALE_VERSION'
  | 'INVALID_DOMAIN'
  | 'DOMAIN_TAKEN'
  | 'NAME_TAKEN'
  | 'UNSUPPORTED_FIELD_TYPE'
  | 'UNKNOWN';

import { SiteContentValidationIssue } from '../usecases/ports/site-content-validator.port';

export class TemplateError extends Error {
  /**
   * @param issues Optional structured validation findings, set when `code` is
   *   `INVALID_TEMPLATE_JSON`. Surfaced for logging/debugging; the client maps
   *   only `code` to a user-facing message.
   */
  constructor(public code: TemplateErrorCode, public issues?: SiteContentValidationIssue[]) {
    super(code);
  }
}
