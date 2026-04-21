'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { UserSite } from '@/domain/entities/user-site.entity';
import { TemplateJson, TemplateGlobalStyles } from '@/domain/entities/template.entity';
import { saveSiteJsonAction, publishSiteAction } from '@/app/(dashboard)/editor/actions';
import GlobalStylesEditor from './GlobalStylesEditor';
import { loadTheme } from '@/themes/registry';
import { ThemeRendererProps } from '@/themes/types';

interface DynamicEditorProps {
  site: UserSite;
}

export default function DynamicEditor({ site }: DynamicEditorProps) {
  const [siteJson, setSiteJson] = useState<TemplateJson>(site.siteJson);
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    siteJson.sections[0]?.id ?? null
  );
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  // Theme Renderer loading
  const [ThemeRenderer, setThemeRenderer] = useState<React.ComponentType<ThemeRendererProps> | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchTheme = async () => {
      setLoadingError(null);
      setThemeRenderer(null);

      const timeoutId = setTimeout(() => {
        if (mounted && !ThemeRenderer) {
          setLoadingError('Theme loading timed out. Please check your connection or theme configuration.');
        }
      }, 10000);

      try {
        const themeModule = await loadTheme(siteJson.themeKey || 'corporate');
        clearTimeout(timeoutId);
        if (mounted) {
          if (themeModule) {
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

  const selectedSection = siteJson.sections.find((s) => s.id === selectedSectionId) ?? null;

  const handleFieldChange = useCallback(
    (sectionId: string, fieldKey: string, value: string) => {
      setSiteJson((prev) => {
        const updated = JSON.parse(JSON.stringify(prev)) as TemplateJson;
        const section = updated.sections.find((s) => s.id === sectionId);
        if (section && section.data[fieldKey]) {
          section.data[fieldKey].value = value;
        }
        return updated;
      });
    },
    []
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
    setSaving(true);
    const result = await saveSiteJsonAction(site.id, siteJson);
    if (result && 'error' in result) {
      alert(`Save failed: ${result.error}`);
    }
    setSaving(false);
  };

  const handlePublish = async () => {
    setSaving(true);
    await saveSiteJsonAction(site.id, siteJson);
    setPublishing(true);
    const result = await publishSiteAction(site.id);

    if (result && 'error' in result) {
      alert(`Publish failed: ${result.error}`);
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

  return (
    <>
      {/* Left Panel */}
      <section className="w-1/4 flex flex-col border-r border-outline-variant bg-surface overflow-hidden">
        {/* Tab Switcher */}
        <div className="flex border-b border-outline-variant">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex-1 py-4 text-[0.6875rem] tracking-[0.2em] uppercase font-medium transition-colors ${
              activeTab === 'content' ? 'text-primary border-b-2 border-primary' : 'text-outline hover:text-primary'
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab('design')}
            className={`flex-1 py-4 text-[0.6875rem] tracking-[0.2em] uppercase font-medium transition-colors ${
              activeTab === 'design' ? 'text-primary border-b-2 border-primary' : 'text-outline hover:text-primary'
            }`}
          >
            Design
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'content' ? (
            <div className="space-y-12">
              {/* Hierarchy */}
              <div>
                <h3 className="font-['Inter'] font-medium text-[0.6875rem] tracking-[0.1em] uppercase text-primary mb-6">
                  Hierarchy
                </h3>
                <ul className="space-y-4">
                  {siteJson.sections.map((section) => (
                    <li
                      key={section.id}
                      onClick={() => setSelectedSectionId(section.id)}
                      className="flex items-center justify-between group cursor-pointer"
                    >
                      <span
                        className={`font-['Inter'] font-light text-xs tracking-wider transition-colors ${
                          selectedSectionId === section.id ? 'text-primary font-medium' : section.visible ? 'text-on-surface' : 'text-outline'
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
                    Parameters — {selectedSection.type}
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
        <div className="p-8 border-t border-outline-variant bg-surface-container-low">
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
              <a href="/domains" className="underline ml-1 font-bold hover:text-amber-800 transition-colors">
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
        
        <div className="flex-grow overflow-y-auto custom-scrollbar p-12">
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

// ─── Dynamic Field Input ─────────────────────────────────────

interface DynamicFieldProps {
  sectionId: string;
  fieldKey: string;
  field: { value: string; type: string; label: string; options?: string[] };
  onChange: (sectionId: string, fieldKey: string, value: string) => void;
}

function DynamicField({ sectionId, fieldKey, field, onChange }: DynamicFieldProps) {
  const baseInputClass =
    "w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 pb-1 font-['Inter'] font-light text-xs transition-colors";

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
            onChange={(e) => onChange(sectionId, fieldKey, e.target.value)}
            placeholder="https://images.unsplash.com/..."
          />
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
