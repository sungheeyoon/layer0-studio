import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../corporate.module.css';
import { getFieldValue } from '@/domain/entities/template.entity';

const Features: SectionComponent = function Features({ section }: TemplateSectionProps) {
  const { fields } = section;
  const title = getFieldValue(fields, 'title') || 'Core Features';
  const subtitle = getFieldValue(fields, 'subtitle') || '';

  // Filter out non-feature items
  const features = Object.entries(fields).filter(([key]) => !['title', 'subtitle', 'heading'].includes(key));

  return (
    <div className={styles.section}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-medium block mb-4">Capabilities</span>
          <h2 className={styles.sectionTitle}>{title}</h2>
          {subtitle && <p className="text-sm font-light opacity-60 max-w-lg mx-auto leading-relaxed">{subtitle}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-outline-variant border border-outline-variant">
          {features.map(([key, field]) => (
            <div key={key} className="bg-surface p-10 group hover:bg-primary transition-colors duration-500">
              <span className="text-[0.625rem] font-medium tracking-[0.2em] text-primary group-hover:text-on-primary opacity-40 block mb-6 uppercase">
                {key.padStart(2, '0')}
              </span>
              <h3 className="text-xs font-medium tracking-widest uppercase mb-4 group-hover:text-on-primary transition-colors">
                {field.label}
              </h3>
              <p className="text-xs font-light leading-relaxed opacity-60 group-hover:text-on-primary group-hover:opacity-80 transition-all">
                {getFieldValue(fields, key)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

Features.meta = {
  componentKey: 'features',
  category: 'features',
  label: 'Corporate Features',
  fieldsSchema: {
    title: { type: 'text', label: 'Section Title', required: true },
    subtitle: { type: 'text', label: 'Subtitle' },
    strategy: { type: 'text', label: 'Strategy' },
    design: { type: 'text', label: 'Design' },
    development: { type: 'text', label: 'Development' },
    analytics: { type: 'text', label: 'Analytics' }
  },
  previewImage: '/component-previews/corporate/features.webp',
};

export default Features;
