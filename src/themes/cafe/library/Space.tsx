import { TemplateSectionProps, SectionComponent } from '../../types';
import styles from '../cafe.module.css';
import { SunIcon, BuildingsIcon, LaptopIcon, BookIcon, VinylIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Space: SectionComponent = function Space({ section }: TemplateSectionProps) {
  const { data } = section;
  const label = getFieldValue(data, 'label') || '공간';
  const title = getFieldValue(data, 'title') || '머물고 싶은\n공간을 만듭니다';
  const description = getFieldValue(data, 'description') || '';

  const imageLarge = getFieldValue(data, 'imageLarge') || '';
  const imageSmall = getFieldValue(data, 'imageSmall') || '';
  const cardTitle = getFieldValue(data, 'cardTitle') || '채광이 좋은 공간';
  const cardDesc = getFieldValue(data, 'cardDesc') || '';

  const features = [
    { title: getFieldValue(data, 'f1Title'), desc: getFieldValue(data, 'f1Desc'), icon: <BuildingsIcon size={20} className="text-[var(--c-terra)] fill-current" /> },
    { title: getFieldValue(data, 'f2Title'), desc: getFieldValue(data, 'f2Desc'), icon: <LaptopIcon size={20} className="text-[var(--c-terra)] fill-current" /> },
    { title: getFieldValue(data, 'f3Title'), desc: getFieldValue(data, 'f3Desc'), icon: <BookIcon size={20} className="text-[var(--c-terra)] fill-current" /> },
    { title: getFieldValue(data, 'f4Title'), desc: getFieldValue(data, 'f4Desc'), icon: <VinylIcon size={20} className="text-[var(--c-terra)] fill-current" /> },
  ].filter(f => f.title);

  return (
    <section className="py-24 lg:py-32 px-6 lg:px-10 max-w-7xl mx-auto" id="space">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
        <div className={`${styles.reveal} ${styles.revealIn}`}>
          <p className={`${styles.sectionLabel} mb-5`}>{label}</p>
          <h2
            className={`${styles.fontSerif} leading-[1.1] text-[var(--c-espresso)]`}
            style={{ fontSize: 'clamp(2.2rem, 4vw, 3.6rem)' }}
          >
            {title.split('\n').map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </h2>
        </div>
        <p className={`${styles.reveal} ${styles.revealIn} text-[var(--c-dust)] text-[14px] leading-relaxed max-w-[280px]`}>
          {description}
        </p>
      </div>

      {/* Asymmetric image grid */}
      <div className="grid grid-cols-12 gap-4 mb-12">
        {/* Large left image */}
        <div className={`${styles.reveal} ${styles.revealIn} col-span-12 lg:col-span-7 overflow-hidden bg-[var(--c-linen-dark)]`} style={{ height: '480px' }}>
          {imageLarge && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageLarge}
              alt="Space 1"
              className="w-full h-full object-cover spring hover:scale-[1.03]"
              loading="lazy"
            />
          )}
        </div>

        {/* Right column: 2 stacked */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
          <div className={`${styles.reveal} ${styles.revealIn} overflow-hidden bg-[var(--c-linen-dark)] flex-1`} style={{ minHeight: '220px' }}>
            {imageSmall && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={imageSmall}
                alt="Space 2"
                className="w-full h-full object-cover spring hover:scale-[1.03]"
                loading="lazy"
              />
            )}
          </div>
          {/* Text card */}
          <div className={`${styles.reveal} ${styles.revealIn} bg-[var(--c-terra)] p-7 flex flex-col justify-between`} style={{ minHeight: '220px' }}>
            <SunIcon size={28} className="text-[var(--c-linen)] opacity-50 fill-current" />
            <div>
              <h3 className={`${styles.fontSerif} italic text-[var(--c-linen)] text-[1.4rem] mb-2`}>{cardTitle}</h3>
              <p className="text-[var(--c-linen)] opacity-70 text-[13px] leading-relaxed whitespace-pre-line">{cardDesc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Space features */}
      <div className={`${styles.reveal} ${styles.revealIn} grid grid-cols-2 md:grid-cols-4 gap-4`}>
        {features.map((f, i) => (
          <div key={i} className="bg-[var(--c-cream)] border border-[var(--c-linen-dark)] p-5 spring hover:border-[var(--c-terra)]/40">
            <div className="mb-3 block">{f.icon}</div>
            <p className="text-[var(--c-espresso)] font-medium text-[13px] mb-1">{f.title}</p>
            <p className="text-[var(--c-dust)] text-[12px] leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

Space.meta = {
  componentKey: 'space',
  category: 'about',
  label: 'Space & Features',
  dataSchema: {
    label: { type: 'text', label: '섹션 라벨' },
    title: { type: 'textarea', label: '섹션 타이틀' },
    description: { type: 'textarea', label: '섹션 설명' },
    imageLarge: { type: 'image', label: '큰 이미지' },
    imageSmall: { type: 'image', label: '작은 이미지' },
    cardTitle: { type: 'text', label: '카드 제목' },
    cardDesc: { type: 'textarea', label: '카드 설명' },
    f1Title: { type: 'text', label: '특징 1 제목' },
    f1Desc: { type: 'text', label: '특징 1 설명' },
    f2Title: { type: 'text', label: '특징 2 제목' },
    f2Desc: { type: 'text', label: '특징 2 설명' },
    f3Title: { type: 'text', label: '특징 3 제목' },
    f3Desc: { type: 'text', label: '특징 3 설명' },
    f4Title: { type: 'text', label: '특징 4 제목' },
    f4Desc: { type: 'text', label: '특징 4 설명' },
  },
  previewImage: '/component-previews/cafe/space.webp',
};

export default Space;
