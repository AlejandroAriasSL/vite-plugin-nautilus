import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "index.js"),
      name: "NautilusPlugin",
      fileName: (format) => `index.${format}.js`,
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [
        "vite",
        "vite-plugin-dts",
        "path",
        "fs",
        "child_process",
        "./scripts/run-command.js",
        "./scripts/merge-files.js"
      ],
      output: {
        globals: {
          vite: "Vite",
        },
      },
    },
  },
});
