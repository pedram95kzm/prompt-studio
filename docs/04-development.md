# Development, deployment, and troubleshooting

Status: **VERIFIED repository/tooling**, with deployment unknowns marked. Last verified: **2026-10-05**.

## Start contributing

Prerequisites: npm, a modern browser, and Node.js compatible with the locked Vite engine: **20.19+ on the Node 20 line, or 22.12+**. The engine is recorded in `package-lock.json`. This update was checked with Node **24.15.0** and Windows PowerShell. Installation needs npm-registry access; runtime styling is bundled and uses system fonts.

```bash
npm ci
npm run dev
```

Open the URL Vite prints, usually `http://localhost:5173`. `npm install` is also available for dependency development; `npm ci` uses the committed lockfile unchanged.

| Command | Behavior |
| --- | --- |
| `npm run dev` | Vite development server. |
| `npm run typecheck` | Strict application TypeScript checks, no emit. |
| `npm run build` | The same type check followed by `vite build`; produces `dist/`. |
| `npm run preview` | Serve the existing production artifact locally, normally port 4173. |

No test, lint, format, or audit script is configured. Preview requires a build; it is local verification rather than a production hosting service.

## Repository map and configuration

```text
index.html                  HTML shell, metadata, and module entry
src/
  main.ts                   DOM/state/event orchestrator
  style.css                 Bundled CSS, themes, and responsive layout
  data/catalog.ts           Category/template registration
  types/index.ts            Shared contracts and visual unions
  utils/parser.ts            Token and schema-key checks
  utils/loader.ts            Fetch and page-session cache
  utils/generator.ts         Validation and text construction
public/prompts/<category>/   Markdown/JSON pairs
docs/                       Five documents and README index
package.json                Scripts and dependency declarations
package-lock.json           Locked dependency graph
tsconfig.json               Main TypeScript configuration
tsconfig.app.json           Application type-check configuration
```

`node_modules/`, `dist/`, coverage output, `.DS_Store`, and `*.local` are ignored. No `.env` files/examples, Dockerfiles, infrastructure definitions, CI configuration, or `vite.config.*` exist.

| Configuration owner | Values / effect |
| --- | --- |
| `tsconfig.json` | ES2022, ESNext modules, Bundler resolution, strict/unused/no-fallthrough checks, DOM libraries, no emit. |
| `tsconfig.app.json` | Extends base; excludes `src/**/*.test.ts`, although none exist. |
| `src/data/catalog.ts` | Categories, template metadata/tags, asset URLs. |
| `src/types/index.ts` + `src/data/catalog.ts` | Category metadata, including legacy icon/color unions. Navigation currently uses titles. |
| `src/main.ts` | Languages, separate RTL set, storage key, initial selections, theme behavior. |
| `index.html` + `src/style.css` | Metadata, bundled styles, color variables, and system-font stacks. |
| Static host | Domain, TLS, MIME/caching/compression/security headers; no provider settings are committed. |

General is the first category. Default category/template is General / Split expenses fairly unless valid saved IDs exist. Language defaults to English. Theme uses saved state or OS color preference. Search/output begin empty. There are no application environment variables, credentials, secrets, feature flags, proxies, or mode-specific values. Development/production use the same catalog/resource paths; Vite handles its normal mode differences.

## Development workflow

1. Read [architecture](03-architecture.md) and [AI constraints](05-decisions.md#constraints-an-ai-agent-must-respect), then inspect affected source and prompt/schema assets.
2. Keep prompt wording in assets, registration in the catalog, and text processing in utility modules.
3. Review existing templates before modifying token or optional-line rules.
4. Run build/typecheck as appropriate and a focused browser check of affected flows.
5. Update the owning consolidated document and links; preserve the five-document-plus-index format.

Observed conventions: strict TypeScript, shared interfaces, small exported utilities, direct DOM rendering, single-quoted TypeScript strings, trailing commas, kebab-case IDs, snake_case field keys, and English UI metadata. No formatter/linter enforces these conventions.

### Add or modify a template

1. Choose a globally unique ID and an existing category.
2. Create `public/prompts/<category>/<id>.md` and adjacent `.json`.
3. Follow the [schema/token contract](03-architecture.md#template-and-generation-semantics); use only `text`/`textarea` and place optional tokens on fully removable lines.
4. Register title, description, tags, and `...prompt(category, id)` in `src/data/catalog.ts`. Files are not automatically discovered.
5. Check key parity, required/optional output, runtime fetching, and production asset copying.

Example:

```text
You are a practical assistant.
Task: {{task}}
Additional context: {{context}}
```

```json
{
  "task": { "required": true, "label": "Task", "type": "textarea" },
  "context": { "required": false, "label": "Context", "type": "textarea" }
}
```

Strong prompts define a role, relevant inputs, useful output, uncertainty handling, and a practical method. Adaptive interviews should explicitly wait for answers, adapt questions to context, avoid repetitions, and reach a useful deliverable. Do not imply that instructions are enforced app logic or claim unperformed verification.

### Add a category

Add a nonempty `Category` entry and its assets. Supply valid `Category.icon`/`color` metadata for the type contract; the minimal navigation displays the category title. Check horizontal mobile navigation and the desktop template list. Changing IDs affects saved selections and cache identity and needs an intentional compatibility decision.

## Testing and validation

No committed test framework/files, unit/integration/E2E suite, fixtures, coverage measurements, accessibility automation, or CI testing exists. Available repository checks are type checking and build. No coverage or conformance claim can be made.

### Minimal interface checks (2026-10-05)

| Check | Result / scope |
| --- | --- |
| `npm run build` | **PASS**: strict TypeScript and Vite production build. |
| One-off Playwright check in Chrome against Vite development server | **PASS**: all 22 forms loaded and generated prompts; required errors/focus; optional context; search; shortcuts; reset; Persian/RTL; theme/language/answer persistence; preview clearing after edits; latest-template selection during delayed loads. |
| Native clipboard read-back | **PASS**: copied prompt matched preview text after normalizing Windows CRLF line endings. |
| Responsive and visual checks | **PASS**: no horizontal page overflow at 320, 390, 768, 1024, or 1440 pixels; mobile selector and desktop resize behavior; inspected mobile and desktop light/dark screenshots. |
| Assistive-technology conformance and downstream AI execution | **NOT VERIFIED**. |

The browser profile and temporary Playwright installation were isolated from user storage and repository dependencies. No maintained test suite was added.

### Checks recorded on 2026-10-03

| Check | Result / scope |
| --- | --- |
| `npm run build` | **PASS**: strict TypeScript and Vite production build. |
| One-off content check using the actual parser/generator | **PASS**: six unique categories, 22 globally unique templates, schema key/shape checks, required rejection, minimal/full input generation, no unresolved tokens for supplied fixtures, language suffix, Persian ledger preservation, matching production copies. |
| One-off Chrome headless check against production preview | **PASS**: all 22 forms loaded; required errors; generation; category icons; Persian/RTL; copy handler received exact preview text and reported success; restored language/theme/values; transient output; scoped reset; Persian search; narrow-viewport DOM. Tailwind loaded. |
| Native clipboard read-back | **NOT VERIFIED**: headless Chrome returned empty clipboard text despite the successful write path. Handler/payload checks do not prove OS round-trip behavior. |
| Visual/accessibility audit, AI execution, exact settlement computation, research accuracy, personality validity | **NOT VERIFIED**: these checks did not exercise or establish those properties. |

Temporary checks were not added as a maintained suite/dependency. Fixtures used required-only answers, full optional answers, Unicode/Persian digits, and all expense participants including zero contributors. Browser checks used an isolated profile, not user storage.

### Focused manual smoke check

1. Load changed templates and confirm labels/order and asset requests.
2. Submit blank required fields, then generate with required values and omitted optional values.
3. Review output/suffix and Persian/Arabic direction.
4. Copy into a text editor; refresh and check saved values/theme and transient output.
5. Reset one template and confirm another template's values remain.
6. Check search and narrow/wide layouts in both themes.
7. Separately execute adaptive prompts in an AI tool to evaluate relevant questions, waiting for replies, and useful deliverables; this is content evaluation, not app testing.

Untested critical areas: loader failure/cancellation, malformed stored shapes/quotas, replacement metacharacters, rapid selections, real clipboard policies, keyboard/screen-reader usability, host rewrites, resource outages, downstream prompt compliance. Recommendations live in [decisions](05-decisions.md#potential-improvements-not-implemented).

## Deployment and operations

```bash
npm ci
npm run build
npm run preview
```

`dist/` contains the HTML shell, hashed JavaScript/CSS under `assets/`, and copied `.md`/`.json` files under `prompts/`. Deploy it to a static host at the **origin root**. Root-absolute prompt URLs do not automatically honor a subpath/different Vite base. There are no client routes requiring history fallback.

Preserve filenames/case, serve actual Markdown/JSON with appropriate content types, and avoid rewriting missing prompt assets to HTML. HTTPS supports transport integrity and clipboard behavior. Serve the bundled JavaScript/CSS assets; no external styling or font resources are required.

| Topic | Current state |
| --- | --- |
| Environments | Local dev and production preview supported; deployed dev/staging/prod topology **UNKNOWN**. |
| Hosting/infrastructure | Static output verified; provider, domains, automation, headers/caching/compression **UNKNOWN**. |
| Docker / CI/CD | **NOT APPLICABLE to current repository**: no corresponding configuration. |
| Secrets/environment | No app secrets or variables; hosting credentials are absent. |
| Rollback | Process **UNKNOWN**; chosen-host responsibility. Keeping a prior artifact is an option, not configured behavior. |
| Database migrations | **NOT APPLICABLE**. |
| App jobs/queues/schedules | **NOT APPLICABLE**. |
| Monitoring/logging/metrics/alerts/health endpoints | Not configured; host telemetry **UNKNOWN**. |
| Backup/recovery | No app-managed backup/export/restore. Clearing browser-site data loses answers. Source/assets are recoverable through Git. |
| Maintenance | Update assets/catalog together, rebuild, check representative assets/flows, review dependency changes. No scheduled automation. |

After publishing: load root with an empty cache, request a representative `.md`/`.json`, generate/copy, check persistence/themes, and ensure an invalid asset URL does not return an HTML success page. No deployment was performed in this update.

## Troubleshooting

| Reproducible symptom / cause | Debugging or resolution |
| --- | --- |
| Unsupported Node engine | Match the engine above and retry installation/build. |
| Native Rollup/esbuild install error | Check registry/network/CPU/OS compatibility; do not reuse `node_modules` across platforms. |
| Port in use | Use Vite's printed URL or set a port; `--strictPort` exits rather than moving. |
| TypeScript/build failure | Run `npm run typecheck`; fix reported type/source mismatch before bundler debugging. |
| Template load failure | Inspect Network and visible error; check both paths, status, actual JSON, and key parity; retry after correction. |
| New template absent | Confirm registration and reload/rebuild; assets are not discovered. |
| Unexpected optional-content loss | Empty tokens remove their full lines; separate content that must survive. |
| Subpath prompt 404 | Paths target origin root; host there or intentionally change path handling. |
| JSON URL returns HTML | Correct asset fallback/rewrite and missing path/file. |
| Unstyled page | Check bundled CSS asset requests, host configuration, cache, and console. Fonts are supplied by the system. |
| Invalid stored shape disrupts startup | Inspect/delete only `prompt-studio-state-v1` in browser storage and reload. |
| Quota/blocked storage failure | Check storage restrictions/quota; writes lack recovery handling. |
| Preview clears after editing | Generate again to review and copy the updated prompt. |
| Copy failure | Check secure context/browser policy; manually select text if fallback fails. |

Database/auth troubleshooting is **NOT APPLICABLE**. Debug with browser Network, Application/Storage, DOM, and Accessibility tools; no application log service exists.
