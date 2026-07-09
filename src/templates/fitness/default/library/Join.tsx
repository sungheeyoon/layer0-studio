import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../fitness.module.css';
import { PhoneIcon, MapPinIcon, ClockIcon, ChatIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Join: SectionComponent = function Join({ section }: TemplateSectionProps) {
  const { fields } = section;
  const label = getFieldValue(fields, 'eyebrow') || '무료 체험';
  const titleLine1 = getFieldValue(fields, 'title1') || '지금 시작하면';
  const titleLine2 = getFieldValue(fields, 'title2') || '첫 주가 무료';
  const description = getFieldValue(fields, 'description') || '';
  const bgImage = getFieldValue(fields, 'backgroundImage') || '';
  const phone = getFieldValue(fields, 'phone') || '02-555-9876';
  const address = getFieldValue(fields, 'address') || '';
  const hours = getFieldValue(fields, 'hours') || '';

  return (
    <section className="relative overflow-hidden py-32 lg:py-52" id="join">
      {/* Background image */}
      {bgImage && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={bgImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-[var(--f-void)]/88 pointer-events-none"></div>

      {/* Lime glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--f-lime) 7%, transparent) 0%, transparent 70%)' }}
      ></div>

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <div>
          <p className={`${styles.sectionLabel} justify-center mb-6`}>{label}</p>
          <h2
            className={`${styles.fontCondensed} font-black uppercase text-[var(--f-snow)] leading-[.9] mb-6`}
            style={{ fontSize: 'clamp(3rem, 7vw, 6rem)' }}
          >
            {titleLine1}<br />
            <span style={{ color: 'var(--f-lime)' }}>{titleLine2}</span>
          </h2>
          <p className="text-[var(--f-soft)] text-[15px] leading-[1.85] mb-10 max-w-xl mx-auto">
            {description}
          </p>

          {/* Contact row */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-10 text-[var(--f-soft)] text-[13px]">
            <span className="flex items-center gap-2">
              <PhoneIcon size={15} className="text-[var(--f-lime)]" />
              {phone}
            </span>
            <span className="flex items-center gap-2">
              <MapPinIcon size={15} className="text-[var(--f-lime)]" />
              {address}
            </span>
            <span className="flex items-center gap-2">
              <ClockIcon size={15} className="text-[var(--f-lime)]" />
              {hours}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <a href={`tel:${phone}`}>
              <button className={`${styles.btnLime} px-10 py-4 text-[13px]`}>
                <PhoneIcon size={17} />
                <span>전화로 예약</span>
              </button>
            </a>
            <button className={`${styles.btnOutline} px-10 py-4 text-[13px]`}>
              <ChatIcon size={17} />
              <span>카카오 상담</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

Join.meta = {
  componentKey: 'join',
  category: 'contact',
  label: 'Fitness Join',
  fieldsSchema: {
    eyebrow: { type: 'text', label: '섹션 라벨' },
    title1: { type: 'text', label: '타이틀 1행', required: true },
    title2: { type: 'text', label: '타이틀 2행 (강조)', required: true },
    description: { type: 'textarea', label: '설명' },
    backgroundImage: { type: 'image', label: '배경 이미지', required: true },
    phone: { type: 'text', label: '전화번호' },
    address: { type: 'text', label: '위치' },
    hours: { type: 'text', label: '운영 시간' },
  },
  previewImage: '/component-previews/fitness/join.webp',
};

export default Join;
