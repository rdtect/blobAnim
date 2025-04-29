import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  // Basic TypeScript and JSX support
  esbuild: {
    jsxFactory: "h",
    jsxFragment: "Fragment",
  },
  // Resolve .ts extensions
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      // Alias for the ESM build of blob-anim
      "blob-anim-es": path.resolve(__dirname, "../../packages/blob-anim/dist/blob-anim.es.js"),
    },
  },
  // Enable better error reporting
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["blob-anim-es"],
        },
      },
    },
  },
});
