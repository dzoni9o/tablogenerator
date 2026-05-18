import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteRecentProject, parseProjectJson, readRecentProjects, saveProjectToLocalStorage } from "./projectStorage";

beforeEach(() => {
  const store = new Map();

  vi.stubGlobal("localStorage", {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  });
});

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

  it("keeps deleted recent projects hidden from autosave", () => {
    const rows = [{ id: "r1", name: "Red 1", capacity: 12, breakers: [] }];
    const projectInfo = { objectName: "Objekat" };
    const savedAt = saveProjectToLocalStorage("Tabla", rows, projectInfo);

    expect(readRecentProjects()).toHaveLength(1);

    deleteRecentProject(savedAt);
    saveProjectToLocalStorage("Tabla", rows, projectInfo);

    expect(readRecentProjects()).toHaveLength(0);
  });

  it("allows a changed project to appear after an old recent entry was deleted", () => {
    const rows = [{ id: "r1", name: "Red 1", capacity: 12, breakers: [] }];
    const projectInfo = { objectName: "Objekat" };
    const savedAt = saveProjectToLocalStorage("Tabla", rows, projectInfo);

    deleteRecentProject(savedAt);
    saveProjectToLocalStorage("Tabla", [{ ...rows[0], capacity: 18 }], projectInfo);

    expect(readRecentProjects()).toHaveLength(1);
  });
});
