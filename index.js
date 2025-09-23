import dtsPlugin from "vite-plugin-dts";
import runCommand from "./scripts/run-command";
import { createTempEntry } from "./scripts/entry-generator.js";
import path from "path";

const generateAutoWiredPath = path.resolve("node_modules", "nautilus", "dist", "tools", "generate-autowired.es.js")
const injectStaticPath = path.resolve("node_modules", "nautilus", "dist", "tools", "inject-static-files.es.js")

export default function nautilus() {
  const virtualModuleId = "virtual:nautilus";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;
  console.log("Cargando nautilus...");

  const nautilusPlugin = {
    name: "nautilus",

    async writeBundle() {
      await runCommand(injectStaticPath, true)
      await runCommand(generateAutoWiredPath, true)
    },

    config: async () => {
      const entryFile = await createTempEntry();
      await runCommand(generateAutoWiredPath, true)
      return {
         resolve: {
          alias: {
            "@generated": path.resolve(process.cwd(), ".nautilus/generated"),
          }
        },
        esbuild: { target: "es2022" },
        build: {
          rollupOptions: {
            input: entryFile,
          },
        },
        rollupOptions: {
          external: ["reflect-metadata"],
          output: {
            globals: {
              "reflect-metadata": "Reflect",
            },
          },
        },
        optimizeDeps: {
          exclude: ["nautilus", path.resolve(process.cwd(), ".nautilus", "nautilus-entry.ts")],
        },
      };
    },

    async handleHotUpdate({ file, server }) {
      if (file.endsWith(".ts") && file.includes("src")) {
        console.log("Cambio detectado en: ", file);
        await createTempEntry();
        server.restart();
      }
    },

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },

    async load(id) {
      if (id === resolvedVirtualModuleId) {
        const config = await runCommand("scripts/load-config.ts");
        return `export default ${JSON.stringify(config, null, 2)}`;
      }
    },
  };

  const dts = dtsPlugin({
    outDir: "./dist",
    insertTypesEntry: true,
    copyDtsFiles: true,
    include: ["src", "main.ts"],
    tsconfigPath: "./tsconfig.json",
    beforeWriteFile: (filePath, content) => {
      console.log("Generando archivo: ", filePath);
      console.log(content.slice(0, 500));
      return content;
    },
    afterBuild: async (emittedFiles) => {
      const { mergeFiles } = await import("./scripts/merge-files.js");
      mergeFiles(emittedFiles);
    },
  });

  return [nautilusPlugin, dts];
}
