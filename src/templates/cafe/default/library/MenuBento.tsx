import { getFieldValue } from '@/domain/entities/template.entity';
import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../cafe.module.css';
import { ArrowRightIcon, CupIcon, PieChartIcon } from '../sections/icons';

const MenuBento: SectionComponent = function MenuBento({ section }: TemplateSectionProps) {
  const { fields } = section;
  const label = getFieldValue(fields, 'eyebrow') || '메뉴';
  const title = getFieldValue(fields, 'title') || '매일 정성껏\n내리는 한 잔';
  const description = getFieldValue(fields, 'description') || '';

  const itemsField = fields['items'];
  const items = itemsField?.type === 'array' ? itemsField.items : [];

  const programs = items.map((item, idx) => {
    const pTitle = getFieldValue(item.title);
    const pDesc = getFieldValue(item.desc);
    const pPrice = getFieldValue(item.price);
    const pImage = getFieldValue(item.image);
    const pBadge = getFieldValue(item.badge);

    return {
      id: String(idx),
      title: pTitle,
      desc: pDesc,
      price: pPrice,
      image: pImage,
      badge: pBadge,
      colSpan: idx === 0 ? 'md:col-span-2' : '',
      icon: idx === 2 ? <CupIcon size={20} className="text-[var(--color-primary)] fill-current" /> :
        idx === 3 ? <PieChartIcon size={20} className="text-[var(--color-primary)] fill-current" /> : null,
    };
  }).filter(p => p.title);

  return (
    <section className="py-24 lg:py-32 px-6 lg:px-10 max-w-7xl mx-auto" id="menu">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
        <div className={`${styles.reveal} ${styles.revealIn}`}>
          <p className={`${styles.sectionLabel} mb-5`}>{label}</p>
          <h2
            className={`${styles.fontSerif} leading-[1.1] text-[var(--color-secondary)]`}
            style={{ fontSize: 'clamp(2.2rem, 4vw, 3.6rem)' }}
          >
            {title.split('\n').map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </h2>
        </div>
        <p className={`${styles.reveal} ${styles.revealIn} text-[var(--color-dust)] text-[14px] leading-relaxed max-w-[280px]`}>
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[280px] lg:auto-rows-[300px]">
        {programs.map((p) => (
          <div
            key={p.id}
            className={`${styles.reveal} ${styles.revealIn} ${styles.menuCard} ${p.colSpan || ''} ${p.image ? '' : 'bg-[var(--color-cream)] border border-[var(--color-surface-dark)] p-7 flex flex-col justify-between spring hover:border-[var(--color-primary)]/40'}`}
          >
            {p.image ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className={styles.menuCardBody}>
                  <div className="flex items-end justify-between">
                    <div>
                      {p.badge && (
                        <span className="inline-block bg-[var(--color-primary)] text-[var(--color-surface)] text-[10px] font-semibold tracking-widest uppercase px-3 py-1 mb-3">
                          {p.badge}
                        </span>
                      )}
                      <h3 className={`${styles.fontSerif} text-[var(--color-surface)] text-[1.5rem] italic mb-1`}>
                        {p.title}
                      </h3>
                      <p className="text-[var(--color-surface)]/65 text-[13px]">{p.desc}</p>
                    </div>
                    {p.price && (
                      <p className={`${styles.fontSerif} text-[var(--color-surface)] text-[1.4rem] font-medium mb-1`}>
                        {p.price}<span className="text-[var(--color-surface)]/60 text-sm">원</span>
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 flex items-center justify-center bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 shrink-0">
                  {p.icon}
                </div>
                <div>
                  <h3 className={`${styles.fontSerif} text-[var(--color-secondary)] text-[1.3rem] italic mb-2`}>
                    {p.title}
                  </h3>
                  <p className="text-[var(--color-dust)] text-[13px] leading-relaxed mb-4">{p.desc}</p>
                  {p.price && (
                    <p className={`${styles.fontSerif} text-[var(--color-secondary)] font-medium text-[1.1rem]`}>
                      {p.price}<span className="text-[var(--color-dust)] text-sm">원</span>
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className={`${styles.reveal} ${styles.revealIn} mt-10 flex justify-end`}>
        <a href="#visit" className="no-underline">
          <button className={`${styles.btnGhost} text-[11px] tracking-widest`}>
            <span>전체 메뉴 보기</span>
            <ArrowRightIcon size={14} />
          </button>
        </a>
      </div>
    </section>
  );
};

MenuBento.meta = {
  componentKey: 'menu',
  category: 'menu',
  label: 'Menu (Bento)',
  fieldsSchema: {
    eyebrow: { type: 'text', label: '섹션 라벨' },
    title: { type: 'textarea', label: '섹션 타이틀' },
    description: { type: 'textarea', label: '섹션 설명' },
    items: {
      type: 'array',
      label: '메뉴 항목',
      itemSchema: {
        title: { type: 'text', label: '제목', required: true },
        desc: { type: 'text', label: '설명' },
        price: { type: 'text', label: '가격' },
        image: { type: 'image', label: '이미지' },
        badge: { type: 'text', label: '배지' },
      },
      minItems: 1,
      maxItems: 6,
    },
  },
  previewImage: '/component-previews/cafe/menu-bento.webp',
};

export default MenuBento;
