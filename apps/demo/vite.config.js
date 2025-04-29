import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";

// Get all package directories
const packagesDir = resolve(__dirname, "../../packages");
const packages = fs.readdirSync(packagesDir).filter((dir) => {
  return fs.statSync(resolve(packagesDir, dir)).isDirectory();
});

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      // Create aliases for each package
      ...packages.reduce((aliases, pkg) => {
        aliases[pkg] = resolve(packagesDir, pkg, "src");
        return aliases;
      }, {}),
    },
  },
  optimizeDeps: {
    include: packages,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
  assetsInclude: ["**/*.frag", "**/*.vert"],
  plugins: [
    {
      name: "raw-loader",
      transform(code, id) {
        if (id.endsWith("?raw")) {
          const filePath = id.slice(0, -4);
          return {
            code: `export default ${JSON.stringify(
              fs.readFileSync(filePath, "utf-8")
            )};`,
            map: null,
          };
        }
      },
    },
  ],
});
