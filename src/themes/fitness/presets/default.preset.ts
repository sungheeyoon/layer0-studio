import { TemplatePreset } from '../../types';
import { defaultTemplateJson } from '../slots';

const preset: TemplatePreset = {
  slug: 'fitness-default',
  templateJson: defaultTemplateJson,
  thumbnailPath: 'public/thumbnails/template-fitness.webp',
  version: '1.0.0',
  defaults: {
    name: 'Fitness',
    description: '역동적인 피트니스·헬스장 웹사이트 템플릿. 프로그램, 트레이너 소개, 회원권 안내 포함.',
    category: 'health',
  },
};

export default preset;
