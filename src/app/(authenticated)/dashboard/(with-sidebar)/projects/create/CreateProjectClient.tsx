'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Template } from '@/domain/entities/template.entity';
import { selectTemplateAction } from '@/app/(authenticated)/dashboard/(with-sidebar)/templates/actions';
import { getDomainError } from '@/lib/errors/messages';
import { useDictionary, useLocale } from '@/lib/i18n/provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateProjectClientProps {
  template: Template;
}

export default function CreateProjectClient({ template }: CreateProjectClientProps) {
  const locale = useLocale();
  const t = useDictionary().dashboard.create;
  const [siteName, setSiteName] = useState('');
  const [urlSlug, setUrlSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [provisionError, setProvisionError] = useState<string | null>(null);

  const handleProvision = async () => {
    if (!siteName) {
      setProvisionError(t.nameRequired);
      return;
    }
    setProvisionError(null);
    setIsSubmitting(true);
    try {
      const result = await selectTemplateAction(template.id, siteName, urlSlug);
      if (result?.error) {
        setProvisionError(getDomainError(result.error, locale));
        setIsSubmitting(false);
      }
    } catch {
      // Next.js redirect() throws internally and is handled automatically.
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="mb-10">
        <h1 className="text-heading">{t.title}</h1>
        <p className="text-body mt-2 text-muted-foreground">{t.subtitle}</p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Form */}
        <div className="lg:col-span-7">
          <Card className="space-y-6 p-6">
            <div className="space-y-2">
              <Label htmlFor="site-name">{t.siteName}</Label>
              <Input
                id="site-name"
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url-slug">{t.urlSlug}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="url-slug"
                  type="text"
                  value={urlSlug}
                  onChange={(e) => setUrlSlug(e.target.value)}
                  className="flex-1"
                />
                <span className="text-caption shrink-0 text-muted-foreground">.layer0.studio</span>
              </div>
            </div>

            {provisionError && (
              <p className="text-caption rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-destructive">
                {provisionError}
              </p>
            )}

            <Button onClick={handleProvision} disabled={isSubmitting} className="group w-full">
              {isSubmitting ? t.provisioning : t.provision}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Card>
        </div>

        {/* Template preview */}
        <div className="lg:col-span-5">
          <Card className="overflow-hidden p-0">
            <div className="flex aspect-video items-center justify-center bg-muted">
              {template.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={template.thumbnailUrl}
                  alt={template.name}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <span className="text-caption text-muted-foreground">{t.noPreview}</span>
              )}
            </div>
            <div className="space-y-2 p-6">
              <p className="text-caption text-muted-foreground">{t.selectedTemplate}</p>
              <h2 className="text-title">{template.name}</h2>
              {template.description && (
                <p className="text-body text-muted-foreground">{template.description}</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
