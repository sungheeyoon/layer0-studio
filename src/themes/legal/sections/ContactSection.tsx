'use client';

import { ThemeSectionProps } from '../../types';
import styles from '../legal.module.css';
import { PhoneIcon, ClockIcon, MapPinIcon, ChatIcon } from './icons';

export default function ContactSection({ section }: ThemeSectionProps) {
  const { data } = section;
  const title = data['title']?.value || '';
  const body = data['body']?.value || '';
  const phone = data['phone']?.value || '';
  const hours = data['hours']?.value || '';
  const location = data['location']?.value || '';

  return (
    <section id="contact" className="py-24 md:py-32 px-4 bg-[#0f172a] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-white/3 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-amber-500/10 translate-y-1/2"></div>
      </div>

      <div className="max-w-5xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className={`${styles.sectionSep} mb-4`} style={{ background: 'linear-gradient(to right, #d97706, #f59e0b)' }}></div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight whitespace-pre-line mb-5">
              {title}
            </h2>
            <p className="text-blue-200/70 leading-relaxed mb-8">
              {body}
            </p>

            <ul className="space-y-4 list-none p-0">
              <li className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <PhoneIcon size={16} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-blue-200/50 font-medium m-0 uppercase tracking-wide">전화 상담</p>
                  <p className="text-white font-bold m-0">{phone}</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ClockIcon size={16} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-blue-200/50 font-medium m-0 uppercase tracking-wide">운영 시간</p>
                  <p className="text-white font-bold m-0">{hours}</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPinIcon size={16} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-blue-200/50 font-medium m-0 uppercase tracking-wide">위치</p>
                  <p className="text-white font-bold m-0">{location}</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-[#0f172a] mb-6">온라인 상담 신청</h3>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wide">성함</label>
                  <input type="text" placeholder="홍길동" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wide">연락처</label>
                  <input type="tel" placeholder="010-0000-0000" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wide">업무 분야</label>
                <select className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all appearance-none">
                  <option value="">분야를 선택해 주세요</option>
                  <option>기업법무 · 계약</option>
                  <option>세무 · 회계 · 세무조사</option>
                  <option>부동산 거래 · 등기</option>
                  <option>상속 · 증여</option>
                  <option>노무 · 인사</option>
                  <option>민사 · 형사 소송</option>
                  <option>기타</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wide">문의 내용</label>
                <textarea rows={4} placeholder="상담 받고 싶은 내용을 간략히 적어 주세요. (비밀 보장)" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all resize-none"></textarea>
              </div>

              <div className="flex items-start gap-2.5">
                <input type="checkbox" id="privacy-legal" className="mt-0.5 w-4 h-4" />
                <label htmlFor="privacy-legal" className="text-xs text-stone-500 leading-relaxed">개인정보 수집·이용에 동의합니다.</label>
              </div>

              <button type="submit" className={`${styles.btnPrimary} w-full justify-center py-3.5 text-base rounded-xl`}>
                <ChatIcon size={18} />
                상담 신청하기
              </button>
            </form>

            <p className="text-xs text-stone-400 text-center mt-4">영업일 기준 4시간 내 연락드립니다.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
