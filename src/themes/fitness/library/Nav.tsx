'use client';

import { useState, useEffect } from 'react';
import { ThemeSectionProps, SectionComponent } from '../../types';
import styles from '../fitness.module.css';
import { DumbbellIcon, HamburgerIcon, ArrowRightIcon } from '../sections/icons';

const Nav: SectionComponent = function Nav({ section }: ThemeSectionProps) {
  const { data } = section;
  const brandName = data['brandName']?.value || 'APEX';
  const ctaText = data['ctaText']?.value || '무료 체험';

  const [scrolled, setScrolled] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: data['menu1']?.value, href: '#programs' },
    { label: data['menu2']?.value, href: '#facility' },
    { label: data['menu3']?.value, href: '#trainers' },
    { label: data['menu4']?.value, href: '#reviews' },
  ].filter(m => m.label);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-[68px]">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 spring hover:opacity-70">
            <div className={`${styles.clipCorner} w-8 h-8 bg-[var(--f-lime)] flex items-center justify-center shrink-0`}>
              <DumbbellIcon size={16} className="text-[#080808]" />
            </div>
            <span className={`${styles.fontCondensed} font-black text-[22px] tracking-[.12em] text-[var(--f-snow)] uppercase`}>
              {brandName}
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-10">
            {menuItems.map((item, i) => (
              <a
                key={i}
                href={item.href}
                className={`${styles.fontCondensed} font-semibold text-[14px] tracking-widest text-[var(--f-soft)] uppercase spring hover:text-[var(--f-snow)]`}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-4">
            <a href="#join" className="hidden sm:inline-flex">
              <button className={`${styles.btnLime} text-[11px] px-5 py-2.5`}>
                <span>{ctaText}</span>
                <ArrowRightIcon size={14} />
              </button>
            </a>
            <button
              className="lg:hidden p-2 text-[var(--f-soft)] spring hover:text-[var(--f-snow)]"
              onClick={() => setMobOpen(!mobOpen)}
            >
              <HamburgerIcon size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden bg-[var(--f-surface)] border-t border-[var(--f-border)] px-6 py-6 space-y-4 overflow-hidden transition-all duration-400 ${mobOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
        {menuItems.map((item, i) => (
          <a
            key={i}
            href={item.href}
            className={`${styles.fontCondensed} block font-bold text-[15px] tracking-widest uppercase text-[var(--f-snow)] py-2`}
            onClick={() => setMobOpen(false)}
          >
            {item.label}
          </a>
        ))}
        <a href="#join" onClick={() => setMobOpen(false)}>
          <button className={`${styles.btnLime} w-full justify-center mt-3 text-[12px] tracking-widest py-3`}>
            <span>{ctaText} 신청</span>
          </button>
        </a>
      </div>
    </nav>
  );
};

export default Nav;
