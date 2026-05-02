import { TemplatePreset } from '../../types';
import { defaultTemplateJson } from '../slots';

const preset: TemplatePreset = {
  slug: 'cafe-default',
  templateJson: defaultTemplateJson,
  thumbnailPath: 'public/thumbnails/template-cafe.jpg',
  version: '1.0.0',
  defaults: {
    name: 'Cafe',
    description: '감각적인 카페·커피숍 웹사이트 템플릿. 메뉴, 공간 소개, 위치 안내 섹션 포함.',
    category: 'food',
  },
};

export default preset;
