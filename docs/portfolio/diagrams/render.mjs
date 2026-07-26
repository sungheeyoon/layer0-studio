import { createRequire } from 'module';
import { readFileSync, readdirSync, mkdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

// Usage: see README. Renders mmd/ -> png/ at 3x.
// Playwright is resolved out of the project install; Chrome is used as the engine
// so no Playwright browser download is needed.
const require = createRequire('file:///C:/dev/layer0-studio/package.json');
const { chromium } = require('playwright');

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, 'mmd');
const OUT = join(HERE, 'png');
const MERMAID = join(HERE, 'node_modules/mermaid/dist/mermaid.min.js');

const FONT = "'Pretendard','Malgun Gothic','Apple SD Gothic Neo',-apple-system,sans-serif";

// 3x. A full-width diagram lands near 3000px, which stays sharp when a PDF of
// this page is zoomed or printed. Raster is the deliverable on purpose — see
// README for why the SVG is not shipped.
const SCALE = 3;

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({
  viewport: { width: 1600, height: 1200 },
  deviceScaleFactor: SCALE,
});
await page.setContent(
  `<!doctype html><html><head><style>
     /* foreignObject labels inherit from the page, not from the SVG theme vars. */
     #out, #out * { font-family: ${FONT} }
   </style></head><body style="margin:0;background:#fff">
     <div id="out" style="display:inline-block"></div>
   </body></html>`,
);
await page.addScriptTag({ path: MERMAID });

// The bundle is an esbuild IIFE; find whichever global it landed on.
const globalName = await page.evaluate(() => {
  if (window.mermaid?.render) return 'mermaid';
  for (const k of Object.keys(window)) {
    if (window[k]?.mermaid?.render) return `${k}.mermaid`;
  }
  return null;
});
if (!globalName) throw new Error('mermaid global not found on the page');
console.log(`mermaid global: window.${globalName}`);

await page.evaluate(
  ({ globalName, font }) => {
    const m = globalName.split('.').reduce((o, k) => o[k], window);
    window.__m = m;
    m.initialize({
      startOnLoad: false,
      theme: 'base',
      fontFamily: font,
      // htmlLabels ON. Labels become foreignObject, so the browser measures the
      // text — the only way CJK box widths come out right. This is exactly what
      // we could not do while the SVG file was a deliverable.
      htmlLabels: true,
      flowchart: { htmlLabels: true, curve: 'basis', nodeSpacing: 45, rankSpacing: 55, padding: 12 },
      themeVariables: {
        fontFamily: font,
        fontSize: '15px',
        primaryColor: '#f8f9fa',
        primaryTextColor: '#212529',
        primaryBorderColor: '#adb5bd',
        secondaryColor: '#f1f3f5',
        tertiaryColor: '#f8f9fa',
        lineColor: '#868e96',
        textColor: '#212529',
        clusterBkg: '#eaf1ff',
        clusterBorder: '#0d6efd',
        edgeLabelBackground: '#ffffff',
      },
    });
  },
  { globalName, font: FONT },
);

const files = readdirSync(SRC).filter((f) => f.endsWith('.mmd')).sort();

for (const file of files) {
  const def = readFileSync(join(SRC, file), 'utf8');
  const id = 'g' + basename(file, '.mmd').replace(/[^a-z0-9]/gi, '');

  // Mermaid emits `style="max-width:NNNpx"` and no width/height attributes, so the
  // element sizes to its container rather than its content. Pin both from the
  // viewBox to get a screenshot cropped exactly to the drawing.
  const [w, h] = await page.evaluate(
    async ({ def, id }) => {
      const { svg } = await window.__m.render(id, def);
      const host = document.getElementById('out');
      host.innerHTML = svg;

      const el = host.querySelector('svg');
      const vb = el.getAttribute('viewBox').split(/[\s,]+/).map(Number);
      const [width, height] = [Math.ceil(vb[2]), Math.ceil(vb[3])];

      el.setAttribute('width', String(width));
      el.setAttribute('height', String(height));
      el.style.maxWidth = 'none';
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
      el.style.background = '#fff';

      await document.fonts.ready;
      return [width, height];
    },
    { def, id },
  );

  const outFile = join(OUT, basename(file, '.mmd') + '.png');
  await page.locator('#out svg').screenshot({ path: outFile });
  console.log(`  ${basename(outFile).padEnd(28)} ${w * SCALE} x ${h * SCALE}`);
}

await browser.close();
console.log(`\ndone -> ${OUT}`);
