export type TemplateFieldType = 'text' | 'textarea' | 'image' | 'url' | 'color' | 'number' | 'select';

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

export type TemplateField = TextTemplateField | SelectTemplateField | ImageTemplateField;

export interface TemplateSection {
  id: string;
  type: string;
  order: number;
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
  sections?: TemplateSection[]; // DEPRECATED: use pages instead
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
