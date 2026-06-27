const config = {
  // Render the real Multi home page through the preset preview route so the
  // thumbnail reflects the actual renderer + tokens + imagery.
  source: 'preview://outdoor-default',
  viewport: { width: 1600, height: 900 },
  capture: 'hero',
  output: 'public/thumbnails/template-outdoor-default.webp',
  resize: { width: 800, height: 450 },
  waitFor: { fonts: true, networkIdle: true, minDelay: 800 },
};

export default config;
