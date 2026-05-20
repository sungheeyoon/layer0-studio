import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../legal.module.css';
import { ShieldCheckIcon, DocumentTextIcon, ChatIcon, PlayCircleIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Footer: SectionComponent = function Footer({ section }: TemplateSectionProps) {
  const { data } = section;
  const brandName = getFieldValue(data, 'brandName') || '하람 법률세무사무소';
  const copyright = getFieldValue(data, 'copyright') || '© 2024 하람 법률세무사무소. All rights reserved.';
  const address = getFieldValue(data, 'address') || '';

  return (
    <footer className="bg-[var(--l-navy-deep)] py-16 px-4">
      <div className={styles.container}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-white/8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <ShieldCheckIcon size={16} className="text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-base tracking-tight leading-none block">{brandName}</span>
                <span className="text-blue-300/50 text-[10px] tracking-widest font-medium uppercase leading-none block mt-0.5">Haram Law & Tax Office</span>
              </div>
            </div>
            <p className="text-sm text-blue-200/50 leading-relaxed max-w-xs">
              2001년 창립 이후 23년간 의뢰인의 신뢰를 최우선으로 지켜온 법률·세무 전문 사무소입니다.
            </p>
            <div className="flex gap-3 mt-5">
              <div className="w-9 h-9 rounded-lg bg-white/8 flex items-center justify-center text-blue-200/60 hover:text-white hover:bg-white/15 transition-all cursor-pointer">
                <DocumentTextIcon size={16} />
              </div>
              <div className="w-9 h-9 rounded-lg bg-white/8 flex items-center justify-center text-blue-200/60 hover:text-white hover:bg-white/15 transition-all cursor-pointer">
                <PlayCircleIcon size={16} />
              </div>
              <div className="w-9 h-9 rounded-lg bg-white/8 flex items-center justify-center text-blue-200/60 hover:text-white hover:bg-white/15 transition-all cursor-pointer">
                <ChatIcon size={16} />
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-white uppercase tracking-widest mb-4">업무 분야</p>
            <ul className="space-y-2.5 list-none p-0 m-0">
              {['기업법무 · 계약', '세무 · 회계', '부동산 거래', '상속 · 증여', '노무 · 인사', '민·형사 소송'].map(item => (
                <li key={item}><a href="#services" className="text-sm text-blue-200/50 hover:text-white transition-colors no-underline">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold text-white uppercase tracking-widest mb-4">사무소</p>
            <ul className="space-y-2.5 list-none p-0 m-0">
              {['사무소 소개', '구성원', '진행 절차', '자주 묻는 질문', '상담 신청'].map(item => (
                <li key={item}><a href={`#${item === '자주 묻는 질문' ? 'faq' : item === '상담 신청' ? 'contact' : item === '업무 분야' ? 'services' : ''}`} className="text-sm text-blue-200/50 hover:text-white transition-colors no-underline">{item}</a></li>
              ))}
            </ul>
            <div className="mt-5 pt-5 border-t border-white/8">
              <p className="text-xs text-blue-200/40 leading-relaxed whitespace-pre-line">
                {address}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="text-xs text-blue-200/30 m-0">
            {copyright}
          </p>
          <div className="flex gap-5">
            <a href="/legal/privacy" className="text-xs text-blue-200/30 hover:text-blue-200/60 transition-colors no-underline">개인정보처리방침</a>
            <a href="/legal/terms" className="text-xs text-blue-200/30 hover:text-blue-200/60 transition-colors no-underline">이용약관</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

Footer.meta = {
  componentKey: 'footer',
  category: 'footer',
  label: 'Legal Footer',
  dataSchema: {
    brandName: { type: 'text', label: '사무소 이름' },
    copyright: { type: 'text', label: '저작권' },
    address: { type: 'textarea', label: '주소' },
  },
  previewImage: '/component-previews/legal/footer.webp',
};

export default Footer;
