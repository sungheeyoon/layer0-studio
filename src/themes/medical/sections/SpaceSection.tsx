import { ThemeSectionProps } from '../../types';
import styles from '../medical.module.css';
import { BuildingsIcon, SofaIcon, ShieldCheckIcon, MapPointIcon } from './icons';

export default function SpaceSection({ section }: ThemeSectionProps) {
  const { data } = section;
  const label = data['label']?.value || '';
  const title = data['title']?.value || '';
  const description = data['description']?.value || '';
  const mainImage = data['mainImage']?.value || '';
  const subImage = data['subImage']?.value || '';

  const features = [
    { title: data['feature1Title']?.value, desc: data['feature1Desc']?.value, icon: <BuildingsIcon size={22} className="text-[#C8A97E]" /> },
    { title: data['feature2Title']?.value, desc: data['feature2Desc']?.value, icon: <SofaIcon size={22} className="text-[#C8A97E]" /> },
    { title: data['feature3Title']?.value, desc: data['feature3Desc']?.value, icon: <ShieldCheckIcon size={22} className="text-[#C8A97E]" /> },
    { title: data['feature4Title']?.value, desc: data['feature4Desc']?.value, icon: <MapPointIcon size={22} className="text-[#C8A97E]" /> },
  ].filter(f => f.title);

  return (
    <section className="bg-[#1C1917] overflow-hidden" id="space">
      <div className="grid lg:grid-cols-2 min-h-[80vh]">
        {/* Left: text + feature grid */}
        <div className="flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-20 order-2 lg:order-1">
          <div>
            <p className={styles.sectionLabel} style={{ color: '#C8A97E' }}>{label}</p>
            <h2 className={`${styles.fontDisplay} text-[clamp(2.4rem,4vw,3.8rem)] font-light text-[#F9F7F3] leading-[1.08] mt-6 mb-8 whitespace-pre-line`}>
              {title}
            </h2>
            <p className="text-[#F9F7F3]/55 text-[15px] leading-[1.85] max-w-[360px] mb-12 whitespace-pre-line">
              {description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div key={i} className="border border-[#F9F7F3]/10 p-5 hover:border-[#C8A97E]/40 transition-colors group">
                <div className="mb-3 block group-hover:scale-110 transition-transform">{f.icon}</div>
                <p className="text-[#F9F7F3] text-sm font-medium mb-1">{f.title}</p>
                <p className="text-[#F9F7F3]/40 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: image collage */}
        <div className="relative order-1 lg:order-2 h-[60vw] max-h-[600px] lg:h-auto lg:max-h-none">
          {mainImage && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={mainImage}
              alt="Clinic Space"
              className="w-full h-full object-cover opacity-75"
            />
          )}
          {/* Inset smaller image */}
          {subImage && (
            <div className="absolute bottom-8 -left-6 lg:-left-12 w-44 lg:w-60 shadow-2xl border-[3px] border-[#1C1917]">
              {/* eslint-disable-next-line @next/next/no-img-element */ }
              <img
                src={subImage}
                alt="Clinic Lounge"
                className="w-full h-28 lg:h-40 object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
