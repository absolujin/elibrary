# Local Infrastructure Placeholders

The MVP skeleton reserves local infrastructure ownership for:

- self-managed PostgreSQL as the primary store and full-text search engine
- self-managed Valkey or Redis-compatible cache for BullMQ queue state

Concrete Docker Compose service definitions and hardening belong to the infrastructure and supply-chain issue.
