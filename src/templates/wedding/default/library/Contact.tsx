'use client';

import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../wedding.module.css';
import { ClockIcon, HeartIcon, MapIcon, PhoneIcon } from '../sections/icons';
import { renderAccentTitle } from '../sections/title-parts';
import { getFieldValue } from '@/domain/entities/template.entity';

const Contact: SectionComponent = function Contact({ section }: TemplateSectionProps) {
  const { data } = section;
  const eyebrow = getFieldValue(data, 'eyebrow') || '';
  const title = getFieldValue(data, 'title') || '';
  const body = getFieldValue(data, 'body') || '';
  const phone = getFieldValue(data, 'phone') || '';
  const hours = getFieldValue(data, 'hours') || '';
  const location = getFieldValue(data, 'location') || '';
  const bgImage = getFieldValue(data, 'backgroundImage') || '';
  const formTitle = getFieldValue(data, 'formTitle') || '무료 상담 신청';
  const formNote = getFieldValue(data, 'formNote') || '';

  return (
    <section
      id="contact"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '6rem 1rem',
      }}
    >
      {bgImage && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgImage}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
            loading="lazy"
          />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(10, 9, 8, 0.88)' }} />
        </div>
      )}

      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '64rem',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: '4rem',
        alignItems: 'flex-start',
      }}>
        <div>
          {eyebrow && <div className={styles.lineOrnament} style={{ marginBottom: '2rem', maxWidth: '20rem' }}>{eyebrow}</div>}
          <h2 className={styles.sectionTitleDisplay} style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1.25rem' }}>
            {renderAccentTitle(title, styles.titleAccent)}
          </h2>
          {body && (
            <p style={{ color: 'rgba(245, 240, 235, 0.5)', lineHeight: 1.65, wordBreak: 'keep-all', marginBottom: '2rem' }}>
              {body}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {phone && (
              <ContactRow icon={<PhoneIcon size={18} />} label="전화 상담" value={phone} />
            )}
            {hours && (
              <ContactRow icon={<ClockIcon size={18} />} label="운영 시간" value={hours} />
            )}
            {location && (
              <ContactRow icon={<MapIcon size={18} />} label="쇼룸" value={location} />
            )}
          </div>
        </div>

        <div style={{
          background: 'rgba(19, 17, 15, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(232, 180, 184, 0.1)',
          borderRadius: '1rem',
          padding: '2rem',
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f5f0eb', marginTop: 0, marginBottom: '1.5rem', wordBreak: 'keep-all' }}>
            {formTitle}
          </h3>
          <form
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            onSubmit={(e) => e.preventDefault()}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className={styles.formLabel}>신랑 성함</label>
                <input type="text" placeholder="홍길동" className={styles.formField} />
              </div>
              <div>
                <label className={styles.formLabel}>신부 성함</label>
                <input type="text" placeholder="김지연" className={styles.formField} />
              </div>
            </div>
            <div>
              <label className={styles.formLabel}>연락처</label>
              <input type="tel" placeholder="010-0000-0000" className={styles.formField} />
            </div>
            <div>
              <label className={styles.formLabel}>예상 예식 시기</label>
              <select className={styles.formField}>
                <option value="">선택해 주세요</option>
                <option>3개월 이내</option>
                <option>3–6개월</option>
                <option>6–12개월</option>
                <option>1년 이상</option>
                <option>아직 미정</option>
              </select>
            </div>
            <div>
              <label className={styles.formLabel}>관심 서비스</label>
              <select className={styles.formField}>
                <option value="">선택해 주세요</option>
                <option>풀 웨딩 플래닝</option>
                <option>세미 풀 플래닝</option>
                <option>당일 코디네이션</option>
                <option>스몰 웨딩</option>
                <option>프러포즈 이벤트</option>
                <option>기타 이벤트</option>
              </select>
            </div>
            <div>
              <label className={styles.formLabel}>전하고 싶은 말</label>
              <textarea
                rows={3}
                placeholder="두 분의 이야기를 자유롭게 적어주세요."
                className={styles.formField}
                style={{ resize: 'none', fontFamily: 'inherit' }}
              />
            </div>
            <button
              type="submit"
              className={styles.btnBlush}
              style={{ width: '100%', justifyContent: 'center', padding: '0.875rem 1rem', fontSize: '1rem', borderRadius: '0.75rem' }}
            >
              <HeartIcon size={18} />
              상담 신청하기
            </button>
          </form>
          {formNote && (
            <p style={{
              fontSize: '0.75rem',
              color: 'rgba(245, 240, 235, 0.2)',
              textAlign: 'center',
              marginTop: '1rem',
              wordBreak: 'keep-all',
            }}>
              {formNote}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

function ContactRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{
        width: '2.25rem',
        height: '2.25rem',
        borderRadius: '0.5rem',
        background: 'rgba(232, 180, 184, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: 'var(--w-blush, #e8b4b8)',
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', color: 'rgba(245, 240, 235, 0.3)', margin: 0 }}>{label}</p>
        <p style={{ fontWeight: 700, color: '#f5f0eb', margin: 0 }}>{value}</p>
      </div>
    </div>
  );
}

export default Contact;
