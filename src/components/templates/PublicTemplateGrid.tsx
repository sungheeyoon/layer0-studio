'use client';

import { Template } from '@/domain/entities/template.entity';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { listPaginatedTemplatesAction } from '@/app/(authenticated)/dashboard/(with-sidebar)/templates/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDictionary } from '@/lib/i18n/provider';
import { categoryLabel } from '@/lib/i18n/category-label';

interface PublicTemplateGridProps {
  templates: Template[];
  categories: string[];
  initialTotal: number;
}

export default function PublicTemplateGrid({ templates: initialTemplates, categories, initialTotal }: PublicTemplateGridProps) {
  const router = useRouter();
  const t = useDictionary().templatesCatalog;
  const [selectingId, setSelectingId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const [currentTemplates, setCurrentTemplates] = useState(initialTemplates);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialTotal);

  const limit = 9;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleSelect = (templateId: string) => {
    setSelectingId(templateId);
    router.push(`/dashboard/projects/create?templateId=${templateId}`);
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setPage(1);
    startTransition(async () => {
      const { data, total: newTotal } = await listPaginatedTemplatesAction(1, limit, category);
      setCurrentTemplates(data);
      setTotal(newTotal);
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    startTransition(async () => {
      const { data, total: newTotal } = await listPaginatedTemplatesAction(newPage, limit, selectedCategory);
      setCurrentTemplates(data);
      setTotal(newTotal);
    });
  };

  return (
    <main className="min-h-screen px-6 pb-24 pt-32 md:px-10">
      {/* Header */}
      <header className="mx-auto mb-16 max-w-6xl">
        <h1 className="text-display">{t.title}</h1>
        <p className="text-body mt-4 max-w-xl text-muted-foreground">
          {t.subtitle}
        </p>
      </header>

      {/* Filter bar */}
      <div
        className="mx-auto mb-10 flex max-w-6xl snap-x gap-2 overflow-x-auto border-b border-border pb-4"
        aria-label={t.title}
      >
        <Button
          variant={!selectedCategory ? 'default' : 'ghost'}
          size="sm"
          className="min-h-11 shrink-0 snap-start"
          onClick={() => handleCategoryChange(null)}
        >
          {t.all}
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'ghost'}
            size="sm"
            className="min-h-11 shrink-0 snap-start"
            onClick={() => handleCategoryChange(cat)}
          >
            {categoryLabel(t.categoryLabels, cat)}
          </Button>
        ))}
      </div>

      {/* Grid */}
      <section className={`mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 ${isPending ? 'opacity-50' : ''} transition-opacity`}>
        {currentTemplates.map((template) => (
          <article key={template.id} className="group flex h-full flex-col">
            <div className="relative mb-4 aspect-video overflow-hidden rounded-lg border border-border bg-muted">
              {template.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={template.name}
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  src={template.thumbnailUrl}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-caption text-muted-foreground">{t.noPreview}</span>
                </div>
              )}

              {/* Category badge */}
              <div className="absolute right-4 top-4">
                <Badge variant="secondary">{template.category ? categoryLabel(t.categoryLabels, template.category) : t.generalCategory}</Badge>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-4">
              <div className="space-y-1">
              <h3 className="text-title">{template.name}</h3>
              {template.description && (
                <p className="line-clamp-3 text-body text-muted-foreground">{template.description}</p>
              )}
              </div>
              <div className="mt-auto grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleSelect(template.id)}
                  disabled={selectingId === template.id}
                  className="min-h-11 w-full"
                >
                  {selectingId === template.id ? t.loading : t.useTemplate}
                </Button>
                <Button asChild variant="outline" className="min-h-11 w-full">
                  <a href={`/preview/${template.id}`} target="_blank" rel="noopener noreferrer">
                    {t.preview}
                  </a>
                </Button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mx-auto mt-16 flex max-w-6xl items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || isPending}
            aria-label={t.previousPage}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-caption tabular-nums text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || isPending}
            aria-label={t.nextPage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </main>
  );
}
