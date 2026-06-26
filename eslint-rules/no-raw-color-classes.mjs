/**
 * ESLint custom rule: `local/no-raw-color-classes`.
 *
 * Studio chrome must paint exclusively from the shadcn semantic token
 * vocabulary (bg-background, text-foreground, text-muted-foreground,
 * bg-card, border-border, bg-primary, …) — ADR-0011.
 *
 * This rule flags, inside className string/template literals:
 *   1. Raw Tailwind palette colors with a numeric scale — both grays
 *      (text-zinc-400, bg-neutral-100, …) AND chromatic palettes
 *      (text-red-500, bg-blue-400, text-amber-600, …). These bypass the token
 *      system; use a semantic token instead (text-destructive for reds,
 *      text-success / text-warning for status greens / ambers, bg-primary for
 *      brand indigo, …). The grays were the original WCAG-AA contrast source.
 *   2. Legacy Material-Design-3 utility stems that no longer resolve to a
 *      real token after the @theme rewrite (text-outline, bg-surface,
 *      text-on-surface, *-container, *-fixed, …).
 *   3. Legacy font utilities (font-body / font-headline / font-label).
 *
 * It deliberately does NOT flag the shadcn semantic tokens
 * (primary, secondary-foreground, muted, accent, card, popover, border,
 * input, ring, destructive, background, foreground, sidebar, chart-N).
 *
 * Scope (wired in eslint.config.mjs): src/app + src/components, excluding
 * src/components/ui/** (generated shadcn primitives) and src/templates/**
 * (covered by no-inline-design-tokens). Variant prefixes (dark:, hover:, …)
 * are matched transparently since we match the utility core as a substring.
 */

const UTIL =
  "text|bg|border|ring|fill|stroke|divide|from|via|to|outline|placeholder|caret|accent|decoration|ring-offset|shadow";

// 1. Raw Tailwind palette colors with numeric scale — grays + chromatics.
//    Semantic tokens (primary/destructive/success/warning/muted/…) carry no
//    numeric scale, so they never match.
const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const RAW_GRAY_RE = new RegExp(`\\b(?:${UTIL})-(?:${PALETTE})-\\d{1,3}\\b`, "g");

// 2. Legacy MD3 utility stems (unique to the old dump — no shadcn collision).
const MD3_STEM =
  "outline(?:-variant)?|surface(?:-tint|-variant|-bright|-dim|-container[a-z-]*)?|on-surface(?:-variant)?|on-background|on-primary(?:-container)?|on-secondary(?:-container)?|on-tertiary(?:-container)?|on-error(?:-container)?|inverse-surface|inverse-on-surface|inverse-primary|primary-container|secondary-container|tertiary(?:-container)?|error-container|primary-fixed(?:-dim)?|secondary-fixed(?:-dim)?|tertiary-fixed(?:-dim)?|on-[a-z-]+-fixed(?:-variant)?";
const MD3_RE = new RegExp(`\\b(?:text|bg|border|fill|stroke|ring|divide)-(?:${MD3_STEM})\\b`, "g");

// 2b. `text-secondary` (MD3 mid-gray text) — but allow shadcn bg-secondary
//     and text-secondary-foreground.
const MD3_SECONDARY_TEXT_RE = /\btext-secondary\b(?!-foreground)/g;

// 3. Legacy font utilities.
const LEGACY_FONT_RE = /\bfont-(?:body|headline|label)\b/g;

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow raw Tailwind gray classes and legacy MD3 utilities in Studio chrome; use shadcn semantic tokens (ADR-0011).",
    },
    schema: [],
    messages: {
      rawColor:
        'Raw/legacy color class "{{match}}" — use a shadcn semantic token (bg-background, text-foreground, text-muted-foreground, bg-card, border-border, bg-primary, …). ADR-0011.',
    },
  },

  create(context) {
    function reportAll(node, raw, re) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(raw)) !== null) {
        context.report({ node, messageId: "rawColor", data: { match: m[0] } });
      }
    }

    function checkString(node, raw) {
      if (typeof raw !== "string" || raw.length === 0) return;
      reportAll(node, raw, RAW_GRAY_RE);
      reportAll(node, raw, MD3_RE);
      reportAll(node, raw, MD3_SECONDARY_TEXT_RE);
      reportAll(node, raw, LEGACY_FONT_RE);
    }

    return {
      Literal(node) {
        if (typeof node.value === "string") checkString(node, node.value);
      },
      TemplateElement(node) {
        checkString(node, node.value?.cooked ?? "");
      },
    };
  },
};

export default rule;
