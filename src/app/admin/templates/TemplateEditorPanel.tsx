'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Template } from '@/domain/entities/template.entity';
import {
  createTemplateAction,
  updateTemplateAction,
  uploadThumbnailAction,
} from './actions';
import { getAvailableThemeKeys } from '@/themes/registry';
import { isPresetSlug } from '@/themes/_generated';
import CompositionPreview from './CompositionPreview';
import { TemplateJson } from '@/domain/entities/template.entity';

interface TemplateEditorPanelProps {
  /** Template to edit. If undefined, it is in create mode. */
  template?: Template;
  onDone?: () => void;
}

export default function TemplateEditorPanel({
  template,
  onDone,
}: TemplateEditorPanelProps) {
  const isEditing = !!template;
  const isCodePreset = template ? isPresetSlug(template.slug) : false;
  const availableThemes = getAvailableThemeKeys();

  // JSON state
  const [templateJsonStr, setTemplateJsonStr] = useState(
    template ? JSON.stringify(template.templateJson, null, 2) : '',
  );
  const [jsonError, setJsonError] = useState<string | null>(
    template ? null : 'JSON is required'
  );

  // Thumbnail state
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(
    template?.thumbnailUrl ?? '',
  );
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(
    template?.thumbnailUrl ?? '',
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showDeployConfirm, setShowDeployConfirm] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Handlers
  const handleJsonChange = (value: string) => {
    if (isCodePreset) return; // Read-only for presets
    setTemplateJsonStr(value);
    try {
      if (value.trim() === '') {
        setJsonError('JSON is required');
        return;
      }
      JSON.parse(value);
      setJsonError(null);
    } catch {
      setJsonError('Invalid JSON format');
    }
  };

  const handleThemeChange = (themeKey: string) => {
    if (isCodePreset) return;
    try {
      const currentJson = templateJsonStr ? JSON.parse(templateJsonStr) : { themeKey: '' };
      currentJson.themeKey = themeKey;
      setTemplateJsonStr(JSON.stringify(currentJson, null, 2));
    } catch {
      // If JSON is invalid, we can't safely update themeKey
    }
  };

  const handleThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setThumbnailPreview(objectUrl);
    setUploadError(null);
    setIsUploading(true);

    const fd = new FormData();
    fd.append('file', file);
    const result = await uploadThumbnailAction(fd);

    setIsUploading(false);
    if ('error' in result && result.error) {
      setUploadError(`Upload failed: ${result.error}`);
      setThumbnailPreview(thumbnailUrl); // Rollback
    } else if ('url' in result && result.url) {
      setThumbnailUrl(result.url);
    }
  };

  const handleSubmit = useCallback(async (formData: FormData, status: 'draft' | 'active') => {
    if (jsonError) return;
    setIsSubmitting(true);
    setSubmitError(null);

    formData.set('templateJson', templateJsonStr);
    formData.set('thumbnailUrl', thumbnailUrl);
    formData.set('status', status);

    if (isEditing) {
      formData.set('id', template.id);
      const result = await updateTemplateAction(formData);
      if (result.error) {
        setSubmitError(result.error);
      } else {
        onDone?.();
      }
    } else {
      const result = await createTemplateAction(formData);
      if (result.error) {
        setSubmitError(result.error);
      } else {
        onDone?.();
      }
    }

    setIsSubmitting(false);
  }, [jsonError, templateJsonStr, thumbnailUrl, isEditing, template, onDone]);

  // Get current themeKey for select input
  let currentThemeKey = 'corporate';
  try {
    currentThemeKey = JSON.parse(templateJsonStr).themeKey || 'corporate';
  } catch { /* invalid JSON, keep previous themeKey */ }

  return (
    <section className="col-span-8 bg-surface overflow-y-auto">
      <div className="p-12 max-w-4xl">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-1 h-1 bg-[#7d000c]" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">
              Core Configuration
            </span>
          </div>
          <h2 className="text-3xl font-[100] tracking-tight">
            {isEditing ? `Edit ${template.name}_` : 'Template Editor_'}
          </h2>
        </header>

        <form
          ref={formRef}
          onSubmit={(e) => e.preventDefault()}
          className="space-y-16"
        >
          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-4">
              <h3 className="text-[11px] font-medium uppercase tracking-widest">
                01 / BASIC_INFO
              </h3>
              <p className="text-[10px] text-neutral-400 mt-2 font-light">
                Define the primary identity and metadata for this blueprint.
              </p>
            </div>
            <div className="col-span-8 space-y-8">
              {/* Title */}
              <div className="group relative">
                <label className="text-[9px] uppercase tracking-widest text-neutral-500 block mb-1">
                  Template Title
                </label>
                <input
                  className="w-full bg-transparent border-none border-b border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white focus:ring-0 p-0 py-2 text-sm font-light tracking-wide transition-colors outline-none"
                  type="text"
                  name="name"
                  required
                  defaultValue={template?.name ?? ''}
                  placeholder="Modern Corporate"
                />
                <div className="absolute top-0 right-0 w-1 h-1 bg-[#7d000c] opacity-0 group-focus-within:opacity-100" />
              </div>

              {/* Theme Key Selector */}
              <div className="relative">
                <label className="text-[9px] uppercase tracking-widest text-neutral-500 block mb-1">
                  Theme Blueprint
                </label>
                <select
                  className="w-full bg-transparent border-none border-b border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white focus:ring-0 p-0 py-2 text-sm font-light tracking-wide transition-colors outline-none cursor-pointer"
                  value={currentThemeKey}
                  onChange={(e) => handleThemeChange(e.target.value)}
                >
                  {availableThemes.map(key => (
                    <option key={key} value={key}>{key.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="group relative">
                <label className="text-[9px] uppercase tracking-widest text-neutral-500 block mb-1">
                  Description
                </label>
                <textarea
                  className="w-full bg-transparent border-none border-b border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white focus:ring-0 p-0 py-2 text-sm font-light tracking-wide transition-colors resize-none outline-none"
                  rows={2}
                  name="description"
                  defaultValue={template?.description ?? ''}
                  placeholder="High-precision corporate identity for enterprise scale solutions."
                />
                <div className="absolute top-0 right-0 w-1 h-1 bg-[#7d000c] opacity-0 group-focus-within:opacity-100" />
              </div>

              {/* Slug + Category */}
              <div className="grid grid-cols-2 gap-8">
                <div className="group relative">
                  <label className="text-[9px] uppercase tracking-widest text-neutral-500 block mb-1">
                    Slug (URL)
                  </label>
                  <input
                    className="w-full bg-transparent border-none border-b border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white focus:ring-0 p-0 py-2 text-sm font-light tracking-wide transition-colors outline-none"
                    type="text"
                    name="slug"
                    defaultValue={template?.slug ?? ''}
                    placeholder="modern-corporate"
                  />
                </div>
                <div className="group relative">
                  <label className="text-[9px] uppercase tracking-widest text-neutral-500 block mb-1">
                    Category
                  </label>
                  <input
                    className="w-full bg-transparent border-none border-b border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white focus:ring-0 p-0 py-2 text-sm font-light tracking-wide transition-colors outline-none"
                    type="text"
                    name="category"
                    defaultValue={template?.category ?? ''}
                    placeholder="Business"
                  />
                </div>
              </div>

              {/* Status indicator (read-only) */}
              {isEditing && (
                <div className="relative">
                  <label className="text-[9px] uppercase tracking-widest text-neutral-500 block mb-1">
                    Current Status
                  </label>
                  <div className="flex items-center gap-2 py-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      template.status === 'active' ? 'bg-[#7d000c]' :
                      template.status === 'draft' ? 'bg-amber-500' :
                      'bg-neutral-400'
                    }`} />
                    <span className="text-sm font-light tracking-wide capitalize">
                      {template.status}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Thumbnail */}
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-4">
              <h3 className="text-[11px] font-medium uppercase tracking-widest">
                02 / THUMBNAIL
              </h3>
              <p className="text-[10px] text-neutral-400 mt-2 font-light">
                Upload a preview image. Stored in Supabase Storage.
              </p>
            </div>
            <div className="col-span-8">
              <div
                className="relative w-full aspect-video bg-neutral-100 dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center cursor-pointer group overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                {thumbnailPreview ? (
                  <Image
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-neutral-400">
                    <span className="material-symbols-outlined text-2xl">
                      add_photo_alternate
                    </span>
                    <span className="text-[10px] uppercase tracking-widest">
                      Click to upload
                    </span>
                  </div>
                )}

                {/* Uploading overlay */}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-[10px] uppercase tracking-widest text-white animate-pulse">
                      Uploading...                    </span>
                  </div>
                )}

                {/* Hover overlay */}
                {!isUploading && thumbnailPreview && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[10px] uppercase tracking-widest text-white">
                      Change Image
                    </span>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg, image/png, image/webp, image/gif"
                className="hidden"
                onChange={handleThumbnailChange}
              />

              {uploadError && (
                <p className="mt-2 text-[10px] text-red-500">{uploadError}</p>
              )}
              {thumbnailUrl && !uploadError && (
                <p className="mt-2 text-[10px] text-neutral-400 font-mono truncate">
                  {thumbnailUrl}
                </p>
              )}
            </div>
          </div>

          {/* Section 3: Data Schema */}
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-4">
              <h3 className="text-[11px] font-medium uppercase tracking-widest">
                03 / DATA_SCHEMA
              </h3>
              <p className="text-[10px] text-neutral-400 mt-2 font-light">
                The foundational JSON object that powers dynamic sections.
              </p>
            </div>
            <div className="col-span-8">
              <div className="bg-neutral-900 dark:bg-neutral-950 p-6 relative">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                    template_schema.json
                  </span>
                  <span
                    className="material-symbols-outlined text-neutral-500 text-sm"
                    data-icon="code"
                  >
                    code
                  </span>
                </div>
                <textarea
                  className="w-full bg-transparent border-none focus:ring-0 text-xs font-mono text-white/80 leading-relaxed resize-none p-0 outline-none"
                  rows={16}
                  value={templateJsonStr}
                  onChange={(e) => handleJsonChange(e.target.value)}
                />
                {jsonError && (
                  <div className="mt-2 text-[10px] text-red-400">
                    {jsonError}
                  </div>
                )}
                <div className="absolute top-2 right-2 w-1 h-1 bg-[#7d000c]" />
              </div>
            </div>
          </div>

          {/* Section 4: Composition */}
          {(() => {
            let parsed: TemplateJson | null = null;
            try {
              if (templateJsonStr) {
                parsed = JSON.parse(templateJsonStr) as TemplateJson;
              }
            } catch {
              return null;
            }
            
            if (!parsed || !parsed.pages) return null;

            return (
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-4">
                  <h3 className="text-[11px] font-medium uppercase tracking-widest">
                    04 / COMPOSITION
                  </h3>
                  <p className="text-[10px] text-neutral-400 mt-2 font-light">
                    Visual breakdown of the sections included in this blueprint.
                  </p>
                </div>
                <div className="col-span-8">
                  <CompositionPreview templateJson={parsed} />
                </div>
              </div>
            );
          })()}

          {/* Submit error */}
          {submitError && (
            <p className="text-[11px] text-red-500 uppercase tracking-widest">
              Error: {submitError}
            </p>
          )}

          {/* Actions */}
          <div className="pt-12 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
            <button
              className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-red-800 dark:hover:text-red-500 transition-colors"
              type="button"
              onClick={onDone}
            >
              Discard Changes
            </button>
            <div className="flex gap-4">
              {/* Save as Draft */}
              <button
                className="px-8 py-3 border border-black dark:border-white text-[10px] uppercase tracking-widest font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors disabled:opacity-40"
                type="button"
                disabled={!!jsonError || isSubmitting || isUploading}
                onClick={() => {
                  if (!formRef.current) return;
                  const fd = new FormData(formRef.current);
                  handleSubmit(fd, 'draft');
                }}
              >
                {isSubmitting ? 'Saving...' : 'Save Draft'}
              </button>

              {/* Deploy Template */}
              <button
                className="px-10 py-3 bg-black dark:bg-white text-white dark:text-black text-[10px] uppercase tracking-widest font-medium hover:opacity-80 transition-opacity disabled:opacity-40"
                type="button"
                disabled={!!jsonError || isSubmitting || isUploading}
                onClick={() => setShowDeployConfirm(true)}
              >
                {isSubmitting ? 'Deploying...' : 'Deploy Template'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Deploy confirmation modal */}
      {showDeployConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-10 w-[420px]">
            <div className="absolute top-3 right-3 w-1 h-1 bg-[#7d000c]" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-1 bg-[#7d000c]" />
              <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-neutral-400">
                Publish to Live
              </span>
            </div>
            <h3 className="text-xl font-[100] tracking-tight mb-4">Deploy Template?</h3>
            <p className="text-[11px] text-neutral-500 font-light leading-relaxed mb-8">
              This will set the template status to <strong>Active</strong> and make it publicly available to all users.
              {isEditing && template.status !== 'active' && ' The current status will change from ' + template.status + ' to active.'}
            </p>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowDeployConfirm(false)}
                className="px-8 py-3 text-[10px] uppercase tracking-widest font-medium text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowDeployConfirm(false);
                  if (!formRef.current) return;
                  const fd = new FormData(formRef.current);
                  await handleSubmit(fd, 'active');
                }}
                className="px-10 py-3 bg-black dark:bg-white text-white dark:text-black text-[10px] uppercase tracking-widest font-medium hover:opacity-80 transition-opacity"
              >
                Deploy
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
