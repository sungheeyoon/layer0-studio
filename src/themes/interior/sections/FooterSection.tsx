import { ThemeSectionProps } from '../../types';
import styles from '../interior.module.css';
import { HomeIcon, InstagramIcon, YoutubeIcon, ChatIcon, MapPinIcon, PhoneIcon, LetterIcon, ClockIcon } from './icons';

export default function FooterSection({ section }: ThemeSectionProps) {
  const { data } = section;
  const description = data['description']?.value || '';
  const address = data['address']?.value || '';
  const phone = data['phone']?.value || '';
  const email = data['email']?.value || '';
  const hours = data['hours']?.value || '';
  const copyright = data['copyright']?.value || '';

  return (
    <footer style={{ background: '#080704', borderTop: '1px solid rgba(255,255,255,.05)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--i-gold)] to-yellow-700 flex items-center justify-center">
                <HomeIcon size={15} className="text-[#0C0A08]" />
              </span>
              <span className="font-bold text-[15px] tracking-tight text-[var(--i-cream)]">에스파시오</span>
            </div>
            <p className="text-[13px] text-[var(--i-muted)] leading-relaxed mb-5">{description}</p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white hover:bg-opacity-10 transition-colors no-underline" style={{ background: 'rgba(255,255,255,.06)' }}>
                <InstagramIcon size={16} className="text-[var(--i-gold)]" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white hover:bg-opacity-10 transition-colors no-underline" style={{ background: 'rgba(255,255,255,.06)' }}>
                <YoutubeIcon size={16} className="text-[var(--i-gold)]" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white hover:bg-opacity-10 transition-colors no-underline" style={{ background: 'rgba(255,255,255,.06)' }}>
                <ChatIcon size={16} className="text-[var(--i-gold)]" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <p className="text-[12px] font-semibold text-[var(--i-cream)] mb-4 tracking-wide uppercase">서비스</p>
            <ul className="space-y-3 text-[13px] text-[var(--i-muted)] list-none p-0 m-0">
              {['주거 인테리어', '상업 공간 디자인', '오피스 인테리어', '공간 컨설팅', 'A/S 서비스'].map(item => (
                <li key={item}><a href="#services" className="hover:text-[var(--i-cream)] transition-colors duration-200 no-underline">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-[12px] font-semibold text-[var(--i-cream)] mb-4 tracking-wide uppercase">회사</p>
            <ul className="space-y-3 text-[13px] text-[var(--i-muted)] list-none p-0 m-0">
              {['스튜디오 소개', '포트폴리오', '진행 과정', '채용 안내', '보도자료'].map(item => (
                <li key={item}><a href="#about" className="hover:text-[var(--i-cream)] transition-colors duration-200 no-underline">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[12px] font-semibold text-[var(--i-cream)] mb-4 tracking-wide uppercase">연락처</p>
            <ul className="space-y-3 text-[13px] text-[var(--i-muted)] list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <MapPinIcon size={14} className="text-[var(--i-gold)] shrink-0 mt-1" />
                {address}
              </li>
              <li className="flex items-center gap-2">
                <PhoneIcon size={14} className="text-[var(--i-gold)] shrink-0" />
                {phone}
              </li>
              <li className="flex items-center gap-2">
                <LetterIcon size={14} className="text-[var(--i-gold)] shrink-0" />
                {email}
              </li>
              <li className="flex items-start gap-2">
                <ClockIcon size={14} className="text-[var(--i-gold)] shrink-0 mt-1" />
                <div className="whitespace-pre-line">{hours}</div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,.05)' }}>
          <p className="text-[12px] text-[var(--i-muted)] m-0">{copyright}</p>
          <div className="flex items-center gap-5 text-[12px] text-[var(--i-muted)]">
            <a href="#" className="hover:text-[var(--i-cream)] transition-colors no-underline">개인정보처리방침</a>
            <a href="#" className="hover:text-[var(--i-cream)] transition-colors no-underline">이용약관</a>
            <a href="#" className="hover:text-[var(--i-cream)] transition-colors no-underline">사업자 정보 확인</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
