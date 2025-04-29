import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs/promises";
import path from "path";

export default defineConfig({
  resolve: {
    extensions: [".ts", ".js"],
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "BlobAnim",
      formats: ["es"], // Only generate ES module build
      fileName: () => `blob-anim.es.js`,
    },
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      external: ["d3"],
      output: {
        globals: {
          d3: "d3",
        },
      },
    },
  },
  server: {
    port: 3000,
    open: "/demos/index.html",
    strictPort: false,
    hmr: true,
  },
  // Plugin to mirror dist outputs into demos folder
  plugins: [
    {
      name: "copy-to-demos",
      async writeBundle() {
        const srcDir = path.resolve(__dirname, "dist");
        const destDir = path.resolve(__dirname, "demos");
        await fs.mkdir(destDir, { recursive: true });
        for (const file of ["blob-anim.es.js", "blob-anim.es.js.map"]) {
          await fs.copyFile(path.join(srcDir, file), path.join(destDir, file));
        }
      },
    },
  ],
});
