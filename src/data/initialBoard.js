import { createId } from "../utils/ids";
import { defaultProjectInfo } from "./projectInfo";

export const defaultBoardName = "Spratna tabla ST-1";
export const defaultRowCapacity = 12;
export const defaultProject = {
  boardName: defaultBoardName,
  projectInfo: defaultProjectInfo,
};

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
        loadKw: "",
        description: "Zastitna sklopka",
      },
      { id: createId(), type: "breaker", poles: 1, icon: "light", label: "F1", amp: "B10", phase: "L1", loadKw: "0.8", description: "Rasveta dnevna soba" },
      { id: createId(), type: "breaker", poles: 1, icon: "outlet", label: "F2", amp: "B16", phase: "L2", loadKw: "2.5", description: "Uticnice kuhinja" },
    ],
  },
];
