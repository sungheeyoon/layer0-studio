import { GlobalStyles } from '@/domain/entities/template.entity';
import type { DesignTokens } from '@/templates/types';

/**
 * 능선 (NEUNGSEON) — a Korean mountain-trail outdoor brand.
 * Earthy and editorial: deep pine green, warm paper, a trail-clay accent.
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
  primaryColor: '#3F4A37',   // pine — deep moss green
  secondaryColor: '#C2602F', // clay — trail amber accent
  backgroundColor: '#F4F1E9', // warm paper — overlays colors.surface
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
 * Block components reference these via `var(--{dim}-{key})` (see
 * `tokensToCssVars`), which keeps the editor's globalStyles overrides
 * propagating site-wide.
 */
export const designTokens: DesignTokens = {
  colors: {
    primary: '#3F4A37',        // pine — themable
    secondary: '#C2602F',      // clay — themable
    'primary-soft': '#5A6650', // sage pine
    surface: '#F4F1E9',        // themable — warm paper (page bg)
    // Tonal sibling of `surface`: derived so a user-picked background keeps
    // the panel one step below the page. Light template → mix toward black.
    'surface-soft': 'color-mix(in srgb, var(--color-surface) 94%, #000)',
    // NOT a sibling — an inverted band with its own `on-dark` text. Stays fixed.
    'surface-dark': '#2B3127', // deep forest (inverted bands)
    ink: '#23271E',            // forest charcoal (headings/body)
    muted: '#6C7163',          // sage gray (secondary text)
    // Hairline border — also a tonal sibling: it separates panels *on* the
    // page, so it has to move with the page.
    line: 'color-mix(in srgb, var(--color-surface) 87%, #000)',
    'on-dark': '#EDEAE0',      // text on dark/forest bands
  },
  fonts: {
    base: "'Pretendard Variable', 'Pretendard', 'Apple SD Gothic Neo', sans-serif",
  },
};
