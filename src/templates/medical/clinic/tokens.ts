import { GlobalStyles } from '@/domain/entities/template.entity';
import type { DesignTokens } from '@/templates/types';

/**
 * 온유의원 (ONYU CLINIC) — a Korean neighbourhood clinic.
 * Clean and trustworthy: clinical white, a calm medical blue, a fresh teal
 * accent, and generous whitespace over large photography.
 *
 * Thin layer — the five user-editable fields exposed in the editor. They
 * overlay specific `designTokens` entries via the overlay map in
 * `src/lib/template/design-tokens.ts`:
 *   primaryColor   → --color-primary
 *   secondaryColor → --color-secondary
 *   fontFamily     → --font-base
 *   fontSize       → --font-size
 */
export const defaultGlobalStyles: GlobalStyles = {
  primaryColor: '#2563EB',   // medical blue — trust, primary CTAs
  secondaryColor: '#0E7490', // fresh teal — kickers / small accents
  fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
  fontSize: '16px',
  layout: 'wide',
};

/**
 * Rich layer — the template's full visual identity, code-fixed. Section
 * components reference these via `var(--{dim}-{key})` (see `tokensToCssVars`),
 * which keeps the editor's globalStyles overrides propagating site-wide.
 */
export const designTokens: DesignTokens = {
  colors: {
    primary: '#2563EB',        // medical blue — themable
    secondary: '#0E7490',      // teal — themable
    'primary-soft': '#5B8DEF', // soft sky blue
    surface: '#FFFFFF',        // clinical white (page bg)
    'surface-soft': '#F1F6FD', // pale blue panel
    'surface-dark': '#0F2C4C', // deep navy (hero / footer / stat bands)
    ink: '#12263A',            // navy charcoal (headings / body)
    muted: '#5C6B7A',          // slate gray (secondary text)
    line: '#E3EAF2',           // hairline border
    'on-dark': '#EAF2FB',      // text on navy bands
  },
  fonts: {
    base: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
  },
};
