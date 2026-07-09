import { TemplateSectionProps, SectionComponent, NavSectionProps } from '../../../types';
import styles from '../medical.module.css';
import { ArrowRightIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Nav: SectionComponent = function Nav(props: TemplateSectionProps) {
  const { section } = props;
  const { navItems } = props as NavSectionProps;
  const { fields } = section;
  const brandName = getFieldValue(fields, 'brandName') || 'ARRC';
  const brandSubtext = getFieldValue(fields, 'brandSubtext') || 'Clinic';
  const ctaText = getFieldValue(fields, 'ctaText') || '예약하기';

  return (
    <nav className={styles.navbar}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <a href="#" className="flex flex-col hover:opacity-60 transition-opacity">
            <span className={`${styles.fontDisplay} text-[22px] font-light tracking-[.14em] leading-none`}>{brandName}</span>
            <span className="text-[9px] font-medium tracking-[.22em] text-[var(--m-warm-gray)] uppercase mt-0.5">{brandSubtext}</span>
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-10">
            {navItems.map((item, i) => (
              <a key={i} href={item.href} className="text-[13px] font-medium text-[var(--m-charcoal-mid)] tracking-wide hover:text-[var(--m-charcoal)] transition-colors">
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
  fieldsSchema: {
    brandName: { type: 'text', label: '브랜드 이름' },
    brandSubtext: { type: 'text', label: '보조 텍스트' },
    ctaText: { type: 'text', label: 'CTA 텍스트' },
  },
  previewImage: '/component-previews/medical/nav.webp',
};

export default Nav;
