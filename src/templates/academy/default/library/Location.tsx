import { TemplateBlockProps, BlockComponent } from '../../../types';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

/** 오시는 길 — address + transit info beside a static map image. */
const locationSchema = {
  eyebrow: { type: 'text', label: '상단 라벨' },
  title: { type: 'text', label: '섹션 제목', required: true },
  address: { type: 'text', label: '주소' },
  transit: { type: 'textarea', label: '교통편 안내' },
  hours: { type: 'textarea', label: '운영 시간' },
  mapImage: { type: 'image', label: '지도 이미지' },
} as const satisfies FieldsSchema;

type LocationContent = ValuesOf<typeof locationSchema>;

const Location: BlockComponent = function Location({ block }: TemplateBlockProps) {
  const content = block.fields as LocationContent;
  const eyebrow = content.eyebrow || '';
  const title = content.title || '';
  const address = content.address || '';
  const transit = content.transit || '';
  const hours = content.hours || '';
  const mapImage = content.mapImage?.url || '';

  return (
    <section className="bg-[var(--color-surface-soft)]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-24 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div>
          {eyebrow && (
            <p className="mb-4 text-sm font-semibold tracking-[0.2em] text-[var(--color-secondary)]">{eyebrow}</p>
          )}
          {title && (
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">{title}</h2>
          )}
          <dl className="mt-10 space-y-6">
            {address && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">주소</dt>
                <dd className="mt-1 text-lg font-medium text-[var(--color-ink)]">{address}</dd>
              </div>
            )}
            {transit && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">교통편</dt>
                <dd className="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-[var(--color-ink)]">{transit}</dd>
              </div>
            )}
            {hours && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">운영 시간</dt>
                <dd className="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-[var(--color-ink)]">{hours}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="aspect-[4/3] w-full overflow-hidden border border-[var(--color-line)] bg-[var(--color-surface)]">
          {mapImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mapImage} alt={address || '오시는 길'} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-medium text-[var(--color-muted)]">
              지도 이미지를 등록하세요
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

Location.meta = {
  componentKey: 'location',
  category: 'contact',
  label: '오시는 길',
  fieldsSchema: locationSchema,
  previewImage: '/component-previews/academy/location.webp',
};

export default Location;
