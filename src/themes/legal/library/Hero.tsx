import { ThemeSectionProps, SectionComponent } from '../../types';
import styles from '../legal.module.css';
import { VerifiedCheckIcon, ChatIcon, ArrowDownIcon, DiplomaIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Hero: SectionComponent = function Hero({ section }: ThemeSectionProps) {
  const { data } = section;
  const eyebrow = getFieldValue(data, 'eyebrow') || '';
  const title = getFieldValue(data, 'title') || '';
  const subtitle = getFieldValue(data, 'subtitle') || '';
  const ctaPrimaryText = getFieldValue(data, 'ctaPrimaryText') || '';
  const ctaSecondaryText = getFieldValue(data, 'ctaSecondaryText') || '';

  const stat1Value = getFieldValue(data, 'stat1Value') || '';
  const stat1Label = getFieldValue(data, 'stat1Label') || '';
  const stat2Value = getFieldValue(data, 'stat2Value') || '';
  const stat2Label = getFieldValue(data, 'stat2Label') || '';
  const stat3Value = getFieldValue(data, 'stat3Value') || '';
  const stat3Label = getFieldValue(data, 'stat3Label') || '';
  const stat4Value = getFieldValue(data, 'stat4Value') || '';
  const stat4Label = getFieldValue(data, 'stat4Label') || '';

  return (
    <section className="bg-gradient-to-br from-[#fafaf9] via-[#f8f7f4] to-[#f0ece4] min-h-[100dvh] flex flex-col justify-center pt-28 pb-20 px-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none opacity-40" aria-hidden="true">
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full border border-stone-300/60"></div>
        <div className="absolute top-32 right-24 w-48 h-48 rounded-full border border-stone-300/40"></div>
        <div className="absolute bottom-32 right-0 w-96 h-1 bg-gradient-to-l from-amber-300/50 to-transparent"></div>
      </div>

      <div className={styles.container}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            {eyebrow && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold tracking-wide uppercase mb-8">
                <VerifiedCheckIcon size={14} className="text-amber-600" />
                {eyebrow}
              </div>
            )}

            <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold text-[#0f172a] leading-[1.1] tracking-tight whitespace-pre-line mb-6">
              {title}
            </h1>

            <p className="text-lg text-stone-600 leading-relaxed max-w-[55ch] mb-10">
              {subtitle}
            </p>

            <div className="flex flex-wrap gap-3">
              {ctaPrimaryText && (
                <a href="#contact" className={`${styles.btnGold} no-underline`}>
                  <ChatIcon size={18} />
                  {ctaPrimaryText}
                </a>
              )}
              {ctaSecondaryText && (
                <a href="#services" className={`${styles.btnOutline} no-underline`}>
                  {ctaSecondaryText}
                  <ArrowDownIcon size={16} />
                </a>
              )}
            </div>

            <p className="text-sm text-stone-400 mt-4">평일 09:00–18:00 · 상담 후 비용 안내 · 비밀 보장</p>
          </div>

          <div className="lg:relative">
            <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-xl shadow-stone-200/60">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-stone-100">
                <div className="w-10 h-10 bg-[#0f172a] rounded-xl flex items-center justify-center flex-shrink-0">
                  <DiplomaIcon size={20} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Established</p>
                  <p className="text-sm font-bold text-[#0f172a]">2001년 창립 · 서울 강남 소재</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-4xl font-black text-[#0f172a]">{stat1Value}<span className="text-2xl font-bold text-amber-600">{stat1Label}</span></p>
                </div>
                <div>
                  <p className="text-4xl font-black text-[#0f172a]">{stat2Value}<span className="text-lg font-bold text-amber-600">{stat2Label}</span></p>
                </div>
                <div>
                  <p className="text-4xl font-black text-[#0f172a]">{stat3Value}<span className="text-lg font-bold text-amber-600">{stat3Label}</span></p>
                </div>
                <div>
                  <p className="text-4xl font-black text-[#0f172a]">{stat4Value}<span className="text-lg font-bold text-amber-600">{stat4Label}</span></p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3.5 bg-amber-50 rounded-xl border border-amber-100">
                <VerifiedCheckIcon size={16} className="text-amber-500 flex-shrink-0" />
                <p className="text-xs font-medium text-amber-900">네이버 법률 상담 4.9점 · 리뷰 2,140건</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

Hero.meta = {
  componentKey: 'hero',
  category: 'hero',
  label: 'Legal Hero',
  dataSchema: {
    eyebrow: { type: 'text', label: '상단 배지' },
    title: { type: 'textarea', label: '메인 타이틀', required: true },
    subtitle: { type: 'textarea', label: '서브 타이틀' },
    ctaPrimaryText: { type: 'text', label: '기본 CTA' },
    ctaSecondaryText: { type: 'text', label: '보조 CTA' },
    stat1Value: { type: 'text', label: '통계 1 값' },
    stat1Label: { type: 'text', label: '통계 1 라벨' },
    stat2Value: { type: 'text', label: '통계 2 값' },
    stat2Label: { type: 'text', label: '통계 2 라벨' },
    stat3Value: { type: 'text', label: '통계 3 값' },
    stat3Label: { type: 'text', label: '통계 3 라벨' },
    stat4Value: { type: 'text', label: '통계 4 값' },
    stat4Label: { type: 'text', label: '통계 4 라벨' },
  },
  previewImage: '/component-previews/legal/hero.webp',
};

export default Hero;
