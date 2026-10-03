# Prompt Studio documentation

Status: **COMPLETE current-state documentation**. Last verified: **2026-10-03**.

This knowledge base contains exactly five documents plus this index. Source code takes precedence over configuration, actual validation results, and prose when they conflict. `VERIFIED`, `INFERRED`, `UNKNOWN`, `NOT VERIFIED`, and `NOT APPLICABLE` distinguish observed behavior from missing evidence.

| Document | Purpose | Audience | Status |
| --- | --- | --- | --- |
| [01-overview.md](01-overview.md) | Product purpose, requirements/PRD, feature reference, catalog, glossary | Everyone | Complete |
| [02-user-guide.md](02-user-guide.md) | End-user workflows, preferences, errors, limitations, FAQ | Users / product | Complete |
| [03-architecture.md](03-architecture.md) | Architecture, technical design, persistence, API applicability, security, integrations, data flow | Developers / AI | Complete |
| [04-development.md](04-development.md) | Setup, contribution, validation, deployment, operations, troubleshooting, configuration | Developers / operations / AI | Complete |
| [05-decisions.md](05-decisions.md) | Inline ADRs, open questions, risks, AI constraints | Developers / architects / AI | Complete |

Start with overview/user guide for product use, or architecture/development/decisions for engineering continuation.

## Applicability

| Topic | Status and location |
| --- | --- |
| Database schema, migrations, seeds | **NOT APPLICABLE**: no database. Browser-state design is in architecture. |
| Application API / OpenAPI | **NOT APPLICABLE**: fetch retrieves static assets only; architecture explains the boundary. |
| Authentication, server jobs, queues | **NOT APPLICABLE**: no backend runtime. |
| Docker and CI/CD | **NOT APPLICABLE to current repository**: no corresponding configuration; development records the absence. |
| Static deployment | Applicable; artifact/build verified. Real provider and release process **UNKNOWN**. |
| Runtime security and operations | Browser/resource trust is applicable; no app monitoring or backup service is configured. |

No separate API, database, security, testing, operations, glossary, AI-context, or ADR files are retained.

## Audit and consolidation

The audit inspected source modules, configuration/dependency manifests, runtime assets, entry points, existing documents, and production build. Legacy index/root links used nonexistent filenames and related product/technical material overlapped. Useful content and three separate ADRs were merged into their owning documents; superseded files were removed under the requested fixed format. Links now target this set.

Documentation describes the final six-category, 22-template catalog and distinguishes prompt instructions from executable app behavior. Unknown production details remain unknown. Validation evidence/limits live in [development](04-development.md#testing-and-validation); risks/decisions in [decisions](05-decisions.md).

**DOCUMENTATION STATUS: COMPLETE**
