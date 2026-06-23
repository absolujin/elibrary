# eLibrary

Bootstrap-stage web and API application for finding ebooks across public electronic libraries.

## Workspace

- `apps/api`: NestJS Backend API skeleton.
- `apps/worker`: NestJS-compatible worker skeleton with BullMQ queue registration.
- `apps/web`: React public/member Web App shell.
- `apps/admin`: React Admin UI shell.
- `packages/domain`: runtime component, module-boundary, and queue definitions.
- `packages/adapters`: `LibraryAdapter` contract and registry.
- `packages/database`: PostgreSQL store and search-index ownership map.

## Commands

- `pnpm test`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm dev`

Use `pnpm@11.8.0`; the root `package.json` pins the package manager.
