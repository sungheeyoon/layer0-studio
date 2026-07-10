import { GlobalStyles } from '@/domain/entities/template.entity';
import type { DesignTokens } from '@/templates/types';

/**
 * Thin layer — user-editable defaults exposed in the editor.
 * Overlays specific `designTokens` entries via the overlay map in
 * `src/lib/template/design-tokens.ts`:
 *   primaryColor   → --color-primary
 *   secondaryColor → --color-secondary
 *   fontFamily     → --font-base
 *   fontSize       → --font-size
 */
export const defaultGlobalStyles: GlobalStyles = {
  primaryColor: '#1B2A4A',   // deep navy — 신뢰
  secondaryColor: '#1F7A5C', // green — 합격/성장
  fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
  fontSize: '16px',
  layout: 'wide',
};

/**
 * Rich layer — the academy template's full visual identity, code-fixed.
 * Section components reference these via `var(--color-{key})` / `var(--font-{key})`
 * (see `tokensToCssVars`). Navy establishes 진중·신뢰, green marks 합격/성장,
 * a restrained gold accents 실적 highlights.
 */
export const designTokens: DesignTokens = {
  colors: {
    primary:        '#1B2A4A',   // navy — themable
    secondary:      '#1F7A5C',   // green — themable
    surface:        '#FFFFFF',
    'surface-soft': '#F4F7FA',   // light section bg
    'surface-dark': '#12203B',   // deep navy band (results/CTA)
    ink:            '#1A2233',    // body text
    muted:          '#5B6472',    // secondary text
    line:           '#E2E8F0',    // borders
    'on-primary':   '#FFFFFF',
    'on-dark':      '#EAF0F7',    // text on surface-dark
    accent:         '#C9A24B',    // gold — 실적 강조
  },
  fonts: {
    base:    "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
    display: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
  },
};
