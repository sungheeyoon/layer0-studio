import { ThemeSectionProps, SectionComponent } from '../../types';
import styles from '../medical.module.css';
import { GraduationCapIcon, HospitalIcon, ClockIcon } from '../sections/icons';

const Team: SectionComponent = function Team({ section }: ThemeSectionProps) {
  const { data } = section;
  const label = data['label']?.value || '';
  const title = data['title']?.value || '';
  const description = data['description']?.value || '';

  const members = [1, 2, 3].map(n => ({
    name: data[`member${n}Name`]?.value,
    role: data[`member${n}Role`]?.value,
    info1: data[`member${n}Info1`]?.value,
    info2: data[`member${n}Info2`]?.value,
    info3: data[`member${n}Info3`]?.value,
    image: data[`member${n}Image`]?.value,
    mt: n === 2 ? 'lg:mt-10' : '',
  })).filter(m => m.name);

  return (
    <section className="py-24 lg:py-32 px-6 lg:px-10 max-w-7xl mx-auto" id="team">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-14 gap-6">
        <div>
          <p className={`${styles.sectionLabel} mb-5`}>{label}</p>
          <h2 className={`${styles.fontDisplay} text-[clamp(2rem,3.5vw,3.2rem)] font-light text-[#1C1917] leading-[1.12] whitespace-pre-line`}>
            {title}
          </h2>
        </div>
        <p className="text-[#9C9189] text-[14px] leading-relaxed max-w-[280px]">
          {description}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
        {members.map((m, i) => (
          <div key={i} className={`${m.mt}`}>
            <div className="aspect-[3/4] overflow-hidden bg-[#F0EBE1]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.image} alt={m.name} className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="pt-6">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <h3 className="text-[#1C1917] font-semibold text-lg">{m.name}</h3>
                <span className={`${styles.pill} bg-[#F0EBE1] text-[#9C9189] border border-[#E5DDD4] text-[11px]`}>{m.role}</span>
              </div>
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-[#9C9189] text-[12px]">
                  <GraduationCapIcon size={14} className="text-[#C8A97E] shrink-0" />
                  {m.info1}
                </p>
                <p className="flex items-center gap-2 text-[#9C9189] text-[12px]">
                  <HospitalIcon size={14} className="text-[#C8A97E] shrink-0" />
                  {m.info2}
                </p>
                <p className="flex items-center gap-2 text-[#9C9189] text-[12px]">
                  <ClockIcon size={14} className="text-[#C8A97E] shrink-0" />
                  {m.info3}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

Team.meta = {
  componentKey: 'team',
  category: 'content',
  label: 'Medical Team',
  dataSchema: {
    label: { type: 'text', label: '섹션 라벨' },
    title: { type: 'textarea', label: '섹션 타이틀', required: true },
    description: { type: 'text', label: '섹션 설명' },
    member1Name: { type: 'text', label: 'M1 이름' },
    member1Role: { type: 'text', label: 'M1 역할' },
    member1Info1: { type: 'text', label: 'M1 정보 1' },
    member1Info2: { type: 'text', label: 'M1 정보 2' },
    member1Info3: { type: 'text', label: 'M1 정보 3' },
    member1Image: { type: 'image', label: 'M1 이미지' },
    member2Name: { type: 'text', label: 'M2 이름' },
    member2Role: { type: 'text', label: 'M2 역할' },
    member2Info1: { type: 'text', label: 'M2 정보 1' },
    member2Info2: { type: 'text', label: 'M2 정보 2' },
    member2Info3: { type: 'text', label: 'M2 정보 3' },
    member2Image: { type: 'image', label: 'M2 이미지' },
    member3Name: { type: 'text', label: 'M3 이름' },
    member3Role: { type: 'text', label: 'M3 역할' },
    member3Info1: { type: 'text', label: 'M3 정보 1' },
    member3Info2: { type: 'text', label: 'M3 정보 2' },
    member3Info3: { type: 'text', label: 'M3 정보 3' },
    member3Image: { type: 'image', label: 'M3 이미지' },
  },
  previewImage: '/component-previews/medical/team.webp',
};

export default Team;
