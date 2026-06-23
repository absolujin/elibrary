## Requirement

As a `System worker`, I need `a LibraryAdapter registry and safe dispatch layer` so that `external library differences are isolated behind approved adapter methods`.

## Owner

- Domain: `architecture`
- Owning file: `ARCHITECTURE.md`
- Existing requirement/control/decision ID, if any: `SR-006 | SR-013`

## Scope

In scope:

- Implement or define the `LibraryAdapter` methods: `searchBooks`, `getBookDetail`, `getAvailability`, and `getLoanUrl`.
- Dispatch adapter calls by configured library and supported capability.
- Load adapter configuration and protected API key material server-side for the selected library.
- Ensure external data enters only through adapters and normalization code.
- Ensure adapter requests follow `SR-006`, including domain restrictions, SSRF protections, timeouts, retries, and circuit breakers.

Out of scope:

- Implementing all first external library adapters before first libraries are selected.
- Automated login to external electronic libraries.

## Acceptance Criteria

- Given a configured integrated library, when an adapter capability is requested, then the registry dispatches to the configured adapter method.
- Given an adapter requires an external library API key, when dispatch occurs, then the key is loaded server-side from protected configuration and is not present in worker job payloads.
- Given an unsupported capability is requested, when dispatch occurs, then a normalized unsupported result is returned.
- Given an adapter attempts a non-approved destination, when the request is evaluated, then it is blocked.
- Given external HTML or JSON is returned, when the adapter processes it, then the data is treated as untrusted input and normalized.

## Verification

- Test or check: `deferred until implementation workflow exists`
- Evidence required: `Adapter registry tests or fixtures covering capability dispatch, protected key loading, unsupported capabilities, destination blocking, and normalized errors.`

## Dependencies

- `github-issues/01-resolve-mvp-implementation-decisions.md`
- `github-issues/07-implement-ebook-normalization-provenance.md`
- `SECURITY.md#sr-006-adapter-and-external-request-safety`
