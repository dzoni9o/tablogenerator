import { createId } from "./ids";

export const labelLimit = 5;
export const descriptionLimit = 70;

export const getAmpLimit = (breaker) => (breaker?.type === "fid" ? 10 : 4);

export const createBreaker = (index) => ({
  id: createId(),
  type: "breaker",
  poles: 1,
  icon: "light",
  label: `F${index}`,
  amp: "B16",
  description: "Novi osigurac",
});

export const createFid = (phase, index) => ({
  id: createId(),
  type: "fid",
  poles: phase === "three" ? 4 : 2,
  icon: "shield",
  label: phase === "three" ? `FID 3F ${index}` : `FID 1F ${index}`,
  amp: phase === "three" ? "40A/4P" : "40A/2P",
  description: phase === "three" ? "Trofazna FID zastita" : "Monofazna FID zastita",
});

export const createNeutralSwitch = (index, linkedFidId = null) => ({
  id: createId(),
  type: "neutral",
  poles: 2,
  icon: "none",
  linkedFidId,
  label: `N ${index}`,
  amp: "2P",
  description: "Zastitnik od prekida nultog voda",
});

export const createBell = (index) => ({
  id: createId(),
  type: "bell",
  poles: 1,
  icon: "bell",
  label: `ZV${index}`,
  amp: "230V",
  description: "Zvonce",
});
