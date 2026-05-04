import { ThemeSectionProps, SectionComponent } from '../../types';
import styles from '../legal.module.css';
import { ShieldCheckIcon, ArrowRightIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Nav: SectionComponent = function Nav({ section }: ThemeSectionProps) {
  const { data } = section;
  const brandName = getFieldValue(data, 'brandName') || '하람';
  const brandSubtext = getFieldValue(data, 'brandSubtext') || 'Law & Tax';
  const phone = getFieldValue(data, 'phone') || '02-3456-7890';
  const ctaText = getFieldValue(data, 'ctaText') || '무료 상담 신청';

  const menuItems = [
    { label: getFieldValue(data, 'menu1'), href: '#about' },
    { label: getFieldValue(data, 'menu2'), href: '#services' },
    { label: getFieldValue(data, 'menu3'), href: '#portfolio' },
    { label: getFieldValue(data, 'menu4'), href: '#process' },
    { label: getFieldValue(data, 'menu5'), href: '#contact' },
  ].filter(m => m.label);

  // Wait, I noticed Nav.tsx didn't have menuItems before in the snippet I read, but let me check again.
  // Actually, I should check the file content again.

  return (
    <header className={styles.navWrap}>
      <nav className={styles.navInner}>
        <a href="#" className="flex items-center gap-2.5 select-none no-underline">
          <div className="w-8 h-8 bg-[#0f172a] rounded-lg flex items-center justify-center flex-shrink-0">
            <ShieldCheckIcon size={16} className="text-amber-400" />
          </div>
          <div>
            <span className="font-bold text-[#0f172a] text-base tracking-tight leading-none block">{brandName}</span>
            <span className="text-stone-500 text-[10px] tracking-widest font-medium uppercase leading-none block mt-0.5">{brandSubtext}</span>
          </div>
        </a>

        <ul className="hidden md:flex items-center gap-1 list-none p-0 m-0">
          <li><a href="#services" className="px-3.5 py-2 text-sm font-medium text-stone-600 hover:text-[#0f172a] rounded-lg hover:bg-stone-100 transition-all duration-200 no-underline">업무 분야</a></li>
          <li><a href="#about" className="px-3.5 py-2 text-sm font-medium text-stone-600 hover:text-[#0f172a] rounded-lg hover:bg-stone-100 transition-all duration-200 no-underline">사무소 소개</a></li>
          <li><a href="#team" className="px-3.5 py-2 text-sm font-medium text-stone-600 hover:text-[#0f172a] rounded-lg hover:bg-stone-100 transition-all duration-200 no-underline">구성원</a></li>
          <li><a href="#process" className="px-3.5 py-2 text-sm font-medium text-stone-600 hover:text-[#0f172a] rounded-lg hover:bg-stone-100 transition-all duration-200 no-underline">진행 절차</a></li>
          <li><a href="#faq" className="px-3.5 py-2 text-sm font-medium text-stone-600 hover:text-[#0f172a] rounded-lg hover:bg-stone-100 transition-all duration-200 no-underline">자주 묻는 질문</a></li>
        </ul>

        <div className="flex items-center gap-2">
          <a href={`tel:${phone}`} className="hidden md:flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-stone-700 hover:text-[#0f172a] transition-colors duration-200 no-underline">
            {phone}
          </a>
          <a href="#contact" className={`${styles.btnPrimary} text-sm py-2.5 px-5 no-underline`}>
            {ctaText}
            <ArrowRightIcon size={16} />
          </a>
        </div>
      </nav>
    </header>
  );
};

Nav.meta = {
  componentKey: 'nav',
  category: 'navigation',
  label: 'Legal Navigation',
  dataSchema: {
    brandName: { type: 'text', label: '사무소 이름' },
    brandSubtext: { type: 'text', label: '보조 텍스트' },
    phone: { type: 'text', label: '전화번호' },
    ctaText: { type: 'text', label: 'CTA 버튼 텍스트' },
  },
  previewImage: '/component-previews/legal/nav.webp',
};

export default Nav;
