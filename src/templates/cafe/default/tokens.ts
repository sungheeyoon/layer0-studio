import { GlobalStyles } from '@/domain/entities/template.entity';
import type { DesignTokens } from '@/templates/types';

/**
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
    primaryColor: '#C96A3A',         // terra
    secondaryColor: '#231509',       // espresso
    backgroundColor: '#F5F0E8',      // linen — page bg, overlays colors.surface
    fontFamily: "'Pretendard Variable', 'Pretendard', 'Apple SD Gothic Neo', sans-serif",
    fontSize: '16px',
    layout: 'wide',
};

/**
 * Rich layer — the template's full visual identity, **code-owned.** Not copied
 * per Site: the renderer imports this module at serve time, so changing a value
 * here restyles *every* existing Site on this Template, including ones the
 * owner has not touched in months.
 *
 * That is the intended behaviour — it is the only channel for fixing a bad
 * contrast ratio or a rotten font stack across the board. Use it for repairs.
 * For a visual redesign, fork to a new leaf directory instead (a `templateKey`
 * is permanent; see CLAUDE.md "Template system").
 *
 * Block components reference these via `var(--{dim}-{key})`.
 */
export const designTokens: DesignTokens = {
  colors: {
    primary:        '#C96A3A',                    // terra — themable
    secondary:      '#231509',                    // espresso — themable
    'surface':      '#F5F0E8',                    // linen (bg) — themable

    // Tonal siblings of `surface`. Derived, not fixed: the user picks the
    // background, and the card / border steps have to keep their relationship
    // to it or the surfaces invert. Light template → mix toward black.
    'surface-dark': 'color-mix(in srgb, var(--color-surface) 94%, #000)',
    cream:          'color-mix(in srgb, var(--color-surface) 97%, #000)',

    'secondary-soft': '#3D2A1A',                  // espresso-soft
    dust:           '#8C7B6B',
  },
  fonts: {
    base:    "'Pretendard Variable', 'Pretendard', 'Apple SD Gothic Neo', sans-serif",  // themable
    serif:   "'Playfair Display', Georgia, serif",
    display: "'DM Sans', sans-serif",
  },
};
