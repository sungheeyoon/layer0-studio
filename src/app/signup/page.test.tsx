// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ko } from '@/lib/i18n/messages/ko';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('./actions', () => ({ signupAction: vi.fn() }));
vi.mock('@/lib/i18n/provider', () => ({
  useDictionary: () => ko,
  useLocale: () => 'ko',
}));
vi.mock('@/components/auth/OAuthButtons', () => ({ OAuthButtons: () => null }));
vi.mock('@/components/auth/AuthShell', () => ({
  AuthShell: ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
    <main><h1>{title}</h1><p>{subtitle}</p>{children}</main>
  ),
  AuthStatus: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

import SignupPage from './page';

afterEach(cleanup);

describe('SignupPage', () => {
  it('only asks for account information, without an unused workspace ID', () => {
    render(<SignupPage />);

    expect(screen.getByLabelText(ko.auth.signup.fullNameLabel)).toBeRequired();
    expect(screen.getByLabelText(ko.auth.signup.emailLabel)).toBeRequired();
    expect(screen.getByLabelText(ko.auth.signup.passwordLabel)).toBeRequired();
    expect(screen.queryByText(/워크스페이스 ID/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/workspace ID/i)).not.toBeInTheDocument();
  });
});
