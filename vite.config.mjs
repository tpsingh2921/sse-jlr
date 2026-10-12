import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command }) => ({
  root: path.join(projectRoot, "client"),
  base: command === "build" ? "/react/" : "/",
  publicDir: path.join(projectRoot, "public"),
  plugins: [react()],
  build: {
    outDir: path.join(projectRoot, "public", "react"),
    emptyOutDir: true,
    copyPublicDir: false,
  },
}));
