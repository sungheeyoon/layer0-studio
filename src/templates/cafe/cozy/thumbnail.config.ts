const config = {
  source: 'preview://cafe-cozy',
  viewport: { width: 1600, height: 1000 },
  capture: 'hero',
  output: 'public/thumbnails/template-cafe-cozy.webp',
  resize: { width: 800, height: 500 },
  waitFor: { fonts: true, networkIdle: true, minDelay: 500 },
};

export default config;
