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
  primaryColor:   '--color-primary',
  secondaryColor: '--color-secondary',
  fontFamily:     '--font-base',
  fontSize:       '--font-size',
};

/**
 * Convert a template's rich `DesignTokens` to a flat CSS custom property
 * object suitable for spreading into `style={{}}` on the template root.
 *
 * If `overrides` is provided, its globalStyles fields overlay specific
 * tokens (see `OVERLAY_MAP`). Empty / nullish override values are ignored
 * so that the code-defined defaults remain.
 *
 *   const vars = tokensToCssVars(designTokens, siteJson.globalStyles);
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
      vars[`${prefix}${key}`] = value;
    }
  }

  if (overrides) {
    for (const [field, cssVar] of Object.entries(OVERLAY_MAP) as Array<[keyof GlobalStyles, string]>) {
      const value = overrides[field];
      if (value !== undefined && value !== null && value !== '') {
        vars[cssVar] = String(value);
      }
    }
  }

  return vars;
}
