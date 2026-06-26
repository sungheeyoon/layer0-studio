/**
 * Korean message catalog — the **canonical** source of the `Messages` shape.
 *
 * `type Messages = typeof ko` widens string literals to `string`, so en.ts only
 * has to match the *keys* (not the values). Adding a key here without adding it
 * to en.ts is a compile error — that's how "반쪽 번역" is structurally blocked.
 *
 * Keep every value a plain string so the active dictionary stays serializable
 * across the Server→Client boundary (only one locale ships to the client). When
 * interpolation is needed, use a placeholder + a string-format helper rather
 * than a function value (functions can't cross the RSC boundary as props).
 */
export const ko = {
  auth: {
    login: {
      emailLabel: '이메일',
      passwordLabel: '비밀번호',
      submit: '로그인',
      submitting: '인증 중...',
      forgotLink: '비밀번호 찾기',
      signupLink: '가입 요청',
      errorPrefix: '오류',
    },
  },
};

export type Messages = typeof ko;
