import { ThemeSectionProps } from '../../types';
import styles from '../fitness.module.css';
import { PhoneIcon, MapPinIcon, ClockIcon, ChatIcon } from './icons';

export default function JoinSection({ section }: ThemeSectionProps) {
  const { data } = section;
  const label = data['label']?.value || '무료 체험';
  const titleLine1 = data['title1']?.value || '지금 시작하면';
  const titleLine2 = data['title2']?.value || '첫 주가 무료';
  const description = data['description']?.value || '트레이너 상담부터 시설 이용, 그룹 클래스까지 조건 없이 7일 무료 체험을 제공합니다. 마음에 드셔야 결제하시면 됩니다.';
  const bgImage = data['backgroundImage']?.value || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=70';
  const phone = data['phone']?.value || '02-555-9876';
  const address = data['address']?.value || '서울 강남구 역삼동 823-14 B1–2F';
  const hours = data['hours']?.value || '매일 05:00 – 24:00';

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
        style={{ background: 'radial-gradient(circle, rgba(205, 255, 0, 0.07) 0%, transparent 70%)' }}
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
}
