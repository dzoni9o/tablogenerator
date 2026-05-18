import { createInitialRows, defaultBoardName } from "../data/initialBoard";
import { defaultProjectInfo } from "../data/projectInfo";

const storageKey = "tablogenerator.project.v2";
const recentProjectsKey = "tablogenerator.recent.v1";
const hiddenRecentProjectsKey = "tablogenerator.recent.hidden.v1";
const projectVersion = 2;

export function createProject(boardName, rows, projectInfo = defaultProjectInfo) {
  return {
    version: projectVersion,
    savedAt: new Date().toISOString(),
    boardName: boardName || defaultBoardName,
    projectInfo: normalizeProjectInfo(projectInfo),
    rows,
  };
}

export function readSavedProject() {
  try {
    const raw = localStorage.getItem(storageKey) ?? localStorage.getItem("tablogenerator.project.v1");
    if (!raw) return null;
    return normalizeProject(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveProjectToLocalStorage(boardName, rows, projectInfo) {
  const project = createProject(boardName, rows, projectInfo);
  localStorage.setItem(storageKey, JSON.stringify(project));
  saveRecentProject(project);
  return project.savedAt;
}

export function downloadProjectJson(boardName, rows, projectInfo) {
  const project = createProject(boardName, rows, projectInfo);
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${safeFileName(boardName || "tabla")}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function parseProjectJson(text) {
  return normalizeProject(JSON.parse(text));
}

export function createBlankProject() {
  return {
    boardName: defaultBoardName,
    projectInfo: defaultProjectInfo,
    rows: createInitialRows(),
  };
}

export function readRecentProjects() {
  try {
    const hidden = readHiddenRecentProjects();
    return readRecentProjectsRaw().filter((item) => !hidden.includes(getRecentIdentity(item)));
  } catch {
    return [];
  }
}

export function deleteRecentProject(savedAt) {
  const recent = readRecentProjectsRaw();
  const removedItem = recent.find((item) => item.savedAt === savedAt);
  const removedIdentity = removedItem ? getRecentIdentity(removedItem) : null;
  const hidden = removedIdentity ? [...new Set([...readHiddenRecentProjects(), removedIdentity])] : readHiddenRecentProjects();
  const next = recent.filter((item) => item.savedAt !== savedAt && (!removedIdentity || getRecentIdentity(item) !== removedIdentity));

  localStorage.setItem(hiddenRecentProjectsKey, JSON.stringify(hidden));
  localStorage.setItem(recentProjectsKey, JSON.stringify(next));
  return next;
}

function normalizeProject(project) {
  if (!project || typeof project !== "object") {
    throw new Error("JSON fajl nije projekat table.");
  }

  const rows = Array.isArray(project.rows) ? project.rows : null;
  if (!rows) throw new Error("JSON fajl nema listu redova.");

  return {
    boardName: typeof project.boardName === "string" ? project.boardName : defaultBoardName,
    projectInfo: normalizeProjectInfo(project.projectInfo),
    rows: rows.map(normalizeRow),
  };
}

function normalizeProjectInfo(info = {}) {
  return {
    ...defaultProjectInfo,
    ...Object.fromEntries(
      Object.entries(info ?? {}).map(([key, value]) => [key, typeof value === "string" ? value : ""]),
    ),
  };
}

function normalizeRow(row, rowIndex) {
  return {
    id: asString(row.id, `row-${rowIndex + 1}`),
    name: asString(row.name, `Red ${rowIndex + 1}`),
    capacity: Math.max(1, Math.min(50, Number(row.capacity) || 12)),
    breakers: Array.isArray(row.breakers) ? row.breakers.map(normalizeBreaker) : [],
  };
}

function normalizeBreaker(breaker, index) {
  return {
    id: asString(breaker.id, `breaker-${index + 1}`),
    type: asString(breaker.type, "breaker"),
    poles: Number(breaker.poles) || 1,
    icon: asString(breaker.icon, breaker.type === "neutral" ? "none" : "light"),
    linkedFidId: breaker.linkedFidId ?? null,
    label: asString(breaker.label, `F${index + 1}`),
    amp: asString(breaker.amp, "B16"),
    phase: asString(breaker.phase, breaker.type === "neutral" || breaker.type === "busbar" ? "NPE" : "L1"),
    loadW: normalizeLoadWatts(breaker),
    description: asString(breaker.description, "Bez opisa"),
  };
}

function normalizeLoadWatts(breaker) {
  if (typeof breaker.loadW === "string") return breaker.loadW;
  if (typeof breaker.loadKw !== "string" || !breaker.loadKw) return "";

  const legacyValue = Number(breaker.loadKw.replace(",", "."));
  if (!Number.isFinite(legacyValue) || legacyValue <= 0) return "";
  return String(Math.round(legacyValue * 1000));
}

function asString(value, fallback) {
  return typeof value === "string" ? value : fallback;
}

function safeFileName(value) {
  return value.replace(/[\\/:*?"<>|]/g, "-").trim() || "tabla";
}

function saveRecentProject(project) {
  const recent = readRecentProjectsRaw();
  const hidden = readHiddenRecentProjects();
  const summary = {
    boardName: project.boardName,
    objectName: project.projectInfo.objectName,
    savedAt: project.savedAt,
    project,
  };
  const summaryIdentity = getRecentIdentity(summary);

  if (hidden.includes(summaryIdentity)) {
    const nextWithoutHidden = recent.filter((item) => getRecentIdentity(item) !== summaryIdentity);
    localStorage.setItem(recentProjectsKey, JSON.stringify(nextWithoutHidden));
    return;
  }

  const next = [summary, ...recent.filter((item) => item.boardName !== project.boardName)].slice(0, 5);
  localStorage.setItem(recentProjectsKey, JSON.stringify(next));
}

function readHiddenRecentProjects() {
  try {
    return JSON.parse(localStorage.getItem(hiddenRecentProjectsKey) ?? "[]");
  } catch {
    return [];
  }
}

function readRecentProjectsRaw() {
  try {
    return JSON.parse(localStorage.getItem(recentProjectsKey) ?? "[]");
  } catch {
    return [];
  }
}

function getRecentIdentity(item) {
  return [item.boardName || "", item.objectName || item.project?.projectInfo?.objectName || ""].join("::");
}
