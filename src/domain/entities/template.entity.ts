export interface TemplateField {
  value: string;
  type: 'text' | 'textarea' | 'image' | 'url' | 'color' | 'number' | 'select';
  label: string;
  editable?: boolean; // Basic true, hidden in editor if false
  options?: string[]; // for 'select' type
}

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

export interface TemplateJson {
  themeKey: string; // 'corporate' | 'cafe' etc. - renderer key
  globalStyles: TemplateGlobalStyles;
  sections: TemplateSection[];
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
