import { ThemeSectionProps, SectionComponent } from '../../types';
import styles from '../wedding.module.css';
import { ArrowRightIcon } from '../sections/icons';

const Nav: SectionComponent = function Nav({ section }: ThemeSectionProps) {
  const { data } = section;
  const brand = data['brand']?.value || 'HAUTRE';
  const tagline = data['tagline']?.value || '';
  const ctaText = data['ctaText']?.value || '';
  const ctaUrl = data['ctaUrl']?.value || '#contact';

  const menuItems = [1, 2, 3, 4, 5]
    .map((n) => ({
      label: data[`menu${n}`]?.value || '',
      href: data[`menu${n}Url`]?.value || '#',
    }))
    .filter((m) => m.label);

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
          {menuItems.map((m, i) => (
            <li key={i}>
              <a href={m.href}>{m.label}</a>
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
  dataSchema: {
    brand: { type: 'text', label: '브랜드 로고' },
    tagline: { type: 'text', label: '브랜드 태그라인' },
    menu1: { type: 'text', label: '메뉴 1' },
    menu1Url: { type: 'url', label: '메뉴 1 링크' },
    menu2: { type: 'text', label: '메뉴 2' },
    menu2Url: { type: 'url', label: '메뉴 2 링크' },
    menu3: { type: 'text', label: '메뉴 3' },
    menu3Url: { type: 'url', label: '메뉴 3 링크' },
    menu4: { type: 'text', label: '메뉴 4' },
    menu4Url: { type: 'url', label: '메뉴 4 링크' },
    menu5: { type: 'text', label: '메뉴 5' },
    menu5Url: { type: 'url', label: '메뉴 5 링크' },
    ctaText: { type: 'text', label: 'CTA 버튼' },
    ctaUrl: { type: 'url', label: 'CTA 링크' },
  },
  previewImage: '/component-previews/wedding/nav.webp',
};

export default Nav;
