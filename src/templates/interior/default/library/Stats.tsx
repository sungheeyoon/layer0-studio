import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../interior.module.css';
import { getFieldValue } from '@/domain/entities/template.entity';

const Stats: SectionComponent = function Stats({ section }: TemplateSectionProps) {
  const { data } = section;
  const stats = [1, 2, 3, 4].map(n => ({
    value: getFieldValue(data, `s${n}Value`),
    label: getFieldValue(data, `s${n}Label`),
  })).filter(s => s.value);

  return (
    <section className="border-y border-white border-opacity-5" style={{ background: 'var(--i-stat-bg)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white divide-opacity-5">
          {stats.map((s, i) => (
            <div key={i} className={`${styles.reveal} ${styles.revealIn} ${styles[`delay${i}` as keyof typeof styles] || ''} py-10 px-8 text-center`}>
              <p className={`${styles.statNum} ${styles.textGoldGrad}`}>
                {s.value}
                {(s.label?.includes('비율') || s.label?.includes('%')) ? (
                  <span className="text-2xl">%</span>
                ) : s.label?.includes('프로젝트') ? (
                  <span className="text-2xl">+</span>
                ) : null}
              </p>
              <p className="text-[13px] text-[var(--i-muted)] mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

Stats.meta = {
  componentKey: 'stats',
  category: 'content',
  label: 'Interior Stats Bar',
  dataSchema: {
    s1Value: { type: 'text', label: '통계 1 수치' },
    s1Label: { type: 'text', label: '통계 1 라벨' },
    s2Value: { type: 'text', label: '통계 2 수치' },
    s2Label: { type: 'text', label: '통계 2 라벨' },
    s3Value: { type: 'text', label: '통계 3 수치' },
    s3Label: { type: 'text', label: '통계 3 라벨' },
    s4Value: { type: 'text', label: '통계 4 수치' },
    s4Label: { type: 'text', label: '통계 4 라벨' },
  },
  previewImage: '/component-previews/interior/stats.webp',
};

export default Stats;
