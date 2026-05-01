import { ThemeSectionProps } from '../../types';
import styles from '../cafe.module.css';
import { LeafIcon, FireIcon, HandHeartIcon } from './icons';

export default function StorySection({ section }: ThemeSectionProps) {
  const { data } = section;
  const label = data['label']?.value || '카페 소개';
  const title1 = data['title1']?.value || '커피 한 잔에는';
  const titleAccent = data['titleAccent']?.value || '이야기가';
  const title2 = data['title2']?.value || '담겨 있습니다';
  const quote = data['quote']?.value || '';
  const description = data['description']?.value || '';
  const image = data['image']?.value || '';

  const pillars = [
    { title: data['f1Title']?.value, desc: data['f1Desc']?.value, icon: <LeafIcon size={22} className="text-[var(--c-terra)] fill-current" /> },
    { title: data['f2Title']?.value, desc: data['f2Desc']?.value, icon: <FireIcon size={22} className="text-[var(--c-terra)] fill-current" /> },
    { title: data['f3Title']?.value, desc: data['f3Desc']?.value, icon: <HandHeartIcon size={22} className="text-[var(--c-terra)] fill-current" /> },
  ].filter(p => p.title);

  return (
    <section className="py-24 lg:py-32 bg-[var(--c-espresso)]" id="story">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-20 lg:mb-28">
          {/* Text */}
          <div className={`${styles.reveal} ${styles.revealIn} order-2 lg:order-1`}>
            <p className={`${styles.sectionLabel} mb-6`} style={{ color: 'var(--c-terra)' }}>{label}</p>
            <h2
              className={`${styles.fontSerif} leading-[1.08] text-[var(--c-linen)] mb-8`}
              style={{ fontSize: 'clamp(2.4rem, 4.5vw, 4rem)' }}
            >
              {title1}<br />
              <em style={{ color: 'var(--c-terra)', fontStyle: 'italic' }}>{titleAccent}</em><br />
              {title2}
            </h2>
            <div className={`${styles.quoteLine} pl-6 mb-8`}>
              <p className="text-[var(--c-linen)] opacity-55 text-[15px] leading-[1.9] whitespace-pre-line">
                {quote}
              </p>
            </div>
            <p className="text-[var(--c-linen)] opacity-45 text-[14px] leading-[1.85] whitespace-pre-line">
              {description}
            </p>
          </div>

          {/* Image */}
          <div className={`${styles.reveal} ${styles.revealIn} order-1 lg:order-2`}>
            <div className="aspect-square overflow-hidden" style={{ borderRadius: '8px' }}>
              {image && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={image}
                  alt="Story"
                  className="w-full h-full object-cover spring hover:scale-[1.04]"
                  loading="lazy"
                />
              )}
            </div>
          </div>
        </div>

        {/* Three pillars */}
        <div className={`${styles.reveal} ${styles.revealIn} grid md:grid-cols-3 gap-8 border-t border-[var(--c-linen)] opacity-10 pt-16`}>
          {pillars.map((p, i) => (
            <div key={i} className="opacity-100">
               <div className="w-12 h-12 flex items-center justify-center bg-[var(--c-terra)]/10 border border-[var(--c-terra)]/20 mb-5">
                {p.icon}
              </div>
              <h3 className={`${styles.fontSerif} text-[var(--c-linen)] text-[1.25rem] italic mb-3`}>{p.title}</h3>
              <p className="text-[var(--c-linen)] opacity-45 text-[13px] leading-relaxed whitespace-pre-line">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
