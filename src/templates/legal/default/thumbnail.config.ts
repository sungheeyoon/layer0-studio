const config = {
  source: 'templates-ui/legal.html',
  viewport: { width: 1600, height: 1000 },
  capture: 'fullpage',
  output: 'public/thumbnails/template-legal-default.webp',
  resize: { width: 800, height: 500 },
  waitFor: { fonts: true, networkIdle: true, minDelay: 500 },
};

export default config;
