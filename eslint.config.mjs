import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import noInlineDesignTokens from "./eslint-rules/no-inline-design-tokens.mjs";

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
  // Token enforcement on template section components.
  // Scope: src/templates/**/*.{ts,tsx} except tokens.ts (the source of truth).
  // Severity: 'warn' for now — existing templates still carry inline literals
  // that will be migrated in the cleanup follow-up. Flip to 'error' once clean.
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
      "local/no-inline-design-tokens": "warn",
    },
  },
]);

export default eslintConfig;
