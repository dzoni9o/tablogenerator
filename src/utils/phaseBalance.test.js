import { describe, expect, it } from "vitest";
import { calculatePhaseBalance } from "./phaseBalance";

describe("phase balance", () => {
  it("splits three-phase loads across all phases", () => {
    const result = calculatePhaseBalance([
      {
        breakers: [
          { phase: "L1", loadKw: "3" },
          { phase: "3F", loadKw: "6" },
        ],
      },
    ]);

    expect(result.totals.L1).toBe(5);
    expect(result.totals.L2).toBe(2);
    expect(result.totals.L3).toBe(2);
    expect(result.isBalanced).toBe(false);
  });

  it("treats missing loads as zero", () => {
    const result = calculatePhaseBalance([{ breakers: [{ phase: "L2", loadKw: "" }] }]);

    expect(result.totals).toEqual({ L1: 0, L2: 0, L3: 0 });
    expect(result.isBalanced).toBe(true);
  });
});
