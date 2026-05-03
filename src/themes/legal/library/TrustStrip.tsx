import { ThemeSectionProps, SectionComponent } from '../../types';
import styles from '../legal.module.css';
import { BuildingsIcon, DocumentTextIcon, HomeIcon, UserHandsIcon } from '../sections/icons';

const TrustStrip: SectionComponent = function TrustStrip({ section }: ThemeSectionProps) {
  const { data } = section;
  
  const stats = [1, 2, 3, 4].map(n => ({
    value: data[`stat${n}Value`]?.value || '',
    label: data[`stat${n}Label`]?.value || '',
  }));

  const icons = [
    <BuildingsIcon key="1" size={32} className="text-amber-400 mb-3 mx-auto" />,
    <DocumentTextIcon key="2" size={32} className="text-amber-400 mb-3 mx-auto" />,
    <HomeIcon key="3" size={32} className="text-amber-400 mb-3 mx-auto" />,
    <UserHandsIcon key="4" size={32} className="text-amber-400 mb-3 mx-auto" />,
  ];

  return (
    <section className="bg-[#0f172a] py-16 px-4">
      <div className={styles.container}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-white/10">
          {stats.map((s, i) => (
            <div key={i} className="text-center px-8">
              {icons[i]}
              <p className="text-3xl font-black text-white">{s.value}<span className="text-xl text-amber-400">+</span></p>
              <p className="text-sm text-blue-200/70 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

TrustStrip.meta = {
  componentKey: 'trust-strip',
  category: 'content',
  label: 'Legal Trust Strip',
  dataSchema: {
    stat1Value: { type: 'text', label: '통계 1 값' },
    stat1Label: { type: 'text', label: '통계 1 라벨' },
    stat2Value: { type: 'text', label: '통계 2 값' },
    stat2Label: { type: 'text', label: '통계 2 라벨' },
    stat3Value: { type: 'text', label: '통계 3 값' },
    stat3Label: { type: 'text', label: '통계 3 라벨' },
    stat4Value: { type: 'text', label: '통계 4 값' },
    stat4Label: { type: 'text', label: '통계 4 라벨' },
  },
  previewImage: '/component-previews/legal/trust-strip.webp',
};

export default TrustStrip;
