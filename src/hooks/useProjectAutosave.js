import { useEffect, useState } from "react";
import { saveProjectToLocalStorage } from "../utils/projectStorage";

export function useProjectAutosave(boardName, rows, projectInfo) {
  const [autosavedAt, setAutosavedAt] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAutosavedAt(saveProjectToLocalStorage(boardName, rows, projectInfo));
    }, 900);

    return () => window.clearTimeout(timer);
  }, [boardName, rows, projectInfo]);

  return {
    autosavedAt,
  };
}
