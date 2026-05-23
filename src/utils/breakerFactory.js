import { createId } from "./ids";
import { getCatalogItem } from "../data/breakerCatalog";

export const labelLimit = 5;
export const descriptionLimit = 70;

export const getAmpLimit = (breaker) => (breaker?.type === "fid" ? 12 : 4);

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

export const createBreakerWithParams = (index, params = {}) => ({
  ...createCatalogBreaker("breaker", index),
  amp: formatBreakerAmp(params.curve, params.amp),
});

export const createCustomElement = (poles = 1) => ({
  id: createId(),
  type: "custom",
  poles: Math.max(1, Math.min(50, Number(poles) || 1)),
  icon: "none",
  label: "",
  amp: "",
  phase: "none",
  loadW: "",
  description: "",
});

export const createFid = (phase, index, params = {}) => {
  const amp = formatFidAmp(params.amp || "40");
  const sensitivity = formatSensitivity(params.sensitivity || "30mA");

  return {
    id: createId(),
    type: "fid",
    poles: phase === "three" ? 4 : 2,
    icon: "shield",
    label: phase === "three" ? `FID 3F ${index}` : `FID 1F ${index}`,
    amp: `${amp}/${sensitivity}`,
    nominalAmp: amp,
    sensitivity,
    phase: phase === "three" ? "3F" : "L1",
    loadW: "",
    description: phase === "three" ? `Trofazna FID zastita ${sensitivity}` : `Monofazna FID zastita ${sensitivity}`,
  };
};

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

function formatBreakerAmp(curve = "B", amp = "16") {
  const safeCurve = ["B", "C", "D"].includes(String(curve).toUpperCase()) ? String(curve).toUpperCase() : "B";
  const safeAmp = String(amp || "16").replace(/\D/g, "").slice(0, 3) || "16";
  return `${safeCurve}${safeAmp}`;
}

function formatFidAmp(amp = "40") {
  const safeAmp = String(amp || "40").replace(/\D/g, "").slice(0, 3) || "40";
  return `${safeAmp}A`;
}

function formatSensitivity(sensitivity = "30mA") {
  const safeSensitivity = String(sensitivity || "30mA").replace(/\s+/g, "");
  return /^(30|50|300|500)mA$/i.test(safeSensitivity) ? safeSensitivity.replace(/ma$/i, "mA") : "30mA";
}
