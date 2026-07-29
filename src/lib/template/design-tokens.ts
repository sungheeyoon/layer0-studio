import type { DesignTokens } from '@/templates/types';
import type { GlobalStyles } from '@/domain/entities/template.entity';

/**
 * Map each `DesignTokens` dimension to its CSS custom property prefix
 * (singular form). `colors.primary` → `--color-primary`, etc.
 */
const PREFIX_BY_DIMENSION: Record<keyof DesignTokens, string> = {
  colors:     '--color-',
  fonts:      '--font-',
  spacing:    '--spacing-',
  radius:     '--radius-',
  shadows:    '--shadow-',
  typography: '--typography-',
};

/**
 * Mapping from the *thin*, user-editable `GlobalStyles` to the
 * specific CSS custom properties that overlay the template's rich
 * `DesignTokens`. Templates that want a particular axis to be themable must
 * name their token accordingly (e.g. `colors.primary`, `fonts.base`).
 */
const OVERLAY_MAP: Readonly<Partial<Record<keyof GlobalStyles, string>>> = {
  primaryColor:    '--color-primary',
  secondaryColor:  '--color-secondary',
  backgroundColor: '--color-surface',
  fontFamily:      '--font-base',
  fontSize:        '--font-size',
};

function normalizePretendardFamily(value: string): string {
  if (/(['"])Pretendard Variable\1/.test(value)) return value;

  const quotedLegacyFamily = /(['"])Pretendard\1/;
  if (quotedLegacyFamily.test(value)) {
    return value.replace(
      quotedLegacyFamily,
      (family) => `${family[0]}Pretendard Variable${family[0]}, ${family}`,
    );
  }

  return value.replace(
    /\bPretendard\b(?!\s+Variable)/,
    "'Pretendard Variable', Pretendard",
  );
}

/**
 * The legacy channel, for Templates that ship no `designTokens`: their
 * `.module.css` reads `var(--theme-<axis>, <fallback>)`, and every render path
 * (public Site, Site preview, preset preview, editor) spreads this object onto
 * the wrapper. Kept beside `OVERLAY_MAP` because the two are the same decision
 * — *which globalStyles axes are themable* — expressed for the two paths.
 */
export function globalStylesToThemeVars(gs: GlobalStyles): Record<string, string> {
  return {
    '--theme-primary': gs.primaryColor,
    '--theme-secondary': gs.secondaryColor,
    '--theme-bg': gs.backgroundColor,
    '--theme-font-family': gs.fontFamily,
    '--theme-font-size': gs.fontSize,
  };
}

/**
 * Convert a template's rich `DesignTokens` to a flat CSS custom property
 * object suitable for spreading into `style={{}}` on the template root.
 *
 * If `overrides` is provided, its globalStyles fields overlay specific
 * tokens (see `OVERLAY_MAP`). Empty / nullish override values are ignored
 * so that the code-defined defaults remain.
 *
 *   const vars = tokensToCssVars(designTokens, content.globalStyles);
 *   <div style={vars}>...</div>
 */
export function tokensToCssVars(
  designTokens: DesignTokens,
  overrides?: Partial<GlobalStyles> | null,
): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const dim of Object.keys(PREFIX_BY_DIMENSION) as Array<keyof DesignTokens>) {
    const entries = designTokens[dim];
    if (!entries) continue;
    const prefix = PREFIX_BY_DIMENSION[dim];
    for (const [key, value] of Object.entries(entries)) {
      vars[`${prefix}${key}`] =
        dim === 'fonts' ? normalizePretendardFamily(value) : value;
    }
  }

  if (overrides) {
    for (const [field, cssVar] of Object.entries(OVERLAY_MAP) as Array<[keyof GlobalStyles, string]>) {
      const value = overrides[field];
      if (value !== undefined && value !== null && value !== '') {
        const stringValue = String(value);
        vars[cssVar] =
          field === 'fontFamily'
            ? normalizePretendardFamily(stringValue)
            : stringValue;
      }
    }
  }

  return vars;
}
