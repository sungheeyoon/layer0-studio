import { TemplatePreset } from '../../types';
import { defaultTemplateJson } from '../slots';

const preset: TemplatePreset = {
  slug: 'wedding-default',
  templateJson: defaultTemplateJson,
  thumbnailPath: 'public/thumbnails/template-wedding.jpg',
  version: '1.0.0',
  defaults: {
    name: 'Wedding',
    description: '감성적인 웨딩 플래너 웹사이트 템플릿. 서비스, 갤러리, 가격 안내, FAQ 포함.',
    category: 'lifestyle',
  },
};

export default preset;
