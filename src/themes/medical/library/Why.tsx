import { ThemeSectionProps, SectionComponent } from '../../types';
import styles from '../medical.module.css';
import { getFieldValue } from '@/domain/entities/template.entity';

const Why: SectionComponent = function Why({ section }: ThemeSectionProps) {
  const { data } = section;
  const label = getFieldValue(data, 'label') || '';
  const title = getFieldValue(data, 'title') || '';

  const features = [
    { title: getFieldValue(data, 'f1Title'), desc: getFieldValue(data, 'f1Desc'), image: getFieldValue(data, 'f1Image'), num: '01' },
    { title: getFieldValue(data, 'f2Title'), desc: getFieldValue(data, 'f2Desc'), image: getFieldValue(data, 'f2Image'), num: '02', reverse: true },
    { title: getFieldValue(data, 'f3Title'), desc: getFieldValue(data, 'f3Desc'), image: getFieldValue(data, 'f3Image'), num: '03' },
  ].filter(f => f.title);

  return (
    <section className="py-24 lg:py-36 bg-[#F0EBE1]" id="why">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-20">
          <p className={`${styles.sectionLabel} justify-center mb-5`}>{label}</p>
          <h2 className={`${styles.fontDisplay} text-[clamp(2rem,3.5vw,3.2rem)] font-light text-[#1C1917] whitespace-pre-line`}>
            {title}
          </h2>
        </div>

        <div className="space-y-20 lg:space-y-28">
          {features.map((f, i) => (
            <div key={i} className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className={`${f.reverse ? 'order-1 lg:order-2' : ''}`}>
                <div className="aspect-[4/3] overflow-hidden bg-[#F9F7F3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.image}
                    alt={f.title?.replace('\n', ' ')}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
              <div className={`${f.reverse ? 'order-2 lg:order-1 lg:pr-8' : 'lg:pl-8'}`}>
                <span className={`${styles.fontDisplay} text-[5rem] font-light text-[#C8A97E]/25 leading-none`}>{f.num}</span>
                <h3 className={`${styles.fontDisplay} text-[clamp(1.6rem,2.5vw,2.2rem)] font-light text-[#1C1917] mt-2 mb-5 leading-tight whitespace-pre-line`}>
                  {f.title}
                </h3>
                <p className="text-[#9C9189] text-[15px] leading-[1.85] mb-7 whitespace-pre-line">
                  {f.desc}
                </p>
                <div className="flex flex-wrap gap-2">
                  {i === 0 && ['AI 피부 분석', '15년 임상 DB', '개인 맞춤 리포트'].map(tag => (
                    <span key={tag} className={`${styles.pill} bg-[#F9F7F3] border border-[#E5DDD4] text-[#1C1917]/65 text-[11px]`}>{tag}</span>
                  ))}
                  {i === 1 && ['전문의 직접 시술', '1:1 전담 케어', '사후 관리 포함'].map(tag => (
                    <span key={tag} className={`${styles.pill} bg-[#F9F7F3] border border-[#E5DDD4] text-[#1C1917]/65 text-[11px]`}>{tag}</span>
                  ))}
                  {i === 2 && ['FDA 인증 장비', '국내 최초 도입', '정기 업데이트'].map(tag => (
                    <span key={tag} className={`${styles.pill} bg-[#F9F7F3] border border-[#E5DDD4] text-[#1C1917]/65 text-[11px]`}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

Why.meta = {
  componentKey: 'why',
  category: 'content',
  label: 'Why Medical',
  dataSchema: {
    label: { type: 'text', label: '섹션 라벨' },
    title: { type: 'text', label: '섹션 타이틀', required: true },
    f1Title: { type: 'textarea', label: '특징 1 제목' },
    f1Desc: { type: 'textarea', label: '특징 1 설명' },
    f1Image: { type: 'image', label: '특징 1 이미지' },
    f2Title: { type: 'textarea', label: '특징 2 제목' },
    f2Desc: { type: 'textarea', label: '특징 2 설명' },
    f2Image: { type: 'image', label: '특징 2 이미지' },
    f3Title: { type: 'textarea', label: '특징 3 제목' },
    f3Desc: { type: 'textarea', label: '특징 3 설명' },
    f3Image: { type: 'image', label: '특징 3 이미지' },
  },
  previewImage: '/component-previews/medical/why.webp',
};

export default Why;
