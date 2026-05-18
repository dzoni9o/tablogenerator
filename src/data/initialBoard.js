import { createId } from "../utils/ids";

export const defaultBoardName = "Spratna tabla ST-1";

export const createInitialRows = () => [
  {
    id: createId(),
    name: "Red 1",
    breakers: [
      {
        id: createId(),
        type: "fid",
        poles: 2,
        icon: "shield",
        label: "FID",
        amp: "40A/2P",
        description: "Zastitna sklopka",
      },
      { id: createId(), type: "breaker", poles: 1, icon: "light", label: "F1", amp: "B10", description: "Rasveta dnevna soba" },
      { id: createId(), type: "breaker", poles: 1, icon: "outlet", label: "F2", amp: "B16", description: "Uticnice kuhinja" },
    ],
  },
];
