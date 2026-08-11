// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ko } from '@/lib/i18n/messages/ko';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));
vi.mock('@/components/LocaleToggle', () => ({ LocaleToggle: () => <div>ko / en</div> }));
vi.mock('@/components/ThemeToggle', () => ({ ThemeToggle: () => <button type="button">theme</button> }));
vi.mock('@/components/ProfileDropdown', () => ({ default: () => null }));

import Navbar from './Navbar';

afterEach(cleanup);

describe('Navbar responsive navigation', () => {
  it('keeps a one-line brand and exposes every guest route from the mobile menu', async () => {
    const user = userEvent.setup();
    render(<Navbar user={null} copy={ko.nav} />);

    const brand = screen.getAllByRole('link', { name: 'Layer0 Studio' })[0];
    expect(brand).toHaveClass('whitespace-nowrap');

    await user.click(screen.getByRole('button', { name: ko.nav.menu }));
    const menu = await screen.findByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: ko.nav.templates })).toHaveAttribute('href', '/templates');
    expect(within(menu).getByRole('menuitem', { name: ko.nav.signIn })).toHaveAttribute('href', '/login');
    expect(within(menu).getByRole('menuitem', { name: ko.nav.getStarted })).toHaveAttribute('href', '/signup');
  });
});
