import { ThemeSectionProps } from '../../types';
import styles from '../wedding.module.css';
import { CheckCircleIcon } from './icons';

interface Pkg {
  badge?: string;
  tier: string;
  name: string;
  price: string;
  priceSuffix: string;
  note: string;
  features: string[];
  ctaText: string;
  featured?: boolean;
  premium?: boolean;
}

export default function PricingSection({ section }: ThemeSectionProps) {
  const { data } = section;
  const eyebrow = data['eyebrow']?.value || '';
  const title = data['title']?.value || '';
  const subtitle = data['subtitle']?.value || '';

  const buildPkg = (n: number, opts: { featured?: boolean; premium?: boolean } = {}): Pkg | null => {
    const name = data[`pkg${n}Name`]?.value;
    if (!name) return null;
    const features: string[] = [];
    for (let i = 1; i <= 6; i++) {
      const f = data[`pkg${n}Feature${i}`]?.value;
      if (f) features.push(f);
    }
    return {
      badge: data[`pkg${n}Badge`]?.value || undefined,
      tier: data[`pkg${n}Tier`]?.value || '',
      name,
      price: data[`pkg${n}Price`]?.value || '',
      priceSuffix: data[`pkg${n}PriceSuffix`]?.value || '',
      note: data[`pkg${n}Note`]?.value || '',
      features,
      ctaText: data[`pkg${n}CtaText`]?.value || '상담 신청',
      featured: opts.featured,
      premium: opts.premium,
    };
  };

  const pkgs: Array<Pkg | null> = [
    buildPkg(1),
    buildPkg(2, { featured: true }),
    buildPkg(3, { premium: true }),
  ];
  const visiblePkgs = pkgs.filter(Boolean) as Pkg[];

  return (
    <section className={`${styles.section} ${styles.bgDark800}`} id="pricing">
      <div className={styles.sectionInnerNarrow}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          {eyebrow && <div className={styles.lineOrnament} style={{ marginBottom: '2rem', justifyContent: 'center' }}>{eyebrow}</div>}
          <h2 className={styles.sectionTitle} style={{ marginBottom: '0.75rem' }}>{title}</h2>
          {subtitle && (
            <p style={{ color: 'rgba(245, 240, 235, 0.4)', fontSize: '0.875rem', wordBreak: 'keep-all', margin: 0 }}>
              {subtitle}
            </p>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap: '1.25rem',
        }}>
          {visiblePkgs.map((p, i) => {
            const tierColor = p.featured
              ? 'rgba(232, 180, 184, 0.6)'
              : p.premium
              ? 'rgba(212, 169, 106, 0.5)'
              : 'rgba(245, 240, 235, 0.3)';
            return (
              <div
                key={i}
                className={`${styles.pkgCard} ${p.featured ? styles.pkgCardFeatured : ''}`}
              >
                {p.badge && <div className={styles.pkgBadge}>{p.badge}</div>}
                <p style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: tierColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  marginBottom: '1rem',
                }}>
                  {p.tier}
                </p>
                <h3 style={{ color: '#f5f0eb', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem', wordBreak: 'keep-all' }}>
                  {p.name}
                </h3>
                <p className={`${styles.pkgPrice} ${p.premium ? styles.pkgPriceGold : ''}`}>
                  {p.price}
                  <span className={styles.pkgPriceUnit}>{p.priceSuffix}</span>
                </p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(245, 240, 235, 0.3)', marginBottom: '1.5rem' }}>
                  {p.note}
                </p>
                <ul className={`${styles.pkgList} ${p.featured ? styles.pkgListFeatured : ''}`}>
                  {p.features.map((f, fi) => (
                    <li key={fi}>
                      <CheckCircleIcon
                        size={16}
                        className={`${styles.checkIcon} ${p.featured ? styles.checkIconFeatured : ''} ${p.premium ? styles.checkIconGold : ''}`}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className={p.featured ? styles.btnBlush : styles.btnGhost}
                  style={{ width: '100%', justifyContent: 'center', padding: '0.75rem 1rem', fontSize: '0.875rem' }}
                >
                  {p.ctaText}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
