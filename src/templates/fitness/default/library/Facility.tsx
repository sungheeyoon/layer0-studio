import { TemplateBlockProps, BlockComponent } from '../../../types';
import styles from '../fitness.module.css';
import { RulerIcon, DumbbellIcon, ShowerIcon, ClockIcon, ParkingIcon } from '../sections/icons';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

const facilitySchema = {
  eyebrow: { type: 'text', label: '섹션 라벨' },
  title: { type: 'textarea', label: '섹션 타이틀', required: true },
  description: { type: 'textarea', label: '섹션 설명' },
  f1Title: { type: 'text', label: '특징 1 제목' },
  f1Label: { type: 'text', label: '특징 1 라벨' },
  f2Title: { type: 'text', label: '특징 2 제목' },
  f2Label: { type: 'text', label: '특징 2 라벨' },
  f3Title: { type: 'text', label: '특징 3 제목' },
  f3Label: { type: 'text', label: '특징 3 라벨' },
  f4Title: { type: 'text', label: '특징 4 제목' },
  f4Label: { type: 'text', label: '특징 4 라벨' },
  f5Title: { type: 'text', label: '특징 5 제목' },
  f5Label: { type: 'text', label: '특징 5 라벨' },
  image1: { type: 'image', label: '이미지 1' },
  image2: { type: 'image', label: '이미지 2' },
  image3: { type: 'image', label: '이미지 3' },
  trustValue: { type: 'text', label: '신뢰 지수 수치' },
  trustLabel: { type: 'textarea', label: '신뢰 지수 라벨' },
} as const satisfies FieldsSchema;

type FacilityContent = ValuesOf<typeof facilitySchema>;

const Facility: BlockComponent = function Facility({ block }: TemplateBlockProps) {
  const content = block.fields as FacilityContent;
  const label = content.eyebrow || '시설 안내';
  const title = content.title || '장비가\n결과를\n만듭니다';
  const description = content.description || '';

  const features = [
    { title: content.f1Title, label: content.f1Label, icon: <RulerIcon size={18} className="text-[var(--f-lime)]" /> },
    { title: content.f2Title, label: content.f2Label, icon: <DumbbellIcon size={18} className="text-[var(--f-lime)]" /> },
    { title: content.f3Title, label: content.f3Label, icon: <ShowerIcon size={18} className="text-[var(--f-lime)]" /> },
    { title: content.f4Title, label: content.f4Label, icon: <ClockIcon size={18} className="text-[var(--f-lime)]" /> },
    { title: content.f5Title, label: content.f5Label, icon: <ParkingIcon size={18} className="text-[var(--f-lime)]" /> },
  ].filter(f => f.title);

  const images = ([1, 2, 3] as const).map(n => content[`image${n}`]?.url).filter(Boolean);
  const trustValue = content.trustValue || '14';
  const trustLabel = content.trustLabel || 'Years\nof Trust';

  return (
    <section className="bg-[var(--f-surface)] border-y border-[var(--f-border)] overflow-hidden" id="facility">
      <div className="grid lg:grid-cols-[45fr_55fr]">
        {/* Left text */}
        <div className="flex flex-col justify-center px-8 lg:px-14 xl:px-20 py-20 order-2 lg:order-1">
          <div>
            <p className={`${styles.sectionLabel} mb-6`}>{label}</p>
            <h2
              className={`${styles.fontCondensed} font-black uppercase text-[var(--f-snow)] leading-[.92] mb-8`}
              style={{ fontSize: 'clamp(2.4rem, 4.5vw, 4rem)' }}
            >
              {title.split('\n').map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
            </h2>
            <p className="text-[var(--f-soft)] text-[14px] leading-[1.9] mb-10 max-w-[360px]">
              {description}
            </p>
          </div>

          <div className="space-y-0">
            {features.map((f, i) => (
              <div key={i} className={`${styles.statLine} py-5 flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                  {f.icon}
                  <span className="text-[var(--f-snow)] text-[14px] font-medium">{f.title}</span>
                </div>
                <span className={`${styles.fontCondensed} font-bold text-[13px] text-[var(--f-soft)] uppercase tracking-widest`}>
                  {f.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: image grid */}
        <div className="order-1 lg:order-2 grid grid-cols-2 grid-rows-2 gap-1" style={{ minHeight: '520px' }}>
          {images[0] && (
            <div className="overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[0]} alt="Facility 1" className="w-full h-full object-cover spring hover:scale-105" />
            </div>
          )}
          {images[1] && (
            <div className="overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[1]} alt="Facility 2" className="w-full h-full object-cover spring hover:scale-105" />
            </div>
          )}
          {images[2] && (
            <div className="overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[2]} alt="Facility 3" className="w-full h-full object-cover spring hover:scale-105" />
            </div>
          )}
          <div className="overflow-hidden bg-[var(--f-lime)]/5 flex items-center justify-center p-8">
            <div className="text-center">
              <p className={`${styles.fontCondensed} font-black text-[var(--f-lime)]`} style={{ fontSize: '3.5rem', lineHeight: 1 }}>
                {trustValue}
              </p>
              <p className={`${styles.fontCondensed} font-black text-[var(--f-snow)] uppercase tracking-widest text-[12px] mt-1`}>
                {trustLabel.split('\n').map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

Facility.meta = {
  componentKey: 'facility',
  category: 'content',
  label: 'Fitness Facility',
  fieldsSchema: facilitySchema,
  previewImage: '/component-previews/fitness/facility.webp',
};

export default Facility;
