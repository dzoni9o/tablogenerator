import { createId } from "./ids";
import { getCatalogItem } from "../data/breakerCatalog";

export const labelLimit = 5;
export const descriptionLimit = 70;

export const getAmpLimit = (breaker) => (breaker?.type === "fid" ? 10 : 4);

export const createCatalogBreaker = (type, index) => {
  const item = getCatalogItem(type);

  return {
    id: createId(),
    type: item.type,
    poles: item.poles,
    icon: item.icon,
    label: item.defaultLabel === "F" ? `F${index}` : `${item.defaultLabel}${index > 1 ? ` ${index}` : ""}`,
    amp: item.amp,
    phase: item.type === "busbar" ? "NPE" : item.poles >= 3 ? "3F" : "L1",
    loadW: "",
    description: item.description,
  };
};

export const createFid = (phase, index) => ({
  id: createId(),
  type: "fid",
  poles: phase === "three" ? 4 : 2,
  icon: "shield",
  label: phase === "three" ? `FID 3F ${index}` : `FID 1F ${index}`,
  amp: phase === "three" ? "40A/4P" : "40A/2P",
  phase: phase === "three" ? "3F" : "L1",
  loadW: "",
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
  phase: "NPE",
  loadW: "",
  description: "Zastitnik od prekida nultog voda",
});
