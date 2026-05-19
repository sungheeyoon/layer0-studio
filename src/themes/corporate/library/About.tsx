import { TemplateSectionProps, SectionComponent } from '../../types';
import styles from '../corporate.module.css';
import { getFieldValue } from '@/domain/entities/template.entity';

const About: SectionComponent = function About({ section }: TemplateSectionProps) {
  const { data } = section;
  const title = getFieldValue(data, 'title') || 'About Us';
  const subtitle = getFieldValue(data, 'subtitle') || '';
  const body = getFieldValue(data, 'body') || '';
  const image = getFieldValue(data, 'image');

  return (
    <div className={`${styles.section} ${styles.genericSection}`}>
      <div className="flex flex-col md:flex-row gap-16 items-center">
        <div className={image ? 'md:w-1/2' : 'w-full text-center max-w-2xl mx-auto'}>
          <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-medium block mb-4">Discovery</span>
          <h2 className={styles.sectionTitle}>{title}</h2>
          {subtitle && <p className="text-sm font-medium tracking-wide mb-6 opacity-60 uppercase">{subtitle}</p>}
          <div className={`${styles.sectionBody} whitespace-pre-line`}>{body}</div>
        </div>
        {image && (
          <div className="md:w-1/2">
            <div className="relative group">
              <div className="absolute -inset-4 border border-outline-variant transition-all group-hover:inset-0" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={title} className="w-full relative z-10 grayscale group-hover:grayscale-0 transition-all duration-1000" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

About.meta = {
  componentKey: 'about',
  category: 'content',
  label: 'Corporate About',
  dataSchema: {
    title: { type: 'text', label: 'Section Title', required: true },
    subtitle: { type: 'text', label: 'Subtitle' },
    body: { type: 'textarea', label: 'Description' },
    image: { type: 'image', label: 'Section Image' }
  },
  previewImage: '/component-previews/corporate/about.webp',
};

export default About;
