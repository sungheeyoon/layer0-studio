import { ThemeSectionProps } from '../../types';
import styles from '../fitness.module.css';
import { RulerIcon, DumbbellIcon, ShowerIcon, ClockIcon, ParkingIcon } from './icons';

export default function FacilitySection({ section }: ThemeSectionProps) {
  const { data } = section;
  const label = data['label']?.value || '시설 안내';
  const title = data['title']?.value || '장비가\n결과를\n만듭니다';
  const description = data['description']?.value || '500평 규모의 전문 공간에 최신 피트니스 장비가 완비되어 있습니다. 유산소, 웨이트, 기능성 훈련 구역이 명확히 분리되어 집중력 있는 운동이 가능합니다.';

  const features = [
    { title: data['f1Title']?.value, label: data['f1Label']?.value, icon: <RulerIcon size={18} className="text-[var(--f-lime)]" /> },
    { title: data['f2Title']?.value, label: data['f2Label']?.value, icon: <DumbbellIcon size={18} className="text-[var(--f-lime)]" /> },
    { title: data['f3Title']?.value, label: data['f3Label']?.value, icon: <ShowerIcon size={18} className="text-[var(--f-lime)]" /> },
    { title: data['f4Title']?.value, label: data['f4Label']?.value, icon: <ClockIcon size={18} className="text-[var(--f-lime)]" /> },
    { title: data['f5Title']?.value, label: data['f5Label']?.value, icon: <ParkingIcon size={18} className="text-[var(--f-lime)]" /> },
  ].filter(f => f.title);

  const images = [1, 2, 3].map(n => data[`image${n}`]?.value).filter(Boolean);
  const trustValue = data['trustValue']?.value || '14';
  const trustLabel = data['trustLabel']?.value || 'Years\nof Trust';

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
}
