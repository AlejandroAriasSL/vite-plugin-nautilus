import { spawn } from "child_process";
import { resolve } from "path";

export default async function runCommand(scriptPath){
  const fullPath = resolve(process.cwd(), scriptPath);
  return await new Promise((resolve, reject) => {
    const child = spawn("npx", ["tsx", fullPath], {
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
    });
  
    let output = "";
  
    child.stdout.on("data", (data) => (output += data.toString()));
    child.stderr.on("data", (data) => console.error(data.toString()));
  
    child.on("exit", (code) => {
      if (code === 0) resolve(output.trim());
      else reject(new Error("script failed to launch"));
    });
  });
}
