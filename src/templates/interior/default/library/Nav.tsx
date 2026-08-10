'use client';

import { TemplateSectionProps, SectionComponent, NavSectionProps } from '../../../types';
import styles from '../interior.module.css';
import { HomeIcon, ChatIcon } from '../sections/icons';
import type { ValuesOf } from '@/domain/entities/template.entity';
import { navSchema } from './Nav.meta';

type NavContent = ValuesOf<typeof navSchema>;

const Nav: SectionComponent = function Nav(props: TemplateSectionProps) {
  const { section } = props;
  const { navItems } = props as NavSectionProps;
  const content = section.fields as NavContent;
  const brandName = content.brandName || '에스파시오';
  const ctaText = content.ctaText || '무료 상담 신청';

  return (
    <nav className={`${styles.glassNav} fixed top-0 left-0 right-0 z-50`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16">
        <a href="#" className="flex items-center gap-3 no-underline">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--i-gold)] to-yellow-700 flex items-center justify-center">
            <HomeIcon size={15} className="text-[var(--i-dark)]" />
          </span>
          <span className="font-bold text-[15px] tracking-tight text-[var(--i-cream)]">{brandName}</span>
        </a>

        <ul className="hidden md:flex items-center gap-8 text-[13px] text-[var(--i-muted)] font-medium list-none p-0 m-0">
          {navItems.map((item, i) => (
            <li key={i}>
              <a href={item.href} className="hover:text-[var(--i-cream)] transition-colors duration-300 no-underline">
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <a href="#contact" className={`${styles.pillBtn} text-[13px] no-underline`} style={{ padding: '10px 20px 10px 10px', gap: '8px' }}>
          <span className={styles.ic} style={{ width: '28px', height: '28px' }}>
            <ChatIcon size={13} className="text-[var(--i-dark)]" />
          </span>
          {ctaText}
        </a>
      </div>
    </nav>
  );
};

export default Nav;
