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
  primaryColor: '#1B2A4A',   // deep navy — 신뢰
  secondaryColor: '#1F7A5C', // green — 합격/성장
  backgroundColor: '#FFFFFF', // page bg — overlays colors.surface
  fontFamily: "'Pretendard Variable', 'Pretendard', 'Apple SD Gothic Neo', sans-serif",
  fontSize: '16px',
  layout: 'wide',
};

/**
 * Rich layer — the academy template's full visual identity, **code-owned.**
 * Not copied per Site: the renderer imports this module at serve time, so
 * changing a value here restyles *every* existing Site on this Template.
 * That is intended — it is the only channel for a fleet-wide repair (bad
 * contrast, rotten font stack). For a redesign, fork to a new leaf directory.
 *
 * Section components reference these via `var(--color-{key})` / `var(--font-{key})`
 * (see `tokensToCssVars`). Navy establishes 진중·신뢰, green marks 합격/성장,
 * a restrained gold accents 실적 highlights.
 */
export const designTokens: DesignTokens = {
  colors: {
    primary:        '#1B2A4A',   // navy — themable
    secondary:      '#1F7A5C',   // green — themable
    surface:        '#FFFFFF',   // themable — page bg
    // Tonal sibling of `surface`: derived so a user-picked background keeps
    // the panel one step below the page. Light template → mix toward black.
    'surface-soft': 'color-mix(in srgb, var(--color-surface) 97%, #000)',
    // NOT a sibling — an inverted band with its own `on-dark` text. Stays fixed.
    'surface-dark': '#12203B',   // deep navy band (results/CTA)
    ink:            '#1A2233',    // body text
    muted:          '#5B6472',    // secondary text
    // Borders — also a tonal sibling: they separate panels *on* the page, so
    // they have to move with the page.
    line:           'color-mix(in srgb, var(--color-surface) 91%, #000)',
    'on-primary':   '#FFFFFF',
    'on-dark':      '#EAF0F7',    // text on surface-dark
    accent:         '#C9A24B',    // gold — 실적 강조
  },
  fonts: {
    base:    "'Pretendard Variable', 'Pretendard', 'Apple SD Gothic Neo', sans-serif",
    display: "'Pretendard Variable', 'Pretendard', 'Apple SD Gothic Neo', sans-serif",
  },
};
