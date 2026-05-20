/**
 * ESLint custom rule: `local/no-inline-design-tokens`.
 *
 * Disallows inline hex/rgb/hsl color literals and inline `font-family`
 * strings inside template section components. Visual tokens must be
 * referenced as `var(--*)` (or Tailwind arbitrary values that resolve
 * to the same variables) so the editor's `globalStyles` overrides
 * propagate site-wide.
 *
 * Whitelist: tokens.ts files (exempt at the config layer), plus the
 * CSS keywords transparent/inherit/currentColor/none/initial/unset/revert
 * (these are not "design tokens" — they're CSS semantics).
 *
 * Regex/whitelist intentionally mirror `src/lib/template/inline-tokens.ts`.
 * If you change one, change the other.
 */

// Hex literal must be followed by a non-word char (or end-of-string).
// Without `\w`, `#facility` would match `#fac` since `i` is non-hex; we
// require the next char (if any) to be outside the identifier alphabet.
// Global flags — checkString iterates every match in a string so multi-color
// values (e.g. a gradient `from-[#aaa] to-[#bbb]`) are all reported instead
// of stopping at the first.
const COLOR_HEX_RE  = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?!\w)/g;
const COLOR_FUNC_RE = /\b(?:rgb|rgba|hsl|hsla)\s*\(/g;
const FONT_FAMILY_CSS_RE = /font-family\s*:\s*['"][^'"\n]+['"]/gi;

const COLOR_WHITELIST = new Set([
  'transparent',
  'inherit',
  'currentColor',
  'currentcolor',
  'none',
  'initial',
  'unset',
  'revert',
]);

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow inline color/font literals in template section components; use var(--*) tokens instead.',
    },
    schema: [],
    messages: {
      inlineColor:
        'Inline color literal "{{match}}" — use var(--*) tokens (defined in tokens.ts) instead.',
      inlineFont:
        'Inline font-family "{{match}}" — use var(--font-*) tokens (defined in tokens.ts) instead.',
    },
  },

  create(context) {
    function reportAll(node, raw, re, messageId) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(raw)) !== null) {
        context.report({ node, messageId, data: { match: m[0] } });
      }
    }

    function checkString(node, raw) {
      if (typeof raw !== 'string' || raw.length === 0) return;
      if (COLOR_WHITELIST.has(raw.trim())) return;

      reportAll(node, raw, COLOR_HEX_RE,        'inlineColor');
      reportAll(node, raw, COLOR_FUNC_RE,       'inlineColor');
      reportAll(node, raw, FONT_FAMILY_CSS_RE,  'inlineFont');
    }

    return {
      Literal(node) {
        if (typeof node.value === 'string') checkString(node, node.value);
      },
      TemplateElement(node) {
        checkString(node, node.value?.cooked ?? '');
      },
      // JSX inline style object: { fontFamily: '...' }
      Property(node) {
        const key = node.key;
        const keyName =
          key.type === 'Identifier'
            ? key.name
            : key.type === 'Literal'
              ? key.value
              : null;
        if (keyName !== 'fontFamily') return;
        const v = node.value;
        if (v.type === 'Literal' && typeof v.value === 'string' && v.value.length > 0) {
          const trimmed = v.value.trim();
          // CSS-wide keywords (inherit / initial / unset / revert) are not
          // design tokens — allow them through.
          if (COLOR_WHITELIST.has(trimmed)) return;
          // `var(--font-*)` is the correct pattern — not a literal.
          if (/^var\s*\(/.test(trimmed)) return;
          context.report({
            node: v,
            messageId: 'inlineFont',
            data: { match: v.value },
          });
        }
      },
    };
  },
};

export default rule;
