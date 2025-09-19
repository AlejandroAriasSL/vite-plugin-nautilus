import dtsPlugin from "vite-plugin-dts";
import runCommand from "./scripts/run-command";

export default function nautilus() {
  const virtualModuleId = "virtual:nautilus";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  return {
    name: "nautilus",
    config: () => ({
      plugins: [ dtsPlugin({insertTypesEntry: true, outputDir: "dist"}) ],
      esbuild: { target: "ES2022" },
      rollupOptions: {
        external: ["reflect-metadata"],
        output: {
          globals: {
            "reflect-metadata": "Reflect",
          }
        }
      }
    }),

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },

    async load(id) {
      if (id === resolvedVirtualModuleId) {
        const config = await runCommand("scripts/load-config.ts")
        return `export default ${JSON.stringify(config, null, 2)}`;
      }
    }
  };
}
