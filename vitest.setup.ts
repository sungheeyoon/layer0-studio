import '@testing-library/jest-dom/vitest';

// jsdom implements neither of these, and Radix primitives call both while
// measuring and while deciding whether a pointer interaction is real. Without
// them a Dialog throws on open, which would look like a component bug.
//
// Guarded on `window` because the default test environment is still `node`;
// only files carrying `// @vitest-environment jsdom` get a DOM.
// `window` is typed as absent here (this file is also loaded under the default
// `node` environment), so the DOM globals are reached through an untyped alias
// rather than by narrowing — narrowing collapses the type to `never`.
const dom = globalThis as unknown as {
  window?: Record<string, unknown>;
  Element?: { prototype: Record<string, unknown> };
};

if (dom.window && dom.Element) {
  const win = dom.window;
  const proto = dom.Element.prototype;

  win.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  win.matchMedia ??= (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  });

  for (const name of ['hasPointerCapture', 'setPointerCapture', 'releasePointerCapture']) {
    proto[name] ??= () => false;
  }

  proto.scrollIntoView ??= () => {};
}
