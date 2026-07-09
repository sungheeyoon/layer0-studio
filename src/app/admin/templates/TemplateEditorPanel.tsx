'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Code2, ImagePlus } from 'lucide-react';
import { Template } from '@/domain/entities/template.entity';
import {
  createTemplateAction,
  updateTemplateAction,
  uploadThumbnailAction,
} from './actions';
import { getAvailableTemplateKeys } from '@/templates/registry';
import { isPresetSlug } from '@/templates/_generated';
import CompositionPreview from './CompositionPreview';
import { ContentModel } from '@/domain/entities/template.entity';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TemplateEditorPanelProps {
  /** Template to edit. If undefined, it is in create mode. */
  template?: Template;
  /** Whether the user holds `canPublishTemplates` — gates the Deploy (→active) action (ADR-0012 §5). */
  canPublish?: boolean;
  onDone?: () => void;
}

export default function TemplateEditorPanel({
  template,
  canPublish = false,
  onDone,
}: TemplateEditorPanelProps) {
  const isEditing = !!template;
  const isCodePreset = template ? isPresetSlug(template.slug) : false;
  const availableThemes = getAvailableTemplateKeys();

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

  const handleThemeChange = (templateKey: string) => {
    if (isCodePreset) return;
    try {
      const currentJson = templateJsonStr ? JSON.parse(templateJsonStr) : { templateKey: '' };
      currentJson.templateKey = templateKey;
      setTemplateJsonStr(JSON.stringify(currentJson, null, 2));
    } catch {
      // If JSON is invalid, we can't safely update templateKey
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

  // Get current templateKey for select input
  let currentThemeKey = 'corporate';
  try {
    currentThemeKey = JSON.parse(templateJsonStr).templateKey || 'corporate';
  } catch { /* invalid JSON, keep previous templateKey */ }

  const statusVariant =
    template?.status === 'active' ? 'default' : 'outline';

  return (
    <section className="col-span-8 overflow-y-auto bg-background">
      <div className="max-w-4xl p-12">
        {/* Header */}
        <header className="mb-12">
          <span className="text-xs font-medium text-muted-foreground">Configuration</span>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            {isEditing ? `Edit ${template.name}` : 'New template'}
          </h2>
        </header>

        <form
          ref={formRef}
          onSubmit={(e) => e.preventDefault()}
          className="space-y-12"
        >
          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-4">
              <h3 className="text-sm font-semibold">Basic info</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                Identity and metadata for this template.
              </p>
            </div>
            <div className="col-span-8 space-y-6">
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="tpl-name">Template title</Label>
                <Input
                  id="tpl-name"
                  type="text"
                  name="name"
                  required
                  defaultValue={template?.name ?? ''}
                  placeholder="Modern Corporate"
                />
              </div>

              {/* Theme Key Selector */}
              <div className="space-y-1.5">
                <Label>Renderer key</Label>
                <Select
                  value={currentThemeKey}
                  onValueChange={handleThemeChange}
                  disabled={isCodePreset}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableThemes.map((key) => (
                      <SelectItem key={key} value={key}>{key}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="tpl-description">Description</Label>
                <Textarea
                  id="tpl-description"
                  rows={2}
                  name="description"
                  defaultValue={template?.description ?? ''}
                  placeholder="A short description shown in the catalog."
                />
              </div>

              {/* Slug + Category */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="tpl-slug">Slug (URL)</Label>
                  <Input
                    id="tpl-slug"
                    type="text"
                    name="slug"
                    defaultValue={template?.slug ?? ''}
                    placeholder="modern-corporate"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tpl-category">Category</Label>
                  <Input
                    id="tpl-category"
                    type="text"
                    name="category"
                    defaultValue={template?.category ?? ''}
                    placeholder="Business"
                  />
                </div>
              </div>

              {/* Status indicator (read-only) */}
              {isEditing && (
                <div className="space-y-1.5">
                  <Label>Current status</Label>
                  <div>
                    <Badge variant={statusVariant} className="capitalize">
                      {template.status}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Thumbnail */}
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-4">
              <h3 className="text-sm font-semibold">Thumbnail</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                Upload a preview image. Stored in Supabase Storage.
              </p>
            </div>
            <div className="col-span-8">
              <div
                className="group relative flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted"
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
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImagePlus className="h-6 w-6" />
                    <span className="text-xs">Click to upload</span>
                  </div>
                )}

                {/* Uploading overlay */}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                    <span className="animate-pulse text-xs">Uploading...</span>
                  </div>
                )}

                {/* Hover overlay */}
                {!isUploading && thumbnailPreview && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="text-xs font-medium">Change image</span>
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
                <p className="mt-2 text-xs text-destructive">{uploadError}</p>
              )}
              {thumbnailUrl && !uploadError && (
                <p className="mt-2 truncate font-mono text-xs text-muted-foreground">
                  {thumbnailUrl}
                </p>
              )}
            </div>
          </div>

          {/* Section 3: Data Schema */}
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-4">
              <h3 className="text-sm font-semibold">Data schema</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                The JSON object that powers dynamic sections.
              </p>
            </div>
            <div className="col-span-8">
              <div className="rounded-lg border border-border bg-muted p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">
                    template_schema.json
                  </span>
                  <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <Textarea
                  className="resize-none border-none bg-transparent p-0 font-mono text-xs leading-relaxed shadow-none focus-visible:ring-0 dark:bg-transparent"
                  rows={16}
                  value={templateJsonStr}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  readOnly={isCodePreset}
                />
                {jsonError && (
                  <div className="mt-2 text-xs text-destructive">
                    {jsonError}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Composition */}
          {(() => {
            let parsed: ContentModel | null = null;
            try {
              if (templateJsonStr) {
                parsed = JSON.parse(templateJsonStr) as ContentModel;
              }
            } catch {
              return null;
            }

            if (!parsed || (parsed.mode !== 'single' && parsed.mode !== 'multi')) return null;

            return (
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-4">
                  <h3 className="text-sm font-semibold">Composition</h3>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Sections included in this template.
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
            <p className="text-xs text-destructive">Error: {submitError}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-border pt-8">
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground"
              onClick={onDone}
            >
              Discard changes
            </Button>
            <div className="flex gap-3">
              {/* Save as Draft */}
              <Button
                type="button"
                variant="outline"
                disabled={!!jsonError || isSubmitting || isUploading}
                onClick={() => {
                  if (!formRef.current) return;
                  const fd = new FormData(formRef.current);
                  handleSubmit(fd, 'draft');
                }}
              >
                {isSubmitting ? 'Saving...' : 'Save draft'}
              </Button>

              {/* Deploy Template (→active) — publish, gated by canPublishTemplates (ADR-0012 §5). */}
              {canPublish && (
                <Button
                  type="button"
                  disabled={!!jsonError || isSubmitting || isUploading}
                  onClick={() => setShowDeployConfirm(true)}
                >
                  {isSubmitting ? 'Deploying...' : 'Deploy template'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Deploy confirmation */}
      <AlertDialog open={showDeployConfirm} onOpenChange={setShowDeployConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deploy template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will set the template status to <strong>Active</strong> and make it publicly available to all users.
              {isEditing && template.status !== 'active' && ` The current status will change from ${template.status} to active.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setShowDeployConfirm(false);
                if (!formRef.current) return;
                const fd = new FormData(formRef.current);
                await handleSubmit(fd, 'active');
              }}
            >
              Deploy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
