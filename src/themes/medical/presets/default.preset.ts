import { TemplatePreset } from '../../types';
import { defaultTemplateJson } from '../slots';

const preset: TemplatePreset = {
  slug: 'medical-default',
  templateJson: defaultTemplateJson,
  thumbnailPath: 'public/thumbnails/template-hospital.jpg',
  version: '1.0.0',
  defaults: {
    name: 'Medical',
    description: '깔끔한 의원·클리닉 웹사이트 템플릿. 진료 서비스, 의료진 소개, 예약 안내 포함.',
    category: 'health',
  },
};

export default preset;
