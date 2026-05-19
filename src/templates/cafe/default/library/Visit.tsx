import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../cafe.module.css';
import { PhoneIcon, ArrowUpRightIcon, MapPointIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Visit: SectionComponent = function Visit({ section }: TemplateSectionProps) {
  const { data } = section;
  const bgImage = getFieldValue(data, 'backgroundImage') || '';
  const label = getFieldValue(data, 'label') || '방문 안내';
  const title = getFieldValue(data, 'title') || '언제든\n환영합니다';
  const description = getFieldValue(data, 'description') || '';
  const phone = getFieldValue(data, 'phone') || '';
  const instagram = getFieldValue(data, 'instagram') || '#';

  const hours = [1, 2, 3, 4].map(n => ({
    label: getFieldValue(data, `h${n}Label`),
    value: getFieldValue(data, `h${n}Value`),
  })).filter(h => h.label);

  const address = getFieldValue(data, 'address') || '';
  const addressDetail = getFieldValue(data, 'addressDetail') || '';

  return (
    <section className="relative overflow-hidden" id="visit">
      {bgImage && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={bgImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-[var(--c-espresso)] opacity-90 pointer-events-none"></div>
      {/* Warm glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(201, 106, 58, 0.12) 0%, transparent 70%)' }}
      ></div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className={`${styles.reveal} ${styles.revealIn}`}>
            <p className={`${styles.sectionLabel} mb-6`} style={{ color: 'var(--c-terra)' }}>{label}</p>
            <h2
              className={`${styles.fontSerif} leading-[1.08] text-[var(--c-linen)] mb-8`}
              style={{ fontSize: 'clamp(2.4rem, 4.5vw, 4rem)' }}
            >
              {title.split('\n').map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
            </h2>
            <p className="text-[var(--c-linen)] opacity-55 text-[15px] leading-[1.85] mb-10 max-w-[380px] whitespace-pre-line">
              {description}
            </p>
            <div className="flex flex-wrap gap-4">
              {phone && (
                <a href={`tel:${phone}`} className="no-underline">
                  <button className={styles.btnEspresso} style={{ background: 'var(--c-terra)' }}>
                    <PhoneIcon size={16} className="fill-current" />
                    <span>{phone}</span>
                  </button>
                </a>
              )}
              <a href={instagram} className="no-underline">
                <button className={styles.btnGhost} style={{ borderColor: 'rgba(245, 240, 232, 0.2)', color: 'var(--c-linen)' }}>
                  <span>인스타그램</span>
                  <ArrowUpRightIcon size={15} />
                </button>
              </a>
            </div>
          </div>

          {/* Right: hours table */}
          <div className={`${styles.reveal} ${styles.revealIn}`}>
            <h3 className={`${styles.fontSerif} italic text-[var(--c-linen)] opacity-70 text-[1.1rem] mb-6`}>영업 시간</h3>
            <div className="space-y-0">
              {hours.map((h, i) => (
                <div key={i} className={`${styles.hoursRow} flex justify-between items-center py-4 px-2`}>
                  <span className="text-[var(--c-linen)] opacity-60 text-[14px]">{h.label}</span>
                  <span className={`text-[var(--c-linen)] font-medium text-[14px] ${h.label === '라스트 오더' ? 'text-[var(--c-terra)]' : ''}`}>
                    {h.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Address */}
            <div className="mt-8 p-5 border border-[var(--c-linen)] border-opacity-10 bg-[var(--c-linen)] bg-opacity-5">
              <div className="flex items-start gap-3">
                <MapPointIcon size={18} className="text-[var(--c-terra)] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[var(--c-linen)] text-[14px] font-medium mb-1">{address}</p>
                  <p className="text-[var(--c-linen)] opacity-45 text-[12px] leading-relaxed whitespace-pre-line">
                    {addressDetail}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

Visit.meta = {
  componentKey: 'visit',
  category: 'about',
  label: 'Visit Info',
  dataSchema: {
    backgroundImage: { type: 'image', label: '배경 이미지' },
    label: { type: 'text', label: '섹션 라벨' },
    title: { type: 'textarea', label: '섹션 타이틀' },
    description: { type: 'textarea', label: '섹션 설명' },
    phone: { type: 'text', label: '전화번호' },
    instagram: { type: 'url', label: '인스타그램 링크' },
    h1Label: { type: 'text', label: '시간 1 라벨' },
    h1Value: { type: 'text', label: '시간 1 수치' },
    h2Label: { type: 'text', label: '시간 2 라벨' },
    h2Value: { type: 'text', label: '시간 2 수치' },
    h3Label: { type: 'text', label: '시간 3 라벨' },
    h3Value: { type: 'text', label: '시간 3 수치' },
    h4Label: { type: 'text', label: '시간 4 라벨' },
    h4Value: { type: 'text', label: '시간 4 수치' },
    address: { type: 'text', label: '주소' },
    addressDetail: { type: 'textarea', label: '상세 주소/주차' },
  },
  previewImage: '/component-previews/cafe/visit.webp',
};

export default Visit;
