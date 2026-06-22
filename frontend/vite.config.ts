import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const basePath =
  (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env?.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [react()],
  server: {
    port: 5175
  }
});
