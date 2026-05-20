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

const COLOR_HEX_RE  = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-fA-F])/;
const COLOR_FUNC_RE = /\b(?:rgb|rgba|hsl|hsla)\s*\(/;
const FONT_FAMILY_CSS_RE = /font-family\s*:\s*['"][^'"\n]+['"]/i;

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
    function checkString(node, raw) {
      if (typeof raw !== 'string' || raw.length === 0) return;
      if (COLOR_WHITELIST.has(raw.trim())) return;

      const hexMatch = raw.match(COLOR_HEX_RE);
      if (hexMatch) {
        context.report({ node, messageId: 'inlineColor', data: { match: hexMatch[0] } });
        return;
      }
      const fnMatch = raw.match(COLOR_FUNC_RE);
      if (fnMatch) {
        context.report({ node, messageId: 'inlineColor', data: { match: fnMatch[0] } });
        return;
      }
      const fontMatch = raw.match(FONT_FAMILY_CSS_RE);
      if (fontMatch) {
        context.report({ node, messageId: 'inlineFont', data: { match: fontMatch[0] } });
      }
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
