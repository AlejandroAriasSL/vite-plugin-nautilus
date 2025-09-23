import { spawn } from "child_process";
import { resolve } from "path";

export default async function runCommand(scriptPath, inherit = false){
  const fullPath = resolve(process.cwd(), scriptPath);
  console.log("el path completo del script",fullPath)
  return await new Promise((resolve, reject) => {
    const child = spawn("npx", ["tsx", fullPath], {
      stdio: inherit ? "inherit" :  ["ignore", "pipe", "pipe"],
      shell: true,
    });
  
    let output = "";
     if (!inherit && child.stdout && child.stderr) {
      child.stdout.on("data", (data) => (output += data.toString()));
      child.stderr.on("data", (data) => console.error(data.toString()));
    }
  
    child.on("exit", (code) => {
      if (code === 0) {
        if (!inherit){
          resolve(output.trim());
        } else {
          resolve();
        }

      } 
      else reject(new Error("script failed to launch"));
    });
  });
}
