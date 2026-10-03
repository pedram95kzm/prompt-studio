export type FieldType = 'text' | 'textarea';

export interface Placeholder {
  required: boolean;
  label: string;
  type: FieldType;
  description?: string;
  placeholder?: string;
}

export type PlaceholderSchema = Record<string, Placeholder>;

export interface Template {
  id: string;
  title: string;
  description: string;
  tags: string[];
  templatePath: string;
  schemaPath: string;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  icon: 'code' | 'sparkles' | 'book' | 'mind' | 'home' | 'film';
  color: 'blue' | 'green' | 'cyan' | 'violet' | 'amber' | 'rose';
  templates: Template[];
}

export type UserInput = Record<string, string>;

export interface LoadedTemplate {
  content: string;
  schema: PlaceholderSchema;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface GenerateResult {
  prompt: string;
  errors: ValidationErrors;
}

export interface StoredState {
  categoryId: string;
  templateId: string;
  language: string;
  theme: 'light' | 'dark';
  inputs: Record<string, UserInput>;
}
