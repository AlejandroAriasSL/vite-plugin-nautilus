import path from "path"
import fs from "fs"
import { execSync } from "child_process"

const TEMP_DIR = path.join(process.cwd(), ".nautilus")
const ENTRY_FILE = path.join(TEMP_DIR, "nautilus-entry.ts")
const INDEX_HTML = path.join(process.cwd(), "index.html")

export async function findClientFiles(dir, extension = ".ts"){
    const entries = await fs.promises.readdir(dir, {withFileTypes: true})
    console.log(entries)
    const files = []

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()){
            const nestedFiles = await findClientFiles(fullPath, extension)
            files.push(...nestedFiles)
        } else if (entry.isFile() && entry.name.endsWith(extension)){
            files.push(fullPath)
        }
    }

    return files;
}

function generateEntryContent(files){
    const imports = files
    .map(file => `import "${file.replace(/\\/g, "/")}";`)
    .join("\n");

    return `
        import "reflect-metadata"

        declare global {
            interface Window {
                nautilusAppInitialized: boolean;
            }
        }

        ${imports}

        import {DIContainer, Router} from "nautilus"

        if(!window.nautilusAppInitialized){
            window.nautilusAppInitialized = true;
            DIContainer.getInstance().bootstrap()
            await Router.init()
        }

    `
}

export async function createTempEntry(){

    fs.mkdirSync(TEMP_DIR, {recursive: true})
    if (fs.existsSync(ENTRY_FILE)) fs.unlinkSync(ENTRY_FILE)

    if(process.platform === "win32") execSync(`attrib +h "${TEMP_DIR}"`)

    console.log(path.join(process.cwd(), "src"));

    const files = await findClientFiles(path.join(process.cwd(), "src"))
    
    console.log(files)

    if (files.length === 0) {
        console.warn("No hay ningún archivo en el directorio de solución")
    }

    const content = generateEntryContent(files)

    fs.writeFileSync(ENTRY_FILE, content, "utf-8")

    console.log("Nueva entrada temporal en: ", ENTRY_FILE)

    if(fs.existsSync(INDEX_HTML)){
        let html = fs.readFileSync(INDEX_HTML, "utf-8");

       const newScriptTag = `<script type="module" src=".nautilus/nautilus-entry.ts"></script>`

        if (/<script\s+type=["']module["']\s+src=["'][^"']*["']><\/script>/.test(html)) {
            html = html.replace(
                /<script\s+type=["']module["']\s+src=["'][^"']*["']><\/script>/,
                newScriptTag
            )
        }
        
        fs.writeFileSync(INDEX_HTML, html, "utf-8");

        console.log("index.html reemplazado con script temporal")
    }

    return ENTRY_FILE;
}
