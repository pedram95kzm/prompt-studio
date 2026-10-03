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

const icons = {
  sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m12 3-1.2 3.4a7.1 7.1 0 0 1-4.4 4.4L3 12l3.4 1.2a7.1 7.1 0 0 1 4.4 4.4L12 21l1.2-3.4a7.1 7.1 0 0 1 4.4-4.4L21 12l-3.4-1.2a7.1 7.1 0 0 1-4.4-4.4L12 3Z"/><path d="m19 3-.4 1.1a2.4 2.4 0 0 1-1.5 1.5L16 6l1.1.4a2.4 2.4 0 0 1 1.5 1.5L19 9l.4-1.1a2.4 2.4 0 0 1 1.5-1.5L22 6l-1.1-.4a2.4 2.4 0 0 1-1.5-1.5L19 3Z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20.5 15.3A9 9 0 0 1 8.7 3.5 9 9 0 1 0 20.5 15.3Z"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m8 9-3 3 3 3m8-6 3 3-3 3m-2-9-4 12"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 5.5C9 3.5 5 3.5 2 5v14c3-1.5 7-1.5 10 .5 3-2 7-2 10-.5V5c-3-1.5-7-1.5-10 .5Zm0 0v14"/></svg>',
  mind: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9.5 4.5A3.5 3.5 0 0 0 6 8v.3A3.6 3.6 0 0 0 4 11.5c0 1.2.6 2.3 1.5 3A3.5 3.5 0 0 0 9 19h1V5.5a2 2 0 0 0-.5-1Zm5 0A3.5 3.5 0 0 1 18 8v.3a3.6 3.6 0 0 1 2 3.2c0 1.2-.6 2.3-1.5 3A3.5 3.5 0 0 1 15 19h-1V5.5a2 2 0 0 1 .5-1Z"/><path d="M6 8.5h2m8 0h2M5.5 14H8m8 0h2.5"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></svg>',
  film: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M17 5v14M3 9h4m10 0h4M3 15h4m10 0h4"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="m6 12 4 4 8-8"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
  reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v5h5M9 13h6m-6 4h4"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 4h.01"/></svg>',
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
  theme:
    stored.theme ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
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
  <div class="min-h-screen">
    <header class="sticky top-0 z-40 border-b border-[#dfe4dc]/80 bg-[#f7f8f4]/85 backdrop-blur-xl dark:border-[#2b352e] dark:bg-[#101512]/85">
      <div class="mx-auto flex h-[72px] max-w-[1560px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <a href="#" class="flex shrink-0 items-center gap-3" aria-label="Prompt Studio home">
          <span class="grid h-10 w-10 place-items-center rounded-xl bg-moss-600 text-white shadow-lg shadow-moss-600/15">
            <span class="h-[21px] w-[21px]">${icons.sparkles}</span>
          </span>
          <span>
            <span class="block text-[15px] font-bold leading-4 tracking-[-0.02em]">Prompt Studio</span>
            <span class="hidden text-[10px] font-medium uppercase tracking-[0.16em] text-[#859087] sm:block dark:text-[#829087]">Thoughtful prompts, faster</span>
          </span>
        </a>

        <label class="relative mx-auto hidden w-full max-w-md md:block">
          <span class="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[#849087]">
            <span class="h-[18px] w-[18px]">${icons.search}</span>
          </span>
          <input id="search-desktop" type="search" autocomplete="off" placeholder="Search templates…" class="field h-10 py-0 pl-10 pr-16" />
          <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <kbd class="rounded-md border border-[#dce2db] bg-white px-1.5 py-0.5 text-[10px] font-medium text-[#8b958e] shadow-sm dark:border-[#3a463e] dark:bg-[#1b231e]">/</kbd>
          </span>
        </label>

        <div class="ml-auto flex items-center gap-2 md:ml-0">
          <button id="theme-toggle" type="button" class="grid h-10 w-10 place-items-center rounded-xl border border-[#dfe5dd] bg-white/75 text-[#667169] transition hover:border-[#c6d0c8] hover:bg-white dark:border-[#354039] dark:bg-[#18201b] dark:text-[#b8c4bc] dark:hover:bg-[#202a23]" aria-label="Switch to dark mode"></button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-[1560px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div class="mb-5 md:hidden">
        <label class="relative block">
          <span class="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[#849087]"><span class="h-[18px] w-[18px]">${icons.search}</span></span>
          <input id="search-mobile" type="search" autocomplete="off" placeholder="Search templates…" class="field h-11 py-0 pl-10 pr-4" />
        </label>
      </div>

      <div class="grid items-start gap-5 lg:grid-cols-[218px_minmax(0,1fr)] xl:grid-cols-[218px_minmax(520px,1fr)_minmax(340px,0.78fr)]">
        <aside class="surface min-w-0 rounded-2xl p-2.5 lg:sticky lg:top-[100px]">
          <div class="hidden px-3 pb-2 pt-2 lg:block">
            <p class="text-[10px] font-bold uppercase tracking-[0.17em] text-[#929b94] dark:text-[#7f8b83]">Collections</p>
          </div>
          <nav id="category-list" class="flex gap-2 overflow-x-auto pb-0.5 lg:block lg:space-y-1.5" aria-label="Prompt categories"></nav>
          <div class="mt-3 hidden rounded-xl border border-[#deeadf] bg-[#f2f8f3] p-3.5 lg:block dark:border-[#304b3a] dark:bg-[#18291f]">
            <div class="mb-2 flex items-center gap-2 text-moss-700 dark:text-[#7bc49a]">
              <span class="h-4 w-4">${icons.sparkles}</span>
              <span class="text-[11px] font-bold uppercase tracking-[0.1em]">Quick tip</span>
            </div>
            <p class="text-xs leading-5 text-[#647068] dark:text-[#9ead9f]">Add specific context to get more useful, less generic results.</p>
          </div>
        </aside>

        <section class="min-w-0 space-y-5" aria-label="Prompt builder">
          <div class="surface rounded-2xl p-4 sm:p-5">
            <div class="mb-4">
              <div>
                <p class="mb-1 text-[10px] font-bold uppercase tracking-[0.17em] text-moss-600 dark:text-[#6dbc8d]">01 · Choose a starting point</p>
                <h1 id="template-heading" class="text-xl font-bold tracking-[-0.025em] sm:text-2xl">Coding templates</h1>
              </div>
            </div>
            <div id="template-list" class="grid gap-2.5 sm:grid-cols-2"></div>
          </div>

          <div id="form-panel" class="surface overflow-hidden rounded-2xl">
            <div class="border-b border-[#e5e9e3] px-5 py-4 sm:px-6 dark:border-[#303a33]">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="mb-1 text-[10px] font-bold uppercase tracking-[0.17em] text-moss-600 dark:text-[#6dbc8d]">02 · Make it yours</p>
                  <h2 id="form-title" class="text-lg font-bold tracking-[-0.02em]">Loading template…</h2>
                </div>
                <div id="completion-badge" class="hidden shrink-0 items-center gap-2 rounded-full bg-[#f1f5f1] px-3 py-1.5 text-[11px] font-semibold text-[#647068] dark:bg-[#222c25] dark:text-[#a0ada4]">
                  <span id="completion-dot" class="h-1.5 w-1.5 rounded-full bg-[#aab4ac]"></span>
                  <span id="completion-label">0% ready</span>
                </div>
              </div>
            </div>
            <form id="prompt-form" novalidate>
              <div id="form-content" class="space-y-5 px-5 py-5 sm:px-6 sm:py-6"></div>
              <div id="form-actions" class="border-t border-[#e5e9e3] bg-[#fafbf8]/75 px-5 py-4 sm:px-6 dark:border-[#303a33] dark:bg-[#151c18]/80"></div>
            </form>
          </div>
        </section>

        <section class="surface min-w-0 overflow-hidden rounded-2xl xl:sticky xl:top-[100px]" aria-label="Generated prompt preview">
          <div class="flex items-center justify-between gap-3 border-b border-[#e5e9e3] px-5 py-4 dark:border-[#303a33]">
            <div>
              <p class="mb-1 text-[10px] font-bold uppercase tracking-[0.17em] text-moss-600 dark:text-[#6dbc8d]">03 · Your result</p>
              <h2 class="text-lg font-bold tracking-[-0.02em]">Final prompt</h2>
            </div>
            <button id="copy-button" type="button" disabled class="inline-flex h-9 items-center gap-2 rounded-lg border border-[#dce2db] bg-white px-3 text-xs font-semibold text-[#5d6961] transition hover:border-moss-500 hover:text-moss-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#3a453d] dark:bg-[#1b231e] dark:text-[#b0bbb3] dark:hover:border-[#579d76]">
              <span class="h-4 w-4">${icons.copy}</span>
              <span>Copy</span>
            </button>
          </div>
          <div id="preview" class="preview-paper min-h-[360px] xl:min-h-[calc(100vh-204px)]"></div>
        </section>
      </div>
    </main>

    <div id="toast-region" class="pointer-events-none fixed inset-x-0 bottom-6 z-50" aria-live="polite" aria-atomic="true"></div>
  </div>
`;

const elements = {
  categoryList: mustFind<HTMLElement>('#category-list'),
  templateHeading: mustFind<HTMLElement>('#template-heading'),
  templateList: mustFind<HTMLElement>('#template-list'),
  form: mustFind<HTMLFormElement>('#prompt-form'),
  formTitle: mustFind<HTMLElement>('#form-title'),
  formContent: mustFind<HTMLElement>('#form-content'),
  formActions: mustFind<HTMLElement>('#form-actions'),
  completionBadge: mustFind<HTMLElement>('#completion-badge'),
  completionDot: mustFind<HTMLElement>('#completion-dot'),
  completionLabel: mustFind<HTMLElement>('#completion-label'),
  preview: mustFind<HTMLElement>('#preview'),
  copyButton: mustFind<HTMLButtonElement>('#copy-button'),
  themeToggle: mustFind<HTMLButtonElement>('#theme-toggle'),
  searchDesktop: mustFind<HTMLInputElement>('#search-desktop'),
  searchMobile: mustFind<HTMLInputElement>('#search-mobile'),
  toastRegion: mustFind<HTMLElement>('#toast-region'),
};

function colorClasses(category: Category): { icon: string; active: string } {
  if (category.color === 'green') {
    return { icon: 'bg-[#e6f4eb] text-[#28774d] dark:bg-[#213d2d] dark:text-[#8ad0a7]', active: 'bg-[#edf8f0] dark:bg-[#203729]' };
  }
  if (category.color === 'cyan') {
    return { icon: 'bg-[#e4f4f8] text-[#28788c] dark:bg-[#203b43] dark:text-[#8bcbdc]', active: 'bg-[#edf8fb] dark:bg-[#20333b]' };
  }
  if (category.color === 'violet') {
    return { icon: 'bg-[#f0edfb] text-[#6858b8] dark:bg-[#30294c] dark:text-[#aea2ee]', active: 'bg-[#f4f1fc] dark:bg-[#29233e]' };
  }
  if (category.color === 'amber') {
    return { icon: 'bg-[#fff1d7] text-[#a56919] dark:bg-[#3c2d18] dark:text-[#e8b767]', active: 'bg-[#fff6e5] dark:bg-[#332818]' };
  }
  if (category.color === 'rose') {
    return { icon: 'bg-[#fbecef] text-[#ad4f67] dark:bg-[#452832] dark:text-[#e796aa]', active: 'bg-[#fdf1f3] dark:bg-[#382129]' };
  }
  return { icon: 'bg-[#e9f1fb] text-[#3f6fa7] dark:bg-[#243547] dark:text-[#86b3e4]', active: 'bg-[#edf4fb] dark:bg-[#202e3b]' };
}

function renderCategories(): void {
  elements.categoryList.replaceChildren();

  categories.forEach((category) => {
    const button = document.createElement('button');
    const selected = category.id === state.category.id;
    const colors = colorClasses(category);
    button.type = 'button';
    button.dataset.categoryId = category.id;
    button.className = `category-button group flex min-w-[185px] items-center gap-3 rounded-xl border px-3 py-2.5 text-left lg:w-full lg:min-w-0 ${
      selected
        ? `${colors.active} border-transparent`
        : 'border-transparent hover:border-[#e1e6df] hover:bg-[#f8faf6] dark:hover:border-[#354039] dark:hover:bg-[#1a221d]'
    }`;
    button.setAttribute('aria-current', selected ? 'true' : 'false');
    button.innerHTML = `
      <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg ${colors.icon}"><span class="h-[18px] w-[18px]">${icons[category.icon]}</span></span>
      <span class="min-w-0 flex-1">
        <span class="block text-[13px] font-semibold">${category.title}</span>
        <span class="block truncate text-[10px] text-[#8a958d] dark:text-[#87948b]">${category.description}</span>
      </span>
      <span class="h-1.5 w-1.5 shrink-0 rounded-full ${selected ? 'bg-moss-500' : 'bg-transparent'}"></span>
    `;
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
  const templates = filteredTemplates();
  elements.templateHeading.textContent = `${state.category.title} templates`;
  elements.templateList.replaceChildren();

  if (!templates.length) {
    const empty = document.createElement('div');
    empty.className = 'col-span-full rounded-xl border border-dashed border-[#d8dfd8] px-5 py-8 text-center dark:border-[#3a463e]';
    empty.innerHTML = `<span class="mx-auto mb-2 block h-5 w-5 text-[#93a097]">${icons.search}</span><p class="text-sm font-semibold">No matching templates</p><p class="mt-1 text-xs text-[#879188]">Try a different word or choose another collection.</p>`;
    elements.templateList.append(empty);
    return;
  }

  templates.forEach((template) => {
    const button = document.createElement('button');
    const selected = template.id === state.template.id;
    button.type = 'button';
    button.dataset.templateId = template.id;
    button.dataset.active = String(selected);
    button.className = 'template-card relative rounded-xl border border-[#e1e6df] bg-white/65 p-3.5 text-left dark:border-[#354039] dark:bg-[#19201c]/70';
    button.innerHTML = `
      <span class="selection-check absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-moss-600 text-white"><span class="h-3 w-3">${icons.check}</span></span>
      <span class="mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[#f1f4ef] text-[#6e7a71] dark:bg-[#252f28] dark:text-[#a9b5ac]"><span class="h-4 w-4">${icons.file}</span></span>
      <span class="block pr-7 text-[13px] font-bold tracking-[-0.01em]">${template.title}</span>
      <span class="mt-1 block text-[11px] leading-[1.55] text-[#7d8880] dark:text-[#909c93]">${template.description}</span>
    `;
    elements.templateList.append(button);
  });
}

function renderLoadingForm(): void {
  elements.formTitle.textContent = 'Loading template…';
  elements.completionBadge.classList.add('hidden');
  elements.formContent.innerHTML = `
    <div class="space-y-3"><div class="skeleton h-3 w-28 rounded"></div><div class="skeleton h-11 rounded-xl"></div></div>
    <div class="space-y-3"><div class="skeleton h-3 w-36 rounded"></div><div class="skeleton h-28 rounded-xl"></div></div>
    <div class="space-y-3"><div class="skeleton h-3 w-24 rounded"></div><div class="skeleton h-11 rounded-xl"></div></div>
  `;
  elements.formActions.innerHTML = '<div class="skeleton ml-auto h-11 w-40 rounded-xl"></div>';
}

function renderLoadError(): void {
  elements.formTitle.textContent = 'Template unavailable';
  elements.completionBadge.classList.add('hidden');
  elements.formContent.innerHTML = `
    <div class="rounded-xl border border-[#f0cbc7] bg-[#fff7f6] p-4 text-[#a23f38] dark:border-[#633c38] dark:bg-[#2e1e1c] dark:text-[#f0a29a]">
      <div class="flex gap-3"><span class="mt-0.5 h-5 w-5 shrink-0">${icons.alert}</span><div><p class="text-sm font-semibold">We couldn't load this template.</p><p class="mt-1 text-xs leading-5 opacity-80">${state.loadError}</p></div></div>
    </div>
  `;
  elements.formActions.innerHTML = '<button type="button" data-action="retry" class="rounded-xl bg-moss-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-moss-700">Try again</button>';
}

function currentInputs(): UserInput {
  return state.inputs[state.template.id] ?? {};
}

function completedRequiredCount(): { complete: number; total: number } {
  if (!state.loaded) return { complete: 0, total: 0 };
  const required = Object.entries(state.loaded.schema).filter(([, field]) => field.required);
  return {
    complete: required.filter(([key]) => currentInputs()[key]?.trim()).length,
    total: required.length,
  };
}

function updateCompletion(): void {
  const { complete, total } = completedRequiredCount();
  const percentage = total ? Math.round((complete / total) * 100) : 100;
  elements.completionLabel.textContent = `${percentage}% ready`;
  elements.completionDot.className = `h-1.5 w-1.5 rounded-full ${percentage === 100 ? 'bg-moss-500' : 'bg-[#aab4ac]'}`;
}

function createField(key: string, field: Placeholder): HTMLElement {
  const wrapper = document.createElement('div');
  const id = `field-${key}`;
  const error = state.errors[key];
  wrapper.className = 'field-group fade-in';
  wrapper.dataset.fieldWrapper = key;

  const label = document.createElement('label');
  label.htmlFor = id;
  label.className = 'mb-2 flex items-center gap-2 text-[13px] font-semibold';
  label.innerHTML = `${field.label}${field.required ? '<span class="text-[#d9544d]" aria-label="required">*</span>' : '<span class="rounded bg-[#eef1ed] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#8a948c] dark:bg-[#28312b] dark:text-[#929f96]">Optional</span>'}`;

  if (field.description) {
    const help = document.createElement('p');
    help.id = `${id}-help`;
    help.className = 'mb-2 text-[11px] leading-4 text-[#879188] dark:text-[#8c998f]';
    help.textContent = field.description;
    wrapper.append(label, help);
  } else {
    wrapper.append(label);
  }

  const input = document.createElement(field.type === 'textarea' ? 'textarea' : 'input');
  input.id = id;
  input.setAttribute('name', key);
  input.setAttribute('dir', 'auto');
  input.setAttribute('aria-invalid', String(Boolean(error)));
  input.setAttribute('aria-describedby', `${id}-help ${id}-error`);
  input.className = `field px-3.5 ${field.type === 'textarea' ? 'py-3' : 'h-11 py-0'}`;
  input.setAttribute('placeholder', field.placeholder ?? '');
  input.value = currentInputs()[key] ?? '';
  wrapper.append(input);

  const errorElement = document.createElement('p');
  errorElement.id = `${id}-error`;
  errorElement.dataset.errorFor = key;
  errorElement.className = `mt-1.5 text-[11px] font-medium text-[#c94640] ${error ? '' : 'hidden'}`;
  errorElement.textContent = error ?? '';
  wrapper.append(errorElement);

  return wrapper;
}

function renderForm(): void {
  if (state.loading) return renderLoadingForm();
  if (!state.loaded || state.loadError) return renderLoadError();

  elements.formTitle.textContent = state.template.title;
  elements.completionBadge.classList.remove('hidden');
  elements.completionBadge.classList.add('flex');
  elements.formContent.replaceChildren();

  Object.entries(state.loaded.schema).forEach(([key, field]) => {
    elements.formContent.append(createField(key, field));
  });

  const languageBlock = document.createElement('div');
  languageBlock.className = 'fade-in border-t border-[#e9ece7] pt-5 dark:border-[#303a33]';
  languageBlock.innerHTML = `
    <label for="language" class="mb-2 flex items-center gap-2 text-[13px] font-semibold">
      Response language
      <span class="rounded bg-[#eaf4ed] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-moss-700 dark:bg-[#263c2e] dark:text-[#8bc8a3]">Appended</span>
    </label>
    <p class="mb-2 text-[11px] leading-4 text-[#879188] dark:text-[#8c998f]">Every generated prompt ends with this language instruction.</p>
    <select id="language" class="field h-11 cursor-pointer px-3.5 py-0"></select>
  `;
  const select = languageBlock.querySelector<HTMLSelectElement>('select')!;
  languages.forEach((language) => {
    const option = document.createElement('option');
    option.value = language;
    option.textContent = language;
    option.selected = state.language === language;
    select.append(option);
  });
  elements.formContent.append(languageBlock);

  elements.formActions.innerHTML = `
    <div class="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
      <button type="button" data-action="reset" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold text-[#778279] transition hover:bg-[#eef2ed] hover:text-[#4c5850] dark:text-[#929f96] dark:hover:bg-[#242e27] dark:hover:text-[#c7d2ca]">
        <span class="h-4 w-4">${icons.reset}</span> Reset fields
      </button>
      <button type="submit" class="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-moss-600 px-5 text-sm font-semibold text-white shadow-lg shadow-moss-600/15 transition hover:-translate-y-0.5 hover:bg-moss-700 hover:shadow-xl hover:shadow-moss-600/20 active:translate-y-0">
        Generate prompt
        <span class="h-4 w-4 transition-transform group-hover:translate-x-0.5">${icons.arrow}</span>
      </button>
    </div>
  `;
  updateCompletion();
}

function renderPreview(): void {
  elements.preview.replaceChildren();
  elements.copyButton.disabled = !state.output;

  if (!state.output) {
    const empty = document.createElement('div');
    empty.className = 'flex min-h-[360px] flex-col items-center justify-center px-8 py-12 text-center xl:min-h-[calc(100vh-204px)]';
    empty.innerHTML = `
      <span class="relative mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-[#dfe6df] bg-white text-moss-600 shadow-card dark:border-[#354039] dark:bg-[#1b231e] dark:text-[#76c395]">
        <span class="h-7 w-7">${icons.sparkles}</span>
        <span class="absolute -right-1.5 -top-1.5 h-4 w-4 rounded-full border-2 border-[#fbfcf8] bg-[#efbd64] dark:border-[#111713]"></span>
      </span>
      <p class="text-sm font-bold">Your prompt will appear here</p>
      <p class="mt-2 max-w-[240px] text-xs leading-5 text-[#89938b] dark:text-[#8d9a91]">Fill in the required details, then generate a polished prompt ready to use.</p>
      <div class="mt-6 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#abb3ad] dark:text-[#68756c]"><span class="h-px w-8 bg-current"></span> Preview <span class="h-px w-8 bg-current"></span></div>
    `;
    elements.preview.append(empty);
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'fade-in p-5 sm:p-6';
  const meta = document.createElement('div');
  meta.className = 'mb-4 flex items-center justify-between gap-3';
  meta.innerHTML = `<span class="rounded-full border border-[#dce7de] bg-white/80 px-2.5 py-1 text-[10px] font-semibold text-moss-700 dark:border-[#35523f] dark:bg-[#1c2c22] dark:text-[#80c69c]">Ready to use</span><span class="text-[10px] font-medium text-[#949d96]">${state.output.length.toLocaleString()} characters</span>`;
  const pre = document.createElement('pre');
  pre.className = 'whitespace-pre-wrap break-words font-mono text-[12px] leading-[1.8] text-[#344039] dark:text-[#cbd6ce]';
  pre.dir = rtlLanguages.has(state.language) ? 'rtl' : 'auto';
  pre.textContent = state.output;
  wrapper.append(meta, pre);
  elements.preview.append(wrapper);
}

function renderTheme(): void {
  document.documentElement.classList.toggle('dark', state.theme === 'dark');
  elements.themeToggle.innerHTML = `<span class="h-[18px] w-[18px]">${state.theme === 'dark' ? icons.sun : icons.moon}</span>`;
  elements.themeToggle.setAttribute('aria-label', `Switch to ${state.theme === 'dark' ? 'light' : 'dark'} mode`);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', state.theme === 'dark' ? '#101512' : '#f7f8f4');
}

function showToast(message: string, kind: 'success' | 'error' = 'success'): void {
  const toast = document.createElement('div');
  toast.className = `toast-enter pointer-events-auto absolute bottom-0 left-1/2 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-semibold shadow-xl ${
    kind === 'success'
      ? 'border-[#cee4d5] bg-[#f5fbf7] text-moss-700 dark:border-[#375843] dark:bg-[#1b2d21] dark:text-[#8bd0a5]'
      : 'border-[#efcfcc] bg-[#fff7f6] text-[#a23f38] dark:border-[#633c38] dark:bg-[#2e1e1c] dark:text-[#f0a29a]'
  }`;
  toast.innerHTML = `<span class="h-4 w-4">${kind === 'success' ? icons.check : icons.alert}</span><span></span>`;
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

async function selectTemplate(template: Template): Promise<void> {
  state.template = template;
  state.loaded = null;
  state.loading = true;
  state.loadError = '';
  state.errors = {};
  state.output = '';
  persist();
  renderAll();

  try {
    state.loaded = await loadTemplate(template);
  } catch (error) {
    state.loadError = error instanceof Error ? error.message : 'An unknown error occurred.';
  } finally {
    state.loading = false;
    renderForm();
  }
}

function selectCategory(category: Category): void {
  if (category.id === state.category.id) return;
  state.category = category;
  state.query = '';
  elements.searchDesktop.value = '';
  elements.searchMobile.value = '';
  void selectTemplate(category.templates[0]);
}

function setSearch(value: string, source: HTMLInputElement): void {
  state.query = value;
  const counterpart = source === elements.searchDesktop ? elements.searchMobile : elements.searchDesktop;
  counterpart.value = value;
  renderTemplates();
}

elements.categoryList.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-category-id]');
  const category = categories.find((item) => item.id === button?.dataset.categoryId);
  if (category) selectCategory(category);
});

elements.templateList.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-template-id]');
  const template = state.category.templates.find((item) => item.id === button?.dataset.templateId);
  if (template && template.id !== state.template.id) void selectTemplate(template);
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
    error?.classList.add('hidden');
  }
  updateCompletion();
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
    const firstInvalid = elements.formContent.querySelector<HTMLElement>('[aria-invalid="true"]');
    firstInvalid?.focus();
    showToast('Please complete the required fields.', 'error');
    return;
  }

  state.output = result.prompt;
  renderPreview();
  showToast('Prompt generated successfully.');
  if (window.innerWidth < 1280) {
    elements.preview.closest('section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

elements.form.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-action]');
  if (!button) return;

  if (button.dataset.action === 'retry') {
    void selectTemplate(state.template);
  }

  if (button.dataset.action === 'reset') {
    state.inputs[state.template.id] = {};
    state.errors = {};
    state.output = '';
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

elements.searchDesktop.addEventListener('input', () => setSearch(elements.searchDesktop.value, elements.searchDesktop));
elements.searchMobile.addEventListener('input', () => setSearch(elements.searchMobile.value, elements.searchMobile));

document.addEventListener('keydown', (event) => {
  if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement).tagName)) {
    event.preventDefault();
    (window.innerWidth >= 768 ? elements.searchDesktop : elements.searchMobile).focus();
  }
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    elements.form.requestSubmit();
  }
});

renderAll();
void selectTemplate(state.template);
