import { TemplateSectionProps, SectionComponent } from '../../../types';
import { HomeIcon, InstagramIcon, YoutubeIcon, ChatIcon, MapPinIcon, PhoneIcon, LetterIcon, ClockIcon } from '../sections/icons';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

const footerSchema = {
  description: { type: 'textarea', label: '브랜드 설명' },
  address: { type: 'text', label: '주소' },
  phone: { type: 'text', label: '전화번호' },
  email: { type: 'text', label: '이메일' },
  hours: { type: 'textarea', label: '운영 시간' },
  copyright: { type: 'text', label: '저작권' },
} as const satisfies FieldsSchema;

type FooterContent = ValuesOf<typeof footerSchema>;

const Footer: SectionComponent = function Footer({ section }: TemplateSectionProps) {
  const content = section.fields as FooterContent;
  const description = content.description || '';
  const address = content.address || '';
  const phone = content.phone || '';
  const email = content.email || '';
  const hours = content.hours || '';
  const copyright = content.copyright || '';

  return (
    <footer style={{ background: 'var(--i-dark-deepest)', borderTop: '1px solid color-mix(in srgb, white 5%, transparent)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--i-gold)] to-yellow-700 flex items-center justify-center">
                <HomeIcon size={15} className="text-[var(--i-dark)]" />
              </span>
              <span className="font-bold text-[15px] tracking-tight text-[var(--i-cream)]">에스파시오</span>
            </div>
            <p className="text-[13px] text-[var(--i-muted)] leading-relaxed mb-5">{description}</p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white hover:bg-opacity-10 transition-colors no-underline" style={{ background: 'color-mix(in srgb, white 6%, transparent)' }}>
                <InstagramIcon size={16} className="text-[var(--i-gold)]" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white hover:bg-opacity-10 transition-colors no-underline" style={{ background: 'color-mix(in srgb, white 6%, transparent)' }}>
                <YoutubeIcon size={16} className="text-[var(--i-gold)]" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white hover:bg-opacity-10 transition-colors no-underline" style={{ background: 'color-mix(in srgb, white 6%, transparent)' }}>
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
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8" style={{ borderTop: '1px solid color-mix(in srgb, white 5%, transparent)' }}>
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
};

Footer.meta = {
  componentKey: 'footer',
  category: 'footer',
  label: 'Interior Footer',
  fieldsSchema: footerSchema,
  previewImage: '/component-previews/interior/footer.webp',
};

export default Footer;
