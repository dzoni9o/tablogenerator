import { createId } from "../utils/ids";

export const defaultBoardName = "Spratna tabla ST-1";
export const defaultRowCapacity = 12;

export const createInitialRows = () => [
  {
    id: createId(),
    name: "Red 1",
    capacity: defaultRowCapacity,
    breakers: [
      {
        id: createId(),
        type: "fid",
        poles: 2,
        icon: "shield",
        label: "FID",
        amp: "40A/2P",
        phase: "L1",
        loadW: "",
        description: "Zastitna sklopka",
      },
      { id: createId(), type: "breaker", poles: 1, icon: "light", label: "F1", amp: "B10", phase: "L1", loadW: "800", description: "Rasveta dnevna soba" },
      { id: createId(), type: "breaker", poles: 1, icon: "outlet", label: "F2", amp: "B16", phase: "L2", loadW: "2500", description: "Uticnice kuhinja" },
    ],
  },
];

export const createBlankRows = () => [
  {
    id: createId(),
    name: "Red 1",
    capacity: defaultRowCapacity,
    breakers: [],
  },
];
