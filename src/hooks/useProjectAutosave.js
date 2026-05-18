import { useEffect, useState } from "react";
import { deleteRecentProject, readRecentProjects, saveProjectToLocalStorage } from "../utils/projectStorage";

export function useProjectAutosave(boardName, rows, projectInfo) {
  const [autosavedAt, setAutosavedAt] = useState(null);
  const [recentProjects, setRecentProjects] = useState(() => readRecentProjects());

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAutosavedAt(saveProjectToLocalStorage(boardName, rows, projectInfo));
      setRecentProjects(readRecentProjects());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [boardName, rows, projectInfo]);

  function removeRecentProject(savedAt) {
    setRecentProjects(deleteRecentProject(savedAt));
  }

  return {
    autosavedAt,
    recentProjects,
    removeRecentProject,
  };
}
