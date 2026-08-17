import { defineConfig } from "vite";

export default defineConfig({
  base: "/helper/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
