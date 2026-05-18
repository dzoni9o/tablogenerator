import { describe, expect, it } from "vitest";
import { calculatePhaseBalance } from "./phaseBalance";

describe("phase balance", () => {
  it("splits three-phase loads across all phases", () => {
    const result = calculatePhaseBalance([
      {
        breakers: [
          { phase: "L1", loadW: "3000" },
          { phase: "3F", loadW: "6000" },
        ],
      },
    ]);

    expect(result.totals.L1).toBe(5000);
    expect(result.totals.L2).toBe(2000);
    expect(result.totals.L3).toBe(2000);
    expect(result.isBalanced).toBe(false);
  });

  it("treats missing loads as zero", () => {
    const result = calculatePhaseBalance([{ breakers: [{ phase: "L2", loadW: "" }] }]);

    expect(result.totals).toEqual({ L1: 0, L2: 0, L3: 0 });
    expect(result.isBalanced).toBe(true);
  });

  it("keeps legacy kW values compatible", () => {
    const result = calculatePhaseBalance([{ breakers: [{ phase: "L1", loadKw: "1.2" }] }]);

    expect(result.totals.L1).toBe(1200);
  });
});
