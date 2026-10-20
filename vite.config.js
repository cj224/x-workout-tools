import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";

// Gitee Pages path: https://<user>.gitee.io/x-workout-tools/
const repoBase = "/x-workout-tools/";

export default defineConfig(({ command }) => ({
  base: command === "build" ? repoBase : "/",
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  optimizeDeps: {
    // Keep worker/wasm packages out of prebundle so Worker URL stays valid
    exclude: ["heic-to", "libraw-wasm"],
  },
  worker: {
    format: "es",
  },
  server: {
    port: 5180,
    host: true,
    strictPort: true,
  },
}));
