import { TemplateSectionProps, SectionComponent } from '../../types';
import styles from '../cafe.module.css';
import { MapPointIcon, PhoneIcon, ClockIcon, InstagramIcon, YoutubeIcon, BlogIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Footer: SectionComponent = function Footer({ section }: TemplateSectionProps) {
  const { data } = section;
  const brandName = getFieldValue(data, 'brandName') || 'MONO';
  const brandSubtext = getFieldValue(data, 'brandSubtext') || 'Specialty Coffee & Bakery';
  const description = getFieldValue(data, 'description') || '';
  const phone = getFieldValue(data, 'phone') || '';
  const address = getFieldValue(data, 'address') || '';
  const weekdayHours = getFieldValue(data, 'weekdayHours') || '';
  const weekendHours = getFieldValue(data, 'weekendHours') || '';
  const copyright = getFieldValue(data, 'copyright') || '';
  const businessInfo = getFieldValue(data, 'businessInfo') || '';

  return (
    <footer className="bg-[var(--c-espresso)] border-t border-[var(--c-linen)] border-opacity-5 pt-16 pb-10 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div>
            <div className="mb-5">
              <span className={`${styles.fontSerif} font-bold italic text-[26px] text-[var(--c-linen)] tracking-[.14em] block leading-none`}>
                {brandName}
              </span>
              <span className="text-[9px] font-medium tracking-[.22em] text-[var(--c-dust)] uppercase mt-0.5 block">
                {brandSubtext}
              </span>
            </div>
            <p className="text-[var(--c-linen)] opacity-35 text-[12px] leading-relaxed mb-6 whitespace-pre-line">
              {description}
            </p>
            <div className="flex gap-2.5">
              <a href="#" aria-label="Instagram" className="w-8 h-8 flex items-center justify-center border border-[var(--c-linen)] border-opacity-10 text-[var(--c-linen)] opacity-35 spring hover:border-[var(--c-terra)] hover:text-[var(--c-terra)] hover:opacity-100">
                <InstagramIcon size={15} />
              </a>
              <a href="#" aria-label="Youtube" className="w-8 h-8 flex items-center justify-center border border-[var(--c-linen)] border-opacity-10 text-[var(--c-linen)] opacity-35 spring hover:border-[var(--c-terra)] hover:text-[var(--c-terra)] hover:opacity-100">
                <YoutubeIcon size={15} />
              </a>
              <a href="#" aria-label="Blog" className="w-8 h-8 flex items-center justify-center border border-[var(--c-linen)] border-opacity-10 text-[var(--c-linen)] opacity-35 spring hover:border-[var(--c-terra)] hover:text-[var(--c-terra)] hover:opacity-100">
                <BlogIcon size={15} />
              </a>
            </div>
          </div>

          {/* Menu links */}
          <div>
            <h4 className="text-[var(--c-linen)] opacity-60 text-[10px] font-semibold tracking-[.16em] uppercase mb-5">메뉴</h4>
            <ul className="space-y-3 list-none p-0 m-0">
              {['에스프레소 & 라떼', '핸드드립', '시즌 드링크', '홈메이드 베이커리', '원두 구매'].map(item => (
                <li key={item}>
                  <a href="#" className="text-[var(--c-linen)] opacity-35 text-[13px] spring hover:opacity-70 no-underline">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About links */}
          <div>
            <h4 className="text-[var(--c-linen)] opacity-60 text-[10px] font-semibold tracking-[.16em] uppercase mb-5">카페 정보</h4>
            <ul className="space-y-3 list-none p-0 m-0">
              <li><a href="#story" className="text-[var(--c-linen)] opacity-35 text-[13px] spring hover:opacity-70 no-underline">카페 소개</a></li>
              <li><a href="#space" className="text-[var(--c-linen)] opacity-35 text-[13px] spring hover:opacity-70 no-underline">공간 안내</a></li>
              <li><a href="#" className="text-[var(--c-linen)] opacity-35 text-[13px] spring hover:opacity-70 no-underline">로스팅 이야기</a></li>
              <li><a href="#" className="text-[var(--c-linen)] opacity-35 text-[13px] spring hover:opacity-70 no-underline">공지사항</a></li>
              <li><a href="#visit" className="text-[var(--c-linen)] opacity-35 text-[13px] spring hover:opacity-70 no-underline">오시는 길</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[var(--c-linen)] opacity-60 text-[10px] font-semibold tracking-[.16em] uppercase mb-5">위치 & 연락</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-[var(--c-linen)] opacity-35">
                <MapPointIcon size={15} className="text-[var(--c-terra)] shrink-0 mt-0.5 fill-current" />
                <p className="text-[12px] leading-relaxed whitespace-pre-line m-0">{address}</p>
              </div>
              <div className="flex items-center gap-3 text-[var(--c-linen)] opacity-35">
                <PhoneIcon size={15} className="text-[var(--c-terra)] shrink-0 fill-current" />
                <p className="text-[12px] m-0">{phone}</p>
              </div>
              <div className="flex items-start gap-3 text-[var(--c-linen)] opacity-35">
                <ClockIcon size={15} className="text-[var(--c-terra)] shrink-0 mt-0.5 fill-current" />
                <div className="text-[12px] leading-relaxed m-0">
                  <p className="m-0">{weekdayHours}</p>
                  <p className="m-0">{weekendHours}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--c-linen)] border-opacity-5 pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-[var(--c-linen)] opacity-20 text-[11px] m-0">
            {copyright} &nbsp;|&nbsp; {businessInfo}
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-[var(--c-linen)] opacity-20 text-[11px] spring hover:opacity-45 no-underline">개인정보처리방침</a>
            <a href="#" className="text-[var(--c-linen)] opacity-20 text-[11px] spring hover:opacity-45 no-underline">이용약관</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

Footer.meta = {
  componentKey: 'footer',
  category: 'footer',
  label: 'Footer',
  dataSchema: {
    brandName: { type: 'text', label: '브랜드 이름', required: true },
    brandSubtext: { type: 'text', label: '브랜드 보조텍스트' },
    description: { type: 'textarea', label: '브랜드 설명' },
    phone: { type: 'text', label: '전화번호' },
    address: { type: 'textarea', label: '주소' },
    weekdayHours: { type: 'text', label: '평일 영업시간' },
    weekendHours: { type: 'text', label: '주말 영업시간' },
    copyright: { type: 'text', label: '저작권' },
    businessInfo: { type: 'text', label: '사업자 정보' },
  },
  previewImage: '/component-previews/cafe/footer.webp',
};

export default Footer;
