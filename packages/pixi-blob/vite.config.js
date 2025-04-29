import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "PixiBlob",
      fileName: "pixi-blob",
    },
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      external: ["pixi.js"],
      output: {
        globals: {
          "pixi.js": "PIXI",
        },
      },
    },
  },
  optimizeDeps: {
    include: ["pixi.js"],
    exclude: ["@types/pixi.js"],
  },
  plugins: [
    {
      name: "glsl-plugin",
      transform(code, id) {
        if (id.endsWith(".frag")) {
          return {
            code: `export default ${JSON.stringify(code)};`,
            map: null,
          };
        }
      },
    },
  ],
  server: {
    port: 5500,
    open: true,
    fs: {
      strict: false,
      allow: [".."],
    },
    hmr: {
      overlay: false,
    },
  },
  root: "demo",
  publicDir: "demo/public",
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  esbuild: {
    sourcemap: true,
  },
});
