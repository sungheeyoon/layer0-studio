// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

vi.mock('@/components/auth/AuthHeader', () => ({ default: () => <span>Layer0 Studio</span> }));

import { AuthShell } from './AuthShell';

afterEach(cleanup);

describe('AuthShell focused chrome', () => {
  it('renders a single brand and uses a dynamic viewport-height shell', () => {
    const { container } = render(<AuthShell title="로그인">form</AuthShell>);
    expect(screen.getAllByText('Layer0 Studio')).toHaveLength(1);
    expect(container.querySelector('main')).toHaveClass('min-h-dvh');
  });
});
