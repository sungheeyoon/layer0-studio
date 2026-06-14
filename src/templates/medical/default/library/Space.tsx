import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../medical.module.css';
import { BuildingsIcon, SofaIcon, ShieldCheckIcon, MapPointIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Space: SectionComponent = function Space({ section }: TemplateSectionProps) {
  const { data } = section;
  const label = getFieldValue(data, 'eyebrow') || '';
  const title = getFieldValue(data, 'title') || '';
  const description = getFieldValue(data, 'description') || '';
  const mainImage = getFieldValue(data, 'mainImage') || '';
  const subImage = getFieldValue(data, 'subImage') || '';

  const features = [
    { title: getFieldValue(data, 'feature1Title'), desc: getFieldValue(data, 'feature1Desc'), icon: <BuildingsIcon size={22} className="text-[var(--m-gold)]" /> },
    { title: getFieldValue(data, 'feature2Title'), desc: getFieldValue(data, 'feature2Desc'), icon: <SofaIcon size={22} className="text-[var(--m-gold)]" /> },
    { title: getFieldValue(data, 'feature3Title'), desc: getFieldValue(data, 'feature3Desc'), icon: <ShieldCheckIcon size={22} className="text-[var(--m-gold)]" /> },
    { title: getFieldValue(data, 'feature4Title'), desc: getFieldValue(data, 'feature4Desc'), icon: <MapPointIcon size={22} className="text-[var(--m-gold)]" /> },
  ].filter(f => f.title);

  return (
    <section className="bg-[var(--m-charcoal)] overflow-hidden" id="space">
      <div className="grid lg:grid-cols-2 min-h-[80vh]">
        {/* Left: text + feature grid */}
        <div className="flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-20 order-2 lg:order-1">
          <div>
            <p className={styles.sectionLabel} style={{ color: 'var(--m-gold)' }}>{label}</p>
            <h2 className={`${styles.fontDisplay} text-[clamp(2.4rem,4vw,3.8rem)] font-light text-[var(--m-cream)] leading-[1.08] mt-6 mb-8 whitespace-pre-line`}>
              {title}
            </h2>
            <p className="text-[var(--m-cream)]/55 text-[15px] leading-[1.85] max-w-[360px] mb-12 whitespace-pre-line">
              {description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div key={i} className="border border-[var(--m-cream)]/10 p-5 hover:border-[var(--m-gold)]/40 transition-colors group">
                <div className="mb-3 block group-hover:scale-110 transition-transform">{f.icon}</div>
                <p className="text-[var(--m-cream)] text-sm font-medium mb-1">{f.title}</p>
                <p className="text-[var(--m-cream)]/40 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: image collage */}
        <div className="relative order-1 lg:order-2 h-[60vw] max-h-[600px] lg:h-auto lg:max-h-none">
          {mainImage && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={mainImage}
              alt="Clinic Space"
              className="w-full h-full object-cover opacity-75"
            />
          )}
          {/* Inset smaller image */}
          {subImage && (
            <div className="absolute bottom-8 -left-6 lg:-left-12 w-44 lg:w-60 shadow-2xl border-[3px] border-[var(--m-charcoal)]">
              {/* eslint-disable-next-line @next/next/no-img-element */ }
              <img
                src={subImage}
                alt="Clinic Lounge"
                className="w-full h-28 lg:h-40 object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

Space.meta = {
  componentKey: 'space',
  category: 'content',
  label: 'Medical Space',
  dataSchema: {
    eyebrow: { type: 'text', label: '섹션 라벨' },
    title: { type: 'textarea', label: '섹션 타이틀', required: true },
    description: { type: 'textarea', label: '섹션 설명' },
    mainImage: { type: 'image', label: '메인 이미지' },
    subImage: { type: 'image', label: '보조 이미지' },
    feature1Title: { type: 'text', label: '특징 1 제목' },
    feature1Desc: { type: 'text', label: '특징 1 설명' },
    feature2Title: { type: 'text', label: '특징 2 제목' },
    feature2Desc: { type: 'text', label: '특징 2 설명' },
    feature3Title: { type: 'text', label: '특징 3 제목' },
    feature3Desc: { type: 'text', label: '특징 3 설명' },
    feature4Title: { type: 'text', label: '특징 4 제목' },
    feature4Desc: { type: 'text', label: '특징 4 설명' },
  },
  previewImage: '/component-previews/medical/space.webp',
};

export default Space;
