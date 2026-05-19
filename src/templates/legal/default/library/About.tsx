import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../legal.module.css';
import { UserHandsIcon, DocumentTextIcon, LockIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const About: SectionComponent = function About({ section }: TemplateSectionProps) {
  const { data } = section;
  const title = getFieldValue(data, 'title') || '';
  const body = getFieldValue(data, 'body') || '';

  const reasons = [
    { title: getFieldValue(data, 'reason1Title'), body: getFieldValue(data, 'reason1Body'), icon: <UserHandsIcon size={20} className="text-amber-400" /> },
    { title: getFieldValue(data, 'reason2Title'), body: getFieldValue(data, 'reason2Body'), icon: <DocumentTextIcon size={20} className="text-amber-400" /> },
    { title: getFieldValue(data, 'reason3Title'), body: getFieldValue(data, 'reason3Body'), icon: <LockIcon size={20} className="text-amber-400" /> },
  ];

  return (
    <section id="about" className="py-24 md:py-32 px-4 bg-stone-50">
      <div className={styles.container}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className={`${styles.sectionSep} mb-4`}></div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Why Haram</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight leading-tight whitespace-pre-line mb-6">
              {title}
            </h2>
            <p className="text-stone-600 leading-relaxed">
              {body}
            </p>
          </div>

          <div className="space-y-6">
            {reasons.map((r, i) => (
              <div key={i} className="flex gap-5 bg-white rounded-xl p-6 border border-stone-200 shadow-sm transition-shadow hover:shadow-md">
                <div className="w-12 h-12 bg-[#0f172a] rounded-xl flex items-center justify-center flex-shrink-0">
                  {r.icon}
                </div>
                <div>
                  <h3 className="font-bold text-[#0f172a] mb-1">{r.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

About.meta = {
  componentKey: 'about',
  category: 'content',
  label: 'Legal About',
  dataSchema: {
    title: { type: 'textarea', label: '섹션 타이틀', required: true },
    body: { type: 'textarea', label: '본문' },
    reason1Title: { type: 'text', label: '이유 1 제목' },
    reason1Body: { type: 'textarea', label: '이유 1 설명' },
    reason2Title: { type: 'text', label: '이유 2 제목' },
    reason2Body: { type: 'textarea', label: '이유 2 설명' },
    reason3Title: { type: 'text', label: '이유 3 제목' },
    reason3Body: { type: 'textarea', label: '이유 3 설명' },
  },
  previewImage: '/component-previews/legal/about.webp',
};

export default About;
