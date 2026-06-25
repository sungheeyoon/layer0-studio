// Plain login (no `next`) lands on the dashboard; the template-select flow
// carries a `next` to /dashboard/projects/create?templateId=… instead.
const DEFAULT_NEXT = '/dashboard';

/**
 * Validate a post-auth `next` destination against open-redirect abuse.
 * Only local absolute paths are allowed — anything starting with `//`
 * (protocol-relative) or carrying a scheme is rejected and falls back to
 * the default destination. Shared by the OAuth callback route and the
 * email-login client redirect so both can't drift.
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next) return DEFAULT_NEXT;
  if (!next.startsWith('/')) return DEFAULT_NEXT;
  if (next.startsWith('//') || next.startsWith('/\\')) return DEFAULT_NEXT;
  return next;
}
