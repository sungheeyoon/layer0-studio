const config = {
  // Render the real Multi home page through the preset preview route so the
  // thumbnail reflects the actual renderer + tokens + imagery.
  source: 'preview://corporate-multipage',
  viewport: { width: 1600, height: 1000 },
  capture: 'hero',
  output: 'public/thumbnails/template-corporate-multipage.webp',
  resize: { width: 800, height: 500 },
  waitFor: { fonts: true, networkIdle: true, minDelay: 500 },
};

export default config;
