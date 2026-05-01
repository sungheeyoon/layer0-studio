import { ThemeSectionProps } from '../../types';
import styles from '../interior.module.css';

export default function StatsSection({ section }: ThemeSectionProps) {
  const { data } = section;
  const stats = [1, 2, 3, 4].map(n => ({
    value: data[`s${n}Value`]?.value,
    label: data[`s${n}Label`]?.value,
  })).filter(s => s.value);

  return (
    <section className="border-y border-white border-opacity-5" style={{ background: '#111009' }}>
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
}
