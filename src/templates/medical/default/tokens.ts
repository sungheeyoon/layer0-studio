import { GlobalStyles } from '@/domain/entities/template.entity';

/**
 * Thin layer — **the user's copy.** Deep-copied into the Site's `content` at
 * creation, so editing a value here never reaches a Site that already exists.
 *
 * This Template has not migrated to rich `designTokens` (ADR-0005), so its
 * palette lives in its `.module.css` instead. That file **is** code-owned:
 * editing a colour there restyles every existing Site on this Template. The
 * fields below reach it through the legacy `var(--theme-<axis>, …)`
 * fallbacks — see `globalStylesToThemeVars` in
 * `src/lib/template/design-tokens.ts`.
 */
export const defaultGlobalStyles: GlobalStyles = {
  primaryColor: '#1C1917', // charcoal
  secondaryColor: '#C8A97E', // gold
  backgroundColor: '#F9F7F3', // cream — page bg
  fontFamily: "'Pretendard Variable', 'Pretendard', 'Apple SD Gothic Neo', sans-serif",
  fontSize: '16px',
  layout: 'wide',
};
