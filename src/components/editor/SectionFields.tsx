'use client';

import { useId, useState } from 'react';
import {
  FieldDescriptor,
  FieldsSchema,
  ImageValue,
  Block,
} from '@/domain/entities/template.entity';
import {
  EditableItem,
  FieldValue,
  addItem,
  canAddItem,
  canRemoveItem,
  coerceNumberInput,
  moveItemAt,
  removeItemAt,
  setItemFieldAt,
} from '@/domain/entities/field-edit';
import { emptyValue, makeEmptyItem } from '@/lib/template/field-factory';
import { createClient } from '@/utils/supabase/client';
import { initUploadAction, confirmUploadAction } from '@/app/(authenticated)/dashboard/editor/actions';
import { FieldIssues } from './FieldIssues';
import { fieldIssueKey } from '@/lib/editor/content-issues';
import { useDictionary } from '@/lib/i18n/provider';
import { ChevronUp, ChevronDown, PlusCircle, Trash2 } from 'lucide-react';
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

/**
 * The editable fields of one Block, rendered inline under the hierarchy item the
 * user clicked.
 *
 * **The schema drives this, not the data** (ADR-0016 §4-1). Before the
 * Field/Value split each stored field carried its own `{type, label}` and the
 * editor read the input kind straight off it; a Value carries neither, so every
 * decision here — which control to render, what to call it, what `options` a
 * select offers, what an emptied number resets to — comes from
 * `library[block.type].meta.fieldsSchema`.
 *
 * Two consequences fall out of that inversion, both wanted:
 *   - Fields are shown in **schema order**, which is authored to match the
 *     renderer's reading order. (The old code sorted the data's keys by the
 *     schema and appended leftovers; there is no longer any leftover to append,
 *     because an undescribed key has no type to render an input for.)
 *   - An optional field with **no stored Value still gets an input**, seeded
 *     from `emptyValue`. Under the old shape every editable field existed in the
 *     data, so "absent" was unreachable; now it is the normal state of an
 *     optional field nobody has filled in.
 */
export function SectionFields({
  section,
  schema,
  onFieldChange,
  onError,
  issues,
}: {
  section: Block;
  schema?: FieldsSchema;
  onFieldChange: (sectionId: string, fieldKey: string, value: FieldValue) => void;
  onError: (msg: string) => void;
  /** Warning codes keyed by {@link fieldIssueKey} — see `content-issues.ts`. */
  issues: Record<string, string[]>;
}) {
  return (
    <div className="space-y-6">
      {Object.entries(schema ?? {})
        .filter(([, descriptor]) => descriptor.editable !== false)
        .map(([fieldKey, descriptor]) => (
          <DynamicField
            key={`${section.id}-${fieldKey}`}
            descriptor={descriptor}
            value={section.fields[fieldKey]}
            onChange={(value) => onFieldChange(section.id, fieldKey, value)}
            onError={onError}
            issueCodes={issues[fieldIssueKey(section.id, fieldKey)]}
          />
        ))}
    </div>
  );
}

interface DynamicFieldProps {
  descriptor: FieldDescriptor;
  /** The stored Value, or `undefined` for an optional field never filled in. */
  value: unknown;
  onChange: (value: FieldValue) => void;
  onError: (msg: string) => void;
  /** Warning codes for this field, rendered inline. Never blocks the save. */
  issueCodes?: string[];
}

/** A stored Value that is at least ImageValue-shaped. */
function asImageValue(value: unknown): ImageValue {
  if (typeof value === 'object' && value !== null && 'url' in value) {
    const { url, assetId } = value as ImageValue;
    return { url: typeof url === 'string' ? url : '', assetId };
  }
  return { url: '' };
}

function DynamicField({ descriptor, value, onChange, onError, issueCodes }: DynamicFieldProps) {
  const t = useDictionary().editor;
  const [isUploading, setIsUploading] = useState(false);
  // The schema `label` is the only name this control has — nothing else on the
  // page identifies it — so it is wired to the control rather than left floating
  // beside it. (Array fields render their own group heading instead.)
  const controlId = useId();

  if (descriptor.type === 'array') {
    return (
      <ArrayFieldEditor
        descriptor={descriptor}
        items={Array.isArray(value) ? (value as EditableItem[]) : []}
        onChange={onChange}
        onError={onError}
      />
    );
  }

  if (descriptor.type === 'number') {
    return (
      <div className="space-y-2">
        <Label htmlFor={controlId}>{descriptor.label}</Label>
        <NumberField id={controlId} descriptor={descriptor} value={value} onChange={onChange} />
        <FieldIssues codes={issueCodes} />
      </div>
    );
  }

  if (descriptor.type === 'image') {
    const image = asImageValue(value ?? emptyValue(descriptor));

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
        const initRes = await initUploadAction(file.name, file.type, file.size);
        if ('error' in initRes) throw new Error(initRes.error || 'Failed to initialize upload');

        const supabase = createClient();
        const { error: uploadError } = await supabase.storage
          .from('user_assets')
          .upload(initRes.uploadPath, file);

        if (uploadError) throw new Error(uploadError.message);

        const confirmRes = await confirmUploadAction(initRes.assetId, initRes.uploadPath);
        if ('error' in confirmRes) throw new Error(confirmRes.error || 'Failed to confirm upload');

        // url and assetId are written as one ImageValue — they are two halves of
        // the same fact (what to render, what to reference-count; ADR-0003).
        onChange({ url: confirmRes.publicUrl, assetId: initRes.assetId });
      } catch (err: unknown) {
        onError(`${t.field.uploadFailedPrefix}${err instanceof Error ? err.message : 'Unknown error'}`);
        console.error('[ASSET_UPLOAD_ERROR]', err);
      } finally {
        setIsUploading(false);
      }
    };

    return (
      <div className="space-y-2">
        <Label htmlFor={controlId}>{descriptor.label}</Label>
        <div className="space-y-2">
          <Input
            id={controlId}
            value={image.url}
            // `assetId` is carried through, not cleared: typing a URL over an
            // uploaded image leaves the upload referenced, which keeps the
            // orphan sweep off an asset the user may be mid-way through
            // swapping. Same behaviour as before ADR-0016, where a manual URL
            // edit passed no assetId and so left the field's own untouched.
            onChange={(e) => onChange({ ...image, url: e.target.value })}
            placeholder="https://images.unsplash.com/..."
            disabled={isUploading}
          />
          <Input
            type="file"
            accept="image/jpeg, image/png, image/webp, image/gif"
            className="cursor-pointer text-xs file:mr-2 file:cursor-pointer"
            onChange={handleUpload}
            disabled={isUploading}
          />
          {isUploading && (
            <p className="animate-pulse text-xs text-primary">{t.field.uploading}</p>
          )}
          {image.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.url}
              alt={descriptor.label}
              className="mt-1 h-24 w-full rounded-md border border-border object-cover"
            />
          )}
        </div>
        <FieldIssues codes={issueCodes} />
      </div>
    );
  }

  // Everything left is a string Value: text / textarea / url / color / select.
  const text = typeof value === 'string' ? value : '';

  return (
    <div className="space-y-2">
      <Label htmlFor={controlId}>{descriptor.label}</Label>

      {descriptor.type === 'textarea' ? (
        <Textarea
          id={controlId}
          rows={3}
          value={text}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : descriptor.type === 'color' ? (
        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label={descriptor.label}
            value={text}
            onChange={(e) => onChange(e.target.value)}
            className="size-9 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-1"
          />
          <Input
            id={controlId}
            className="font-mono"
            value={text}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      ) : descriptor.type === 'select' ? (
        <Select value={text} onValueChange={(v) => onChange(v)}>
          <SelectTrigger id={controlId} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {/* Options come from the schema — the Value is just the chosen
                string, and the old `SelectField.options` copy it used to carry
                alongside was exactly the drift ADR-0016 §4 removes. */}
            {descriptor.options.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={controlId}
          type={descriptor.type === 'url' ? 'url' : 'text'}
          value={text}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      <FieldIssues codes={issueCodes} />
    </div>
  );
}

/**
 * A `number` input. Owns a draft string so an in-progress edit — `""`, `"-"`,
 * `"1."` — can sit in the field without a non-finite number reaching the
 * ContentModel; the draft is transient UI state and so lives in the component
 * that renders it (CLAUDE.md "Client state in chrome components" §2).
 *
 * Committing follows ADR-0016 §4-3: a parseable draft is written as it is typed,
 * and leaving the field resolves anything unparseable — an emptied input above
 * all — to the descriptor's mandatory `default`.
 */
function NumberField({
  id,
  descriptor,
  value,
  onChange,
}: {
  id: string;
  descriptor: Extract<FieldDescriptor, { type: 'number' }>;
  value: unknown;
  onChange: (value: FieldValue) => void;
}) {
  const committed = typeof value === 'number' ? value : descriptor.default;
  const [draft, setDraft] = useState(() => String(committed));

  return (
    <Input
      id={id}
      type="number"
      value={draft}
      onChange={(e) => {
        const raw = e.target.value;
        setDraft(raw);
        const parsed = Number(raw);
        if (raw.trim() !== '' && Number.isFinite(parsed)) onChange(parsed);
      }}
      onBlur={() => {
        const next = coerceNumberInput(draft, descriptor.default);
        setDraft(String(next));
        // Compared against the raw prop, not `committed`: an optional number
        // that has never been stored reads as `undefined` here, and blurring an
        // emptied input has to materialise the default rather than assume it.
        if (next !== value) onChange(next);
      }}
    />
  );
}

function ArrayFieldEditor({
  descriptor,
  items,
  onChange,
  onError,
}: {
  descriptor: Extract<FieldDescriptor, { type: 'array' }>;
  items: EditableItem[];
  onChange: (value: FieldValue) => void;
  onError: (msg: string) => void;
}) {
  const t = useDictionary().editor;
  const { itemSchema, minItems, maxItems } = descriptor;

  const handleAddItem = () => {
    if (!canAddItem(items, maxItems)) {
      onError(`${t.field.maxItemsErrorPrefix}${maxItems}${t.field.maxItemsErrorSuffix}`);
      return;
    }
    onChange(addItem(items, makeEmptyItem(itemSchema)));
  };

  const handleRemoveItem = (index: number) => {
    if (!canRemoveItem(items, minItems)) {
      onError(`${t.field.minItemsErrorPrefix}${minItems}${t.field.minItemsErrorSuffix}`);
      return;
    }
    onChange(removeItemAt(items, index));
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    onChange(moveItemAt(items, index, direction));
  };

  const handleItemFieldChange = (index: number, fieldKey: string, value: FieldValue) => {
    onChange(setItemFieldAt(items, index, fieldKey, value));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-primary">
          {descriptor.label} ({items.length}{maxItems !== undefined ? ` / ${maxItems}` : ''})
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleAddItem}
          disabled={!canAddItem(items, maxItems)}
          className="text-primary hover:text-primary"
          title={!canAddItem(items, maxItems) ? `${t.field.maxReachedPrefix}${maxItems}${t.field.maxReachedSuffix}` : t.field.addItem}
        >
          <PlusCircle className="size-5" />
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          // The item's own persisted id (ADR-0016 §4-4) — the whole reason the
          // `_key` fake Field existed. Reordering swaps the item objects, so a
          // row's React subtree (and any in-progress draft in it) travels with
          // the item rather than staying at the index.
          <div
            key={item.id}
            className="group/item relative rounded-md border border-border bg-muted/40 p-4"
          >
            <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover/item:opacity-100">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => handleMoveItem(index, 'up')}
                aria-label={t.field.moveUp}
                className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              >
                <ChevronUp className="size-4" />
              </button>
              <button
                type="button"
                disabled={index === items.length - 1}
                onClick={() => handleMoveItem(index, 'down')}
                aria-label={t.field.moveDown}
                className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              >
                <ChevronDown className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                disabled={!canRemoveItem(items, minItems)}
                aria-label={t.field.delete}
                className="text-muted-foreground transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-30"
                title={!canRemoveItem(items, minItems) ? `${t.field.minRequiredPrefix}${minItems}${t.field.minRequiredSuffix}` : t.field.delete}
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            <div className="space-y-6 pt-2">
              {Object.entries(itemSchema)
                .filter(([, sub]) => sub.editable !== false)
                .map(([fKey, sub]) => (
                  <DynamicField
                    key={fKey}
                    descriptor={sub}
                    value={item.fields[fKey]}
                    onChange={(val) => handleItemFieldChange(index, fKey, val)}
                    onError={onError}
                  />
                ))}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="rounded-md border border-dashed border-border py-8 text-center">
            <p className="text-sm text-muted-foreground">{t.field.noItems}</p>
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={handleAddItem}
              className="mt-1 h-auto text-primary"
            >
              {t.field.addFirstItem}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
