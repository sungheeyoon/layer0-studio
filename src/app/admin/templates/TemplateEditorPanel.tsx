'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Template } from '@/domain/entities/template.entity';
import {
  createTemplateAction,
  updateTemplateAction,
  uploadThumbnailAction,
} from './actions';
import { getAvailableThemeKeys } from '@/themes/registry';

const DEFAULT_JSON = JSON.stringify(
  {
    themeKey: 'corporate',
    globalStyles: {
      primaryColor: '#000000',
      secondaryColor: '#7d000c',
      fontFamily: 'Inter',
      fontSize: '16px',
      layout: 'asymmetric',
    },
    sections: [
      {
        id: 'hero_01',
        type: 'hero',
        order: 1,
        visible: true,
        editable: true,
        data: {
          title: { value: 'Welcome', type: 'text', label: 'Hero Title', editable: true },
          subtitle: {
            value: 'Your subtitle here',
            type: 'text',
            label: 'Subtitle',
            editable: true
          },
          backgroundImage: {
            value: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000',
            type: 'image',
            label: 'Background Image',
            editable: true
          },
          ctaText: { value: 'Explore More', type: 'text', label: 'CTA Text', editable: true },
          ctaUrl: { value: '#', type: 'url', label: 'CTA URL', editable: true }
        },
      },
      {
        id: 'about_01',
        type: 'about',
        order: 2,
        visible: true,
        editable: true,
        data: {
          title: { value: 'Our Mission', type: 'text', label: 'Section Title', editable: true },
          body: { value: 'We provide high-precision solutions for global enterprises.', type: 'textarea', label: 'Body Text', editable: true }
        }
      }
    ],
  },
  null,
  2,
);

interface TemplateEditorPanelProps {
  /** 편집할 template. undefined면 새로 만들기 모드 */
  template?: Template;
  onDone?: () => void;
}

export default function TemplateEditorPanel({
  template,
  onDone,
}: TemplateEditorPanelProps) {
  const isEditing = !!template;
  const availableThemes = getAvailableThemeKeys();

  // ── JSON state ────────────────────────────────────────────────────────────
  const [templateJsonStr, setTemplateJsonStr] = useState(
    template ? JSON.stringify(template.templateJson, null, 2) : DEFAULT_JSON,
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  // ── Thumbnail state ───────────────────────────────────────────────────────
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(
    template?.thumbnailUrl ?? '',
  );
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(
    template?.thumbnailUrl ?? '',
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Form submission state ─────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleJsonChange = (value: string) => {
    setTemplateJsonStr(value);
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch {
      setJsonError('Invalid JSON format');
    }
  };

  const handleThemeChange = (themeKey: string) => {
    try {
      const currentJson = JSON.parse(templateJsonStr);
      currentJson.themeKey = themeKey;
      setTemplateJsonStr(JSON.stringify(currentJson, null, 2));
    } catch (e) {
      // If JSON is invalid, just update it if we can
    }
  };

  const handleThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 로컬 미리보기
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
      setThumbnailPreview(thumbnailUrl); // 롤백
    } else if ('url' in result && result.url) {
      setThumbnailUrl(result.url);
    }
  };

  const handleSubmit = async (formData: FormData, deployStatus?: 'active') => {
    if (jsonError) return;
    setIsSubmitting(true);
    setSubmitError(null);

    formData.set('templateJson', templateJsonStr);
    formData.set('thumbnailUrl', thumbnailUrl);

    // Deploy Template 버튼은 status를 'active'로 강제
    if (deployStatus) {
      formData.set('status', deployStatus);
    }

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
  };

  // Get current themeKey for select input
  let currentThemeKey = 'corporate';
  try {
    currentThemeKey = JSON.parse(templateJsonStr).themeKey || 'corporate';
  } catch (e) {}

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
            {isEditing ? `Edit — ${template.name}_` : 'Template Editor_'}
          </h2>
        </header>

        <form
          action={async (fd) => await handleSubmit(fd)}
          className="space-y-16"
        >
          {/* ─── Section 1: Basic Info ──────────────────────────────────── */}
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

              {/* Status (Draft/Active/Archived) — 기본 select */}
              <div className="relative">
                <label className="text-[9px] uppercase tracking-widest text-neutral-500 block mb-1">
                  Status
                </label>
                <select
                  className="w-full bg-transparent border-none border-b border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white focus:ring-0 p-0 py-2 text-sm font-light tracking-wide transition-colors outline-none"
                  name="status"
                  defaultValue={template?.status ?? 'draft'}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* ─── Section 2: Thumbnail ───────────────────────────────────── */}
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
                      Uploading…
                    </span>
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
                accept="image/*"
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

          {/* ─── Section 3: Data Schema ─────────────────────────────────── */}
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

          {/* ─── Submit error ───────────────────────────────────────────── */}
          {submitError && (
            <p className="text-[11px] text-red-500 uppercase tracking-widest">
              Error: {submitError}
            </p>
          )}

          {/* ─── Actions ────────────────────────────────────────────────── */}
          <div className="pt-12 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
            <button
              className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-red-800 dark:hover:text-red-500 transition-colors"
              type="button"
              onClick={onDone}
            >
              Discard Changes
            </button>
            <div className="flex gap-4">
              {/* Save Draft — status는 select에서 가져옴 */}
              <button
                className="px-8 py-3 border border-black dark:border-white text-[10px] uppercase tracking-widest font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors disabled:opacity-40"
                type="submit"
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting ? 'Saving…' : 'Save Draft'}
              </button>

              {/* Deploy Template — status를 'active'로 강제 */}
              <button
                className="px-10 py-3 bg-black dark:bg-white text-white dark:text-black text-[10px] uppercase tracking-widest font-medium hover:opacity-80 transition-opacity disabled:opacity-40"
                type="button"
                disabled={!!jsonError || isSubmitting || isUploading}
                onClick={async () => {
                  const fd = new FormData(
                    document.querySelector('form') as HTMLFormElement,
                  );
                  await handleSubmit(fd, 'active');
                }}
              >
                {isSubmitting ? 'Deploying…' : 'Deploy Template'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
