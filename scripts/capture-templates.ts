import { chromium } from 'playwright';
import { readdirSync, existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import sharp from 'sharp';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { spawn } from 'child_process';
import http from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const THEMES_DIR = join(ROOT, 'src', 'themes');
const OUTPUT_DIR = join(ROOT, 'public', 'thumbnails');

interface ThumbnailConfig {
  source: string;
  viewport: { width: number; height: number };
  capture: 'fullpage' | 'hero' | string;
  output: string;
  resize: { width: number; height: number };
  waitFor: { fonts: boolean; networkIdle: boolean; minDelay: number };
}

async function isServerRunning(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      res.on('data', () => {});
      res.on('end', () => resolve(true));
    });
    req.on('error', () => resolve(false));
  });
}

async function ensureDevServer() {
  const port = 3000;
  if (await isServerRunning(port)) {
    console.log('📡 Dev server already running.');
    return;
  }

  console.log('🚀 Starting dev server...');
  const devServer = spawn('pnpm.cmd', ['dev'], {
    cwd: ROOT,
    stdio: 'ignore',
    detached: true,
    shell: true,
  });
  devServer.unref();

  // Wait for server to be ready
  for (let i = 0; i < 30; i++) {
    if (await isServerRunning(port)) {
      console.log('✅ Dev server ready.');
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error('Timeout waiting for dev server');
}

async function captureTheme(themeKey: string, config: ThumbnailConfig, browser: any, isCheck: boolean): Promise<boolean> {
  const page = await browser.newPage();
  await page.setViewportSize(config.viewport);

  let url = '';
  if (config.source.startsWith('preview://')) {
    const presetKey = config.source.replace('preview://', '');
    url = `http://localhost:3000/preview/preset/${presetKey}`;
  } else if (config.source.startsWith('templates-ui/')) {
    const htmlPath = join(ROOT, config.source);
    url = pathToFileURL(htmlPath).href;
  } else {
    url = config.source;
  }

  console.log(`📸 Capturing [${themeKey}] from ${url}...`);

  await page.goto(url, {
    waitUntil: config.waitFor.networkIdle ? 'networkidle' : 'load',
  });

  if (config.waitFor.fonts) {
    await page.evaluateHandle(() => document.fonts.ready);
  }

  if (config.waitFor.minDelay) {
    await new Promise((resolve) => setTimeout(resolve, config.waitFor.minDelay));
  }

  // Remove animations/transitions for stability
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
      }
    `,
  });

  const outputPath = join(ROOT, config.output);
  const tempPng = outputPath.replace('.webp', '.png');

  let captureOptions: any = { path: tempPng, type: 'png' };
  if (config.capture === 'fullpage') {
    captureOptions.fullPage = true;
  } else if (config.capture !== 'hero') {
    const element = await page.$(config.capture);
    if (element) {
      captureOptions = { ...captureOptions, clip: await element.boundingBox() };
    }
  } else {
    // Default to top area if 'hero' or unknown
    captureOptions.clip = { x: 0, y: 0, width: config.viewport.width, height: config.viewport.height };
  }

  await page.screenshot(captureOptions);

  // Resize and convert to WebP using sharp
  const newWebpBuffer = await sharp(tempPng)
    .resize(config.resize.width, config.resize.height)
    .webp({ quality: 85 })
    .toBuffer();

  // Discard the intermediate PNG once sharp has the buffer.
  try { unlinkSync(tempPng); } catch {}

  let hasVisualChange = true;
  if (existsSync(outputPath)) {
    const oldWebpBuffer = readFileSync(outputPath);
    const newPixels = await sharp(newWebpBuffer).raw().toBuffer();
    const oldPixels = await sharp(oldWebpBuffer).raw().toBuffer();
    
    if (newPixels.equals(oldPixels)) {
      hasVisualChange = false;
    } else {
      // Use pixelmatch for perceptual diff if they are same dimensions
      try {
        const { width, height } = config.resize;
        const diff = new PNG({ width, height });
        const numDiffPixels = pixelmatch(
          new Uint8Array(newPixels),
          new Uint8Array(oldPixels),
          diff.data,
          width,
          height,
          { threshold: 0.1 }
        );
        const diffPercent = (numDiffPixels / (width * height)) * 100;
        if (diffPercent < 0.1) { // 0.1% threshold
          hasVisualChange = false;
        } else {
          console.log(`  [${themeKey}] Visual change detected: ${diffPercent.toFixed(2)}%`);
        }
      } catch (e) {
        // Fallback to hasVisualChange = true if dimensions mismatch etc.
      }
    }
  }

  if (hasVisualChange) {
    if (isCheck) {
      console.error(`❌ [${themeKey}] FAILED: Visual changes detected in --check mode.`);
    } else {
      writeFileSync(outputPath, newWebpBuffer);
      console.log(`✅ Saved → ${config.output}`);
    }
  } else {
    console.log(`⏭️ No visual change for [${themeKey}].`);
  }
  
  await page.close();
  return !hasVisualChange;
}

async function run() {
  const args = process.argv.slice(2);
  const isCheck = args.includes('--check');
  const targetTheme = args.find((a) => !a.startsWith('--'));

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const themeKeys = readdirSync(THEMES_DIR).filter((k) =>
    existsSync(join(THEMES_DIR, k, 'thumbnail.config.ts'))
  );

  const filteredThemes = targetTheme
    ? themeKeys.filter((k) => k === targetTheme)
    : themeKeys;

  if (filteredThemes.length === 0) {
    console.log('No themes with thumbnail.config.ts found.');
    return;
  }

  // Check if any filtered theme needs dev server
  let hasPreviewSource = false;
  const configs: Record<string, ThumbnailConfig> = {};

  for (const key of filteredThemes) {
    const configPath = join(THEMES_DIR, key, 'thumbnail.config.ts');
    const configModule = await import(pathToFileURL(configPath).href);
    const config = configModule.default as ThumbnailConfig;
    configs[key] = config;
    if (config.source.startsWith('preview://')) {
      hasPreviewSource = true;
    }
  }

  if (hasPreviewSource) {
    await ensureDevServer();
  }

  const browser = await chromium.launch();
  let anyFailed = false;

  for (const key of filteredThemes) {
    try {
      const ok = await captureTheme(key, configs[key], browser, isCheck);
      if (!ok && isCheck) anyFailed = true;
    } catch (err) {
      console.error(`❌ Failed to capture ${key}:`, err);
      if (isCheck) anyFailed = true;
    }
  }

  await browser.close();
  
  if (anyFailed && isCheck) {
    console.error('\n💥 Thumbnail check failed for one or more themes.');
    process.exit(1);
  }

  console.log('\n🎉 All captures completed!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
