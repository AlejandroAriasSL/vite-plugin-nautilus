import { expect, vi } from "vitest";
import nautilus from "../index";

describe("nautilus vite plugin", () => {
  const plugin = nautilus();
  console.log(plugin);

  it("should return a plugin object with a name", () => {
    expect(plugin).toBeDefined();
    expect(plugin.name).toBe("nautilus");
  });

  it("should match the expected config snapshot", () => {

    const actualConfig = plugin.config();

    expect(actualConfig).toMatchSnapshot()
  });

  it("should return the virtual module id", () => {
    const expectedResult = "\0" + "virtual:nautilus";
    const actualResult = plugin.resolveId("virtual:nautilus");

    expect(actualResult).toEqual(expectedResult)
  })

  it("should load virtual module with correct configuration", async () => {
    
    vi.mock("../scripts/run-command.js", () => ({
        default: vi.fn().mockResolvedValue({
            plugins: ["my-plugin"],
            target: "es2022"
        })
    }));

    const loadedConfig = await plugin.load("\0virtual:nautilus");

    const expectedConfig = {
        plugins: ["my-plugin"],
        target: "es2022"
    }

    const expectedString = `export default ${JSON.stringify(expectedConfig, null, 2)}`

    expect(loadedConfig).toEqual(expectedString)
  })
});
