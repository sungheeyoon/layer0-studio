import { ThemeSectionProps } from '../../types';
import styles from '../fitness.module.css';
import { DumbbellIcon, InstagramIcon, YoutubeIcon, ChatIcon, MapPinIcon, PhoneIcon, ClockIcon } from './icons';

export default function FooterSection({ section }: ThemeSectionProps) {
  const { data } = section;
  const brandName = data['brandName']?.value || 'APEX';
  const brandSubtext = data['brandSubtext']?.value || 'Fitness';
  const description = data['description']?.value || '한계를 다시 정의하는 강남 프리미엄 피트니스 센터';
  const copyright = data['copyright']?.value || `© ${new Date().getFullYear()} APEX FITNESS. All rights reserved.`;
  const businessInfo = data['businessInfo']?.value || '사업자등록번호: 456-78-90123 | 대표: 남준혁';
  
  const address = data['address']?.value || '서울 강남구 역삼동 823-14 에이펙스빌딩 B1–2F';
  const phone = data['phone']?.value || '02-555-9876';
  const hours = data['hours']?.value || '평일·주말 05:00 – 24:00 / 공휴일 06:00 – 22:00';

  return (
    <footer className="bg-[#080808] border-t border-[var(--f-border)] pt-16 pb-10 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className={`${styles.clipCorner} w-8 h-8 bg-[var(--f-lime)] flex items-center justify-center shrink-0`}>
                <DumbbellIcon size={16} className="text-[#080808]" />
              </div>
              <div>
                <span className={`${styles.fontCondensed} font-black text-[20px] tracking-[.12em] text-[var(--f-snow)] uppercase block leading-none`}>
                  {brandName}
                </span>
                <span className="text-[9px] font-medium tracking-[.22em] text-[var(--f-muted)] uppercase">
                  {brandSubtext}
                </span>
              </div>
            </div>
            <p className="text-[var(--f-muted)] text-[12px] leading-relaxed mb-6 whitespace-pre-line">
              {description}
            </p>
            <div className="flex gap-2.5">
              <a href="#" className="w-8 h-8 flex items-center justify-center border border-[var(--f-border)] text-[var(--f-muted)] spring hover:border-[var(--f-lime)] hover:text-[var(--f-lime)]">
                <InstagramIcon size={15} />
              </a>
              <a href="#" className="w-8 h-8 flex items-center justify-center border border-[var(--f-border)] text-[var(--f-muted)] spring hover:border-[var(--f-lime)] hover:text-[var(--f-lime)]">
                <YoutubeIcon size={15} />
              </a>
              <a href="#" className="w-8 h-8 flex items-center justify-center border border-[var(--f-border)] text-[var(--f-muted)] spring hover:border-[var(--f-lime)] hover:text-[var(--f-lime)]">
                <ChatIcon size={15} />
              </a>
            </div>
          </div>

          {/* Programs */}
          <div>
            <h4 className={`${styles.fontCondensed} font-bold text-[11px] tracking-[.18em] uppercase text-[var(--f-soft)] mb-5`}>
              프로그램
            </h4>
            <ul className="space-y-3 list-none p-0 m-0">
              {['퍼스널 트레이닝', '그룹 클래스', '크로스핏', '필라테스', '복싱', '영양 코칭'].map(item => (
                <li key={item}>
                  <a href="#" className="text-[var(--f-muted)] text-[13px] spring hover:text-[var(--f-snow)] no-underline">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className={`${styles.fontCondensed} font-bold text-[11px] tracking-[.18em] uppercase text-[var(--f-soft)] mb-5`}>
              센터 정보
            </h4>
            <ul className="space-y-3 list-none p-0 m-0">
              {['시설 안내', '트레이너', '회원권 안내', '오시는 길', '무료 체험'].map(item => (
                <li key={item}>
                  <a href={`#${item === '시설 안내' ? 'facility' : item === '트레이너' ? 'trainers' : item === '무료 체험' ? 'join' : ''}`} className="text-[var(--f-muted)] text-[13px] spring hover:text-[var(--f-snow)] no-underline">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className={`${styles.fontCondensed} font-bold text-[11px] tracking-[.18em] uppercase text-[var(--f-soft)] mb-5`}>
              위치 & 운영
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-[var(--f-muted)]">
                <MapPinIcon size={15} className="text-[var(--f-lime)] shrink-0 mt-1" />
                <p className="text-[12px] leading-relaxed m-0">{address}</p>
              </div>
              <div className="flex items-center gap-3 text-[var(--f-muted)]">
                <PhoneIcon size={15} className="text-[var(--f-lime)] shrink-0" />
                <p className="text-[12px] m-0">{phone}</p>
              </div>
              <div className="flex items-start gap-3 text-[var(--f-muted)]">
                <ClockIcon size={15} className="text-[var(--f-lime)] shrink-0 mt-1" />
                <div className="text-[12px] leading-relaxed whitespace-pre-line">
                  {hours}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--f-border)] pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-[var(--f-muted)] text-[11px] m-0">
            {copyright} | {businessInfo}
          </p>
          <div className="flex gap-6">
            <a href="/legal/privacy" className="text-[var(--f-muted)] text-[11px] spring hover:text-[var(--f-soft)] no-underline">개인정보처리방침</a>
            <a href="/legal/terms" className="text-[var(--f-muted)] text-[11px] spring hover:text-[var(--f-soft)] no-underline">이용약관</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
