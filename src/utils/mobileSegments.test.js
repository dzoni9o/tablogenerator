import { describe, expect, it } from "vitest";
import { createMobileSegments } from "./mobileSegments";

describe("mobile segments", () => {
  it("splits breakers into readable module groups", () => {
    const segments = createMobileSegments([{ poles: 1 }, { poles: 10 }, { poles: 2 }, { poles: 1 }], 12);

    expect(segments).toHaveLength(2);
    expect(segments[0].used).toBe(11);
    expect(segments[1].used).toBe(3);
    expect(segments[1].start).toBe(13);
  });

  it("extends segment range for one oversized element", () => {
    const segments = createMobileSegments([{ poles: 14 }], 12);

    expect(segments[0].start).toBe(1);
    expect(segments[0].end).toBe(24);
    expect(segments[0].used).toBe(14);
  });
});
