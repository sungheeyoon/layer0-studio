export type AuthErrorCode =
  | 'INVALID_EMAIL'
  | 'WEAK_PASSWORD'
  | 'WRONG_CREDENTIALS'
  | 'USER_ALREADY_EXISTS'
  | 'UNAUTHORIZED'
  | 'EMAIL_NOT_CONFIRMED'
  | 'UNKNOWN';

export class AuthError extends Error {
  constructor(public code: AuthErrorCode) {
    super(code);
  }
}
