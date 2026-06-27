/**
 * register-css-stub — let template modules load under tsx (Node CJS) for
 * validation / sync.
 *
 * Template renderers do `import styles from './x.module.css'`. Under tsx the
 * `.css` file falls through to the JS compile path and Node tries to parse it
 * as JavaScript, crashing on the leading `@import url(...)`. This is the root
 * cause of the long-standing `template:sync` breakage and the `template:verify`
 * validate-json crash.
 *
 * Validation / sync only need the module's `library` / `meta` / `preset` — never
 * the actual CSS class strings — so we register a require hook that maps every
 * `.css` import to an identity Proxy (`styles.foo` → `"foo"`, mirroring how
 * CSS-modules class names read at runtime). Side-effect-only imports
 * (`import './globals.css'`) just get the harmless stub.
 *
 * **Side-effect import — must run before any template module is dynamically
 * imported.** Put `import './lib/register-css-stub';` as the FIRST import in any
 * script that loads template modules under tsx (sync, verify).
 */
import { createRequire } from 'module';

// In tsx CJS mode `require.extensions` is present; fall back to createRequire
// so this also resolves when evaluated as an ES module.
const req =
  typeof require !== 'undefined'
    ? require
    : createRequire(import.meta.url);

const cssStub = new Proxy(
  {},
  {
    get(_target, prop) {
      // CSS-modules access (`styles.someClass`) returns the key as its class
      // name; default import returns the Proxy itself.
      return typeof prop === 'string' ? prop : undefined;
    },
  },
);

const extensions = (req as unknown as { extensions?: Record<string, (m: NodeModule, filename: string) => void> }).extensions;

if (extensions) {
  for (const ext of ['.css']) {
    extensions[ext] = (module: NodeModule) => {
      (module as { exports: unknown }).exports = cssStub;
    };
  }
}
