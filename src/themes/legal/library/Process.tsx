import { TemplateSectionProps, SectionComponent } from '../../types';
import styles from '../legal.module.css';
import { getFieldValue } from '@/domain/entities/template.entity';

const Process: SectionComponent = function Process({ section }: TemplateSectionProps) {
  const { data } = section;
  const title = getFieldValue(data, 'title') || '';

  const steps = [1, 2, 3, 4, 5].map(n => ({
    title: getFieldValue(data, `step${n}Title`) || '',
    body: getFieldValue(data, `step${n}Body`) || '',
  }));

  return (
    <section id="process" className="py-24 md:py-32 px-4 bg-stone-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className={`${styles.sectionSep} mx-auto mb-4`}></div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">How We Work</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">
            {title}
          </h2>
        </div>

        <div className="space-y-4">
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1;
            const bgClass = isLast ? 'bg-amber-50 border-amber-100' : 'bg-white border-stone-200';
            const numBgClass = isLast ? 'bg-amber-500 text-white' : 'bg-[#0f172a] text-amber-400';
            
            return (
              <div key={i} className={`flex gap-6 rounded-2xl p-6 border transition-shadow hover:shadow-md ${bgClass}`}>
                <div className="flex flex-col items-center">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${numBgClass}`}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  {!isLast && <div className="w-px flex-1 bg-stone-200 mt-2"></div>}
                </div>
                <div className="pt-1 pb-4">
                  <h3 className={`font-bold text-[#0f172a] mb-1`}>{step.title}</h3>
                  <p className={`text-sm leading-relaxed ${isLast ? 'text-stone-600' : 'text-stone-500'}`}>
                    {step.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

Process.meta = {
  componentKey: 'process',
  category: 'content',
  label: 'Legal Process',
  dataSchema: {
    title: { type: 'text', label: '섹션 타이틀', required: true },
    step1Title: { type: 'text', label: '단계 1 제목' },
    step1Body: { type: 'textarea', label: '단계 1 설명' },
    step2Title: { type: 'text', label: '단계 2 제목' },
    step2Body: { type: 'textarea', label: '단계 2 설명' },
    step3Title: { type: 'text', label: '단계 3 제목' },
    step3Body: { type: 'textarea', label: '단계 3 설명' },
    step4Title: { type: 'text', label: '단계 4 제목' },
    step4Body: { type: 'textarea', label: '단계 4 설명' },
    step5Title: { type: 'text', label: '단계 5 제목' },
    step5Body: { type: 'textarea', label: '단계 5 설명' },
  },
  previewImage: '/component-previews/legal/process.webp',
};

export default Process;
