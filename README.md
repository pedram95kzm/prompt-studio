# Prompt Studio

Prompt Studio is a guided prompt builder for creating detailed, reusable AI prompts. Pick a template, answer a focused set of questions, choose a response language, and copy the finished prompt into any AI tool.

The application runs entirely in the browser. It does not call an AI API, require an account, or send form values to an application backend.

## Highlights

- Curated templates for software engineering, everyday tasks, academic work, structured reflection, interior design, and cinema recommendations
- Shared-expense settlement prompts that require verification of the minimum transfer count
- Idea discovery and personality/relationship exploration with context-appropriate follow-up questions
- High-quality instructions with explicit roles, guardrails, workflows, and output contracts
- Dynamic forms generated from adjacent JSON schemas
- Minimal layout with compact template navigation and collapsible optional context
- Required-field validation and automatic removal of unused optional lines
- English, Persian, Arabic, Spanish, French, and German response instructions
- RTL-aware output for Persian and Arabic
- Template search, dark mode, keyboard shortcuts, clipboard copy, and responsive layouts
- Browser-local persistence for selections, theme, language, and per-template inputs

## Quick start

Requirements:

- Node.js 20.19+ or 22.12+
- npm

```bash
npm install
npm run dev
```

Open the URL printed by Vite, usually <http://localhost:5173>.

## How it works

1. `src/data/catalog.ts` registers every category and template.
2. The browser loads a template’s Markdown and adjacent JSON schema from `public/prompts/`.
3. `src/utils/loader.ts` verifies that schema keys match the template placeholders.
4. `src/main.ts` renders the form and stores inputs in `localStorage`.
5. `src/utils/generator.ts` validates required values, replaces placeholders, removes empty optional lines, and appends the response-language instruction.
6. The generated text is previewed as plain text and can be copied to the clipboard.

Prompt Studio performs deterministic text generation only. The resulting prompt is intended to be pasted into a separate AI product.

## Template catalog

The catalog is maintained in `src/data/catalog.ts` and displayed in the app. It contains 22 templates in six collections:

- **General:** shared-expense settlement and topic-driven idea discovery.
- **Coding:** debugging, features, tests, refactoring, and documentation.
- **Academic:** research ideas, study plans, and literature reviews.
- **Psychology:** personality/relationship reflection, personal boundaries, thoughts, decisions, habits, and conversations.
- **Decoration:** rooms, palettes, small spaces, and lighting.
- **Cinema:** separate movie and series recommenders.

Adaptive questions and expense calculations are instructions for the external AI tool where the user runs the prompt. Prompt Studio collects the starting context and constructs text locally; it does not itself conduct an interview or compute a settlement.

The psychology templates provide general reflection and communication exercises. They are not a substitute for diagnosis, treatment, crisis support, or professional care.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run typecheck` | Run strict TypeScript checks |
| `npm run build` | Type-check and create the production bundle in `dist/` |
| `npm run preview` | Serve the production bundle locally |

There is currently no configured test runner, linter, or formatter.

## Project structure

```text
public/
  prompts/
    <category>/      Markdown templates and JSON schemas
src/
  data/catalog.ts    Category and template registry
  types/index.ts     Shared TypeScript contracts
  utils/generator.ts Validation and prompt construction
  utils/loader.ts    Asset loading, schema checks, and caching
  utils/parser.ts    Placeholder extraction and key comparison
  main.ts            UI, state, rendering, and event handling
  style.css          Bundled responsive styles and light/dark themes
docs/                 Product and engineering documentation
index.html            Application shell and module entry
```

## Template format

Each prompt is a Markdown file containing double-brace placeholders:

```text
## Issue

{{problem}}

Additional context: {{additional_context}}
```

Each placeholder must have a matching key in the adjacent JSON schema. The reserved `language` placeholder is the only exception.

Optional placeholders should normally remain on their own line. When an optional value is empty, Prompt Studio removes the entire source line containing that placeholder.

## Schema format

```json
{
  "problem": {
    "required": true,
    "label": "Problem",
    "type": "textarea",
    "description": "Describe what is going wrong and when it happens.",
    "placeholder": "The save button stops responding after…"
  },
  "additional_context": {
    "required": false,
    "label": "Additional context",
    "type": "textarea"
  }
}
```

Supported field types are `text` and `textarea`. Required fields appear first; optional fields are grouped under **More context**. Schema property order is preserved within each group.

## Add or edit a template

1. Add or update `public/prompts/<category>/<template-id>.md`.
2. Add or update the same-name `.json` schema.
3. Ensure every non-`language` placeholder has exactly one schema entry and every schema entry appears in the Markdown.
4. Register new templates in `src/data/catalog.ts`.
5. Run:

```bash
npm run typecheck
npm run build
```

Strong templates in this project should:

- define the expert role and desired outcome;
- distinguish required inputs from optional context;
- ask focused questions when useful, and for interview workflows explicitly adapt questions to the topic and previous answers, wait for replies, and avoid endless questioning;
- include domain-specific safety and accuracy guardrails;
- define a practical method without requesting hidden reasoning;
- specify the expected deliverable or response structure;
- prohibit fabricated facts, verification results, prices, or certainty.

## Production build

```bash
npm ci
npm run build
```

Deploy the generated `dist/` directory to a static host at the origin root. The current catalog uses root-absolute `/prompts/...` asset paths. HTTPS is recommended for transport integrity and clipboard behavior.

## Privacy and storage

Prompt content is generated locally, but entered values are automatically stored unencrypted in browser `localStorage` under `prompt-studio-state-v1`. Reset clears only the active template. Avoid entering sensitive information on a shared browser or device.

Styles are bundled with the app, and typography uses system fonts. No third-party styling or font requests are made at runtime.

## Documentation

Start with [the documentation index](docs/README.md). Important references include:

- [Overview, requirements, and catalog](docs/01-overview.md)
- [User guide](docs/02-user-guide.md)
- [Architecture, technical design, and security](docs/03-architecture.md)
- [Development, testing, and deployment](docs/04-development.md)
- [Decisions, risks, and AI constraints](docs/05-decisions.md)

## License

This project is available under the [MIT License](LICENSE).
