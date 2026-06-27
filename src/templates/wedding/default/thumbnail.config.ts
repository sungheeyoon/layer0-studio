const config = {
  source: 'preview://wedding-default',
  viewport: { width: 1600, height: 900 },
  capture: 'hero',
  output: 'public/thumbnails/template-wedding-default.webp',
  resize: { width: 800, height: 450 },
  waitFor: { fonts: true, networkIdle: true, minDelay: 500 },
};

export default config;
