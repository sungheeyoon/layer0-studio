import { ThemeSectionProps, SectionComponent } from '../../types';
import styles from '../medical.module.css';
import { MapPointIcon, PhoneIcon, ClockIcon, InstagramIcon, YoutubeIcon, BlogIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Footer: SectionComponent = function Footer({ section }: ThemeSectionProps) {
  const { data } = section;
  const brandName = getFieldValue(data, 'brandName') || 'ARRC';
  const brandSubtext = getFieldValue(data, 'brandSubtext') || 'Clinic';
  const description = getFieldValue(data, 'description') || '';
  const address = getFieldValue(data, 'address') || '';
  const phone = getFieldValue(data, 'phone') || '';
  const hours = getFieldValue(data, 'hours') || '';
  const copyright = getFieldValue(data, 'copyright') || '';
  const businessNum = getFieldValue(data, 'businessNum') || '';
  const representative = getFieldValue(data, 'representative') || '';

  return (
    <footer className="bg-[#1C1917] border-t border-[#F9F7F3]/[0.06] pt-16 pb-10 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand col */}
          <div>
            <div className="mb-5">
              <span className={`${styles.fontDisplay} text-[26px] font-light tracking-[.14em] text-[#F9F7F3] block leading-none`}>{brandName}</span>
              <span className="text-[9px] font-medium tracking-[.22em] text-[#9C9189] uppercase">{brandSubtext}</span>
            </div>
            <p className="text-[#F9F7F3]/35 text-[12px] leading-relaxed mb-6 whitespace-pre-line">
              {description}
            </p>
            <div className="flex gap-2.5">
              <a href="#" aria-label="Instagram" className="w-8 h-8 flex items-center justify-center border border-[#F9F7F3]/10 text-[#F9F7F3]/35 hover:border-[#C8A97E] hover:text-[#C8A97E] transition-all">
                <InstagramIcon size={15} />
              </a>
              <a href="#" aria-label="Youtube" className="w-8 h-8 flex items-center justify-center border border-[#F9F7F3]/10 text-[#F9F7F3]/35 hover:border-[#C8A97E] hover:text-[#C8A97E] transition-all">
                <YoutubeIcon size={15} />
              </a>
              <a href="#" aria-label="Blog" className="w-8 h-8 flex items-center justify-center border border-[#F9F7F3]/10 text-[#F9F7F3]/35 hover:border-[#C8A97E] hover:text-[#C8A97E] transition-all">
                <BlogIcon size={15} />
              </a>
            </div>
          </div>

          {/* Links col */}
          <div>
            <h4 className="text-[#F9F7F3]/65 text-[10px] font-semibold tracking-[.16em] uppercase mb-5">진료 안내</h4>
            <ul className="space-y-3">
              {['리프팅 & 탄력', '레이저 토닝', '보톡스 & 필러', '피부 재생', '안티에이징'].map(item => (
                <li key={item}><a href="#" className="text-[#F9F7F3]/35 text-[13px] hover:text-[#F9F7F3]/70 transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Clinic col */}
          <div>
            <h4 className="text-[#F9F7F3]/65 text-[10px] font-semibold tracking-[.16em] uppercase mb-5">클리닉 정보</h4>
            <ul className="space-y-3">
              <li><a href="#space" className="text-[#F9F7F3]/35 text-[13px] hover:text-[#F9F7F3]/70 transition-colors">클리닉 소개</a></li>
              <li><a href="#team" className="text-[#F9F7F3]/35 text-[13px] hover:text-[#F9F7F3]/70 transition-colors">의료진</a></li>
              <li><a href="#" className="text-[#F9F7F3]/35 text-[13px] hover:text-[#F9F7F3]/70 transition-colors">오시는 길</a></li>
              <li><a href="#" className="text-[#F9F7F3]/35 text-[13px] hover:text-[#F9F7F3]/70 transition-colors">공지사항</a></li>
              <li><a href="#booking" className="text-[#F9F7F3]/35 text-[13px] hover:text-[#F9F7F3]/70 transition-colors">예약 안내</a></li>
            </ul>
          </div>

          {/* Contact col */}
          <div>
            <h4 className="text-[#F9F7F3]/65 text-[10px] font-semibold tracking-[.16em] uppercase mb-5">위치 & 연락처</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-[#F9F7F3]/35">
                <MapPointIcon size={15} className="text-[#C8A97E] shrink-0 mt-1" />
                <p className="text-[12px] leading-relaxed">{address}</p>
              </div>
              <div className="flex items-center gap-3 text-[#F9F7F3]/35">
                <PhoneIcon size={15} className="text-[#C8A97E] shrink-0" />
                <p className="text-[12px]">{phone}</p>
              </div>
              <div className="flex items-start gap-3 text-[#F9F7F3]/35">
                <ClockIcon size={15} className="text-[#C8A97E] shrink-0 mt-1" />
                <div className="text-[12px] leading-relaxed whitespace-pre-line">
                  {hours}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#F9F7F3]/[0.06] pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-[#F9F7F3]/20 text-[11px]">
            {copyright} &nbsp;|&nbsp; 사업자등록번호: {businessNum} &nbsp;|&nbsp; 대표자: {representative}
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-[#F9F7F3]/20 text-[11px] hover:text-[#F9F7F3]/45 transition-colors">개인정보처리방침</a>
            <a href="#" className="text-[#F9F7F3]/20 text-[11px] hover:text-[#F9F7F3]/45 transition-colors">이용약관</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

Footer.meta = {
  componentKey: 'footer',
  category: 'footer',
  label: 'Medical Footer',
  dataSchema: {
    brandName: { type: 'text', label: '브랜드 이름' },
    brandSubtext: { type: 'text', label: '보조 텍스트' },
    description: { type: 'text', label: '설명' },
    address: { type: 'text', label: '주소' },
    phone: { type: 'text', label: '전화번호' },
    hours: { type: 'textarea', label: '운영 시간' },
    copyright: { type: 'text', label: '저작권' },
    businessNum: { type: 'text', label: '사업자 번호' },
    representative: { type: 'text', label: '대표자' },
  },
  previewImage: '/component-previews/medical/footer.webp',
};

export default Footer;
