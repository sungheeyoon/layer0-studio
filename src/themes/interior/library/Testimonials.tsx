import { TemplateSectionProps, SectionComponent } from '../../types';
import styles from '../interior.module.css';
import { StarIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Testimonials: SectionComponent = function Testimonials({ section }: TemplateSectionProps) {
  const { data } = section;
  const label = getFieldValue(data, 'label') || 'Client Reviews';
  const title = getFieldValue(data, 'title') || '';

  const reviews = [1, 2, 3].map(n => ({
    body: getFieldValue(data, `r${n}Body`),
    author: getFieldValue(data, `r${n}Author`),
    meta: getFieldValue(data, `r${n}Meta`),
  })).filter(r => r.body);

  return (
    <section className="py-28 lg:py-36">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-14">
          <div className={`${styles.reveal} ${styles.revealIn} flex items-center justify-center gap-3 mb-5`}>
            <span className={styles.goldBar}></span>
            <span className={styles.secTag}>{label}</span>
            <span className={styles.goldBar} style={{ background: 'linear-gradient(270deg, #C9A96E, rgba(201,169,110,0))' }}></span>
          </div>
          <h2 className={`${styles.reveal} ${styles.revealIn} ${styles.delay1} font-extrabold tracking-tight text-[var(--i-cream)]`} style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1 }}>
            {title.split('\n').map((line, i) => (
              <span key={i}>
                {line.includes('가장 정직한 포트폴리오입니다') ? (
                  <span className={styles.textGoldGrad}>가장 정직한 포트폴리오입니다</span>
                ) : line}
                <br />
              </span>
            ))}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <div key={i} className={`${styles.reveal} ${styles.revealIn} ${styles[`delay${i}` as keyof typeof styles] || ''} ${styles.testiCard}`} style={i === 1 ? { borderColor: 'rgba(201,169,110,0.2)' } : {}}>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <StarIcon key={j} size={14} className="text-[var(--i-gold)]" />
                ))}
              </div>
              <p className="text-[14px] text-[var(--i-cream)] leading-relaxed mb-6 whitespace-pre-line">{r.body}</p>
              <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px]" style={{ background: 'rgba(201,169,110,0.15)', color: '#C9A96E' }}>
                  {r.author?.charAt(0)}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[var(--i-cream)]">{r.author}</p>
                  <p className="text-[11px] text-[var(--i-muted)]">{r.meta}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

Testimonials.meta = {
  componentKey: 'testimonials',
  category: 'content',
  label: 'Interior Testimonials',
  dataSchema: {
    label: { type: 'text', label: '섹션 라벨' },
    title: { type: 'textarea', label: '섹션 타이틀', required: true },
    r1Body: { type: 'textarea', label: '후기 1 본문' },
    r1Author: { type: 'text', label: '후기 1 작성자' },
    r1Meta: { type: 'text', label: '후기 1 메타' },
    r2Body: { type: 'textarea', label: '후기 2 본문' },
    r2Author: { type: 'text', label: '후기 2 작성자' },
    r2Meta: { type: 'text', label: '후기 2 메타' },
    r3Body: { type: 'textarea', label: '후기 3 본문' },
    r3Author: { type: 'text', label: '후기 3 작성자' },
    r3Meta: { type: 'text', label: '후기 3 메타' },
  },
  previewImage: '/component-previews/interior/testimonials.webp',
};

export default Testimonials;
