import { GlobalStyles } from '@/domain/entities/template.entity';
import type { DesignTokens } from '@/templates/types';

/**
 * 능선 (NEUNGSEON) — a Korean mountain-trail outdoor brand.
 * Earthy and editorial: deep pine green, warm paper, a trail-clay accent.
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
  primaryColor: '#3F4A37',   // pine — deep moss green
  secondaryColor: '#C2602F', // clay — trail amber accent
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
    primary: '#3F4A37',        // pine — themable
    secondary: '#C2602F',      // clay — themable
    'primary-soft': '#5A6650', // sage pine
    surface: '#F4F1E9',        // warm paper (page bg)
    'surface-soft': '#EAE5D8', // oat panel
    'surface-dark': '#2B3127', // deep forest (inverted bands)
    ink: '#23271E',            // forest charcoal (headings/body)
    muted: '#6C7163',          // sage gray (secondary text)
    line: '#DAD4C5',           // hairline border
    'on-dark': '#EDEAE0',      // text on dark/forest bands
  },
  fonts: {
    base: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
  },
};
