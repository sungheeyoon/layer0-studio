'use client';

import { TemplateGlobalStyles } from '@/domain/entities/template.entity';
import { useDictionary } from '@/lib/i18n/provider';

interface GlobalStylesEditorProps {
  globalStyles: TemplateGlobalStyles;
  onChange: (key: keyof TemplateGlobalStyles, value: string) => void;
}

export default function GlobalStylesEditor({ globalStyles, onChange }: GlobalStylesEditorProps) {
  const t = useDictionary().editor.design;
  const fontOptions = ['Inter', 'Playfair Display', 'Roboto', 'Noto Sans KR', 'Montserrat'];
  const layoutOptions = ['asymmetric', 'centered', 'full-width'];

  const baseInputClass =
    "w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 pb-1 font-['Inter'] font-light text-xs";

  return (
    <div className="space-y-8">
      {/* Primary Color */}
      <div className="relative">
        <label className="block font-['Inter'] font-light text-[0.625rem] tracking-[0.1em] uppercase text-outline mb-2">
          {t.primaryColor}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={globalStyles.primaryColor}
            onChange={(e) => onChange('primaryColor', e.target.value)}
            className="w-8 h-8 border border-outline-variant cursor-pointer"
          />
          <input
            type="text"
            className={baseInputClass}
            value={globalStyles.primaryColor}
            onChange={(e) => onChange('primaryColor', e.target.value)}
          />
        </div>
      </div>

      {/* Secondary Color */}
      <div className="relative">
        <label className="block font-['Inter'] font-light text-[0.625rem] tracking-[0.1em] uppercase text-outline mb-2">
          {t.secondaryColor}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={globalStyles.secondaryColor}
            onChange={(e) => onChange('secondaryColor', e.target.value)}
            className="w-8 h-8 border border-outline-variant cursor-pointer"
          />
          <input
            type="text"
            className={baseInputClass}
            value={globalStyles.secondaryColor}
            onChange={(e) => onChange('secondaryColor', e.target.value)}
          />
        </div>
      </div>

      {/* Font Family */}
      <div className="relative">
        <label className="block font-['Inter'] font-light text-[0.625rem] tracking-[0.1em] uppercase text-outline mb-2">
          {t.fontFamily}
        </label>
        <select
          className={baseInputClass}
          value={globalStyles.fontFamily}
          onChange={(e) => onChange('fontFamily', e.target.value)}
        >
          {fontOptions.map((font) => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div className="relative">
        <label className="block font-['Inter'] font-light text-[0.625rem] tracking-[0.1em] uppercase text-outline mb-2">
          {t.baseFontSize}
        </label>
        <input
          type="text"
          className={baseInputClass}
          value={globalStyles.fontSize}
          onChange={(e) => onChange('fontSize', e.target.value)}
          placeholder={t.fontSizePlaceholder}
        />
      </div>

      {/* Layout */}
      <div className="relative">
        <label className="block font-['Inter'] font-light text-[0.625rem] tracking-[0.1em] uppercase text-outline mb-2">
          {t.layoutStyle}
        </label>
        <select
          className={baseInputClass}
          value={globalStyles.layout}
          onChange={(e) => onChange('layout', e.target.value)}
        >
          {layoutOptions.map((layout) => (
            <option key={layout} value={layout}>{layout}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
