import { createInitialRows, defaultBoardName } from "../data/initialBoard";
import { defaultProjectInfo } from "../data/projectInfo";

const storageKey = "tablogenerator.project.v2";
const recentProjectsKey = "tablogenerator.recent.v1";
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
    return JSON.parse(localStorage.getItem(recentProjectsKey) ?? "[]");
  } catch {
    return [];
  }
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
    capacity: Number(row.capacity) || 12,
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
    loadKw: asString(breaker.loadKw, ""),
    description: asString(breaker.description, "Bez opisa"),
  };
}

function asString(value, fallback) {
  return typeof value === "string" ? value : fallback;
}

function safeFileName(value) {
  return value.replace(/[\\/:*?"<>|]/g, "-").trim() || "tabla";
}

function saveRecentProject(project) {
  const recent = readRecentProjects();
  const summary = {
    boardName: project.boardName,
    objectName: project.projectInfo.objectName,
    savedAt: project.savedAt,
    project,
  };
  const next = [summary, ...recent.filter((item) => item.boardName !== project.boardName)].slice(0, 5);
  localStorage.setItem(recentProjectsKey, JSON.stringify(next));
}
