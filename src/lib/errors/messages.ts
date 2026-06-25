export const AUTH_ERRORS: Record<string, string> = {
  INVALID_EMAIL: '올바른 이메일 형식이 아닙니다.',
  WEAK_PASSWORD: '비밀번호는 6자 이상이어야 합니다.',
  USER_ALREADY_EXISTS: '이미 사용 중인 이메일입니다.',
  WRONG_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
  EMAIL_NOT_CONFIRMED: '이메일 확인이 필요합니다. 받은 메일함을 확인해주세요.',
  OAUTH_FAILED: 'SNS 로그인에 실패했습니다. 다시 시도해주세요.',
  UNKNOWN: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};

export const DOMAIN_ERRORS: Record<string, string> = {
  DOMAIN_TAKEN: '이미 사용 중인 도메인입니다.',
  INVALID_DOMAIN: '도메인 형식이 올바르지 않거나 예약된 단어입니다 (최소 3자, 영문/숫자/하이픈).',
  NAME_TAKEN: '이미 사용 중인 사이트 이름입니다.',
  STALE_VERSION: '다른 곳에서 먼저 수정되었습니다. 새로고침 후 다시 시도해주세요.',
};

export const SITE_ERRORS: Record<string, string> = {
  RATE_LIMITED: '잠시 후 다시 시도해주세요 (30초 제한).',
  INVALID_TEMPLATE_JSON: '저장할 수 없는 콘텐츠입니다. 입력값을 확인해주세요.',
  STALE_VERSION: '다른 곳에서 먼저 수정되었습니다. 새로고침 후 다시 시도해주세요.',
};

export const ADMIN_DOMAIN_ERRORS: Record<string, string> = {
  DOMAIN_TAKEN: 'Domain already in use',
  INVALID_DOMAIN: 'Invalid domain format (min 3 chars, alphanumeric/hyphen)',
  STALE_VERSION: 'This site was modified elsewhere. Refresh and try again.',
};

export const ADMIN_ACTION_ERRORS: Record<string, string> = {
  SITE_NOT_FOUND: 'Site not found',
  SITE_ACCESS_DENIED: 'Access denied',
  FORBIDDEN: 'Admin permission required',
  UNSUPPORTED_FIELD_TYPE: 'This field type does not support partial updates',
  STALE_VERSION: 'This site was modified elsewhere. Refresh and try again.',
};

/**
 * True when a Server Action result is an optimistic-concurrency conflict.
 * Centralizes the STALE_VERSION check so save/publish/metadata paths don't each
 * re-implement it (and can't drift from the Conflict-modal / refresh flow).
 */
export function isStaleConflict(result: unknown): boolean {
  return (
    !!result &&
    typeof result === 'object' &&
    'error' in result &&
    (result as { error?: unknown }).error === 'STALE_VERSION'
  );
}

export function getAuthError(code: string | undefined): string {
  return AUTH_ERRORS[code ?? 'UNKNOWN'] ?? AUTH_ERRORS.UNKNOWN;
}

export function getDomainError(code: string | undefined): string {
  return DOMAIN_ERRORS[code ?? ''] ?? code ?? '알 수 없는 오류입니다.';
}

export function getSiteError(code: string | undefined, fallback: string): string {
  return SITE_ERRORS[code ?? ''] ?? fallback;
}

export function getAdminDomainError(code: string | undefined): string {
  return ADMIN_DOMAIN_ERRORS[code ?? ''] ?? code ?? 'An unexpected error occurred';
}

export function getAdminActionError(code: string | undefined): string {
  return ADMIN_ACTION_ERRORS[code ?? ''] ?? 'An unexpected error occurred';
}
