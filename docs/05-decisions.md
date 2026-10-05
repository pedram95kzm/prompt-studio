# Decisions, unknowns, risks, and AI constraints

Status: **Observed decisions and current constraints**. Last verified: **2026-10-05**.

## Architecture decisions

Inherited entries describe choices visible in code, not historical approval. Approvers/dates and evaluated alternatives are **UNKNOWN** unless stated. Technical-fit explanations are inferences rather than invented history.

### ADR-001: Static browser application

- **Context:** Forms/templates produce portable text; Vite browser entry, no server.
- **Problem:** Locate execution and persistence boundaries.
- **Decision:** Run in the browser, deploy static files, omit database/API/auth/backend.
- **Alternatives:** Historically considered alternatives **UNKNOWN**.
- **Reasoning:** Historical rationale unknown. **INFERRED:** Deterministic substitution needs no shared compute.
- **Consequences:** Static hosting suffices; no AI execution, accounts, shared history, or server controls. Browser/resource/host boundaries matter.
- **Evidence/status:** `src/main.ts`, `package.json`, repository structure; **active**.

### ADR-002: Vanilla TypeScript and direct DOM

- **Context/problem:** Implement the guided UI and state without an installed framework.
- **Decision:** Direct DOM creation, explicit renderers, one mutable state object.
- **Alternatives:** Historically considered frameworks **UNKNOWN**.
- **Reasoning:** Historical rationale unknown.
- **Consequences:** Small dependency surface; UI/state/events concentrated in `main.ts`.
- **Evidence/status:** `src/main.ts`, `package.json`; **active**.

### ADR-003: File-backed templates and compiled registry

- **Context/problem:** Distinct workflows need wording/metadata while sharing one renderer.
- **Decision:** Adjacent Markdown/JSON, explicit typed catalog, double-brace tokens, schema/token parity. Catalog/languages are compiled configuration.
- **Alternatives:** Historical alternatives **UNKNOWN**; combined formats/remote management are not documented past choices.
- **Reasoning:** Historical rationale unknown. **INFERRED:** This separates prompt wording from field metadata.
- **Consequences:** Two assets plus registration; runtime load failures; no auto-discovery; incomplete shape validation.
- **Evidence/status:** `public/prompts/`, catalog, parser, loader; **active**.

### ADR-004: Whole-line optional removal

- **Context/problem:** Avoid empty optional labels.
- **Decision:** Remove the full source line containing an empty optional token.
- **Alternatives:** Historical alternatives **UNKNOWN**.
- **Reasoning:** Historical rationale unknown.
- **Consequences:** Authoring convention is simple but mixed lines can lose unrelated/required content; preserve compatibility.
- **Evidence/status:** `src/utils/generator.ts`; **active**.

### ADR-005: Global language instruction

- **Context/problem:** Consistent response-language guidance across templates.
- **Decision:** Always append the language sentence; separately configure Persian/Arabic preview RTL.
- **Alternatives:** Historical alternatives **UNKNOWN**.
- **Reasoning:** Historical rationale unknown.
- **Consequences:** Universal suffix; language choice is not interface translation. New RTL options need coordinated list/set edits.
- **Evidence/status:** `src/main.ts`, generator; **active**.

### ADR-006: Browser-local persistence

- **Context/problem:** Retain answers/preferences without accounts/server storage.
- **Decision:** Store selections, language, theme, all per-template inputs under the existing versioned localStorage key; keep output/search/errors/cache transient.
- **Alternatives:** Historical alternatives **UNKNOWN**.
- **Reasoning:** Historical rationale unknown. **INFERRED:** Origin-local storage fits client-only execution.
- **Consequences:** Resume within one browser, clear-text retention, synchronous writes, no migrations/sync/global-delete UI.
- **Evidence/status:** `StoredState`, `readStoredState()`, `persist()`; **active**.

### ADR-007: Lazy loading and ID cache

- **Context/problem:** Avoid startup-wide and repeat asset fetches.
- **Decision:** Fetch each pair concurrently on selection, cache successful loads by ID for the page lifetime.
- **Alternatives:** Historical alternatives **UNKNOWN**.
- **Reasoning:** Historical rationale unknown.
- **Consequences:** IDs must be globally unique; no refresh policy, cancellation, or in-flight deduplication.
- **Evidence/status:** `src/utils/loader.ts`; **active**.

### ADR-008: Bundled styling and system fonts

- **Context/problem:** The minimal interface needs consistent layout, controls, and typography.
- **Decision:** Bundle native CSS through Vite and use system fonts. Remove the Tailwind browser script and Google Fonts import.
- **Alternatives:** The previous interface used runtime Tailwind and Google Fonts resources.
- **Reasoning:** A smaller visual system can be expressed directly in the app stylesheet.
- **Consequences:** Styling no longer depends on third-party runtime requests; typography varies with the operating system.
- **Evidence/status:** `index.html`, `src/style.css`; **updated 2026-10-05**.

### ADR-009: New workflows remain prompt content

- **Context:** Current request adds General/Academic, settlement, ideas, personality/relationship exploration.
- **Problem:** Support these tasks/adaptive questions in the existing static builder.
- **Decision:** Add seven prompt/schema pairs and category visuals; encode exact-settlement verification and context/answer-appropriate interviews in wording. Additional topics are study plans, literature reviews, and personal boundaries.
- **Alternatives:** An AI chat/calculator would require different runtime behavior; no such architecture change was requested.
- **Reasoning:** User requested classifications/templates within the established external-AI handoff.
- **Consequences:** Forms collect starting answers; subsequent questions, minimum settlement, sources, and assessments depend on downstream execution.
- **Evidence/status:** General/Academic and new Psychology assets; catalog/type/icon/color changes; **implemented 2026-10-03**.

### ADR-010: Consolidated documentation

- **Context/problem:** Legacy documents, AI context, and separate ADRs overlap; index/root links contain nonexistent filenames.
- **Decision:** Exactly five specified documents plus `docs/README.md`; merge content and remove superseded files.
- **Alternatives:** Retaining the old split conflicts with the requested fixed set.
- **Reasoning:** Explicit user-provided format; actual source/configuration remain authoritative.
- **Consequences:** Product/requirements/features/glossary → overview; workflows → user guide; technical/security/integrations/data flow → architecture; setup/tests/deployment/configuration/support → development; decisions/AI context/risks → this document. Root links target the consolidated set.
- **Evidence/status:** `docs/`, root `README.md`; **implemented 2026-10-03**.

### ADR-011: Minimal interface (2026-10-05)

The requested UI simplification replaces colorful collection badges, large template cards, numbered headings, readiness badges, and decorated preview surfaces with text navigation, a compact template list, neutral colors, and a plain preview. Required inputs appear first; optional inputs use **More context**, and mobile template selection uses a disclosure. Input edits clear generated output and disable Copy until regeneration. Template request IDs prevent outdated loads from replacing the selected form. The storage contract and template content remain compatible.

## Open questions

### BLOCKING

**None for building, running, or documenting the current application.** Publishing requires a destination/configuration, but unknown production details do not prevent local use.

### NON-BLOCKING

| Unknown | Why it matters |
| --- | --- |
| Original business narrative, owner, maturity, historical approvers | Avoid inventing intent/commitments. |
| Real host/domain, environments, release/rollback process | Only the static artifact contract is verifiable. |
| Browser matrix and accessibility/performance/availability targets | No conformance/SLA can be asserted. |
| Privacy/retention policy and opt-out/global-delete needs | Code, academic, expense, and personal answers are retained. |
| Content review and downstream AI evaluation | Instructions do not establish compliance or answer quality. |
| Downstream exact-computation tools and source access | Determine whether minimum/literature claims can be verified. |
| Approved roadmap/test framework | Recommendations are not accepted future behavior. |

## Known risks

| Risk | Evidence / effect |
| --- | --- |
| Clear-text retention | Inputs survive restarts, are origin-script-readable, and lack global deletion/export/migration UI. |
| Runtime validation/recovery gaps | Stored/schema objects are cast; quota/blocked writes can throw. |
| Replacement metacharacters | String replacements interpret sequences such as `$&`; user text can change rather than reproduce literally. Later token passes can interpret tokens inserted by earlier fields. |
| Root-path/cache assumptions | Subpath hosting misses assets; duplicate IDs would collide in cache/storage. Current IDs are unique. |
| Limited regression evidence | No maintained suite/CI; one-off checks do not cover all failures, accessibility, or real clipboard policies. |
| Downstream interpretation | Exact optimization can be expensive; research sources may be unavailable; personality/fit conclusions remain provisional. Wording cannot enforce correctness. |

### Potential improvements (not implemented)

Focused parser/generator/catalog checks in CI; literal-safe replacement; structural validation/storage recovery; retention controls; a host trust/header policy; subpath support; content evaluation/accessibility review. These are recommendations rather than current code or commitments.

## Constraints an AI agent must respect

- Read source first: source → configuration → actual checks → documentation. This is a snapshot.
- Preserve the client-only builder boundary unless explicitly asked to change it. External AI instructions are not local app behavior.
- Maintain matching Markdown/JSON pairs, registration, legal keys, supported field types, and globally unique IDs.
- Preserve optional-line semantics and universal language suffix unless intentionally changing the content contract.
- Render user/generated text through text/value APIs. Trusted-content HTML is not permission to accept untrusted metadata.
- Do not casually change storage key/payload, IDs, reset scope, origin-root paths, or cache identity; consider existing browser data.
- Keep category icon/color metadata within its type contract, and coordinate language choices with RTL configuration.
- Distinguish executed checks from assumptions. Do not assume a test/lint/CI framework or production environment.
- Require settlement proof or explicit NOT PROVEN; greedy matching is not a minimum guarantee. Keep academic facts sourced and personal observations tentative.
- Preserve topic/answer-adaptive follow-ups, waiting for replies, and a finite route to useful output.
- Keep exactly five consolidated documents plus index; add ADR/security/testing details to their owning document rather than recreating the old split.
