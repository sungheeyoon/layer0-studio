'use client';

import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../interior.module.css';
import { ArrowRightIcon, PhoneIcon, LetterIcon, MapPinIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Contact: SectionComponent = function Contact({ section }: TemplateSectionProps) {
  const { data } = section;
  const label = getFieldValue(data, 'eyebrow') || 'Get Started';
  const title = getFieldValue(data, 'title') || '';
  const description = getFieldValue(data, 'description') || '';
  const phone = getFieldValue(data, 'phone') || '';
  const email = getFieldValue(data, 'email') || '';
  const address = getFieldValue(data, 'address') || '';

  return (
    <section id="contact" className="py-28 lg:py-36 relative overflow-hidden" style={{ background: 'var(--i-grad-contact)' }}>
      {/* Decorative glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, color-mix(in srgb, var(--i-gold) 7%, transparent) 0%, transparent 70%)' }}></div>
      {/* Grid lines */}
      <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(var(--i-gold) 1px, transparent 1px), linear-gradient(90deg, var(--i-gold) 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>

      <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center relative z-10">
        <div className={`${styles.reveal} ${styles.revealIn} flex items-center justify-center gap-3 mb-6`}>
          <span className={styles.goldBar}></span>
          <span className={styles.secTag}>{label}</span>
          <span className={styles.goldBar} style={{ background: 'linear-gradient(270deg, var(--i-gold), color-mix(in srgb, var(--i-gold) 0%, transparent))' }}></span>
        </div>
        <h2 className={`${styles.reveal} ${styles.revealIn} ${styles.delay1} font-extrabold tracking-tight mb-6 text-[var(--i-cream)]`} style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)', lineHeight: 1.05 }}>
          {title.split('\n').map((line, i) => (
            <span key={i}>
              {line.includes('지금 바꿔드립니다') ? (
                <span className={styles.textGoldGrad}>지금 바꿔드립니다</span>
              ) : line}
              <br />
            </span>
          ))}
        </h2>
        <p className={`${styles.reveal} ${styles.revealIn} ${styles.delay2} text-[var(--i-muted)] leading-relaxed mb-10 max-w-xl mx-auto`} style={{ fontSize: '16px' }}>
          {description}
        </p>

        {/* Contact form card */}
        <div className={`${styles.reveal} ${styles.revealIn} ${styles.delay3} ${styles.bezel} max-w-lg mx-auto mb-10`}>
          <div className={styles.bezelInner} style={{ padding: '32px 28px 36px' }}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-left">
                  <label className="block text-[12px] text-[var(--i-muted)] mb-1.5">이름</label>
                  <input type="text" placeholder="홍길동" className="w-full px-4 py-3 rounded-xl text-[14px] text-[var(--i-cream)] placeholder-[var(--i-muted)] outline-none focus:ring-1 focus:ring-[var(--i-gold)] transition-all" style={{ background: 'color-mix(in srgb, white 4%, transparent)', border: '1px solid color-mix(in srgb, white 8%, transparent)' }} />
                </div>
                <div className="text-left">
                  <label className="block text-[12px] text-[var(--i-muted)] mb-1.5">연락처</label>
                  <input type="tel" placeholder="010-0000-0000" className="w-full px-4 py-3 rounded-xl text-[14px] text-[var(--i-cream)] placeholder-[var(--i-muted)] outline-none focus:ring-1 focus:ring-[var(--i-gold)] transition-all" style={{ background: 'color-mix(in srgb, white 4%, transparent)', border: '1px solid color-mix(in srgb, white 8%, transparent)' }} />
                </div>
              </div>
              <div className="text-left">
                <label className="block text-[12px] text-[var(--i-muted)] mb-1.5">서비스 유형</label>
                <select className="w-full px-4 py-3 rounded-xl text-[14px] outline-none focus:ring-1 focus:ring-[var(--i-gold)] transition-all appearance-none text-[var(--i-muted)]" style={{ background: 'color-mix(in srgb, white 4%, transparent)', border: '1px solid color-mix(in srgb, white 8%, transparent)' }}>
                  <option value="">서비스를 선택해주세요</option>
                  <option value="residential">주거 인테리어</option>
                  <option value="commercial">상업 공간</option>
                  <option value="office">오피스 디자인</option>
                  <option value="consulting">공간 컨설팅</option>
                </select>
              </div>
              <div className="text-left">
                <label className="block text-[12px] text-[var(--i-muted)] mb-1.5">문의 내용</label>
                <textarea placeholder="공간 규모, 희망 스타일, 예산 범위 등을 자유롭게 적어주세요." rows={3} className="w-full px-4 py-3 rounded-xl text-[14px] text-[var(--i-cream)] placeholder-[var(--i-muted)] outline-none focus:ring-1 focus:ring-[var(--i-gold)] transition-all resize-none" style={{ background: 'color-mix(in srgb, white 4%, transparent)', border: '1px solid color-mix(in srgb, white 8%, transparent)' }}></textarea>
              </div>
              <button className={`${styles.pillBtn} w-full justify-center text-[15px]`} style={{ padding: '16px 28px' }}>
                <span className={styles.ic}>
                  <ArrowRightIcon size={16} className="text-[var(--i-dark)]" />
                </span>
                무료 상담 신청하기
              </button>
            </form>
            <p className="text-[11px] text-[var(--i-muted)] mt-3">영업일 기준 24시간 이내 연락드립니다.</p>
          </div>
        </div>

        {/* Alternative contact */}
        <div className={`${styles.reveal} ${styles.revealIn} ${styles.delay4} flex flex-wrap items-center justify-center gap-6 text-[13px] text-[var(--i-muted)]`}>
          <a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-[var(--i-cream)] transition-colors duration-300 no-underline">
            <PhoneIcon size={16} className="text-[var(--i-gold)]" />
            {phone}
          </a>
          <span className="opacity-20 hidden sm:block">|</span>
          <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-[var(--i-cream)] transition-colors duration-300 no-underline">
            <LetterIcon size={16} className="text-[var(--i-gold)]" />
            {email}
          </a>
          <span className="opacity-20 hidden sm:block">|</span>
          <span className="flex items-center gap-2">
            <MapPinIcon size={16} className="text-[var(--i-gold)]" />
            {address}
          </span>
        </div>
      </div>
    </section>
  );
};

export default Contact;
