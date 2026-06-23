## Requirement

As a `project maintainer`, I need `infrastructure, secret handling, and supply-chain safeguards before production use` so that `implementation and deployment do not expose secrets, vulnerable dependencies, or production data`.

## Owner

- Domain: `security`
- Owning file: `SECURITY.md`
- Existing requirement/control/decision ID, if any: `SR-007 | SR-011 | SR-012`

## Scope

In scope:

- Keep secrets out of the repository and local logs.
- Support write-only external library API key storage and rotation from admin service settings.
- Treat email and Web Push delivery credentials as secrets once providers and credential ownership are selected; do not create provider-specific secrets while provider selection or credential ownership is deferred.
- Use local ignore patterns for environment, registry, key, and certificate files.
- Use pnpm with exact dependency versions and committed `pnpm-lock.yaml` once package manifests exist.
- Reject runtime dependencies with known unpatched CVEs and review direct/transitive dependencies.
- Prepare Docker Compose packaging and zero-cost Oracle Cloud Always Free deployment baseline for a single Arm/Ampere VM running the web/API, workers, PostgreSQL, Valkey or Redis-compatible cache, and HTTPS ingress.
- Document that the zero-cost deployment is not production-grade until backup, patching, monitoring, recovery, and capacity risks are explicitly accepted.
- Document backup, recovery, and incident-response readiness before production.

Out of scope:

- Changing the selected zero-cost Oracle Cloud Always Free deployment target without updating `ARCHITECTURE.md` and `SECURITY.md`.
- Implementing paid cloud services or production infrastructure beyond the selected zero-cost baseline.
- Selecting or integrating email or Web Push delivery providers, or creating provider-specific delivery credentials, while provider selection or credential ownership is deferred.

## Acceptance Criteria

- Given local secret-like files exist, when git status is checked, then ignored patterns prevent accidental inclusion according to `.gitignore`.
- Given an external library API key is registered or rotated, when storage and logs are inspected, then the secret is protected, masked, and not returned by APIs.
- Given runtime dependencies are added, when dependency review runs, then pnpm lockfile state exists, versions are pinned, and known unpatched CVEs are rejected.
- Given production readiness is reviewed, when `SR-012` is checked, then backup, recovery, and incident response requirements have documented verification.
- Given deployment baseline is reviewed, when this issue is complete, then Oracle Cloud Always Free VM, Docker Compose, PostgreSQL, Valkey or Redis-compatible cache, HTTPS ingress, and no-cost observability match `ARCHITECTURE.md`.
- Given VM runtime resources are configured, when security is reviewed, then network paths, host firewall, Docker networks, secrets, encryption, backups, and patching satisfy `SECURITY.md`.

## Verification

- Test or check: `deferred until implementation workflow exists`
- Evidence required: `Updated ignore/config files, protected API key storage/rotation evidence, pnpm lockfile policy, vulnerability check evidence, zero-cost OCI VM baseline notes, and readiness notes for backup/recovery/incident response.`

## Dependencies

- `github-issues/01-resolve-mvp-implementation-decisions.md`
- `.gitignore`
- `SECURITY.md#sr-007-secrets-management`
- `SECURITY.md#sr-011-infrastructure-and-supply-chain`
- `SECURITY.md#sr-012-backup-recovery-and-incident-response`
