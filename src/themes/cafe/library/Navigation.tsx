'use client';

import { useState, useEffect } from 'react';
import { ThemeSectionProps, SectionComponent } from '../../types';
import styles from '../cafe.module.css';
import { MapPointIcon, HamburgerIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Navigation: SectionComponent = function Navigation({ section }: ThemeSectionProps) {
  const { data } = section;
  const brandName = getFieldValue(data, 'brandName') || 'MONO';
  const brandSubtext = getFieldValue(data, 'brandSubtext') || 'Specialty Coffee';
  const ctaText = getFieldValue(data, 'ctaText') || '오시는 길';

  const [scrolled, setScrolled] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: getFieldValue(data, 'menu1'), href: '#menu' },
    { label: getFieldValue(data, 'menu2'), href: '#story' },
    { label: getFieldValue(data, 'menu3'), href: '#space' },
    { label: getFieldValue(data, 'menu4'), href: '#visit' },
  ].filter(m => m.label);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-[68px]">
          {/* Logo */}
          <a href="#" className="flex flex-col spring hover:opacity-60 no-underline">
            <span className={`${styles.fontSerif} font-bold text-[22px] tracking-[.16em] text-[var(--c-espresso)] italic leading-none`}>
              {brandName}
            </span>
            <span className="text-[9px] font-medium tracking-[.22em] text-[var(--c-dust)] uppercase mt-0.5">
              {brandSubtext}
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-10">
            {menuItems.map((item, i) => (
              <a
                key={i}
                href={item.href}
                className="text-[13px] font-medium text-[var(--c-dust)] tracking-wide spring hover:text-[var(--c-espresso)] no-underline"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            <a href="#visit" className="hidden sm:inline-flex no-underline">
              <button className={`${styles.btnEspresso} text-[11px] tracking-widest px-5 py-2.5`}>
                <span>{ctaText}</span>
                <MapPointIcon size={14} />
              </button>
            </a>
            <button
              className="lg:hidden p-2 text-[var(--c-dust)] spring hover:text-[var(--c-espresso)] bg-transparent border-0 cursor-pointer"
              onClick={() => setMobOpen(!mobOpen)}
            >
              <HamburgerIcon size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden bg-[var(--c-linen)] border-t border-[var(--c-linen-dark)] px-6 py-6 space-y-4 overflow-hidden transition-all duration-400 ${mobOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
        {menuItems.map((item, i) => (
          <a
            key={i}
            href={item.href}
            className="block text-[14px] font-medium text-[var(--c-espresso)] py-2 no-underline"
            onClick={() => setMobOpen(false)}
          >
            {item.label}
          </a>
        ))}
        <a href="#visit" onClick={() => setMobOpen(false)} className="block no-underline">
          <button className={`${styles.btnEspresso} w-full justify-center text-[12px] tracking-widest py-3 mt-2`}>
            <span>{ctaText}</span>
          </button>
        </a>
      </div>
    </nav>
  );
};

export default Navigation;
