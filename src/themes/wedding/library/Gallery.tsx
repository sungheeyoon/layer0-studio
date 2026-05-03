import { ThemeSectionProps, SectionComponent } from '../../types';
import styles from '../wedding.module.css';

const Gallery: SectionComponent = function Gallery({ section }: ThemeSectionProps) {
  const { data } = section;
  const eyebrow = data['eyebrow']?.value || '';
  const title = data['title']?.value || '';

  const images = [1, 2, 3, 4, 5, 6]
    .map((n) => data[`image${n}`]?.value || '')
    .filter((src) => src);

  // Spans for masonry effect: 1st & 4th are tall (row-span-2)
  const itemSpans: Array<React.CSSProperties> = [
    { gridRow: 'span 2 / span 2', minHeight: '24rem' },
    { minHeight: '12rem' },
    { minHeight: '12rem' },
    { gridRow: 'span 2 / span 2', minHeight: '24rem' },
    { minHeight: '12rem' },
    { minHeight: '12rem' },
  ];

  return (
    <section className={`${styles.section} ${styles.bgDark800}`}>
      <div className={styles.sectionInner}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '3rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <div className={styles.dividerBlush} style={{ marginBottom: '1rem' }} />
            {eyebrow && <p className={styles.eyebrowLabel}>{eyebrow}</p>}
            <h2 className={styles.sectionTitle}>{title}</h2>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gridAutoRows: '12rem',
          gap: '0.75rem',
        }}>
          {images.map((src, i) => (
            <div key={i} className={styles.galleryItem} style={itemSpans[i] || { minHeight: '12rem' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`gallery ${i + 1}`} loading="lazy" />
              <div className={styles.photoOverlay} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

Gallery.meta = {
  componentKey: 'gallery',
  category: 'content',
  label: 'Wedding Gallery',
  dataSchema: {
    eyebrow: { type: 'text', label: '상단 라벨' },
    title: { type: 'text', label: '타이틀', required: true },
    image1: { type: 'image', label: '갤러리 이미지 1' },
    image2: { type: 'image', label: '갤러리 이미지 2' },
    image3: { type: 'image', label: '갤러리 이미지 3' },
    image4: { type: 'image', label: '갤러리 이미지 4' },
    image5: { type: 'image', label: '갤러리 이미지 5' },
    image6: { type: 'image', label: '갤러리 이미지 6' },
  },
  previewImage: '/component-previews/wedding/gallery.webp',
};

export default Gallery;
