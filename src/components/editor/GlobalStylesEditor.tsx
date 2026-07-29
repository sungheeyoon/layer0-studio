'use client';

import { GlobalStyles } from '@/domain/entities/template.entity';
import { useDictionary } from '@/lib/i18n/provider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldIssues } from './FieldIssues';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GlobalStylesEditorProps {
  globalStyles: GlobalStyles;
  onChange: (key: keyof GlobalStyles, value: string) => void;
  /**
   * Warning codes per `globalStyles` key. These describe how a value will render
   * on the published Site; none of them stops a save (ADR-0015 §5).
   */
  issues: Record<string, string[]>;
  /**
   * The Template's own defaults, used only to *display* an axis this Site's
   * content predates. A Site created before an axis existed has no value for
   * it, and every render path falls back to the Template default — so the
   * control must show that same default rather than the empty-string reading
   * of `<input type="color">`, which is black and would misreport the Site.
   * Nothing is written until the user actually picks a value.
   */
  templateDefaults?: GlobalStyles;
}

export default function GlobalStylesEditor({ globalStyles, onChange, issues, templateDefaults }: GlobalStylesEditorProps) {
  const t = useDictionary().editor.design;
  const fontOptions = ['Inter', 'Playfair Display', 'Roboto', 'Noto Sans KR', 'Montserrat'];
  const backgroundColor = globalStyles.backgroundColor || templateDefaults?.backgroundColor || '#ffffff';

  return (
    <div className="space-y-6">
      {/* Primary Color */}
      <div className="space-y-2">
        <Label htmlFor="primaryColor">{t.primaryColor}</Label>
        <div className="flex items-center gap-2">
          <input
            id="primaryColor"
            type="color"
            value={globalStyles.primaryColor}
            onChange={(e) => onChange('primaryColor', e.target.value)}
            className="size-9 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-1"
          />
          <Input
            className="font-mono"
            value={globalStyles.primaryColor}
            onChange={(e) => onChange('primaryColor', e.target.value)}
          />
        </div>
        <FieldIssues codes={issues.primaryColor} />
      </div>

      {/* Secondary Color */}
      <div className="space-y-2">
        <Label htmlFor="secondaryColor">{t.secondaryColor}</Label>
        <div className="flex items-center gap-2">
          <input
            id="secondaryColor"
            type="color"
            value={globalStyles.secondaryColor}
            onChange={(e) => onChange('secondaryColor', e.target.value)}
            className="size-9 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-1"
          />
          <Input
            className="font-mono"
            value={globalStyles.secondaryColor}
            onChange={(e) => onChange('secondaryColor', e.target.value)}
          />
        </div>
        <FieldIssues codes={issues.secondaryColor} />
      </div>

      {/* Background Color */}
      <div className="space-y-2">
        <Label htmlFor="backgroundColor">{t.backgroundColor}</Label>
        <div className="flex items-center gap-2">
          <input
            id="backgroundColor"
            type="color"
            value={backgroundColor}
            onChange={(e) => onChange('backgroundColor', e.target.value)}
            className="size-9 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-1"
          />
          <Input
            className="font-mono"
            value={backgroundColor}
            onChange={(e) => onChange('backgroundColor', e.target.value)}
          />
        </div>
        <FieldIssues codes={issues.backgroundColor} />
      </div>

      {/* Font Family */}
      <div className="space-y-2">
        <Label>{t.fontFamily}</Label>
        <Select value={globalStyles.fontFamily} onValueChange={(v) => onChange('fontFamily', v)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fontOptions.map((font) => (
              <SelectItem key={font} value={font}>{font}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <Label htmlFor="fontSize">{t.baseFontSize}</Label>
        <Input
          id="fontSize"
          value={globalStyles.fontSize}
          onChange={(e) => onChange('fontSize', e.target.value)}
          placeholder={t.fontSizePlaceholder}
        />
        <FieldIssues codes={issues.fontSize} />
      </div>

      {/*
        No `layout` control — see ADR-0015. `globalStyles.layout` reaches no
        renderer (no CSS variable, no OVERLAY_MAP entry), and the dropdown that
        used to sit here offered values outside the validator's allow-list,
        which permanently blocked saving for any Site that picked one.
      */}
    </div>
  );
}
