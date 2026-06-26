import type { Locale } from '@/lib/i18n/locale';

/**
 * Auth error display strings keyed by stable domain `code`, now locale-aware
 * ({ ko, en }) for the Studio bilingual UI. This registry stays a separate
 * module from the UI copy dictionary on purpose — it decouples domain error
 * codes from display strings (a different axis than chrome copy).
 */
export const AUTH_ERRORS: Record<string, Record<Locale, string>> = {
  INVALID_EMAIL: {
    ko: '올바른 이메일 형식이 아닙니다.',
    en: 'Invalid email format.',
  },
  WEAK_PASSWORD: {
    ko: '비밀번호는 6자 이상이어야 합니다.',
    en: 'Password must be at least 6 characters.',
  },
  USER_ALREADY_EXISTS: {
    ko: '이미 사용 중인 이메일입니다.',
    en: 'This email is already in use.',
  },
  WRONG_CREDENTIALS: {
    ko: '이메일 또는 비밀번호가 올바르지 않습니다.',
    en: 'Incorrect email or password.',
  },
  EMAIL_NOT_CONFIRMED: {
    ko: '이메일 확인이 필요합니다. 받은 메일함을 확인해주세요.',
    en: 'Email confirmation required. Please check your inbox.',
  },
  OAUTH_FAILED: {
    ko: 'SNS 로그인에 실패했습니다. 다시 시도해주세요.',
    en: 'Social login failed. Please try again.',
  },
  UNKNOWN: {
    ko: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    en: 'An error occurred. Please try again later.',
  },
};

export const DOMAIN_ERRORS: Record<string, Record<Locale, string>> = {
  DOMAIN_TAKEN: {
    ko: '이미 사용 중인 도메인입니다.',
    en: 'This domain is already in use.',
  },
  INVALID_DOMAIN: {
    ko: '도메인 형식이 올바르지 않거나 예약된 단어입니다 (최소 3자, 영문/숫자/하이픈).',
    en: 'Invalid or reserved domain format (min 3 chars; letters, numbers, hyphens).',
  },
  NAME_TAKEN: {
    ko: '이미 사용 중인 사이트 이름입니다.',
    en: 'This site name is already in use.',
  },
  STALE_VERSION: {
    ko: '다른 곳에서 먼저 수정되었습니다. 새로고침 후 다시 시도해주세요.',
    en: 'This was modified elsewhere. Refresh and try again.',
  },
};

export const SITE_ERRORS: Record<string, Record<Locale, string>> = {
  RATE_LIMITED: {
    ko: '잠시 후 다시 시도해주세요 (30초 제한).',
    en: 'Please try again shortly (30-second limit).',
  },
  INVALID_TEMPLATE_JSON: {
    ko: '저장할 수 없는 콘텐츠입니다. 입력값을 확인해주세요.',
    en: 'This content cannot be saved. Please check your input.',
  },
  STALE_VERSION: {
    ko: '다른 곳에서 먼저 수정되었습니다. 새로고침 후 다시 시도해주세요.',
    en: 'This was modified elsewhere. Refresh and try again.',
  },
};

const UNKNOWN_ERROR: Record<Locale, string> = {
  ko: '알 수 없는 오류입니다.',
  en: 'An unknown error occurred.',
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

export function getAuthError(code: string | undefined, locale: Locale): string {
  return (AUTH_ERRORS[code ?? 'UNKNOWN'] ?? AUTH_ERRORS.UNKNOWN)[locale];
}

export function getDomainError(code: string | undefined, locale: Locale): string {
  return DOMAIN_ERRORS[code ?? '']?.[locale] ?? code ?? UNKNOWN_ERROR[locale];
}

export function getSiteError(code: string | undefined, locale: Locale, fallback: string): string {
  return SITE_ERRORS[code ?? '']?.[locale] ?? fallback;
}

export function getAdminDomainError(code: string | undefined): string {
  return ADMIN_DOMAIN_ERRORS[code ?? ''] ?? code ?? 'An unexpected error occurred';
}

export function getAdminActionError(code: string | undefined): string {
  return ADMIN_ACTION_ERRORS[code ?? ''] ?? 'An unexpected error occurred';
}
