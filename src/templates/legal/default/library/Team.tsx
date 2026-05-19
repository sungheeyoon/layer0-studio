import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../legal.module.css';
import { getFieldValue } from '@/domain/entities/template.entity';

const Team: SectionComponent = function Team({ section }: TemplateSectionProps) {
  const { data } = section;
  const title = getFieldValue(data, 'title') || '';

  const members = [1, 2, 3].map(n => ({
    name: getFieldValue(data, `member${n}Name`) || '',
    role: getFieldValue(data, `member${n}Role`) || '',
    body: getFieldValue(data, `member${n}Body`) || '',
    image: getFieldValue(data, `member${n}Image`) || `https://picsum.photos/seed/legal_team_${n}/600/450`,
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
};

Team.meta = {
  componentKey: 'team',
  category: 'content',
  label: 'Legal Team',
  dataSchema: {
    title: { type: 'text', label: '섹션 타이틀', required: true },
    member1Name: { type: 'text', label: '멤버 1 이름' },
    member1Role: { type: 'text', label: '멤버 1 직함' },
    member1Body: { type: 'textarea', label: '멤버 1 설명' },
    member1Image: { type: 'image', label: '멤버 1 사진' },
    member2Name: { type: 'text', label: '멤버 2 이름' },
    member2Role: { type: 'text', label: '멤버 2 직함' },
    member2Body: { type: 'textarea', label: '멤버 2 설명' },
    member2Image: { type: 'image', label: '멤버 2 사진' },
    member3Name: { type: 'text', label: '멤버 3 이름' },
    member3Role: { type: 'text', label: '멤버 3 직함' },
    member3Body: { type: 'textarea', label: '멤버 3 설명' },
    member3Image: { type: 'image', label: '멤버 3 사진' },
  },
  previewImage: '/component-previews/legal/team.webp',
};

export default Team;
