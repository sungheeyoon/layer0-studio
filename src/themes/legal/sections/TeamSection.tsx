import { ThemeSectionProps } from '../../types';
import styles from '../legal.module.css';

export default function TeamSection({ section }: ThemeSectionProps) {
  const { data } = section;
  const title = data['title']?.value || '';

  const members = [1, 2, 3].map(n => ({
    name: data[`member${n}Name`]?.value || '',
    role: data[`member${n}Role`]?.value || '',
    body: data[`member${n}Body`]?.value || '',
    image: data[`member${n}Image`]?.value || `https://picsum.photos/seed/legal_team_${n}/600/450`,
    badge: n === 1 ? '대표 변호사' : n === 2 ? '수석 세무사' : '파트너 변호사',
    badgeBg: n === 1 ? 'bg-amber-500' : 'bg-[#1e2b5e]',
  }));

  return (
    <section id="team" className="py-24 md:py-32 px-4 bg-white">
      <div className={styles.container}>
        <div className="text-center mb-16">
          <div className={`${styles.sectionSep} mx-auto mb-4`}></div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Our Team</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {members.map((m, i) => (
            <div key={i} className="group">
              <div className="bg-stone-100 rounded-2xl overflow-hidden mb-5 aspect-[4/3] relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.image} alt={m.name} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <span className={`inline-block px-2.5 py-1 ${m.badgeBg} text-white text-xs font-bold rounded-lg`}>{m.badge}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-1">{m.name}</h3>
              <p className="text-sm text-amber-700 font-semibold mb-2">{m.role}</p>
              <p className="text-sm text-stone-500 leading-relaxed">{m.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-stone-400">이 외 변호사 7명, 세무사 5명, 노무사 3명이 함께합니다.</p>
        </div>
      </div>
    </section>
  );
}
