import { GlobalStyles } from '@/domain/entities/template.entity';
import type { DesignTokens } from '@/templates/types';

/**
 * 온유의원 (ONYU CLINIC) — a Korean neighbourhood clinic.
 * Clean and trustworthy: clinical white, a calm medical blue, a fresh teal
 * accent, and generous whitespace over large photography.
 *
 * Thin layer — **the user's copy.** Deep-copied into the Site's `content` at
 * creation, so editing a value here never reaches a Site that already exists.
 *
 * Overlays specific `designTokens` entries via the overlay map in
 * `src/lib/template/design-tokens.ts`:
 *   primaryColor    → --color-primary
 *   secondaryColor  → --color-secondary
 *   backgroundColor → --color-surface
 *   fontFamily      → --font-base
 *   fontSize        → --font-size
 */
export const defaultGlobalStyles: GlobalStyles = {
  primaryColor: '#2563EB',   // medical blue — trust, primary CTAs
  secondaryColor: '#0E7490', // fresh teal — kickers / small accents
  backgroundColor: '#FFFFFF', // clinical white — overlays colors.surface
  fontFamily: "'Pretendard Variable', 'Pretendard', 'Apple SD Gothic Neo', sans-serif",
  fontSize: '16px',
  layout: 'wide',
};

/**
 * Rich layer — the template's full visual identity, **code-owned.** Not copied
 * per Site: the renderer imports this module at serve time, so changing a value
 * here restyles *every* existing Site on this Template. That is intended — it
 * is the only channel for a fleet-wide repair (bad contrast, rotten font
 * stack). For a redesign, fork to a new leaf directory instead.
 *
 * Section components reference these via `var(--{dim}-{key})` (see
 * `tokensToCssVars`), which keeps the editor's globalStyles overrides
 * propagating site-wide.
 */
export const designTokens: DesignTokens = {
  colors: {
    primary: '#2563EB',        // medical blue — themable
    secondary: '#0E7490',      // teal — themable
    'primary-soft': '#5B8DEF', // soft sky blue
    surface: '#FFFFFF',        // themable — clinical white (page bg)
    // Tonal sibling of `surface`: derived so a user-picked background keeps
    // the panel one step below the page. Light template → mix toward black.
    'surface-soft': 'color-mix(in srgb, var(--color-surface) 97%, #000)',
    // NOT a sibling — an inverted band with its own `on-dark` text. Stays fixed.
    'surface-dark': '#0F2C4C', // deep navy (hero / footer / stat bands)
    ink: '#12263A',            // navy charcoal (headings / body)
    muted: '#5C6B7A',          // slate gray (secondary text)
    // Hairline border — also a tonal sibling: it separates panels *on* the
    // page, so it has to move with the page.
    line: 'color-mix(in srgb, var(--color-surface) 92%, #000)',
    'on-dark': '#EAF2FB',      // text on navy bands
  },
  fonts: {
    base: "'Pretendard Variable', 'Pretendard', 'Apple SD Gothic Neo', sans-serif",
  },
};
