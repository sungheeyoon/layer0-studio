'use client';

import { Template } from '@/domain/entities/template.entity';
import { SiteSummary } from '@/domain/entities/user-site.entity';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { listPaginatedTemplatesAction } from '@/app/(authenticated)/dashboard/(with-sidebar)/templates/actions';
import { useDictionary } from '@/lib/i18n/provider';
import { categoryLabel } from '@/lib/i18n/category-label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ALL_CATEGORIES = '__all__';

interface DynamicTemplateGridProps {
  templates: Template[];
  mySites: SiteSummary[];
  categories: string[];
  initialTotal: number;
}

export default function DynamicTemplateGrid({ templates: initialTemplates, mySites, categories, initialTotal }: DynamicTemplateGridProps) {
  const router = useRouter();
  const t = useDictionary().dashboard.templates;
  const categoryLabels = useDictionary().templatesCatalog.categoryLabels;
  const [selectingId, setSelectingId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const [currentTemplates, setCurrentTemplates] = useState(initialTemplates);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialTotal);

  const limit = 6;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleSelect = (templateId: string) => {
    setSelectingId(templateId);
    router.push(`/dashboard/projects/create?templateId=${templateId}`);
  };

  const handleCategoryChange = (value: string) => {
    const category = value === ALL_CATEGORIES ? null : value;
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

  // If no templates from DB, show a message
  if (initialTemplates.length === 0 && mySites.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-body text-muted-foreground">{t.noTemplates}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full min-w-0 flex-1 flex-col">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-heading">{t.title}</h1>
          <p className="text-body mt-2 max-w-md text-muted-foreground">{t.description}</p>
        </div>
        <Select
          value={selectedCategory ?? ALL_CATEGORIES}
          onValueChange={handleCategoryChange}
          disabled={isPending}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder={t.filterCategory} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES}>{t.allCategories}</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{categoryLabel(categoryLabels, cat)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 ${isPending ? 'pointer-events-none opacity-50' : ''} transition-opacity duration-300`}>
        {currentTemplates.map((template) => (
          <Card key={template.id} className="group gap-0 overflow-hidden p-0">
            <div className="relative aspect-video overflow-hidden bg-muted">
              {template.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={template.thumbnailUrl}
                  alt={template.name}
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-caption text-muted-foreground">{t.noImage}</span>
                </div>
              )}
            </div>

            <div className="space-y-4 p-5">
              <div className="space-y-2">
                <h3 className="text-title">{template.name}</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{template.category ? categoryLabel(categoryLabels, template.category) : t.generalCategory}</Badge>
                  <Badge variant="outline">{t.templateTag}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleSelect(template.id)}
                  disabled={selectingId === template.id}
                  size="sm"
                >
                  {selectingId === template.id ? t.initializing : t.select}
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href={`/preview/${template.id}`} target="_blank" rel="noopener noreferrer">
                    {t.preview}
                  </a>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || isPending}
            aria-label={t.prev}
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
            aria-label={t.next}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
