import { TemplatePreset } from '../../types';
import { defaultTemplateJson } from '../slots';

const preset: TemplatePreset = {
  slug: 'interior-default',
  templateJson: defaultTemplateJson,
  thumbnailPath: 'public/thumbnails/template-interior.jpg',
  version: '1.0.0',
  defaults: {
    name: 'Interior',
    description: '고급스러운 인테리어 디자인 스튜디오 템플릿. 포트폴리오, 서비스, 프로세스 섹션 포함.',
    category: 'design',
  },
};

export default preset;
