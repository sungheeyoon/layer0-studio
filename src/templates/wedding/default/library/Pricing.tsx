import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../wedding.module.css';
import { CheckCircleIcon } from '../sections/icons';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

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

const pricingSchema = {
  eyebrow: { type: 'text', label: '상단 라벨' },
  title: { type: 'text', label: '타이틀', required: true },
  subtitle: { type: 'text', label: '서브 타이틀' },
  pkg1Tier: { type: 'text', label: '패키지 1 등급' },
  pkg1Name: { type: 'text', label: '패키지 1 이름' },
  pkg1Price: { type: 'text', label: '패키지 1 가격' },
  pkg1PriceSuffix: { type: 'text', label: '패키지 1 가격 단위' },
  pkg1Note: { type: 'text', label: '패키지 1 안내' },
  pkg1Feature1: { type: 'text', label: '패키지 1 항목 1' },
  pkg1Feature2: { type: 'text', label: '패키지 1 항목 2' },
  pkg1Feature3: { type: 'text', label: '패키지 1 항목 3' },
  pkg1Feature4: { type: 'text', label: '패키지 1 항목 4' },
  pkg1CtaText: { type: 'text', label: '패키지 1 버튼' },
  pkg2Badge: { type: 'text', label: '패키지 2 배지' },
  pkg2Tier: { type: 'text', label: '패키지 2 등급' },
  pkg2Name: { type: 'text', label: '패키지 2 이름' },
  pkg2Price: { type: 'text', label: '패키지 2 가격' },
  pkg2PriceSuffix: { type: 'text', label: '패키지 2 가격 단위' },
  pkg2Note: { type: 'text', label: '패키지 2 안내' },
  pkg2Feature1: { type: 'text', label: '패키지 2 항목 1' },
  pkg2Feature2: { type: 'text', label: '패키지 2 항목 2' },
  pkg2Feature3: { type: 'text', label: '패키지 2 항목 3' },
  pkg2Feature4: { type: 'text', label: '패키지 2 항목 4' },
  pkg2Feature5: { type: 'text', label: '패키지 2 항목 5' },
  pkg2CtaText: { type: 'text', label: '패키지 2 버튼' },
  pkg3Tier: { type: 'text', label: '패키지 3 등급' },
  pkg3Name: { type: 'text', label: '패키지 3 이름' },
  pkg3Price: { type: 'text', label: '패키지 3 가격' },
  pkg3PriceSuffix: { type: 'text', label: '패키지 3 가격 단위' },
  pkg3Note: { type: 'text', label: '패키지 3 안내' },
  pkg3Feature1: { type: 'text', label: '패키지 3 항목 1' },
  pkg3Feature2: { type: 'text', label: '패키지 3 항목 2' },
  pkg3Feature3: { type: 'text', label: '패키지 3 항목 3' },
  pkg3Feature4: { type: 'text', label: '패키지 3 항목 4' },
  pkg3Feature5: { type: 'text', label: '패키지 3 항목 5' },
  pkg3CtaText: { type: 'text', label: '패키지 3 버튼' },
} as const satisfies FieldsSchema;

type PricingContent = ValuesOf<typeof pricingSchema>;

const Pricing: SectionComponent = function Pricing({ section }: TemplateSectionProps) {
  const content = section.fields as PricingContent;
  const eyebrow = content.eyebrow || '';
  const title = content.title || '';
  const subtitle = content.subtitle || '';

  // The three packages are deliberately *not* uniform — package 1 has four
  // feature lines and no badge, packages 2 and 3 have five. A `pkg${n}Feature${i}`
  // key built from two literal unions asks for the cross product, which includes
  // `pkg1Feature5` and `pkg1Badge`: keys the schema does not have. So the ragged
  // parts are passed in and only the uniform ones are computed.
  const buildPkg = (
    n: 1 | 2 | 3,
    features: ReadonlyArray<string | undefined>,
    opts: { badge?: string; featured?: boolean; premium?: boolean } = {},
  ): Pkg | null => {
    const name = content[`pkg${n}Name`];
    if (!name) return null;
    return {
      badge: opts.badge || undefined,
      tier: content[`pkg${n}Tier`] || '',
      name,
      price: content[`pkg${n}Price`] || '',
      priceSuffix: content[`pkg${n}PriceSuffix`] || '',
      note: content[`pkg${n}Note`] || '',
      features: features.filter((f): f is string => Boolean(f)),
      ctaText: content[`pkg${n}CtaText`] || '상담 신청',
      featured: opts.featured,
      premium: opts.premium,
    };
  };

  const pkgs: Array<Pkg | null> = [
    buildPkg(1, [content.pkg1Feature1, content.pkg1Feature2, content.pkg1Feature3, content.pkg1Feature4]),
    buildPkg(
      2,
      [content.pkg2Feature1, content.pkg2Feature2, content.pkg2Feature3, content.pkg2Feature4, content.pkg2Feature5],
      { badge: content.pkg2Badge, featured: true },
    ),
    buildPkg(
      3,
      [content.pkg3Feature1, content.pkg3Feature2, content.pkg3Feature3, content.pkg3Feature4, content.pkg3Feature5],
      { premium: true },
    ),
  ];
  const visiblePkgs = pkgs.filter(Boolean) as Pkg[];

  return (
    <section className={`${styles.section} ${styles.bgDark800}`} id="pricing">
      <div className={styles.sectionInnerNarrow}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          {eyebrow && <div className={styles.lineOrnament} style={{ marginBottom: '2rem', justifyContent: 'center' }}>{eyebrow}</div>}
          <h2 className={styles.sectionTitle} style={{ marginBottom: '0.75rem' }}>{title}</h2>
          {subtitle && (
            <p style={{ color: 'color-mix(in srgb, var(--w-cream) 40%, transparent)', fontSize: '0.875rem', wordBreak: 'keep-all', margin: 0 }}>
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
              ? 'color-mix(in srgb, var(--w-blush) 60%, transparent)'
              : p.premium
              ? 'color-mix(in srgb, var(--w-gold) 50%, transparent)'
              : 'color-mix(in srgb, var(--w-cream) 30%, transparent)';
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
                <h3 style={{ color: 'var(--w-cream)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem', wordBreak: 'keep-all' }}>
                  {p.name}
                </h3>
                <p className={`${styles.pkgPrice} ${p.premium ? styles.pkgPriceGold : ''}`}>
                  {p.price}
                  <span className={styles.pkgPriceUnit}>{p.priceSuffix}</span>
                </p>
                <p style={{ fontSize: '0.75rem', color: 'color-mix(in srgb, var(--w-cream) 30%, transparent)', marginBottom: '1.5rem' }}>
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
};

Pricing.meta = {
  componentKey: 'pricing',
  category: 'features',
  label: 'Wedding Pricing',
  fieldsSchema: pricingSchema,
  previewImage: '/component-previews/wedding/pricing.webp',
};

export default Pricing;
