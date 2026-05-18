export const phaseOptions = [
  { value: "L1", label: "L1" },
  { value: "L2", label: "L2" },
  { value: "L3", label: "L3" },
  { value: "3F", label: "3F" },
  { value: "NPE", label: "N/PE" },
  { value: "none", label: "-" },
];

export function calculatePhaseBalance(rows) {
  const totals = { L1: 0, L2: 0, L3: 0 };

  rows.flatMap((row) => row.breakers).forEach((breaker) => {
    const load = Number(breaker.loadKw) || 0;
    if (!load) return;

    if (breaker.phase === "3F") {
      totals.L1 += load / 3;
      totals.L2 += load / 3;
      totals.L3 += load / 3;
      return;
    }

    if (totals[breaker.phase] !== undefined) {
      totals[breaker.phase] += load;
    }
  });

  const values = Object.values(totals);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const spread = max - min;

  return {
    totals,
    spread,
    isBalanced: spread <= 1.5,
  };
}
