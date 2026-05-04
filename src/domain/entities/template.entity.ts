export type TemplateFieldType =
  | 'text'
  | 'textarea'
  | 'image'
  | 'url'
  | 'color'
  | 'number'
  | 'select'
  | 'array';

interface BaseTemplateField {
  label: string;
  editable?: boolean; // Basic true, hidden in editor if false
}

export interface TextTemplateField extends BaseTemplateField {
  type: 'text' | 'textarea' | 'url' | 'color' | 'number';
  value: string;
}

export interface SelectTemplateField extends BaseTemplateField {
  type: 'select';
  value: string;
  options: string[]; // for 'select' type
}

export interface ImageTemplateField extends BaseTemplateField {
  type: 'image';
  value: string; // CDN URL
  assetId?: string | null; // UUID of physical asset for reference counting
}

export interface ArrayTemplateField extends BaseTemplateField {
  type: 'array';
  items: Array<Record<string, TemplateField>>;
}

export type TemplateField =
  | TextTemplateField
  | SelectTemplateField
  | ImageTemplateField
  | ArrayTemplateField;

/**
 * Safely get the string value of a field.
 * Returns empty string for 'array' type or missing value.
 * 
 * Usage:
 * 1. getFieldValue(field)
 * 2. getFieldValue(data, 'key')
 */
export function getFieldValue(fieldOrData: TemplateField | Record<string, TemplateField> | undefined, key?: string): string {
  if (!fieldOrData) return '';

  if (key !== undefined) {
    const data = fieldOrData as Record<string, TemplateField>;
    const field = data[key];
    if (!field || field.type === 'array') return '';
    return field.value ?? '';
  }

  const field = fieldOrData as TemplateField;
  if (field.type === 'array') return '';
  return field.value ?? '';
}

export interface TemplateSection {
  id: string;
  type: string;
  visible: boolean;
  editable: boolean;
  data: Record<string, TemplateField>;
}

export interface TemplateGlobalStyles {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: string;
  layout: string;
}

export interface TemplatePage {
  id: string;
  title: string;
  slug: string;
  order: number;
  sections: TemplateSection[];
}

export interface TemplateJson {
  themeKey: string; // 'corporate' | 'cafe' etc. - renderer key
  globalStyles: TemplateGlobalStyles;
  pages: TemplatePage[];
}

export interface Template {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  category: string;
  status: 'draft' | 'active' | 'archived';
  thumbnailUrl: string | null;
  templateJson: TemplateJson;
  version: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateTemplateDto = Omit<Template, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTemplateDto = Partial<Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>;
