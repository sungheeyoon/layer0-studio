import { TemplateBlockProps, BlockComponent, NavBlockProps } from '../../../types';
import styles from '../legal.module.css';
import { ShieldCheckIcon, ArrowRightIcon } from '../sections/icons';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

const navSchema = {
  brandName: { type: 'text', label: '사무소 이름' },
  brandSubtext: { type: 'text', label: '보조 텍스트' },
  phone: { type: 'text', label: '전화번호' },
  ctaText: { type: 'text', label: 'CTA 버튼 텍스트' },
} as const satisfies FieldsSchema;

type NavContent = ValuesOf<typeof navSchema>;

const Nav: BlockComponent = function Nav(props: TemplateBlockProps) {
  const { block } = props;
  const { navItems } = props as NavBlockProps;
  const content = block.fields as NavContent;
  const brandName = content.brandName || '하람';
  const brandSubtext = content.brandSubtext || 'Law & Tax';
  const phone = content.phone || '02-3456-7890';
  const ctaText = content.ctaText || '무료 상담 신청';

  return (
    <header className={styles.navWrap}>
      <nav className={styles.navInner}>
        <a href="#" className="flex items-center gap-2.5 select-none no-underline">
          <div className="w-8 h-8 bg-[var(--l-navy)] rounded-lg flex items-center justify-center flex-shrink-0">
            <ShieldCheckIcon size={16} className="text-amber-400" />
          </div>
          <div>
            <span className="font-bold text-[var(--l-navy)] text-base tracking-tight leading-none block">{brandName}</span>
            <span className="text-stone-500 text-[10px] tracking-widest font-medium uppercase leading-none block mt-0.5">{brandSubtext}</span>
          </div>
        </a>

        <ul className="hidden md:flex items-center gap-1 list-none p-0 m-0">
          {navItems.map((item, i) => (
            <li key={i}>
              <a href={item.href} className="px-3.5 py-2 text-sm font-medium text-stone-600 hover:text-[var(--l-navy)] rounded-lg hover:bg-stone-100 transition-all duration-200 no-underline">
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a href={`tel:${phone}`} className="hidden md:flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-stone-700 hover:text-[var(--l-navy)] transition-colors duration-200 no-underline">
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
  fieldsSchema: navSchema,
  previewImage: '/component-previews/legal/nav.webp',
};

export default Nav;
