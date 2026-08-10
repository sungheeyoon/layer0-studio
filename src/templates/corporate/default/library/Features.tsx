import { TemplateBlockProps, BlockComponent } from '../../../types';
import styles from '../corporate.module.css';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

const featuresSchema = {
  title: { type: 'text', label: 'Block Title', required: true },
  subtitle: { type: 'text', label: 'Subtitle' },
  strategy: { type: 'text', label: 'Strategy' },
  design: { type: 'text', label: 'Design' },
  development: { type: 'text', label: 'Development' },
  analytics: { type: 'text', label: 'Analytics' },
} as const satisfies FieldsSchema;

type FeaturesContent = ValuesOf<typeof featuresSchema>;

/**
 * The cards, in render order — every schema key except the section's own header
 * copy. This used to be `Object.entries(fields)` minus a deny-list, with each
 * card's heading read from the stored Field's `label`. A Value carries no label
 * (ADR-0016 §4), and reading one out of content was exactly the drift the ADR
 * removes: the heading is schema-owned, so it is read from the schema.
 */
const FEATURE_KEYS = ['strategy', 'design', 'development', 'analytics'] as const;

const Features: BlockComponent = function Features({ block }: TemplateBlockProps) {
  const content = block.fields as FeaturesContent;
  const title = content.title || 'Core Features';
  const subtitle = content.subtitle || '';

  const features = FEATURE_KEYS
    .map((key) => ({ key, label: featuresSchema[key].label, body: content[key] ?? '' }))
    .filter((f) => f.body);

  return (
    <div className={styles.section}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-medium block mb-4">Capabilities</span>
          <h2 className={styles.sectionTitle}>{title}</h2>
          {subtitle && <p className="text-sm font-light opacity-60 max-w-lg mx-auto leading-relaxed">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-outline-variant border border-outline-variant">
          {features.map(({ key, label, body }) => (
            <div key={key} className="bg-surface p-10 group hover:bg-primary transition-colors duration-500">
              <span className="text-[0.625rem] font-medium tracking-[0.2em] text-primary group-hover:text-on-primary opacity-40 block mb-6 uppercase">
                {key.padStart(2, '0')}
              </span>
              <h3 className="text-xs font-medium tracking-widest uppercase mb-4 group-hover:text-on-primary transition-colors">
                {label}
              </h3>
              <p className="text-xs font-light leading-relaxed opacity-60 group-hover:text-on-primary group-hover:opacity-80 transition-all">
                {body}
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
  fieldsSchema: featuresSchema,
  previewImage: '/component-previews/corporate/features.webp',
};

export default Features;
