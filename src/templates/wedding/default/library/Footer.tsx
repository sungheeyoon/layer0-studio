import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../wedding.module.css';
import { BookmarkIcon, ChatSquareIcon, InstagramIcon, PlayIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Footer: SectionComponent = function Footer({ section }: TemplateSectionProps) {
  const { data } = section;
  const brand = getFieldValue(data, 'brand') || 'HAUTRE';
  const tagline = getFieldValue(data, 'tagline') || '';
  const description = getFieldValue(data, 'description') || '';
  const address = getFieldValue(data, 'address') || '';
  const copyright = getFieldValue(data, 'copyright') || '';

  return (
    <footer style={{
      background: 'var(--w-bg, #0a0908)',
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      padding: '4rem 1rem',
    }}>
      <div className={styles.sectionInner}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: '2.5rem',
          paddingBottom: '2.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          <div style={{ gridColumn: 'span 2 / span 2', minWidth: 0 }}>
            <div className={styles.fontDisplay} style={{
              fontSize: '1.5rem',
              fontWeight: 300,
              letterSpacing: '0.15em',
              color: '#f5f0eb',
              marginBottom: '0.5rem',
            }}>
              {brand}
            </div>
            {tagline && (
              <p style={{
                fontSize: '0.75rem',
                color: 'rgba(245, 240, 235, 0.2)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: '1.25rem',
              }}>
                {tagline}
              </p>
            )}
            {description && (
              <p style={{
                fontSize: '0.875rem',
                color: 'rgba(245, 240, 235, 0.3)',
                lineHeight: 1.65,
                wordBreak: 'keep-all',
                maxWidth: '20rem',
                margin: 0,
              }}>
                {description}
              </p>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <SocialLink label="인스타그램"><InstagramIcon size={16} /></SocialLink>
              <SocialLink label="유튜브"><PlayIcon size={16} /></SocialLink>
              <SocialLink label="카카오톡"><ChatSquareIcon size={16} /></SocialLink>
              <SocialLink label="핀터레스트"><BookmarkIcon size={16} /></SocialLink>
            </div>
          </div>

          <div>
            <p style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'rgba(245, 240, 235, 0.2)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: '1rem',
            }}>
              서비스
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {['풀 웨딩 플래닝', '스몰 웨딩', '프러포즈 이벤트', '기념일 이벤트', '해외 웨딩'].map((item) => (
                <li key={item}>
                  <a href="#services" style={{ fontSize: '0.875rem', color: 'rgba(245, 240, 235, 0.3)', textDecoration: 'none' }}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'rgba(245, 240, 235, 0.2)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: '1rem',
            }}>
              {brand}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                ['갤러리', '#gallery'],
                ['패키지 안내', '#pricing'],
                ['후기', '#reviews'],
                ['상담 신청', '#contact'],
              ].map(([label, href]) => (
                <li key={label}>
                  <a href={href} style={{ fontSize: '0.875rem', color: 'rgba(245, 240, 235, 0.3)', textDecoration: 'none' }}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            {address && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <p style={{
                  fontSize: '0.75rem',
                  color: 'rgba(245, 240, 235, 0.2)',
                  lineHeight: 1.65,
                  whiteSpace: 'pre-line',
                  margin: 0,
                }}>
                  {address}
                </p>
              </div>
            )}
          </div>
        </div>

        <div style={{
          paddingTop: '1.5rem',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}>
          <p style={{ fontSize: '0.75rem', color: 'rgba(245, 240, 235, 0.15)', margin: 0 }}>{copyright}</p>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <a href="/legal/privacy" style={{ fontSize: '0.75rem', color: 'rgba(245, 240, 235, 0.15)', textDecoration: 'none' }}>
              개인정보처리방침
            </a>
            <a href="/legal/terms" style={{ fontSize: '0.75rem', color: 'rgba(245, 240, 235, 0.15)', textDecoration: 'none' }}>
              이용약관
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

function SocialLink({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <a
      href="#"
      aria-label={label}
      style={{
        width: '2.25rem',
        height: '2.25rem',
        borderRadius: '0.5rem',
        background: 'rgba(255, 255, 255, 0.05)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(245, 240, 235, 0.3)',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </a>
  );
}

Footer.meta = {
  componentKey: 'footer',
  category: 'footer',
  label: 'Wedding Footer',
  dataSchema: {
    brand: { type: 'text', label: '브랜드 로고' },
    tagline: { type: 'text', label: '태그라인' },
    description: { type: 'textarea', label: '브랜드 설명' },
    address: { type: 'textarea', label: '주소·연락처' },
    copyright: { type: 'text', label: '저작권 표기' },
  },
  previewImage: '/component-previews/wedding/footer.webp',
};

export default Footer;
