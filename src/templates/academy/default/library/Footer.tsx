import { TemplateSectionProps, SectionComponent } from '../../../types';
import { getFieldValue } from '@/domain/entities/template.entity';

const Footer: SectionComponent = function Footer({ section }: TemplateSectionProps) {
  const { fields } = section;
  const academyName = getFieldValue(fields, 'academyName') || '';
  const tagline = getFieldValue(fields, 'tagline') || '';
  const phone = getFieldValue(fields, 'phone') || '';
  const copyright = getFieldValue(fields, 'copyright') || `© ${new Date().getFullYear()} ${academyName}`;

  return (
    <footer className="bg-[var(--color-surface-dark)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-14 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {academyName && (
            <span className="block text-xl font-bold tracking-tight text-[var(--color-on-primary)]">{academyName}</span>
          )}
          {tagline && <p className="mt-2 text-sm text-[var(--color-on-dark)]/70">{tagline}</p>}
        </div>
        {phone && (
          <div className="text-sm text-[var(--color-on-dark)]/70">
            <span className="font-semibold text-[var(--color-on-dark)]">대표전화 </span>
            {phone}
          </div>
        )}
      </div>
      <div className="border-t border-[var(--color-on-dark)]/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <span className="text-xs text-[var(--color-on-dark)]/50">{copyright}</span>
          <div className="flex gap-6">
            <a href="/legal/privacy" className="text-xs text-[var(--color-on-dark)]/50 transition-colors hover:text-[var(--color-on-dark)]">
              개인정보처리방침
            </a>
            <a href="/legal/terms" className="text-xs text-[var(--color-on-dark)]/50 transition-colors hover:text-[var(--color-on-dark)]">
              이용약관
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

Footer.meta = {
  componentKey: 'footer',
  category: 'footer',
  label: '학원 푸터',
  fieldsSchema: {
    academyName: { type: 'text', label: '학원 이름' },
    tagline: { type: 'text', label: '슬로건' },
    phone: { type: 'text', label: '대표전화' },
    copyright: { type: 'text', label: '저작권 문구' },
  },
  previewImage: '/component-previews/academy/footer.webp',
};

export default Footer;
