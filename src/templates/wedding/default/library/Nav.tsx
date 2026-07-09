import { TemplateSectionProps, SectionComponent, NavSectionProps } from '../../../types';
import styles from '../wedding.module.css';
import { ArrowRightIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Nav: SectionComponent = function Nav(props: TemplateSectionProps) {
  const { section } = props;
  const { navItems } = props as NavSectionProps;
  const { fields } = section;
  const brand = getFieldValue(fields, 'brand') || 'HAUTRE';
  const tagline = getFieldValue(fields, 'tagline') || '';
  const ctaText = getFieldValue(fields, 'ctaText') || '';
  const ctaUrl = getFieldValue(fields, 'ctaUrl') || '#contact';

  return (
    <header className={styles.navWrap}>
      <nav className={styles.navInner}>
        <a href="#" className={styles.navBrand}>
          <span className={styles.navBrandText}>{brand}</span>
          {tagline && (
            <>
              <span className={styles.navDivider} />
              <span className={styles.navTagline}>{tagline}</span>
            </>
          )}
        </a>
        <ul className={styles.navMenu}>
          {navItems.map((item, i) => (
            <li key={i}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>
        {ctaText && (
          <a href={ctaUrl} className={styles.navCta}>
            {ctaText}
            <ArrowRightIcon size={16} />
          </a>
        )}
      </nav>
    </header>
  );
};

Nav.meta = {
  componentKey: 'nav',
  category: 'navigation',
  label: 'Wedding Navigation',
  fieldsSchema: {
    brand: { type: 'text', label: '브랜드 로고' },
    tagline: { type: 'text', label: '브랜드 태그라인' },
    ctaText: { type: 'text', label: 'CTA 버튼' },
    ctaUrl: { type: 'url', label: 'CTA 링크' },
  },
  previewImage: '/component-previews/wedding/nav.webp',
};

export default Nav;
