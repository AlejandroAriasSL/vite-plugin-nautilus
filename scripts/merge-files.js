import path from "path";
import fs from "fs";

export function mergeFiles(emittedFiles) {

  const seenImports = new Set();
  const seenExports = new Set();
  let merged = "";

  for (const [filePath, content] of emittedFiles) {
    if (!filePath.endsWith(".d.ts")) continue;
    if (path.basename(filePath).startsWith("index")) continue;

    const lines = content.replace(/\/\/# sourceMappingURL=.*\.map/g, "").split("\n");

    const filteredLines = lines.filter((line) => {
      const trimmed = line.trim();

      const normalizePath = (match) => {
        let abs = path.resolve(path.dirname(filePath), match);
        let rel = path.relative(path.resolve("dist"), abs).replace(/\\/g, "/");
        return `./${rel}`;
      };

      if (trimmed.startsWith("import")) {
        const normalized = trimmed.replace(/from ['"](.*)['"]/, (_, p1) => `from "${normalizePath(p1)}"`);
        if (seenImports.has(normalized)) return false;
        seenImports.add(normalized);
        return true;
      }

      if (trimmed.startsWith("export * from")) {
        const normalized = trimmed.replace(/from ['"](.*)['"]/, (_, p1) => `from "${normalizePath(p1)}"`);
        if (seenExports.has(normalized)) return false;
        seenExports.add(normalized);
        return true;
      }

      return true;
    });

    merged += `\n// ----- ${path.basename(filePath)} -----\n`;
    merged += filteredLines.join("\n") + "\n";
  }

  merged += '\nexport * from "./src/index";\n';

  const outputPath = path.resolve("dist/nautilus.d.ts");
  fs.writeFileSync(outputPath, merged, "utf-8");
  console.log(`Archivo dts generado: ${outputPath}`);
}
