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

export class TemplateError extends Error {
  constructor(public code: TemplateErrorCode) {
    super(code);
  }
}
