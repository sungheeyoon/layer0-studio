import { TemplateSectionProps, SectionComponent } from '../../types';
import styles from '../medical.module.css';
import { ArrowRightIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Nav: SectionComponent = function Nav({ section }: TemplateSectionProps) {
  const { data } = section;
  const brandName = getFieldValue(data, 'brandName') || 'ARRC';
  const brandSubtext = getFieldValue(data, 'brandSubtext') || 'Clinic';
  const ctaText = getFieldValue(data, 'ctaText') || '예약하기';

  const menuItems = [
    { label: getFieldValue(data, 'menu1'), href: '#services' },
    { label: getFieldValue(data, 'menu2'), href: '#space' },
    { label: getFieldValue(data, 'menu3'), href: '#team' },
    { label: getFieldValue(data, 'menu4'), href: '#reviews' },
  ].filter(m => m.label);

  return (
    <nav className={styles.navbar}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <a href="#" className="flex flex-col hover:opacity-60 transition-opacity">
            <span className={`${styles.fontDisplay} text-[22px] font-light tracking-[.14em] leading-none`}>{brandName}</span>
            <span className="text-[9px] font-medium tracking-[.22em] text-[#9C9189] uppercase mt-0.5">{brandSubtext}</span>
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-10">
            {menuItems.map((item, i) => (
              <a key={i} href={item.href} className="text-[13px] font-medium text-[#3C3835] tracking-wide hover:text-[#1C1917] transition-colors">
                {item.label}
              </a>
            ))}
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-4">
            <a href="#booking" className="hidden sm:inline-flex">
              <button className={`${styles.btnDark} text-[11px] tracking-widest px-5 py-3`}>
                <span>{ctaText}</span>
                <ArrowRightIcon size={15} />
              </button>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

Nav.meta = {
  componentKey: 'nav',
  category: 'navigation',
  label: 'Medical Navigation',
  dataSchema: {
    brandName: { type: 'text', label: '브랜드 이름' },
    brandSubtext: { type: 'text', label: '보조 텍스트' },
    menu1: { type: 'text', label: '메뉴 1' },
    menu2: { type: 'text', label: '메뉴 2' },
    menu3: { type: 'text', label: '메뉴 3' },
    menu4: { type: 'text', label: '메뉴 4' },
    ctaText: { type: 'text', label: 'CTA 텍스트' },
  },
  previewImage: '/component-previews/medical/nav.webp',
};

export default Nav;
