import { ThemeSectionProps } from '../../types';
import styles from '../legal.module.css';
import { ArrowRightIcon, BuildingsIcon, CalculatorIcon, HomeIcon, GraphIcon, UserHandsIcon, LawIcon, CheckCircleIcon } from './icons';

export default function ServicesSection({ section }: ThemeSectionProps) {
  const { data } = section;
  const title = data['title']?.value || '';

  const services = [
    { title: data['service1Title']?.value, body: data['service1Body']?.value, icon: <BuildingsIcon size={40} className="text-amber-400 mb-5" />, large: true },
    { title: data['service2Title']?.value, body: data['service2Body']?.value, icon: <CalculatorIcon size={32} className="text-amber-600 mb-4" />, bg: 'bg-amber-50 border-amber-100' },
    { title: data['service3Title']?.value, body: data['service3Body']?.value, icon: <HomeIcon size={32} className="text-[#0f172a] mb-4" />, bg: 'bg-stone-50 border-stone-200' },
    { title: data['service4Title']?.value, body: data['service4Body']?.value, icon: <GraphIcon size={32} className="text-[#0f172a] mb-4" />, bg: 'bg-stone-50 border-stone-200' },
    { title: data['service5Title']?.value, body: data['service5Body']?.value, icon: <UserHandsIcon size={32} className="text-[#0f172a] mb-4" />, bg: 'bg-stone-50 border-stone-200' },
  ];

  const mainCtaTitle = data['service6Title']?.value || '';
  const mainCtaBody = data['service6Body']?.value || '';

  return (
    <section id="services" className="py-24 md:py-32 px-4 bg-white">
      <div className={styles.container}>
        <div className="mb-16">
          <div className={`${styles.sectionSep} mb-4`}></div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Practice Areas</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight leading-tight whitespace-pre-line max-w-2xl">
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Service 1 - Large */}
          <div className="md:col-span-2 bg-[#0f172a] rounded-2xl p-8 relative overflow-hidden transition-transform duration-400 hover:-translate-y-1 hover:shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/3 pointer-events-none"></div>
            {services[0].icon}
            <h3 className="text-xl font-bold text-white mb-2">{services[0].title}</h3>
            <p className="text-blue-200/70 text-sm leading-relaxed mb-6">{services[0].body}</p>
            <ul className="space-y-2 list-none p-0">
              <li className="flex items-center gap-2 text-sm text-blue-100/80">
                <CheckCircleIcon size={16} className="text-amber-400 flex-shrink-0" />
                계약서 작성·검토·분쟁
              </li>
              <li className="flex items-center gap-2 text-sm text-blue-100/80">
                <CheckCircleIcon size={16} className="text-amber-400 flex-shrink-0" />
                법인 설립 · 지분 구조 설계
              </li>
              <li className="flex items-center gap-2 text-sm text-blue-100/80">
                <CheckCircleIcon size={16} className="text-amber-400 flex-shrink-0" />
                M&A · 주주간계약 · 투자계약
              </li>
            </ul>
          </div>

          {/* Service 2 */}
          <div className={`rounded-2xl p-7 border transition-transform duration-400 hover:-translate-y-1 hover:shadow-xl ${services[1].bg}`}>
            {services[1].icon}
            <h3 className="text-lg font-bold text-[#0f172a] mb-2">{services[1].title}</h3>
            <p className="text-stone-600 text-sm leading-relaxed">{services[1].body}</p>
          </div>

          {/* Service 3, 4, 5 */}
          {services.slice(2).map((s, i) => (
            <div key={i} className={`rounded-2xl p-7 border transition-transform duration-400 hover:-translate-y-1 hover:shadow-xl ${s.bg}`}>
              {s.icon}
              <h3 className="text-lg font-bold text-[#0f172a] mb-2">{s.title}</h3>
              <p className="text-stone-600 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}

          {/* Service 6 - Wide CTA */}
          <div className="md:col-span-3 bg-gradient-to-r from-[#0f172a] to-[#1e2b5e] rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center gap-6 transition-transform duration-400 hover:-translate-y-1 hover:shadow-2xl">
            <div className="flex-1">
              <LawIcon size={32} className="text-amber-400 mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">{mainCtaTitle}</h3>
              <p className="text-blue-200/70 text-sm leading-relaxed max-w-xl">{mainCtaBody}</p>
            </div>
            <a href="#contact" className={`${styles.btnGold} flex-shrink-0 no-underline`}>
              상담 신청
              <ArrowRightIcon size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
