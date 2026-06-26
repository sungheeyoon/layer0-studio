import { describe, expect, it } from 'vitest';
import { getAuthError } from '../messages';

describe('getAuthError', () => {
  it('returns the message for the given code in the requested locale', () => {
    expect(getAuthError('WRONG_CREDENTIALS', 'ko')).toBe(
      '이메일 또는 비밀번호가 올바르지 않습니다.',
    );
    expect(getAuthError('WRONG_CREDENTIALS', 'en')).toBe(
      'Incorrect email or password.',
    );
  });

  it('falls back to UNKNOWN for an unrecognized code, per locale', () => {
    expect(getAuthError('NOT_A_REAL_CODE', 'ko')).toBe(
      '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    );
    expect(getAuthError('NOT_A_REAL_CODE', 'en')).toBe(
      'An error occurred. Please try again later.',
    );
  });

  it('treats an undefined code as UNKNOWN', () => {
    expect(getAuthError(undefined, 'en')).toBe(
      'An error occurred. Please try again later.',
    );
  });
});
