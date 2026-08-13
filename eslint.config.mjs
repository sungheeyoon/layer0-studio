import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import noInlineDesignTokens from "./eslint-rules/no-inline-design-tokens.mjs";
import noRawColorClasses from "./eslint-rules/no-raw-color-classes.mjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Standard convention: `_`-prefixed args/vars are intentionally unused
  // (e.g. signature stability for stub implementations).
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      }],
    },
  },
  // Token enforcement on template section components.
  // Scope: src/templates/**/*.{ts,tsx} except tokens.ts/template.ts (token definition sites).
  // Severity 'error': all existing templates passed cleanup (#22). Regressions block CI.
  {
    files: ["src/templates/**/*.ts", "src/templates/**/*.tsx"],
    ignores: [
      // Token definition sites — these are the source of truth for color values.
      "src/templates/**/tokens.ts",
      "src/templates/**/tokens.tsx",
      "src/templates/**/template.ts",
      "src/templates/**/template.tsx",
    ],
    plugins: {
      local: { rules: { "no-inline-design-tokens": noInlineDesignTokens } },
    },
    rules: {
      "local/no-inline-design-tokens": "error",
    },
  },
  // Studio chrome must use shadcn semantic tokens, not raw grays / legacy MD3
  // utilities (ADR-0011). Scope: src/app + src/components, except generated
  // shadcn primitives (src/components/ui) and templates (own rule above).
  // Flipped to 'error' once every surface was migrated (count → 0) — the guard
  // now enforces the token vocabulary on all future chrome changes.
  {
    files: ["src/app/**/*.tsx", "src/components/**/*.tsx"],
    ignores: ["src/components/ui/**", "src/templates/**"],
    plugins: {
      local: { rules: { "no-raw-color-classes": noRawColorClasses } },
    },
    rules: {
      "local/no-raw-color-classes": "error",
    },
  },
]);

export default eslintConfig;
