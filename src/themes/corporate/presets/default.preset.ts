import { TemplatePreset } from '../../types';
import { defaultTemplateJson } from '../slots';

const preset: TemplatePreset = {
  slug: 'corporate-default',
  templateJson: defaultTemplateJson,
  thumbnailPath: 'public/thumbnails/template-corporate.jpg',
  version: '1.0.0',
  defaults: {
    name: 'Corporate',
    description: '전문적인 기업 웹사이트 템플릿. 브랜드 스토리, 서비스 소개, 연락처 섹션 포함.',
    category: 'business',
  },
};

export default preset;
