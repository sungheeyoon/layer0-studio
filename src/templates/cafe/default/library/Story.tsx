import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../cafe.module.css';
import { LeafIcon, FireIcon, HandHeartIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Story: SectionComponent = function Story({ section }: TemplateSectionProps) {
  const { data } = section;
  const label = getFieldValue(data, 'label') || '카페 소개';
  const title1 = getFieldValue(data, 'title1') || '커피 한 잔에는';
  const titleAccent = getFieldValue(data, 'titleAccent') || '이야기가';
  const title2 = getFieldValue(data, 'title2') || '담겨 있습니다';
  const quote = getFieldValue(data, 'quote') || '';
  const description = getFieldValue(data, 'description') || '';
  const image = getFieldValue(data, 'image') || '';

  const pillars = [
    { title: getFieldValue(data, 'f1Title'), desc: getFieldValue(data, 'f1Desc'), icon: <LeafIcon size={22} className="text-[var(--color-primary)] fill-current" /> },
    { title: getFieldValue(data, 'f2Title'), desc: getFieldValue(data, 'f2Desc'), icon: <FireIcon size={22} className="text-[var(--color-primary)] fill-current" /> },
    { title: getFieldValue(data, 'f3Title'), desc: getFieldValue(data, 'f3Desc'), icon: <HandHeartIcon size={22} className="text-[var(--color-primary)] fill-current" /> },
  ].filter(p => p.title);

  return (
    <section className="py-24 lg:py-32 bg-[var(--color-secondary)]" id="story">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-20 lg:mb-28">
          {/* Text */}
          <div className={`${styles.reveal} ${styles.revealIn} order-2 lg:order-1`}>
            <p className={`${styles.sectionLabel} mb-6`} style={{ color: 'var(--color-primary)' }}>{label}</p>
            <h2
              className={`${styles.fontSerif} leading-[1.08] text-[var(--color-surface)] mb-8`}
              style={{ fontSize: 'clamp(2.4rem, 4.5vw, 4rem)' }}
            >
              {title1}<br />
              <em style={{ color: 'var(--color-primary)', fontStyle: 'italic' }}>{titleAccent}</em><br />
              {title2}
            </h2>
            <div className={`${styles.quoteLine} pl-6 mb-8`}>
              <p className="text-[var(--color-surface)] opacity-55 text-[15px] leading-[1.9] whitespace-pre-line">
                {quote}
              </p>
            </div>
            <p className="text-[var(--color-surface)] opacity-45 text-[14px] leading-[1.85] whitespace-pre-line">
              {description}
            </p>
          </div>

          {/* Image */}
          <div className={`${styles.reveal} ${styles.revealIn} order-1 lg:order-2`}>
            <div className="aspect-square overflow-hidden" style={{ borderRadius: '8px' }}>
              {image && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={image}
                  alt="Story"
                  className="w-full h-full object-cover spring hover:scale-[1.04]"
                  loading="lazy"
                />
              )}
            </div>
          </div>
        </div>

        {/* Three pillars */}
        <div className={`${styles.reveal} ${styles.revealIn} grid md:grid-cols-3 gap-8 border-t border-[var(--color-surface)] opacity-10 pt-16`}>
          {pillars.map((p, i) => (
            <div key={i} className="opacity-100">
               <div className="w-12 h-12 flex items-center justify-center bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 mb-5">
                {p.icon}
              </div>
              <h3 className={`${styles.fontSerif} text-[var(--color-surface)] text-[1.25rem] italic mb-3`}>{p.title}</h3>
              <p className="text-[var(--color-surface)] opacity-45 text-[13px] leading-relaxed whitespace-pre-line">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

Story.meta = {
  componentKey: 'story',
  category: 'about',
  label: 'Our Story',
  dataSchema: {
    label: { type: 'text', label: '섹션 라벨' },
    title1: { type: 'text', label: '타이틀 1행' },
    titleAccent: { type: 'text', label: '강조 타이틀' },
    title2: { type: 'text', label: '타이틀 2행' },
    quote: { type: 'textarea', label: '인용구' },
    description: { type: 'textarea', label: '설명' },
    image: { type: 'image', label: '섹션 이미지' },
    f1Title: { type: 'text', label: '특징 1 제목' },
    f1Desc: { type: 'textarea', label: '특징 1 설명' },
    f2Title: { type: 'text', label: '특징 2 제목' },
    f2Desc: { type: 'textarea', label: '특징 2 설명' },
    f3Title: { type: 'text', label: '특징 3 제목' },
    f3Desc: { type: 'textarea', label: '특징 3 설명' },
  },
  previewImage: '/component-previews/cafe/story.webp',
};

export default Story;
