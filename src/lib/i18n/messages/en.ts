import type { Messages } from './ko';

/**
 * English catalog. Typed as `Messages` so the compiler enforces exact key
 * parity with ko.ts (missing or extra keys both fail to compile).
 *
 * English values intentionally preserve the login screen's existing techno
 * styling, so `en` renders the page as it looked before this change.
 */
export const en: Messages = {
  auth: {
    login: {
      emailLabel: 'USER_EMAIL',
      passwordLabel: 'SECURE_KEY',
      submit: 'INITIATE_SESSION',
      submitting: 'AUTHENTICATING...',
      forgotLink: 'FORGOT_KEY?',
      signupLink: 'REQUEST_ACCESS',
      errorPrefix: 'ERROR',
    },
  },
};
