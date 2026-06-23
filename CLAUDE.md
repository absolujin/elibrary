# Claude Code Instructions

@REQUIREMENTS.md
@ARCHITECTURE.md
@SECURITY.md
@DESIGN.md

If any import above is missing or unreadable, stop with this error before planning or editing: `ERROR: required project spec import is missing.`

## Domain Ownership

- Product behavior and acceptance criteria: `REQUIREMENTS.md`
- Architecture, interfaces, data flow, technology rationale: `ARCHITECTURE.md`
- Security requirements, controls, threat model, trust-boundary enforcement: `SECURITY.md`
- UI styling and visual design: `DESIGN.md`

Do not restate or redefine rules already owned by imported files.

## Operating Rules

- Read the relevant owning document before changing code, specs, issues, or templates.
- Keep changes scoped to the current structured requirement.
- When a change affects product behavior, architecture, security posture, or visual design, update the owning file in the same change.
- Before implementation code begins, confirm the STRIDE/security verification requirements in `SECURITY.md` are satisfied or update `SECURITY.md` with the current finding.
- If imported files conflict, apply the more secure option and update the losing file to remove the conflict.
- Keep unresolved decisions visible in the owning file's open-questions section; do not invent mature workflow, stack, hosting, or vendor details.

## GitHub Issues

Every new GitHub issue MUST use `REQUIREMENT_TEMPLATE.md` so each issue is a structured, testable requirement.

If `REQUIREMENT_TEMPLATE.md` is missing, do not create issues. Report: `ERROR: REQUIREMENT_TEMPLATE.md is required before creating GitHub issues.`

## Workflow Commands

- Package manager: `pnpm`
- Test: `pnpm test`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Build: `pnpm build`
- Run locally: `pnpm dev`

Until package manifests and scripts exist, verify documentation changes by reading the changed files for consistency and report that automated command verification is not available.
