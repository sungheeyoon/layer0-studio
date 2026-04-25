'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { UserSite } from '@/domain/entities/user-site.entity';
import { TemplateJson, TemplateGlobalStyles, ImageTemplateField } from '@/domain/entities/template.entity';
import { saveSiteJsonAction, publishSiteAction } from '@/app/dashboard/editor/actions';
import GlobalStylesEditor from './GlobalStylesEditor';
import { loadTheme } from '@/themes/registry';
import { ThemeRendererProps } from '@/themes/types';
import { createClient } from '@/utils/supabase/client';
import { initUploadAction, confirmUploadAction } from '@/app/dashboard/editor/actions';

interface DynamicEditorProps {
  site: UserSite;
}

export default function DynamicEditor({ site }: DynamicEditorProps) {
  const [siteJson, setSiteJson] = useState<TemplateJson>(site.siteJson);
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');

  const [activePageId, setActivePageId] = useState<string>(
    siteJson.pages?.[0]?.id || 'home'
  );

  const activePage = useMemo(() => {
    return siteJson.pages.find(p => p.id === activePageId) || siteJson.pages[0];
  }, [siteJson.pages, activePageId]);

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    activePage.sections[0]?.id ?? null
  );

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const lastSaveRef = useRef<number>(0);

  // Theme Renderer loading
  const [ThemeRenderer, setThemeRenderer] = useState<React.ComponentType<ThemeRendererProps> | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let loaded = false;
    const fetchTheme = async () => {
      setLoadingError(null);
      setThemeRenderer(null);

      const timeoutId = setTimeout(() => {
        if (mounted && !loaded) {
          setLoadingError('Theme loading timed out. Please check your connection or theme configuration.');
        }
      }, 10000);

      try {
        const themeModule = await loadTheme(siteJson.themeKey || 'corporate');
        clearTimeout(timeoutId);
        if (mounted) {
          if (themeModule) {
            loaded = true;
            setThemeRenderer(() => themeModule.default);
          } else {
            setLoadingError(`Theme "${siteJson.themeKey}" not found.`);
          }
        }
      } catch (err) {
        clearTimeout(timeoutId);
        if (mounted) {
          setLoadingError('Failed to load theme renderer.');
          console.error('Theme load error:', err);
        }
      }
    };
    fetchTheme();
    return () => { mounted = false; };
  }, [siteJson.themeKey]);

  const selectedSection = activePage.sections.find((s) => s.id === selectedSectionId) ?? null;

  const handleFieldChange = useCallback(
    (sectionId: string, fieldKey: string, value: string, assetId?: string) => {
      setSiteJson((prev) => {
        const updated = structuredClone(prev);

        const page = updated.pages.find(p => p.id === activePageId);
        const section = page?.sections.find(s => s.id === sectionId);

        if (section && section.data[fieldKey]) {
          section.data[fieldKey].value = value;
          if (assetId !== undefined) {
            (section.data[fieldKey] as ImageTemplateField).assetId = assetId;
          }
        }
        return updated;
      });
    },
    [activePageId]
  );

  const handleGlobalStyleChange = useCallback(
    (key: keyof TemplateGlobalStyles, value: string) => {
      setSiteJson((prev) => ({
        ...prev,
        globalStyles: {
          ...prev.globalStyles,
          [key]: value,
        },
      }));
    },
    []
  );

  const handleSave = async () => {
    const now = Date.now();
    if (now - lastSaveRef.current < 2000) return;
    lastSaveRef.current = now;

    setActionError(null);
    setSaving(true);
    const result = await saveSiteJsonAction(site.id, siteJson);
    if (result && 'error' in result) {
      setActionError(`Save failed: ${result.error}`);
    }
    setSaving(false);
  };

  const handlePublish = async () => {
    setActionError(null);
    setSaving(true);
    await saveSiteJsonAction(site.id, siteJson);
    setPublishing(true);
    const result = await publishSiteAction(site.id);

    if (result && 'error' in result) {
      setActionError(
        result.error === 'RATE_LIMITED'
          ? 'Please wait 30 seconds between publishes.'
          : `Publish failed: ${result.error}`
      );
    } else {
      if (site.domain) {
        setPublishedUrl(`/site/${site.domain}`);
      } else {
        setPublishedUrl('NO_DOMAIN');
      }
    }
    setPublishing(false);
    setSaving(false);
  };

  const handleSectionClick = useCallback((sectionId: string) => {
    setSelectedSectionId(sectionId);
    setActiveTab('content');
  }, []);

  const themeVariables = useMemo(() => ({
    '--theme-primary': siteJson.globalStyles.primaryColor,
    '--theme-secondary': siteJson.globalStyles.secondaryColor,
    '--theme-font-family': siteJson.globalStyles.fontFamily,
    '--theme-font-size': siteJson.globalStyles.fontSize,
  } as React.CSSProperties), [siteJson.globalStyles]);

  useEffect(() => {
    if (selectedSectionId) {
      const element = document.getElementById(`section-${selectedSectionId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedSectionId]);

  return (
    <>
      {/* Left Panel */}
      <section className="w-[280px] min-w-[280px] shrink-0 flex flex-col border border-outline-variant bg-surface overflow-hidden">
        {/* Tab Switcher */}
        <div className="flex border-b border-outline-variant">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex-1 py-4 text-[0.6875rem] tracking-[0.2em] uppercase font-medium transition-colors ${activeTab === 'content' ? 'text-primary border-b-2 border-primary' : 'text-outline hover:text-primary'
              }`}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab('design')}
            className={`flex-1 py-4 text-[0.6875rem] tracking-[0.2em] uppercase font-medium transition-colors ${activeTab === 'design' ? 'text-primary border-b-2 border-primary' : 'text-outline hover:text-primary'
              }`}
          >
            Design
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 custom-scrollbar">
          {activeTab === 'content' ? (
            <div className="space-y-12">
              {/* Pages Selector */}
              {siteJson.pages && siteJson.pages.length > 0 && (
                <div>
                  <h3 className="font-['Inter'] font-medium text-[0.6875rem] tracking-[0.1em] uppercase text-primary mb-6">
                    Pages
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {siteJson.pages.map((page) => (
                      <button
                        key={page.id}
                        onClick={() => {
                          setActivePageId(page.id);
                          setSelectedSectionId(page.sections[0]?.id || null);
                        }}
                        className={`px-3 py-1.5 text-[10px] uppercase tracking-widest border transition-all ${activePageId === page.id
                            ? 'bg-primary text-on-primary border-primary'
                            : 'bg-surface text-outline border-outline-variant hover:border-primary'
                          }`}
                      >
                        {page.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Hierarchy */}
              <div>
                <h3 className="font-['Inter'] font-medium text-[0.6875rem] tracking-[0.1em] uppercase text-primary mb-6">
                  Hierarchy
                </h3>
                <ul className="space-y-4">
                  {activePage.sections.map((section) => (
                    <li
                      key={section.id}
                      onClick={() => setSelectedSectionId(section.id)}
                      className="flex items-center justify-between group cursor-pointer"
                    >
                      <span
                        className={`font-['Inter'] font-light text-xs tracking-wider transition-colors ${selectedSectionId === section.id ? 'text-primary font-medium' : section.visible ? 'text-on-surface' : 'text-outline'
                          }`}
                      >
                        {section.type.charAt(0).toUpperCase() + section.type.slice(1).replace(/-/g, ' ')}
                      </span>
                      <span
                        className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-lg"
                      >
                        {section.visible ? 'visibility' : 'visibility_off'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Parameters */}
              {selectedSection && selectedSection.editable && (
                <div>
                  <h3 className="font-['Inter'] font-medium text-[0.6875rem] tracking-[0.1em] uppercase text-primary mb-6">
                    Parameters // {selectedSection.type}
                  </h3>
                  <div className="space-y-8">
                    {Object.entries(selectedSection.data)
                      .filter(([, field]) => field.editable !== false)
                      .map(([fieldKey, field]) => (
                        <DynamicField
                          key={`${selectedSection.id}-${fieldKey}`}
                          sectionId={selectedSection.id}
                          fieldKey={fieldKey}
                          field={field}
                          onChange={handleFieldChange}
                          onError={setActionError}
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-12">
              <h3 className="font-['Inter'] font-medium text-[0.6875rem] tracking-[0.1em] uppercase text-primary mb-6">
                Global Design
              </h3>
              <GlobalStylesEditor
                globalStyles={siteJson.globalStyles}
                onChange={handleGlobalStyleChange}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-outline-variant bg-surface-container-low">
          {actionError && (
            <div className="mb-4 px-3 py-2 text-[10px] uppercase tracking-widest text-error border border-error/30 bg-error/5 leading-relaxed">
              {actionError}
            </div>
          )}
          <button
            onClick={handlePublish}
            disabled={publishing || saving}
            className="w-full bg-primary text-on-primary h-12 font-['Inter'] font-medium text-[0.6875rem] tracking-[0.2em] uppercase flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:brightness-110"
          >
            {publishing ? 'Publishing...' : saving ? 'Saving...' : 'Publish Changes'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full border border-outline mt-2 h-10 font-['Inter'] font-light text-[0.6875rem] tracking-[0.1em] uppercase hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>

          {publishedUrl === 'NO_DOMAIN' && (
            <div className="mt-4 p-4 text-[10px] uppercase tracking-widest text-amber-600 border border-amber-300 bg-amber-50 leading-relaxed text-center">
              Published!
              <a href="/dashboard/domains" className="underline ml-1 font-bold hover:text-amber-800 transition-colors">
                Set a domain in Domains
              </a>
              to go live.
            </div>
          )}
          {publishedUrl && publishedUrl !== 'NO_DOMAIN' && (
            <a
              href={publishedUrl}
              target="_blank"
              className="mt-4 flex items-center justify-center gap-2 p-4 text-[10px] uppercase tracking-widest text-green-700 border border-green-300 bg-green-50 hover:bg-green-100 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              View Published Site
            </a>
          )}
        </div>
      </section>

      {/* Right Panel: Live Preview */}
      <section className="flex-grow bg-surface-container-lowest relative blueprint-grid border border-outline-variant overflow-hidden flex flex-col">
        <div className="absolute top-0 left-0 bg-primary text-on-primary px-3 py-1.5 text-[10px] font-medium tracking-[0.15em] z-50">
          LIVE PREVIEW
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar p-6">
          <div style={themeVariables} className="min-h-full bg-white shadow-2xl">
            {loadingError ? (
              <div className="flex flex-col items-center justify-center h-[50vh] p-8 text-center">
                <span className="material-symbols-outlined text-error text-4xl mb-4">error</span>
                <p className="text-error font-medium mb-2">Theme Load Error</p>
                <p className="text-outline text-sm max-w-xs">{loadingError}</p>
              </div>
            ) : ThemeRenderer ? (
              <ThemeRenderer
                siteJson={siteJson}
                selectedSectionId={selectedSectionId}
                onSectionClick={handleSectionClick}
                activePageId={activePageId}
              />
            ) : (
              <div className="flex items-center justify-center h-[50vh] text-outline font-light text-sm tracking-widest uppercase animate-pulse">
                Loading Theme Renderer...
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// ─── Dynamic Field Input ──────────────────────────────────────────────────

interface DynamicFieldProps {
  sectionId: string;
  fieldKey: string;
  field: { value: string; type: string; label: string; options?: string[] };
  onChange: (sectionId: string, fieldKey: string, value: string, assetId?: string) => void;
  onError: (msg: string) => void;
}

function DynamicField({ sectionId, fieldKey, field, onChange, onError }: DynamicFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const baseInputClass =
    "w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 pb-1 font-['Inter'] font-light text-xs transition-colors";

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Initial pending DB record via Server Action
      const initRes = await initUploadAction(file.name, file.type, file.size);
      if (!initRes.success || !initRes.uploadPath) {
        throw new Error(initRes.error || 'Failed to initialize upload');
      }

      // 2. Upload physically via Supabase Storage Client
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from('user_assets')
        .upload(initRes.uploadPath, file);

      if (uploadError) throw new Error(uploadError.message);

      // 3. Confirm and transition to active
      const confirmRes = await confirmUploadAction(initRes.assetId!, initRes.uploadPath);
      if (!confirmRes.success || !confirmRes.publicUrl) {
        throw new Error(confirmRes.error || 'Failed to confirm upload');
      }

      // 4. Update the state
      onChange(sectionId, fieldKey, confirmRes.publicUrl, initRes.assetId!);
    } catch (err: unknown) {
      onError(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('[ASSET_UPLOAD_ERROR]', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative group">
      <label className="block font-['Inter'] font-light text-[0.625rem] tracking-[0.1em] uppercase text-outline mb-2 group-focus-within:text-primary transition-colors">
        {field.label}
      </label>

      {field.type === 'textarea' ? (
        <textarea
          className={`${baseInputClass} resize-none`}
          rows={3}
          value={field.value}
          onChange={(e) => onChange(sectionId, fieldKey, e.target.value)}
        />
      ) : field.type === 'color' ? (
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 border border-outline-variant overflow-hidden"
            style={{ backgroundColor: field.value }}
          >
            <input
              type="color"
              value={field.value}
              onChange={(e) => onChange(sectionId, fieldKey, e.target.value)}
              className="w-12 h-12 -ml-3 -mt-3 cursor-pointer opacity-0"
            />
          </div>
          <input
            type="text"
            className={baseInputClass}
            value={field.value}
            onChange={(e) => onChange(sectionId, fieldKey, e.target.value)}
          />
        </div>
      ) : field.type === 'select' && field.options ? (
        <select
          className={baseInputClass}
          value={field.value}
          onChange={(e) => onChange(sectionId, fieldKey, e.target.value)}
        >
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : field.type === 'image' ? (
        <div>
          <input
            type="text"
            className={baseInputClass}
            value={field.value}
            onChange={(e) => onChange(sectionId, fieldKey, e.target.value, undefined)}
            placeholder="https://images.unsplash.com/..."
            disabled={isUploading}
          />
          <div className="mt-2">
            <input
              type="file"
              accept="image/jpeg, image/png, image/webp, image/gif"
              className="text-xs max-w-full"
              onChange={handleUpload}
              disabled={isUploading}
            />
          </div>
          {isUploading && (
            <div className="text-xs text-primary animate-pulse mt-1">Uploading...</div>
          )}
          {field.value && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={field.value}
              alt={field.label}
              className="mt-3 w-full h-24 object-cover grayscale opacity-60 border border-outline-variant hover:grayscale-0 hover:opacity-100 transition-all duration-500"
            />
          )}
        </div>
      ) : (
        <input
          type={field.type === 'number' ? 'number' : field.type === 'url' ? 'url' : 'text'}
          className={baseInputClass}
          value={field.value}
          onChange={(e) => onChange(sectionId, fieldKey, e.target.value)}
        />
      )}
    </div>
  );
}
