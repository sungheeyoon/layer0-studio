import { ThemeSectionProps } from '../../types';
import styles from '../wedding.module.css';
import { ArrowRightIcon } from './icons';

export default function NavSection({ section }: ThemeSectionProps) {
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
}
