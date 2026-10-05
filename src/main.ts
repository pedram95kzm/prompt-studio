import './style.css';
import { categories } from './data/catalog';
import type {
  Category,
  LoadedTemplate,
  Placeholder,
  StoredState,
  Template,
  UserInput,
  ValidationErrors,
} from './types';
import { generatePrompt } from './utils/generator';
import { loadTemplate } from './utils/loader';

const STORAGE_KEY = 'prompt-studio-state-v1';
const languages = ['English', 'Persian (فارسی)', 'Arabic (العربية)', 'Spanish', 'French', 'German'];
const rtlLanguages = new Set(['Persian (فارسی)', 'Arabic (العربية)']);
const desktopLayout = window.matchMedia('(min-width: 760px)');

const icons = {
  sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m12 3-1.2 3.4a7.1 7.1 0 0 1-4.4 4.4L3 12l3.4 1.2a7.1 7.1 0 0 1 4.4 4.4L12 21l1.2-3.4a7.1 7.1 0 0 1 4.4-4.4L21 12l-3.4-1.2a7.1 7.1 0 0 1-4.4-4.4L12 3Z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M20.5 15.3A9 9 0 0 1 8.7 3.5 9 9 0 1 0 20.5 15.3Z"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 12 4 4 8-8"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m8 10 4 4 4-4"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 4h.01"/></svg>',
};

type AppState = {
  category: Category;
  template: Template;
  loaded: LoadedTemplate | null;
  inputs: Record<string, UserInput>;
  errors: ValidationErrors;
  language: string;
  theme: 'light' | 'dark';
  output: string;
  query: string;
  loading: boolean;
  loadError: string;
};

function readStoredState(): Partial<StoredState> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<StoredState>;
  } catch {
    return {};
  }
}

const stored = readStoredState();
const initialCategory = categories.find((category) => category.id === stored.categoryId) ?? categories[0];
const initialTemplate =
  initialCategory.templates.find((template) => template.id === stored.templateId) ?? initialCategory.templates[0];

const state: AppState = {
  category: initialCategory,
  template: initialTemplate,
  loaded: null,
  inputs: stored.inputs ?? {},
  errors: {},
  language: languages.includes(stored.language ?? '') ? stored.language! : 'English',
  theme: stored.theme ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  output: '',
  query: '',
  loading: true,
  loadError: '',
};

function persist(): void {
  const payload: StoredState = {
    categoryId: state.category.id,
    templateId: state.template.id,
    language: state.language,
    theme: state.theme,
    inputs: state.inputs,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function mustFind<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing UI element: ${selector}`);
  return element;
}

const app = mustFind<HTMLDivElement>('#app');

app.innerHTML = `
  <header class="app-header">
    <div class="header-inner">
      <a href="#" class="brand" aria-label="Prompt Studio home">
        <span class="brand-mark">${icons.sparkles}</span>
        <span>Prompt Studio</span>
      </a>
      <nav id="category-list" class="category-list" aria-label="Prompt categories"></nav>
      <button id="theme-toggle" type="button" class="icon-button" aria-label="Switch to dark mode"></button>
    </div>
  </header>

  <main class="workspace">
    <aside class="library" aria-label="Template library">
      <details id="template-picker" class="template-picker">
        <summary class="template-picker-summary">
          <span><span class="picker-label">Template</span><span id="template-selection"></span></span>
          <span class="icon disclosure-icon">${icons.chevron}</span>
        </summary>
        <div class="template-picker-body">
          <h2 id="template-heading" class="section-label">Templates</h2>
          <label class="search-field">
            <span class="icon">${icons.search}</span>
            <input id="template-search" type="search" autocomplete="off" placeholder="Search templates…" aria-label="Search templates in the selected collection" />
          </label>
          <div id="template-list" class="template-list"></div>
        </div>
      </details>
    </aside>

    <section id="form-panel" class="builder" aria-label="Prompt builder">
      <div class="builder-heading">
        <p class="section-label">Prompt builder</p>
        <h1 id="form-title">Loading template…</h1>
        <p id="form-description" class="muted"></p>
      </div>
      <form id="prompt-form" novalidate>
        <div id="form-content" class="form-content"></div>
        <div id="form-actions" class="form-footer"></div>
      </form>
    </section>

    <section class="result-panel" aria-label="Generated prompt preview">
      <div class="result-heading">
        <h2>Your prompt</h2>
        <button id="copy-button" type="button" disabled class="secondary-button">
          <span class="icon">${icons.copy}</span><span>Copy</span>
        </button>
      </div>
      <div id="preview" class="preview"></div>
    </section>
  </main>

  <div id="toast-region" class="toast-region" aria-live="polite" aria-atomic="true"></div>
`;

const elements = {
  categoryList: mustFind<HTMLElement>('#category-list'),
  templateHeading: mustFind<HTMLElement>('#template-heading'),
  templateList: mustFind<HTMLElement>('#template-list'),
  templatePicker: mustFind<HTMLDetailsElement>('#template-picker'),
  templateSelection: mustFind<HTMLElement>('#template-selection'),
  search: mustFind<HTMLInputElement>('#template-search'),
  form: mustFind<HTMLFormElement>('#prompt-form'),
  formTitle: mustFind<HTMLElement>('#form-title'),
  formDescription: mustFind<HTMLElement>('#form-description'),
  formContent: mustFind<HTMLElement>('#form-content'),
  formActions: mustFind<HTMLElement>('#form-actions'),
  preview: mustFind<HTMLElement>('#preview'),
  copyButton: mustFind<HTMLButtonElement>('#copy-button'),
  themeToggle: mustFind<HTMLButtonElement>('#theme-toggle'),
  toastRegion: mustFind<HTMLElement>('#toast-region'),
};

elements.templatePicker.open = desktopLayout.matches;

function renderCategories(): void {
  elements.categoryList.replaceChildren();
  categories.forEach((category) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.categoryId = category.id;
    button.className = 'category-button';
    button.setAttribute('aria-current', String(category.id === state.category.id));
    button.textContent = category.title;
    elements.categoryList.append(button);
  });
}

function filteredTemplates(): Template[] {
  const query = state.query.trim().toLocaleLowerCase();
  if (!query) return state.category.templates;
  return state.category.templates.filter((template) =>
    [template.title, template.description, ...template.tags].join(' ').toLocaleLowerCase().includes(query),
  );
}

function renderTemplates(): void {
  elements.templateHeading.textContent = `${state.category.title} templates`;
  elements.templateSelection.textContent = state.template.title;
  elements.templateList.replaceChildren();
  const templates = filteredTemplates();

  if (!templates.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-search muted';
    empty.textContent = 'No matching templates. Try another word or collection.';
    elements.templateList.append(empty);
    return;
  }

  templates.forEach((template) => {
    const button = document.createElement('button');
    const selected = template.id === state.template.id;
    button.type = 'button';
    button.dataset.templateId = template.id;
    button.dataset.active = String(selected);
    button.className = 'template-button';
    button.setAttribute('aria-pressed', String(selected));
    button.innerHTML = `
      <span class="template-text"><span class="template-title"></span><span class="template-description"></span></span>
      <span class="icon selection-check">${icons.check}</span>
    `;
    button.querySelector('.template-title')!.textContent = template.title;
    button.querySelector('.template-description')!.textContent = template.description;
    elements.templateList.append(button);
  });
}

function renderLoadingForm(): void {
  elements.formTitle.textContent = 'Loading template…';
  elements.formDescription.textContent = '';
  elements.form.setAttribute('aria-busy', 'true');
  elements.formContent.innerHTML = '<div class="loading-placeholder" aria-hidden="true"></div>';
  elements.formActions.replaceChildren();
}

function renderLoadError(): void {
  elements.formTitle.textContent = 'Template unavailable';
  elements.formDescription.textContent = "We couldn't load this template.";
  const error = document.createElement('p');
  error.className = 'load-error';
  error.setAttribute('role', 'alert');
  error.textContent = state.loadError;
  elements.formContent.replaceChildren(error);
  elements.formActions.innerHTML = '<button type="button" data-action="retry" class="primary-button">Try again</button>';
}

function currentInputs(): UserInput {
  return state.inputs[state.template.id] ?? {};
}

function createField(key: string, field: Placeholder): HTMLElement {
  const wrapper = document.createElement('div');
  const id = `field-${key}`;
  const error = state.errors[key];
  wrapper.className = 'field-group';
  wrapper.dataset.fieldWrapper = key;

  const label = document.createElement('label');
  label.htmlFor = id;
  label.className = 'field-label';
  label.textContent = field.label;
  if (field.required) {
    const required = document.createElement('span');
    required.className = 'required-mark';
    required.setAttribute('aria-label', 'required');
    required.textContent = '*';
    label.append(required);
  }
  wrapper.append(label);

  if (field.description) {
    const help = document.createElement('p');
    help.id = `${id}-help`;
    help.className = 'field-help';
    help.textContent = field.description;
    wrapper.append(help);
  }

  const input = document.createElement(field.type === 'textarea' ? 'textarea' : 'input');
  input.id = id;
  input.name = key;
  input.dir = 'auto';
  input.required = field.required;
  input.setAttribute('aria-invalid', String(Boolean(error)));
  input.setAttribute('aria-describedby', `${field.description ? `${id}-help ` : ''}${id}-error`);
  input.className = 'field';
  input.placeholder = field.placeholder ?? '';
  input.value = currentInputs()[key] ?? '';
  wrapper.append(input);

  const errorElement = document.createElement('p');
  errorElement.id = `${id}-error`;
  errorElement.dataset.errorFor = key;
  errorElement.className = 'field-error';
  errorElement.hidden = !error;
  errorElement.textContent = error ?? '';
  wrapper.append(errorElement);
  return wrapper;
}

function renderForm(): void {
  if (state.loading) return renderLoadingForm();
  elements.form.setAttribute('aria-busy', 'false');
  if (!state.loaded || state.loadError) return renderLoadError();

  const contextWasOpen = elements.formContent.querySelector<HTMLDetailsElement>('.optional-fields')?.open;
  elements.formTitle.textContent = state.template.title;
  elements.formDescription.textContent = state.template.description;
  elements.formContent.replaceChildren();
  const fields = Object.entries(state.loaded.schema);
  const requiredFields = fields.filter(([, field]) => field.required);
  const optionalFields = fields.filter(([, field]) => !field.required);
  requiredFields.forEach(([key, field]) => elements.formContent.append(createField(key, field)));

  if (optionalFields.length) {
    const details = document.createElement('details');
    details.className = 'optional-fields';
    details.open = requiredFields.length === 0 || Boolean(contextWasOpen) || optionalFields.some(([key]) => currentInputs()[key]?.trim());
    details.innerHTML = `
      <summary><span>More context <span class="optional-label">Optional</span></span><span class="icon disclosure-icon">${icons.chevron}</span></summary>
      <div class="optional-fields-content"></div>
    `;
    const content = details.querySelector('.optional-fields-content')!;
    optionalFields.forEach(([key, field]) => content.append(createField(key, field)));
    elements.formContent.append(details);
  }

  elements.formActions.innerHTML = `
    <div class="language-row">
      <label for="language">Response language</label>
      <select id="language" class="field language-select"></select>
    </div>
    <div class="action-row">
      <button type="button" data-action="reset" class="text-button">Reset fields</button>
      <button type="submit" class="primary-button" title="Ctrl+Enter / ⌘+Enter">Generate prompt</button>
    </div>
  `;
  const select = elements.formActions.querySelector<HTMLSelectElement>('#language')!;
  languages.forEach((language) => {
    const option = document.createElement('option');
    option.value = language;
    option.textContent = language;
    option.selected = state.language === language;
    select.append(option);
  });
}

function renderPreview(): void {
  elements.preview.replaceChildren();
  elements.copyButton.disabled = !state.output;
  if (!state.output) {
    const empty = document.createElement('div');
    empty.className = 'preview-empty';
    empty.innerHTML = '<p>Your prompt will appear here.</p><p class="muted">Add your details, then generate.</p>';
    elements.preview.append(empty);
    return;
  }

  const pre = document.createElement('pre');
  pre.className = 'prompt-output';
  pre.dir = rtlLanguages.has(state.language) ? 'rtl' : 'auto';
  pre.textContent = state.output;
  elements.preview.append(pre);
}

function renderTheme(): void {
  document.documentElement.classList.toggle('dark', state.theme === 'dark');
  elements.themeToggle.innerHTML = `<span class="icon">${state.theme === 'dark' ? icons.sun : icons.moon}</span>`;
  const label = `Switch to ${state.theme === 'dark' ? 'light' : 'dark'} mode`;
  elements.themeToggle.setAttribute('aria-label', label);
  elements.themeToggle.title = label;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', state.theme === 'dark' ? '#171918' : '#ffffff');
}

function showToast(message: string, kind: 'success' | 'error' = 'success'): void {
  const toast = document.createElement('div');
  toast.className = `toast toast-${kind}`;
  toast.innerHTML = `<span class="icon">${kind === 'success' ? icons.check : icons.alert}</span><span></span>`;
  toast.querySelector('span:last-child')!.textContent = message;
  elements.toastRegion.replaceChildren(toast);
  window.setTimeout(() => toast.remove(), 2800);
}

function renderAll(): void {
  renderCategories();
  renderTemplates();
  renderForm();
  renderPreview();
  renderTheme();
}

let templateRequest = 0;

async function selectTemplate(template: Template): Promise<void> {
  const request = ++templateRequest;
  state.template = template;
  state.loaded = null;
  state.loading = true;
  state.loadError = '';
  state.errors = {};
  state.output = '';
  persist();
  renderAll();

  try {
    const loaded = await loadTemplate(template);
    if (request !== templateRequest) return;
    state.loaded = loaded;
  } catch (error) {
    if (request !== templateRequest) return;
    state.loadError = error instanceof Error ? error.message : 'An unknown error occurred.';
  } finally {
    if (request === templateRequest) {
      state.loading = false;
      renderForm();
    }
  }
}

function selectCategory(category: Category): void {
  if (category.id === state.category.id) return;
  state.category = category;
  state.query = '';
  elements.search.value = '';
  elements.templatePicker.open = true;
  void selectTemplate(category.templates[0]);
}

elements.categoryList.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-category-id]');
  const category = categories.find((item) => item.id === button?.dataset.categoryId);
  if (category) selectCategory(category);
});

elements.templateList.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-template-id]');
  const template = state.category.templates.find((item) => item.id === button?.dataset.templateId);
  if (!template) return;
  if (template.id !== state.template.id) void selectTemplate(template);
  if (!desktopLayout.matches) {
    elements.templatePicker.open = false;
    elements.templatePicker.querySelector<HTMLElement>('summary')?.focus();
  }
});

elements.form.addEventListener('input', (event) => {
  const input = event.target as HTMLInputElement | HTMLTextAreaElement;
  if (!input.name || !state.loaded) return;
  state.inputs[state.template.id] ??= {};
  state.inputs[state.template.id][input.name] = input.value;
  if (state.errors[input.name] && input.value.trim()) {
    delete state.errors[input.name];
    input.setAttribute('aria-invalid', 'false');
    const error = elements.formContent.querySelector<HTMLElement>(`[data-error-for="${input.name}"]`);
    if (error) error.hidden = true;
  }
  if (state.output) {
    state.output = '';
    renderPreview();
  }
  persist();
});

elements.form.addEventListener('change', (event) => {
  const select = event.target as HTMLSelectElement;
  if (select.id !== 'language') return;
  state.language = select.value;
  state.output = '';
  persist();
  renderPreview();
});

elements.form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!state.loaded) return;
  const result = generatePrompt(state.loaded.content, state.loaded.schema, currentInputs(), state.language);
  state.errors = result.errors;
  if (Object.keys(result.errors).length) {
    renderForm();
    elements.formContent.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    showToast('Complete the required fields to continue.', 'error');
    return;
  }
  state.output = result.prompt;
  renderPreview();
  if (window.innerWidth < 1120) {
    elements.preview.closest('section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

elements.form.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-action]');
  if (button?.dataset.action === 'retry') void selectTemplate(state.template);
  if (button?.dataset.action === 'reset') {
    state.inputs[state.template.id] = {};
    state.errors = {};
    state.output = '';
    elements.formContent.querySelector<HTMLDetailsElement>('.optional-fields')?.removeAttribute('open');
    persist();
    renderForm();
    renderPreview();
    showToast('Fields reset.');
  }
});

elements.copyButton.addEventListener('click', async () => {
  if (!state.output) return;
  try {
    await navigator.clipboard.writeText(state.output);
    showToast('Copied to clipboard.');
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = state.output;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    showToast(copied ? 'Copied to clipboard.' : 'Copy failed. Please select the text manually.', copied ? 'success' : 'error');
  }
});

elements.themeToggle.addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  persist();
  renderTheme();
});

elements.search.addEventListener('input', () => {
  state.query = elements.search.value;
  renderTemplates();
});

desktopLayout.addEventListener('change', () => {
  elements.templatePicker.open = desktopLayout.matches;
});

document.addEventListener('keydown', (event) => {
  if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement).tagName)) {
    event.preventDefault();
    elements.templatePicker.open = true;
    elements.search.focus();
  }
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    elements.form.requestSubmit();
  }
});

void selectTemplate(state.template);
