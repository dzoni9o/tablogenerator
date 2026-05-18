import { createInitialRows, defaultBoardName } from "../data/initialBoard";

const storageKey = "tablogenerator.project.v1";
const projectVersion = 1;

export function createProject(boardName, rows) {
  return {
    version: projectVersion,
    savedAt: new Date().toISOString(),
    boardName: boardName || defaultBoardName,
    rows,
  };
}

export function readSavedProject() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    return normalizeProject(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveProjectToLocalStorage(boardName, rows) {
  const project = createProject(boardName, rows);
  localStorage.setItem(storageKey, JSON.stringify(project));
  return project.savedAt;
}

export function downloadProjectJson(boardName, rows) {
  const project = createProject(boardName, rows);
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
    rows: createInitialRows(),
  };
}

function normalizeProject(project) {
  if (!project || typeof project !== "object") {
    throw new Error("JSON fajl nije projekat table.");
  }

  const rows = Array.isArray(project.rows) ? project.rows : null;
  if (!rows) throw new Error("JSON fajl nema listu redova.");

  return {
    boardName: typeof project.boardName === "string" ? project.boardName : defaultBoardName,
    rows: rows.map(normalizeRow),
  };
}

function normalizeRow(row, rowIndex) {
  return {
    id: asString(row.id, `row-${rowIndex + 1}`),
    name: asString(row.name, `Red ${rowIndex + 1}`),
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
    description: asString(breaker.description, "Bez opisa"),
  };
}

function asString(value, fallback) {
  return typeof value === "string" ? value : fallback;
}

function safeFileName(value) {
  return value.replace(/[\\/:*?"<>|]/g, "-").trim() || "tabla";
}
