import { GlobalStyles } from '@/domain/entities/template.entity';
import type { DesignTokens } from '@/templates/types';

/**
 * Thin layer — user-editable defaults exposed in the editor.
 * These overlay specific `designTokens` entries via the overlay map in
 * `src/lib/template/design-tokens.ts`:
 *   primaryColor   → --color-primary
 *   secondaryColor → --color-secondary
 *   fontFamily     → --font-base
 *   fontSize       → --font-size
 */
export const defaultGlobalStyles: GlobalStyles = {
    primaryColor: '#C96A3A',         // terra
    secondaryColor: '#231509',       // espresso
    fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
    fontSize: '16px',
    layout: 'wide',
};

/**
 * Rich layer — the template's full visual identity, code-fixed. AI gen
 * pipeline (Tracer #2/#3) emits this shape directly. Section components
 * reference these via `var(--{dim}-{key})` (see `tokensToCssVars`).
 */
export const designTokens: DesignTokens = {
  colors: {
    primary:        '#C96A3A',                    // terra — themable
    secondary:      '#231509',                    // espresso — themable
    'surface':      '#F5F0E8',                    // linen (bg)
    'surface-dark': '#EBE4D5',                    // linen-dark
    'secondary-soft': '#3D2A1A',                  // espresso-soft
    'primary-dim': 'rgba(201, 106, 58, 0.10)',    // terra @ 10% — static for back-compat
    caramel:        '#B8874A',
    dust:           '#8C7B6B',
    'dust-light':   '#B5A898',
    cream:          '#F0E9DC',
  },
  fonts: {
    base:    "'Pretendard', 'Apple SD Gothic Neo', sans-serif",  // themable
    serif:   "'Playfair Display', Georgia, serif",
    display: "'DM Sans', sans-serif",
  },
};
