import { TemplateBlockProps, BlockComponent } from '../../../types';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

const heroSchema = {
  eyebrow: { type: 'text', label: '상단 라벨' },
  title: { type: 'textarea', label: '메인 슬로건', required: true },
  subtitle: { type: 'textarea', label: '보조 설명' },
  ctaText: { type: 'text', label: '상담 버튼 문구' },
  ctaUrl: { type: 'url', label: '상담 버튼 링크' },
  phoneText: { type: 'text', label: '전화 안내 문구' },
  backgroundImage: { type: 'image', label: '배경 이미지' },
} as const satisfies FieldsSchema;

type HeroContent = ValuesOf<typeof heroSchema>;

const Hero: BlockComponent = function Hero({ block }: TemplateBlockProps) {
  const content = block.fields as HeroContent;
  const eyebrow = content.eyebrow || '';
  const title = content.title || '';
  const subtitle = content.subtitle || '';
  const ctaText = content.ctaText || '';
  const ctaUrl = content.ctaUrl || '#';
  const phoneText = content.phoneText || '';
  const bgImage = content.backgroundImage?.url || '';

  return (
    <section
      className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden bg-[var(--color-primary)]"
      style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      {/* Deep-navy scrim keeps text legible over any photo. */}
      <div className="absolute inset-0 bg-[var(--color-surface-dark)]/80" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="mb-6 inline-block border-l-2 border-[var(--color-secondary)] pl-4 text-sm font-semibold tracking-[0.2em] text-[var(--color-on-dark)]/80">
              {eyebrow}
            </p>
          )}
          {title && (
            <h1 className="whitespace-pre-line text-4xl font-bold leading-[1.15] tracking-tight text-[var(--color-on-primary)] sm:text-5xl lg:text-6xl">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="mt-7 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-[var(--color-on-dark)]/85">
              {subtitle}
            </p>
          )}

          <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            {ctaText && (
              <a
                href={ctaUrl}
                className="inline-flex items-center justify-center bg-[var(--color-secondary)] px-8 py-4 text-base font-semibold text-[var(--color-on-primary)] shadow-lg transition-all hover:brightness-110"
              >
                {ctaText}
              </a>
            )}
            {phoneText && (
              <span className="text-base font-medium tracking-wide text-[var(--color-on-dark)]">
                {phoneText}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

Hero.meta = {
  componentKey: 'hero',
  category: 'hero',
  label: '학원 히어로',
  fieldsSchema: heroSchema,
  previewImage: '/component-previews/academy/hero.webp',
};

export default Hero;
