# Review repository with STRIDE threat model before implementation

/workflow Review the entire repository and conduct a detailed STRIDE threat model before proceeding with implementation. Start by inspecting all existing project artifacts, including but not limited to `REQUIREMENTS.md`, `ARCHITECTURE.md`, `SECURITY.md`, `DESIGN.md`, `CLAUDE.md`, `AGENTS.md`, and `REQUIREMENT_TEMPLATE.md`. Assume the goal is to identify and fix any requirement, design decision, architectural assumption, or security rule that could reasonably lead to a security weakness. Use STRIDE: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, and Elevation of Privilege. Use the threat model to adjust the existing artifacts: `REQUIREMENTS.md`, `ARCHITECTURE.md`, `SECURITY.md`, and `DESIGN.md` only if a design artifact duplicates or contradicts security ownership.

## Requirement

As a project maintainer, I need a full-repository STRIDE threat model before implementation so that security weaknesses in requirements, architecture, and security rules are identified and corrected before code is built.

## Owner

- Domain: `security`
- Owning file: `SECURITY.md`
- Existing requirement/control/decision ID, if any: `SR-001 through SR-015`

## Scope

In scope:

- Inspect all existing repository artifacts, including `REQUIREMENTS.md`, `ARCHITECTURE.md`, `SECURITY.md`, `DESIGN.md`, `CLAUDE.md`, `AGENTS.md`, and `REQUIREMENT_TEMPLATE.md`.
- Conduct a detailed STRIDE threat model covering Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, and Elevation of Privilege.
- Identify requirement gaps, weak design decisions, risky architectural assumptions, missing controls, and unclear security rules.
- Update `REQUIREMENTS.md`, `ARCHITECTURE.md`, and `SECURITY.md` to resolve confirmed issues.
- Update `DESIGN.md` only if a design artifact duplicates or contradicts security ownership.
- Preserve domain ownership: security controls remain in `SECURITY.md`; architecture details remain in `ARCHITECTURE.md`; product behavior and acceptance criteria remain in `REQUIREMENTS.md`.

Out of scope:

- Implementing application code.
- Adding production infrastructure.
- Creating automated borrowing or external account-linking features.
- Changing visual design unless a design artifact creates a security weakness.

## Acceptance Criteria

- Given the repository artifacts, when the reviewer completes the STRIDE analysis, then each STRIDE category has documented findings or an explicit `no finding` note.
- Given a finding that affects product behavior, when the artifact updates are complete, then `REQUIREMENTS.md` contains the corrected testable requirement or acceptance criterion.
- Given a finding that affects system structure, when the artifact updates are complete, then `ARCHITECTURE.md` contains the corrected component, interface, data flow, trust boundary, or technology rationale.
- Given a finding that affects security posture, when the artifact updates are complete, then `SECURITY.md` contains the corrected threat, requirement, control, or trust-boundary enforcement rule.
- Given duplicate or conflicting guidance across artifacts, when the review is complete, then the duplicate is removed and the more secure rule is retained in the owning file.
- Given all updates are complete, when the files are re-read end to end, then no requirement, control, or constraint is lost and all cross-references resolve.

## Verification

- Test or check: `Manual STRIDE review; automated verification deferred until implementation workflow exists.`
- Evidence required: A summary of STRIDE findings, files changed, rationale for each artifact update, and confirmation that `REQUIREMENTS.md`, `ARCHITECTURE.md`, and `SECURITY.md` were re-read after edits.

## Dependencies

- `REQUIREMENTS.md`
- `ARCHITECTURE.md`
- `SECURITY.md`
- `REQUIREMENT_TEMPLATE.md`
