# Spec-Driven Development Setup Script for eLibrary

Use these prompts with Claude Code when rebuilding or refreshing this bootstrap-stage repository. They are tailored to eLibrary, a web and API application for searching public electronic-library ebooks, registering usable libraries, viewing holdings and availability, and continuing to external borrowing flows.

Run the steps in order. Do not replace project-specific decisions with generic empty-repo placeholders.

## Current Repository State

- Authoritative specs exist: `REQUIREMENTS.md`, `DESIGN.md`, `ARCHITECTURE.md`, `SECURITY.md`, and `CLAUDE.md`.
- Issue/template docs exist: `REQUIREMENT_TEMPLATE.md`, `GITHUB_ISSUE_STRIDE_THREAT_MODEL.md`, `AGENTS.md`, and `github-issues/`.
- Logo assets exist: `logo.svg` as the primary vector asset and `assets/logo.png` as the existing raster asset.
- Git is initialized, but the repository is still bootstrap-stage and has no implementation code.
- Implementation MUST NOT begin until every open decision is answered or explicitly deferred through Step 10.

## Script Rules

- Before running any step, read the current owning documents for that step.
- Preserve stronger project-specific requirements, controls, and decisions already present in the repository.
- Do not downgrade SECURITY.md when adapting generic setup prompts.
- If files conflict, security content is owned by SECURITY.md; otherwise the file whose domain owns the content wins.
- Keep unresolved choices visible in the owning file's open-questions section.
- Do not invent framework, hosting, vendor, provider, workflow, or library choices.

## 1. Create or Refresh `REQUIREMENTS.md`

```text
Create or refresh REQUIREMENTS.md for this repository.

This repository is a bootstrap-stage web and API application for eLibrary. Do NOT infer mature behavior from nonexistent implementation. Use only the project context that is known now.

Known project context:
- Project purpose: Help users find ebooks across public electronic libraries, see which libraries hold or can lend a title, register libraries they can use, and continue to the appropriate external borrowing flow.
- Primary users / actors: Guest, Member, Admin, System worker.
- Core workflows: Browse public electronic libraries; search ebooks; discover popular and recent ebooks from the home screen; choose and retain search result display layout; view ebook details, holdings, and availability; register usable libraries; personalize search/detail views by registered libraries; continue to an external borrowing page; administer libraries, integration status, external library API keys from service settings, duplicate ebook metadata, and audit/integration events.
- Business objects / data entities: users, user_preferences, user_libraries, saved_books, recent_searches, libraries, integration_events, ebooks, ebook_aliases / identifier merge keys, holdings, availability_snapshots, loan_attempts, notification_preferences, notifications, push_subscriptions, audit_events, adapter configuration.
- External integrations: public electronic-library websites or APIs; public ISBN/book metadata sources; LibraryAdapter integrations for searchBooks, getBookDetail, getAvailability, and getLoanUrl; email sign-in and Google, Apple, Kakao, and Naver social/OAuth providers; email and Web Push delivery provider selection and credential ownership are deferred.
- Authentication / roles: Guest, Member, Admin, System worker. Member sign-in supports email and Google, Apple, Kakao, and Naver social/OAuth providers. Supported OAuth identities automatically link to existing email accounts only when SECURITY.md account-linking conditions are satisfied.
- Regulatory or privacy constraints: SECURITY.md owns security and privacy controls.

Create these sections:
- "## Required Requirement Inputs"
- "## Functional Requirements"
- "## Non-Functional Requirements"
- "## Open Questions"

In "## Required Requirement Inputs", preserve these input lines and fill them from the known project context above:
- `Project purpose: Help users find ebooks across public electronic libraries, see which libraries hold or can lend a title, register libraries they can use, and continue to the appropriate external borrowing flow.`
- `Primary users / actors: Guest, Member, Admin, System worker`
- `Core workflows: Browse public electronic libraries; search ebooks; discover popular and recent ebooks from the home screen; choose and retain search result display layout; view ebook details, holdings, and availability; register usable libraries; personalize search/detail views by registered libraries; continue to an external borrowing page; administer libraries, integration status, external library API keys from service settings, duplicate ebook metadata, and audit/integration events.`
- `Business objects / data entities: users, user_preferences, user_libraries, saved_books, recent_searches, libraries, integration_events, ebooks, ebook_aliases / identifier merge keys, holdings, availability_snapshots, loan_attempts, notification_preferences, notifications, push_subscriptions, audit_events, adapter configuration.`
- `External integrations: public electronic-library websites or APIs; public ISBN/book metadata sources; LibraryAdapter integrations for searchBooks, getBookDetail, getAvailability, and getLoanUrl; email sign-in and Google, Apple, Kakao, and Naver social/OAuth providers; email and Web Push delivery provider selection and credential ownership are deferred.`
- `Authentication / roles: Guest, Member, Admin, System worker. Member sign-in supports email and Google, Apple, Kakao, and Naver social/OAuth providers. Supported OAuth identities automatically link to existing email accounts only when SECURITY.md account-linking conditions are satisfied.`
- `Regulatory or privacy constraints: SECURITY.md owns security and privacy controls.`

In "## Functional Requirements":
- describe a concise list of functional requirements for eLibrary
- group requirements by capability or workflow
- assign stable IDs such as `FR-1.1`, `FR-1.2`, `FR-2.1`
- use RFC 2119 language where useful: MUST, MUST NOT, SHOULD, MAY
- keep each requirement independently testable
- include actors, user-visible behavior, data handled, and system responses where known
- keep unresolved decisions visible in "## Open Questions" instead of inventing behavior

In "## Non-Functional Requirements":
- include only non-functional requirements that directly constrain observable product behavior
- assign stable IDs such as `NFR-1.1`
- keep acceptance criteria testable

Exclude:
- implementation architecture
- framework choices
- deployment details
- security controls owned by SECURITY.md
- invented project-specific features

Keep it compact, concrete, and optimized for Claude Code context loading.
```

## 2. Create or Refresh `logo.svg` and `DESIGN.md`

```text
Create or refresh logo.svg and DESIGN.md for this repository.

Start by reading REQUIREMENTS.md. Treat it as the source of truth for what the product is, who it serves, and the workflows the design must support.

Known design context:
- Brand personality: trustworthy public-library service with lightweight digital access.
- Primary audience: Guests, Members, and Admins.
- Platform target: responsive web application.
- Light/dark mode: light and dark modes included in MVP; light mode is the baseline.
- Existing brand asset: assets/logo.png. The root logo.svg should be the primary vector asset.
- Current logo concept: open book, library, and connection nodes to suggest search, holdings, and borrowing paths.

Create these sections:
- "## Required Design Inputs"
- "## Brand and Logo"
- "## Color Palette"
- "## Typography"
- "## Layout and Spacing"
- "## Components"
- "## Accessibility"
- "## Screens"
- "## Open Questions"

In "## Required Design Inputs", preserve these input lines and fill them from known context:
- `Brand personality: trustworthy public-library service with lightweight digital access`
- `Primary audience: Guests, Members, and Admins using public ebook search, member library management, and admin operations`
- `Platform targets (web / mobile / both): responsive web application`
- `Light / dark mode: light and dark modes are included in MVP; light mode is the baseline`
- `Existing brand assets: logo.svg and assets/logo.png`

For logo.svg:
- keep it clean and recognizable at favicon and header sizes
- use plain SVG with no external fonts or assets
- avoid copyrighted or trademarked imagery
- use the approved palette from DESIGN.md

For DESIGN.md:
- define named color tokens with hex values and safe usage
- every text/background pair used for body text MUST meet WCAG 2.2 AA contrast
- define typography using system or open-licensed fonts
- define spacing, breakpoints, layout conventions, component conventions, accessibility target, and screen-level visual guidance
- keep unresolved design choices in "## Open Questions"
- do not choose a UI framework

Keep it compact, concrete, and optimized for AI context loading.
```

## 3. Create or Refresh `ARCHITECTURE.md`

```text
Create or refresh ARCHITECTURE.md for this repository.

Start by reading REQUIREMENTS.md, SECURITY.md, and DESIGN.md. Treat REQUIREMENTS.md as the source of truth for behavior. Treat SECURITY.md as the source of truth for security controls and trust-boundary enforcement. Treat DESIGN.md as the source of truth for UI styling and visual design.

Known architecture inputs:
- Requirements source: REQUIREMENTS.md
- Security source: SECURITY.md
- Design source: DESIGN.md
- System purpose: eLibrary helps users search public electronic-library ebooks, view holdings/availability, manage usable libraries, and continue to external borrowing flows.
- Primary use cases: library directory, ebook search, ebook detail and holdings, user library registration, personalized search/detail views, external borrowing redirect, admin integration/catalog operations.
- Target users / actors: Guest, Member, Admin, System worker.
- Runtime environment: web and API application.
- Server framework: NestJS.
- Client framework: React.
- Package manager: pnpm for JavaScript/TypeScript workspace and lockfile management.
- API style and integration model: REST-style API endpoints are used; external library integrations are isolated behind LibraryAdapter methods: searchBooks, getBookDetail, getAvailability, getLoanUrl.
- Authentication boundary: Auth module exists; member sign-in supports email plus Google, Apple, Kakao, and Naver social/OAuth providers; supported OAuth identities are automatically linked to existing email accounts only when SECURITY.md account-linking conditions are satisfied; Admin MFA uses application-managed TOTP compatible with Google Authenticator.
- Data model expectations: users, user_preferences, user_libraries, saved_books, recent_searches, libraries, integration_events, ebooks, ebook_aliases, holdings, availability_snapshots, loan_attempts, notification_preferences, notifications, push_subscriptions, audit_events, adapter configuration.
- Search index implementation: PostgreSQL full-text search for MVP.
- Worker queue implementation: BullMQ through @nestjs/bullmq using a self-managed Valkey or Redis-compatible service for MVP worker queues.
- Metadata source baseline: initial ebook metadata comes from public electronic-library APIs and public ISBN/book metadata sources; exact providers and adapter mappings remain unresolved until first libraries are selected.
- Borrowing model: external redirect/handoff is the baseline; internal API-based borrowing is allowed for approved library APIs; external-library automatic borrowing or account linking is allowed only under SECURITY.md credential-handling controls.
- Notification model: saved-book and availability-change notifications use email, Web Push, and in-app channels; email and Web Push delivery provider selection and credential ownership are deferred.
- External library API key ownership: Admins register and rotate external library API keys from service settings while creating or editing integrated libraries.
- Deployment target: zero-cost MVP/demo deployment on Oracle Cloud Always Free using a single Arm/Ampere VM with Docker Compose, self-managed PostgreSQL, self-managed Valkey or Redis-compatible cache and BullMQ queues, and Caddy or Nginx with Let's Encrypt for HTTPS. This is not production-grade until backup, patching, monitoring, recovery, and capacity risks are explicitly accepted.
- Observability stack: no-cost baseline using container/application logs, health checks, and OCI Always Free Logging, Monitoring, Notifications, and Application Performance Monitoring where available. Paid external observability services are out of scope for the zero-cost deployment.
- Performance and degraded-integration behavior: REQUIREMENTS.md owns NFR-1.
- Security expectations: SECURITY.md owns SR-001 through SR-015, STRIDE review, and trust-boundary enforcement.

Create these sections:
- "## Required Architecture Inputs"
- "## Initial Architecture"
- "## Requirement Traceability"
- "## Dependency Rationale"
- "## Open Architecture Questions"

In "## Initial Architecture":
- capture the modular monolith baseline: Web App, Admin UI, Backend API, Workers, Library Adapters, self-managed PostgreSQL, PostgreSQL full-text Search Index, self-managed Valkey or Redis-compatible cache, BullMQ worker queues
- include module boundaries for Auth, User, Library, Ebook, Holding, Loan, Admin, Integration, and Audit
- include REST-style API surface at a useful bootstrap level
- include data-flow, normalization, provenance, and trust-boundary expectations
- keep unresolved choices visible in "## Open Architecture Questions"
- avoid final framework, hosting, or vendor choices unless already decided

In "## Dependency Rationale":
- do not duplicate supply-chain controls from SECURITY.md
- capture architecture-level dependency preferences only
- reference SECURITY.md for dependency security requirements

Exclude:
- file-by-file inventories
- directory summaries
- generic architecture explanations
- framework boilerplate
- speculative details

Keep it compact, concrete, and optimized for AI context loading.
```

## 4. Create or Refresh `SECURITY.md`

```text
Create or refresh SECURITY.md for this repository.

Start by inspecting REQUIREMENTS.md and ARCHITECTURE.md. Assume this project is eLibrary, a web and API application that integrates with public electronic-library websites or APIs.

Use these authoritative security references as source material, but do not copy them verbatim:
- OWASP Top 10 Proactive Controls: https://owasp.org/www-project-proactive-controls/
- OWASP Cheat Sheet Series: https://cheatsheetseries.owasp.org/
- OWASP API Security Top 10: https://owasp.org/www-project-api-security/
- OWASP REST Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html
- OWASP Authentication and Session Management cheat sheets

Project-specific priorities:
- HTTP boundary security
- authentication and authorization
- object-level authorization for member-owned records
- external redirect safety
- external library adapter safety
- input validation
- metadata provenance and normalization
- secret handling
- logging and auditability
- denial-of-service resistance for search and integration workers
- deployment and CI/CD safety once implementation begins

Resolved retention periods:
- Recent searches: 90 days
- Loan attempts: 1 year
- Integration events: 90 days
- Audit events: 3 years
- In-app notifications and notification delivery records: 90 days

Create these sections:
- "## Scope"
- "## Data Classification"
- "## STRIDE Threat Model"
- "## Security Requirements"
- "## Trust Boundary Enforcement"
- "## Security Verification"
- "## Open Security Questions"

In "## Security Requirements", include compact, project-specific controls for:
- external library credentials: MVP must not collect, store, proxy, log, or reuse them
- authentication and sessions
- authorization, including deny-by-default and object-level checks
- API input and response safety
- web client safety, including CSP, referrer policy, and safe external links
- adapter and external request safety, including SSRF prevention and per-library isolation
- secrets management
- logging and monitoring
- admin security
- data protection, retention, and deletion
- infrastructure and supply chain
- backup, recovery, and incident response
- data integrity and provenance
- auditability and non-repudiation
- abuse and denial-of-service resistance

Selected standards:
- Code quality: OWASP Top 10 Proactive Controls.
- API security: OWASP API Security Top 10 and REST Security Cheat Sheet.
- Backend framework hardening: use official NestJS security guidance plus OWASP web/API defaults.
- Frontend framework hardening: use official React documentation plus OWASP XSS/CSP guidance and treat all external metadata as untrusted.
- Auth: OWASP Authentication and Session Management guidance; Admin MFA uses application-managed TOTP compatible with Google Authenticator plus single-use recovery codes.
- Deployment: Oracle Cloud Infrastructure guidance for Always Free compute, virtual cloud networking, security lists or network security groups, block volume storage, logging, monitoring, notifications, vault where available, plus Docker host hardening and OWASP web/API defaults.

Do not invent selected vendors or final framework choices.
Do not copy source security references verbatim.
Keep it compact and optimized for Claude Code.
```

## 5. Create `REQUIREMENT_TEMPLATE.md`

```text
Create REQUIREMENT_TEMPLATE.md for this repository.

Use this exact compact template:

# Requirement Issue Template

Use this template for every new GitHub issue. Each issue must describe one structured, testable requirement.

## Requirement

As a `<actor>`, I need `<capability>` so that `<outcome>`.

## Owner

- Domain: `<requirements | architecture | security | design | agent-workflow>`
- Owning file: `<REQUIREMENTS.md | ARCHITECTURE.md | SECURITY.md | DESIGN.md | CLAUDE.md>`
- Existing requirement/control/decision ID, if any: `<FR-000 | NFR-000 | SR-000 | ADR-000 | none>`

## Scope

In scope:

- `<item>`

Out of scope:

- `<item>`

## Acceptance Criteria

- Given `<context>`, when `<action>`, then `<observable result>`.

## Verification

- Test or check: `<command, manual check, or deferred until implementation workflow exists>`
- Evidence required: `<what proves this is done>`

## Dependencies

- `<linked issue, document section, external dependency, or none>`
```

## 6. Create or Refresh `CLAUDE.md` and `AGENTS.md`

```text
Create or refresh CLAUDE.md for this repository. Also create AGENTS.md that only points to CLAUDE.md.

Assume this repository is in bootstrap mode for eLibrary and may only contain specification files, a logo asset, and issue/template docs. Do NOT invent mature workflow details that are not defined.

First, read whatever exists and is relevant:
- REQUIREMENTS.md
- ARCHITECTURE.md
- SECURITY.md
- DESIGN.md
- REQUIREMENT_TEMPLATE.md

Create a compact CLAUDE.md focused on agent operating rules:
- import @REQUIREMENTS.md and error if not present
- import @ARCHITECTURE.md and error if not present
- import @SECURITY.md and error if not present
- import @DESIGN.md and error if not present
- define domain ownership:
  - product behavior and acceptance criteria: REQUIREMENTS.md
  - architecture, interfaces, data flow, technology rationale: ARCHITECTURE.md
  - security requirements, controls, threat model, trust-boundary enforcement: SECURITY.md
  - UI styling and visual design: DESIGN.md
- avoid duplicating rules from imported artifacts
- include explicit workflow commands: Test `pnpm test`, Lint `pnpm lint`, Typecheck `pnpm typecheck`, Build `pnpm build`, and Run locally `pnpm dev`

IMPORTANT: Every new GitHub issue MUST use REQUIREMENT_TEMPLATE.md so each issue is a structured, testable requirement.

Keep it compact and optimized for Claude Code.
```

## 7. Tighten and Dedupe Specs

```text
Make sure each spec file owns one domain, nothing is duplicated across files, and no information is lost.

The files to review include:
- REQUIREMENTS.md: owns WHAT the system must do: functional and non-functional requirements, each with testable acceptance criteria.
- ARCHITECTURE.md: owns HOW it is built: components, interfaces, data flow, trust boundaries, technology choices, and rationale.
- SECURITY.md: owns security posture: threat model, security requirements, controls, trust-boundary enforcement. All security requirements are authored here; other files reference them, they do not restate them.
- DESIGN.md: owns UI styling and visual design.
- CLAUDE.md: owns agent operating rules: enforcement rules, build/test/run placeholders, and do/don't guidance. It does not define system behavior or architecture; it points to the files that do.
- REQUIREMENT_TEMPLATE.md: owns the required structure for new GitHub issues.
- AGENTS.md: only points to CLAUDE.md.
- GITHUB_ISSUE_STRIDE_THREAT_MODEL.md and github-issues/: issue artifacts must reflect the current specs without inventing implementation scope.

Tiebreak when content fits more than one file: security content goes to SECURITY.md; everything else goes to the file whose domain owns it above. The losing file removes the duplicate.

Procedure:
1. Inventory: list every distinct requirement, rule, or claim across the files and tag each with its owning file.
2. Detect: flag duplicates, contradictions, and low-signal content such as filler, motivational text, restated-obvious points, dead links, and stale placeholders.
3. Resolve: for each duplicate, remove one reference. For each contradiction, remove or replace the less secure option.
4. Verify: re-read all files end to end. Confirm no requirement, control, or constraint was dropped, every cross-reference resolves to a real section, and each file stands on its own.

When unsure whether content is low-signal or load-bearing, err on removing low-signal text but preserve any requirement, control, or decision by moving it to the owning file.
```

## 8. Threat Model the Repository

```text
Review the entire repository and conduct a detailed STRIDE threat model before proceeding with implementation.

Start by inspecting all existing project artifacts, including but not limited to:
- REQUIREMENTS.md
- ARCHITECTURE.md
- SECURITY.md
- DESIGN.md
- CLAUDE.md
- AGENTS.md
- REQUIREMENT_TEMPLATE.md
- GITHUB_ISSUE_STRIDE_THREAT_MODEL.md
- SPEC_DRIVEN_SETUP_SCRIPT.md
- github-issues/
- logo.svg and assets/logo.png

Assume the goal is to identify and fix any requirement, design decision, architectural assumption, or security rule that could reasonably lead to a security weakness.

Use STRIDE:
- Spoofing
- Tampering
- Repudiation
- Information Disclosure
- Denial of Service
- Elevation of Privilege

Use this threat model to adjust the existing artifacts:
- REQUIREMENTS.md for product behavior or acceptance criteria
- ARCHITECTURE.md for components, interfaces, data flow, trust boundaries, or technology rationale
- SECURITY.md for threats, controls, and trust-boundary enforcement
- DESIGN.md only if a design artifact duplicates or contradicts security ownership
```

## 9. Build the GitHub Epic

```text
Decompose project specs into a GitHub epic with granular sub-issues.

Read these files as the authoritative source of truth, in this precedence order:
1. REQUIREMENTS.md
2. ARCHITECTURE.md
3. SECURITY.md
4. DESIGN.md
5. CLAUDE.md

Do not infer requirements that are not present in these files. If a needed detail is missing or ambiguous, collect it under an "Open Questions" section and stop short of fabricating scope.

Produce one parent epic GitHub issue and a set of sub-issues using REQUIREMENT_TEMPLATE.md as the template for each issue. Store draft issue bodies under github-issues/ until a GitHub remote and authenticated issue-creation workflow are available.

Each sub-issue must be:
- Single-responsibility: one component, endpoint, control, or data flow.
- Deterministic: a competent engineer or AI agent could complete it without needing clarification beyond the linked spec sections.
- Bounded: roughly half a day to two days of work. If larger, split it.
- Independently testable.

The parent epic must contain:
- A one-paragraph objective tied to REQUIREMENTS.md.
- A GitHub task list linking every sub-issue.
- An "Open Questions" section that mirrors unresolved implementation-blocking decisions from the specs.

Each issue must be ready to create via `gh issue create` once a GitHub remote and authenticated GitHub CLI or connector are available. Do not add model-choice recommendations unless the user explicitly asks for them.
```

## 10. Resolve Open Decisions Before Code

```text
Before writing implementation code, resolve or explicitly defer every open decision in this project.

Scan the entire repo for unresolved items. Look for:
- "## Open Questions" sections
- unresolved framework, deployment, provider, retention, adapter, or workflow decisions
- workflow commands in CLAUDE.md
- unresolved assumptions explicitly labeled provisional or assumption
- threat model findings that still need a decision
- GitHub issues or epic items flagged as blocked, ambiguous, or needing input
- notification delivery provider and credential ownership decisions

Collect these into a single ordered list, most foundational first: requirements and architecture before downstream implementation details.

Ask the user the questions one at a time. Wait for the answer before asking the next. Do not batch questions. Do not guess or fill in answers on the user's behalf. If an answer raises a new question, add it to the list.

After each answer, record it. Once every question is answered or explicitly deferred:
- update REQUIREMENTS.md, ARCHITECTURE.md, SECURITY.md, DESIGN.md, CLAUDE.md, REQUIREMENT_TEMPLATE.md, the epic, and any sub-issues with resolved values
- remove resolved markers and clear resolved "Open Questions" entries
- keep deferred decisions visible so they are not lost

Do not start implementation until every pending question is either answered or explicitly deferred by the user.
```
