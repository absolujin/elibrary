import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@elibrary/adapters": new URL("./packages/adapters/src/index.ts", import.meta.url).pathname,
      "@elibrary/database": new URL("./packages/database/src/index.ts", import.meta.url).pathname,
      "@elibrary/domain": new URL("./packages/domain/src/index.ts", import.meta.url).pathname
    }
  },
  test: {
    include: ["tests/**/*.test.ts"]
  }
});
