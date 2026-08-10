'use client';

import { TemplateBlockProps, BlockComponent } from '../../../types';
import type { ValuesOf } from '@/domain/entities/template.entity';
import { contactSchema } from './Contact.meta';

/** 상담 신청 CTA — a navy band with a lead form (non-functional preview). */
type ContactContent = ValuesOf<typeof contactSchema>;

const Contact: BlockComponent = function Contact({ block }: TemplateBlockProps) {
  const content = block.fields as ContactContent;
  const eyebrow = content.eyebrow || '';
  const title = content.title || '';
  const subtitle = content.subtitle || '';
  const phone = content.phone || '';
  const kakaoText = content.kakaoText || '';

  return (
    <section className="bg-[var(--color-primary)]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-14 px-6 py-24 lg:grid-cols-2">
        <div>
          {eyebrow && (
            <p className="mb-4 text-sm font-semibold tracking-[0.2em] text-[var(--color-on-dark)]/70">{eyebrow}</p>
          )}
          {title && (
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-on-primary)] sm:text-4xl">{title}</h2>
          )}
          {subtitle && (
            <p className="mt-5 max-w-md whitespace-pre-line text-lg leading-relaxed text-[var(--color-on-dark)]/80">
              {subtitle}
            </p>
          )}
          <div className="mt-10 space-y-4">
            {phone && (
              <div>
                <span className="block text-xs font-semibold uppercase tracking-widest text-[var(--color-on-dark)]/50">전화 상담</span>
                <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className="text-2xl font-bold text-[var(--color-on-primary)]">
                  {phone}
                </a>
              </div>
            )}
            {kakaoText && (
              <div>
                <span className="block text-xs font-semibold uppercase tracking-widest text-[var(--color-on-dark)]/50">카카오톡</span>
                <span className="text-lg font-medium text-[var(--color-on-dark)]">{kakaoText}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[var(--color-surface)] p-8 shadow-xl">
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--color-primary)]">이름</label>
              <input
                type="text"
                className="w-full border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-3 text-[15px] text-[var(--color-ink)] focus:border-[var(--color-secondary)] focus:outline-none"
                placeholder="학부모/학생 이름"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--color-primary)]">연락처</label>
              <input
                type="tel"
                className="w-full border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-3 text-[15px] text-[var(--color-ink)] focus:border-[var(--color-secondary)] focus:outline-none"
                placeholder="010-0000-0000"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--color-primary)]">문의 내용</label>
              <textarea
                rows={4}
                className="w-full resize-none border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-3 text-[15px] text-[var(--color-ink)] focus:border-[var(--color-secondary)] focus:outline-none"
                placeholder="희망 과목/학년, 상담 가능 시간 등"
              />
            </div>
            <button className="w-full bg-[var(--color-secondary)] py-4 text-base font-semibold text-[var(--color-on-primary)] transition-all hover:brightness-110">
              상담 신청하기
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
