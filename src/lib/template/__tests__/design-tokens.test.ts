import { describe, it, expect } from 'vitest';
import { tokensToCssVars } from '../design-tokens';
import type { DesignTokens } from '@/templates/types';

const sample: DesignTokens = {
  colors: {
    primary:   '#C96A3A',
    secondary: '#231509',
    surface:   '#F5F0E8',
  },
  fonts: {
    base:  "'Pretendard', sans-serif",
    serif: "'Playfair Display', serif",
  },
  spacing: { sm: '0.5rem', md: '1rem' },
  radius:  { md: '0.5rem' },
  shadows: { card: '0 1px 3px rgba(0,0,0,0.1)' },
};

describe('tokensToCssVars', () => {
  it('flattens every dimension into --{dim}-{key} variables', () => {
    const vars = tokensToCssVars(sample);
    expect(vars['--color-primary']).toBe('#C96A3A');
    expect(vars['--color-secondary']).toBe('#231509');
    expect(vars['--color-surface']).toBe('#F5F0E8');
    expect(vars['--font-base']).toBe("'Pretendard', sans-serif");
    expect(vars['--font-serif']).toBe("'Playfair Display', serif");
    expect(vars['--spacing-sm']).toBe('0.5rem');
    expect(vars['--spacing-md']).toBe('1rem');
    expect(vars['--radius-md']).toBe('0.5rem');
    expect(vars['--shadow-card']).toBe('0 1px 3px rgba(0,0,0,0.1)');
  });

  it('uses singular prefix even though the dimension key is plural', () => {
    const vars = tokensToCssVars({ colors: { x: '#fff' }, fonts: { x: 'y' }, shadows: { x: 'z' } });
    expect(Object.keys(vars)).toEqual(['--color-x', '--font-x', '--shadow-x']);
  });

  it('skips undefined dimensions silently', () => {
    const vars = tokensToCssVars({ colors: { primary: '#000' } });
    expect(vars).toEqual({ '--color-primary': '#000' });
  });

  it('returns an empty object for empty input', () => {
    expect(tokensToCssVars({})).toEqual({});
  });

  it('applies primaryColor / secondaryColor overrides to --color-primary / --color-secondary', () => {
    const vars = tokensToCssVars(sample, { primaryColor: '#ff0000', secondaryColor: '#00ff00' });
    expect(vars['--color-primary']).toBe('#ff0000');
    expect(vars['--color-secondary']).toBe('#00ff00');
    expect(vars['--color-surface']).toBe('#F5F0E8'); // unchanged
  });

  it('applies fontFamily override to --font-base', () => {
    const vars = tokensToCssVars(sample, { fontFamily: "'Inter', sans-serif" });
    expect(vars['--font-base']).toBe("'Inter', sans-serif");
    expect(vars['--font-serif']).toBe("'Playfair Display', serif"); // unchanged
  });

  it('applies fontSize override to --font-size', () => {
    const vars = tokensToCssVars(sample, { fontSize: '18px' });
    expect(vars['--font-size']).toBe('18px');
  });

  it('ignores empty-string / null / undefined override values (keeps defaults)', () => {
    const vars = tokensToCssVars(sample, {
      primaryColor: '',
      secondaryColor: undefined,
      // @ts-expect-error — explicitly testing null handling
      fontFamily: null,
    });
    expect(vars['--color-primary']).toBe('#C96A3A');
    expect(vars['--color-secondary']).toBe('#231509');
    expect(vars['--font-base']).toBe("'Pretendard', sans-serif");
  });

  it('does not produce keys for axes that the overlay map does not cover', () => {
    // layout is in GlobalStyles but has no CSS-var mapping.
    const vars = tokensToCssVars(sample, { layout: 'wide' });
    expect(Object.keys(vars).every(k => !k.includes('layout'))).toBe(true);
  });

  it('result can be spread directly into a React style object (string keys, string values)', () => {
    const vars = tokensToCssVars(sample);
    for (const [k, v] of Object.entries(vars)) {
      expect(typeof k).toBe('string');
      expect(k.startsWith('--')).toBe(true);
      expect(typeof v).toBe('string');
    }
  });

  it('overlay overrides win over the base designTokens value', () => {
    const vars = tokensToCssVars(
      { colors: { primary: '#aaa' } },
      { primaryColor: '#bbb' },
    );
    expect(vars['--color-primary']).toBe('#bbb');
  });
});
