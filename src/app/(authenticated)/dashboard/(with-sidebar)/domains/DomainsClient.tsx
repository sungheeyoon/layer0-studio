'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSiteDomainAction } from '@/app/(authenticated)/dashboard/editor/actions';
import { getDomainError, isStaleConflict } from '@/lib/errors/messages';
import { useDashboardData } from '../DashboardDataProvider';
import { useDictionary, useLocale } from '@/lib/i18n/provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function DomainsClient() {
  const router = useRouter();
  const { sites, patchSite } = useDashboardData();
  const locale = useLocale();
  const t = useDictionary().dashboard.domains;
  const [editingDomain, setEditingDomain] = useState<{ siteId: string; value: string } | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [domainError, setDomainError] = useState<{ siteId: string; message: string } | null>(null);

  const handleSaveDomain = async (siteId: string) => {
    if (!editingDomain || editingDomain.siteId !== siteId) return;
    const site = sites.find((s) => s.id === siteId);
    if (!site) return;
    setSavingId(siteId);
    setDomainError(null);

    const result = await updateSiteDomainAction(siteId, editingDomain.value, site.updatedAt);
    if (result && 'error' in result) {
      setDomainError({ siteId, message: getDomainError(result.error, locale) });
      if (isStaleConflict(result)) router.refresh();
    } else if (result && 'domain' in result && result.domain) {
      patchSite(siteId, { domain: result.domain ?? null, updatedAt: result.updatedAt });
      setEditingDomain(null);
    }
    setSavingId(null);
  };

  if (sites.length === 0) {
    return <p className="text-body text-muted-foreground">{t.noSites}</p>;
  }

  return (
    <div className="space-y-4">
      {sites.map((site) => {
        const isEditing = editingDomain?.siteId === site.id;
        const isSaving = savingId === site.id;
        const thisError = domainError?.siteId === site.id ? domainError.message : null;

        return (
          <Card
            key={site.id}
            className="flex flex-col justify-between gap-6 p-6 md:flex-row md:items-center"
          >
            <div className="space-y-2">
              <h3 className="text-title">{site.siteName}</h3>
              <div className="flex items-center gap-3">
                <Badge variant={site.status === 'active' ? 'default' : 'secondary'}>
                  {site.status}
                </Badge>
                <span className="text-caption font-mono text-muted-foreground">
                  {site.id.slice(0, 8)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:items-end">
              <div className="flex items-center gap-2">
                <span className="text-caption text-muted-foreground">{t.domainLabel}:</span>
                <span className={`font-mono text-sm ${site.domain ? 'text-foreground' : 'text-muted-foreground italic'}`}>
                  {site.domain || t.noDomainSet}
                </span>
              </div>

              {isEditing ? (
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <Input
                      autoFocus
                      type="text"
                      value={editingDomain.value}
                      onChange={(e) => setEditingDomain({ siteId: site.id, value: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveDomain(site.id);
                        if (e.key === 'Escape') { setEditingDomain(null); setDomainError(null); }
                      }}
                      placeholder="new-domain-slug"
                      className="w-48"
                    />
                    <Button onClick={() => handleSaveDomain(site.id)} disabled={isSaving} size="sm">
                      {isSaving ? '…' : t.save}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setEditingDomain(null); setDomainError(null); }}
                    >
                      {t.cancel}
                    </Button>
                  </div>
                  {thisError && <p className="text-caption text-destructive">{thisError}</p>}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingDomain({ siteId: site.id, value: site.domain || '' });
                      setDomainError(null);
                    }}
                  >
                    {t.changeDomain}
                  </Button>
                  {site.domain && (
                    <Button asChild variant="outline" size="sm">
                      <a href={`/site/${site.domain}`} target="_blank" rel="noopener noreferrer">
                        {t.viewSite}
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
