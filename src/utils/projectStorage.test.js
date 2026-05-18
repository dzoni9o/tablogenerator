import { describe, expect, it } from "vitest";
import { parseProjectJson } from "./projectStorage";

describe("project storage", () => {
  it("normalizes old project files with phase defaults", () => {
    const project = parseProjectJson(
      JSON.stringify({
        boardName: "Test tabla",
        rows: [
          {
            id: "r1",
            name: "Red",
            breakers: [{ id: "b1", label: "F1", amp: "B16", description: "Uticnice" }],
          },
        ],
      }),
    );

    expect(project.rows[0].capacity).toBe(12);
    expect(project.rows[0].breakers[0].phase).toBe("L1");
    expect(project.rows[0].breakers[0].loadW).toBe("");
  });

  it("converts legacy kW values to W", () => {
    const project = parseProjectJson(
      JSON.stringify({
        boardName: "Test tabla",
        rows: [
          {
            id: "r1",
            name: "Red",
            breakers: [{ id: "b1", label: "F1", amp: "B16", loadKw: "2.5", description: "Uticnice" }],
          },
        ],
      }),
    );

    expect(project.rows[0].breakers[0].loadW).toBe("2500");
  });
});
