# Prompt Studio: product overview

Status: **VERIFIED current implementation**, except explicitly labeled inferences and unknowns. Last verified: **2026-10-05**.

## Purpose and scope

Prompt Studio turns a user's context into a structured prompt for another AI tool. Curated templates provide the role, workflow, constraints, and expected output; a guided form collects the missing details. The application constructs text locally and lets the user copy it.

The original business intent and product maturity are **UNKNOWN**. The observed purpose is supported by `src/main.ts`, `src/data/catalog.ts`, and `public/prompts/`. The product addresses incomplete, repetitive prompt writing rather than executing AI tasks itself.

Target users are developers, people reflecting on relationships or decisions, home planners, film/series viewers, people organizing shared expenses or exploring ideas, students and researchers, and maintainers writing templates. These personas are **INFERRED** from the catalog; no user research, commercial plan, or success metrics are recorded.

The core value is reusable, provider-neutral prompt construction with explicit context and output instructions. The primary journey is category/template selection → guided answers → response-language selection → generation → preview/copy → user-controlled use in an external AI tool. See [the user guide](02-user-guide.md) for instructions.

## Current catalog

**Six categories, 22 templates.** `src/data/catalog.ts` is authoritative. For every ID below, the source assets are `public/prompts/<category>/<id>.md` and the adjacent `.json`.

| Category | Template ID | Purpose |
| --- | --- | --- |
| General | `split-expenses` | Request exact shared-expense balances and a minimum-transfer settlement, with verification of optimality. |
| General | `idea-discovery` | Explore a broad topic through tailored questions and develop practical ideas. |
| Coding | `debug` | Investigate an issue and request a focused repair. |
| Coding | `add-feature` | Plan and implement an existing-project feature. |
| Coding | `generate-tests` | Request behavior-focused tests. |
| Coding | `refactor` | Audit and improve an existing repository. |
| Coding | `generate-docs` | Document an existing system from evidence. |
| Academic | `research-idea` | Narrow a broad research topic into feasible questions and a proposal outline. |
| Academic | `study-plan` | Build a realistic study schedule from goals, starting level, and available time. |
| Academic | `literature-review` | Plan a review or synthesize available sources without invented evidence. |
| Psychology | `personality-relationship` | Reflect on personality patterns, relationship readiness, and provisional fit. |
| Psychology | `personal-boundaries` | Identify needs and formulate practical, respectful boundaries. |
| Psychology | `thought-reframe` | Examine an unhelpful thought with balance. |
| Psychology | `decision-clarity` | Compare options against priorities and constraints. |
| Psychology | `habit-builder` | Create a sustainable habit and recovery plan. |
| Psychology | `difficult-conversation` | Prepare respectful conversation and exit language. |
| Decoration | `room-makeover` | Plan a room redesign within constraints. |
| Decoration | `color-palette` | Develop a palette and sampling plan. |
| Decoration | `small-space` | Optimize compact layout and storage. |
| Decoration | `lighting-plan` | Plan layered lighting and verification steps. |
| Cinema | `movie-recommender` | Match films to favorites and compare meaningful differences. |
| Cinema | `series-recommender` | Match series to taste, format, and viewing commitment. |

These are prompt capabilities: settlement calculations, adaptive interviews, research, and relationship assessments happen only when the user executes the generated instructions elsewhere. They are not built-in calculators, AI conversations, or validated assessments.

## Reconstructed requirements and priorities

Priorities are **INFERRED** from the primary journey, not historical product commitments.

| Priority | Functional requirement | Evidence |
| --- | --- | --- |
| Core | Display registered categories/templates and load the selected Markdown/schema pair. | Catalog; `src/utils/loader.ts`; UI renderers. |
| Core | Reject unmatched placeholder/schema keys and render labeled fields from valid schemas. | `src/utils/parser.ts`; `createField()` in `src/main.ts`. |
| Core | Reject blank required fields; construct plain text from supplied values and optional-line rules. | `src/utils/generator.ts`. |
| Core | Append the selected response-language instruction and preview/copy output. | Generator; `renderPreview()` and copy handler. |
| Supporting | Search the active category, show loading/errors, retry asset failures, and reset fields. | `src/main.ts`. |
| Supporting | Restore selections, theme, language, and per-template inputs in the same browser. | `StoredState`; persistence handlers. |
| Supporting | Support responsive layout, dark mode, keyboard shortcuts, and Persian/Arabic preview direction. | `src/main.ts`, `src/style.css`, `index.html`. |

MVP/core functionality is the select → answer → generate → copy path. No explicitly approved roadmap or future functionality is present.

## Significant feature reference

All runtime features serve the end user and require no account or application role. Clipboard access additionally depends on browser policy. Source paths below identify the implementation, not a backend service.

| Feature / purpose | Trigger and preconditions | Inputs → main flow → outputs | Alternative/failure behavior | Dependencies, permissions, source |
| --- | --- | --- | --- | --- |
| Selection: choose a workflow | Startup or navigation click; compiled catalog exists | IDs → select entry and load assets → active navigation/form | Same selection is ignored; asset errors have retry | Catalog and loader; no permission; `src/main.ts`, `src/data/catalog.ts` |
| Search: narrow choices | Search input or `/`; active category | Query → case-insensitive title/description/tag filtering → compact template list | Empty query lists category; no match shows empty state | No service/permission; `filteredTemplates()` |
| Asset loading: retrieve instructions and form | Selected template; paths registered | Asset URLs → concurrent GETs and key validation → cached content/schema | HTTP/JSON/key mismatch → visible error; manual retry | Same-origin host; no auth; `src/utils/loader.ts`, `src/utils/parser.ts` |
| Form: collect context | Successful load | Schema and saved values → required text/textarea controls and collapsible optional context → field values | Loading placeholder, retry state, inline errors | DOM; no permission; `createField()`, `renderForm()` |
| Generation: construct a prompt | Submit or Ctrl/Cmd+Enter; loaded assets | Values/language → validation and substitution → plain text | Missing required values focus first invalid field; no new prompt | Local generator; no remote permission; `src/utils/generator.ts`, submit handler |
| Language/preview: prepare usable output | Language change or successful generation | Language/output → instruction and direction → plain-text preview | Language or input changes clear output; empty preview disables Copy | No remote dependency; `renderPreview()`, generator |
| Copy: transfer text | Copy click; output exists | Output → Clipboard API → clipboard/toast | Legacy copy fallback; failure asks for manual selection | Browser clipboard policy; copy handler |
| Resume/reset: retain or clear form work | Input/selection changes, reload, Reset | Stored selections/values ↔ runtime state; Reset clears active values | Corrupt JSON ignored; storage/shape failures not fully handled | Browser localStorage; `readStoredState()`, `persist()`, reset handler |
| Appearance/feedback: usable layout | Theme click, viewport, action result | Preference/action → neutral light/dark themes, toasts, responsive layout | Mobile template list collapses into a selector | Bundled CSS and system fonts; `src/main.ts`, `src/style.css`, `index.html` |

## Non-functional characteristics

| Area | Observed behavior | Limits / unknown targets |
| --- | --- | --- |
| Performance | Lazy template loading and page-session cache; synchronous generation. | No benchmark, bundle budget, or latency SLA. |
| Security/privacy | Local construction; generated user content rendered as text. | Retained inputs require the boundaries described in [architecture](03-architecture.md#security). |
| Availability/reliability | Static build, visible load errors, manual retry. | No offline mode, automatic retry, availability SLA, or verified production host. |
| Scalability | No application server or shared state; static assets can be served independently. | No capacity/load test; catalog/UI size grows with entries. |
| Maintainability | Strict TypeScript and separate catalog/parser/loader/generator modules. | UI/state responsibilities concentrated in one module; no CI/test framework. |
| Accessibility | Labels, focus styling, live toast region, invalid-field state, reduced motion. | Conformance and assistive-technology behavior **NOT VERIFIED**. |
| Observability | Visible errors/toasts and browser debugging. | No telemetry, metrics, analytics, or app logging pipeline. |

## Constraints and exclusions

- Static browser execution, supported DOM APIs, and root-origin asset hosting are current technical constraints; implementation details live in [architecture](03-architecture.md).
- Only repository-maintained templates are exposed. End-user template editing, import/export, or a content-management interface is absent.
- No AI API, AI answers, accounts, collaboration, cross-device synchronization, billing, database, or backend exists.
- Input validation checks presence, not correctness of expenses, research facts, or personal descriptions.
- Interface translation and certified accessibility/browser support are not implemented product commitments.
- Psychology outputs are reflective prompts; research and settlement outputs depend on the downstream AI's actual capabilities and verification.

**INFERRED:** Static hosting and trusted repository maintainers are the intended operating model. **UNKNOWN:** Product owner, production audience, content-review policy, deployment provider, service levels, original design rationale, and supported browser matrix. These unknowns are recorded in [decisions](05-decisions.md#open-questions).

## Glossary

| Term | Meaning |
| --- | --- |
| Category / collection | A catalog grouping of templates. |
| Template | Display metadata plus a Markdown prompt and JSON field schema. |
| Prompt asset | Plain text with Markdown formatting and replacement tokens; not rendered Markdown. |
| Schema | Map from placeholder keys to field metadata. |
| Placeholder | A `{{key}}` token replaced during generation. |
| Required / optional | Must be nonblank / may be omitted with its source line. |
| Readiness | Percentage of required fields containing non-whitespace text. |
| Response language / RTL | Downstream language instruction / right-to-left preview direction. |
| Stored state | Selections, preferences, and per-template values retained in the browser. |
| Runtime cache | Loaded template pairs retained for the current page lifetime. |
| Adaptive interview | Instructions for the downstream AI to choose follow-up questions from the topic and answers. |
| Net balance / settlement | Amount to receive or pay after fair-share allocation / transfers that bring balances to zero. |
| Proven minimum | A settlement count supported by exact search or a matching proven lower bound. |
| Literature gap | An unanswered research area; remains unverified without suitable source evidence. |
| Vite / ADR | Build/dev tool / architectural decision record. |
