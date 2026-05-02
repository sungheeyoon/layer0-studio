import { TemplatePreset } from '../../types';
import { defaultTemplateJson } from '../slots';

const preset: TemplatePreset = {
  slug: 'legal-default',
  templateJson: defaultTemplateJson,
  thumbnailPath: 'public/thumbnails/template-legal.webp',
  version: '1.0.0',
  defaults: {
    name: 'Legal',
    description: '신뢰감 있는 법률·세무 사무소 웹사이트 템플릿. 서비스, 팀, 사례 안내 섹션 포함.',
    category: 'legal',
  },
};

export default preset;
