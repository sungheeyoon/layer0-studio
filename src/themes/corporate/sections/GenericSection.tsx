import { ThemeSectionProps } from '../../types';
import styles from '../corporate.module.css';

export default function GenericSection({ section }: ThemeSectionProps) {
  const { data } = section;
  const title = data['title']?.value || data['heading']?.value;
  const body = data['body']?.value;
  const image = data['image']?.value || data['backgroundImage']?.value;

  return (
    <div className={`${styles.section} ${styles.genericSection}`}>
      {title && <h2 className={styles.sectionTitle}>{title}</h2>}
      {body && <p className={styles.sectionBody}>{body}</p>}
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={title || ''} className="w-full mt-8 grayscale hover:grayscale-0 transition-all duration-700" />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {Object.entries(data)
          .filter(([key]) => !['title', 'heading', 'body', 'image', 'backgroundImage'].includes(key))
          .map(([key, field]) => (
            <div key={key} className="p-6 border border-gray-100 bg-gray-50/30">
              <span className="text-[10px] uppercase tracking-[0.2em] block mb-2 opacity-50 font-medium">{field.label}</span>
              <span className="text-sm font-light leading-relaxed">{field.value}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
