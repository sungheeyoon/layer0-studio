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
    expect(vars['--font-base']).toBe(
      "'Pretendard Variable', 'Pretendard', sans-serif",
    );
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

  it('applies backgroundColor override to --color-surface', () => {
    const vars = tokensToCssVars(sample, { backgroundColor: '#1B2A41' });
    expect(vars['--color-surface']).toBe('#1B2A41');
    expect(vars['--color-primary']).toBe('#C96A3A'); // unchanged
  });

  it('leaves --color-surface at the template default when backgroundColor is empty', () => {
    const vars = tokensToCssVars(sample, { backgroundColor: '' });
    expect(vars['--color-surface']).toBe('#F5F0E8');
  });

  // The shape a Site row written before this axis existed actually has: the
  // key is absent, not empty. Such a Site must keep rendering at its Template's
  // background rather than losing the variable.
  it('keeps the template background for a Site whose content predates backgroundColor', () => {
    const legacyGlobalStyles = {
      primaryColor: '#C96A3A',
      secondaryColor: '#231509',
      fontFamily: "'Pretendard', sans-serif",
      fontSize: '16px',
      layout: 'wide',
    };
    const vars = tokensToCssVars(sample, legacyGlobalStyles);
    expect(vars['--color-surface']).toBe('#F5F0E8');
    expect(vars['--color-primary']).toBe('#C96A3A');
  });

  it('applies fontFamily override to --font-base', () => {
    const vars = tokensToCssVars(sample, { fontFamily: "'Inter', sans-serif" });
    expect(vars['--font-base']).toBe("'Inter', sans-serif");
    expect(vars['--font-serif']).toBe("'Playfair Display', serif"); // unchanged
  });

  it('keeps persisted legacy Pretendard stacks compatible with the variable family', () => {
    const vars = tokensToCssVars(sample, {
      fontFamily: "'Playfair Display', 'Pretendard', sans-serif",
    });
    expect(vars['--font-base']).toBe(
      "'Playfair Display', 'Pretendard Variable', 'Pretendard', sans-serif",
    );
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
    expect(vars['--font-base']).toBe(
      "'Pretendard Variable', 'Pretendard', sans-serif",
    );
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
