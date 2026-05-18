import { describe, expect, it } from "vitest";
import { getRowUsedModules, getTotalCapacity, getTotalUsedModules } from "./boardOperations";
import { createRowsFromTemplate } from "../data/templates";

describe("board module calculations", () => {
  it("counts module usage per row", () => {
    const row = {
      capacity: 12,
      breakers: [{ poles: 1 }, { poles: 2 }, { poles: 4 }],
    };

    expect(getRowUsedModules(row)).toBe(7);
  });

  it("counts total used modules and capacity", () => {
    const rows = [
      { capacity: 12, breakers: [{ poles: 1 }, { poles: 2 }] },
      { capacity: 18, breakers: [{ poles: 4 }] },
    ];

    expect(getTotalUsedModules(rows)).toBe(7);
    expect(getTotalCapacity(rows)).toBe(30);
  });

  it("creates templates with capacities", () => {
    const rows = createRowsFromTemplate("house-three");

    expect(rows.length).toBeGreaterThan(1);
    expect(rows.every((row) => row.capacity > 0)).toBe(true);
  });
});
