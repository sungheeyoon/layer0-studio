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
  // Standard convention: `_`-prefixed args/vars are intentionally unused
  // (e.g. signature stability for stub implementations).
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      }],
      // Newer react-hooks plugin (shipped with eslint-config-next) flags
      // `setState(props)` inside an `useEffect([prop])` as an anti-pattern.
      // The dashboard providers use this intentionally to merge server-pushed
      // updates into client state. Downgrade to warning until we refactor —
      // tracked separately, not part of the Tracer pipeline work.
      "react-hooks/set-state-in-effect": "warn",
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
]);

export default eslintConfig;
