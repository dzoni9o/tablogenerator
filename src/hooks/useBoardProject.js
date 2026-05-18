import { useEffect, useMemo, useState } from "react";
import { createBlankRows, createInitialRows, defaultBoardName } from "../data/initialBoard";
import { defaultProjectInfo } from "../data/projectInfo";
import { createRowsFromTemplate } from "../data/templates";
import { createCatalogBreaker, createFid, createNeutralSwitch, getAmpLimit, labelLimit, descriptionLimit } from "../utils/breakerFactory";
import {
  canFitBreaker,
  canMoveBreaker,
  findBreaker,
  findBreakerRow,
  getBreakerCount,
  getTotalCapacity,
  getTotalUsedModules,
  moveBreaker,
} from "../utils/boardOperations";
import { calculatePhaseBalance } from "../utils/phaseBalance";
import { downloadProjectJson, parseProjectJson, readRecentProjects, readSavedProject, saveProjectToLocalStorage } from "../utils/projectStorage";
import { createId } from "../utils/ids";

export function useBoardProject() {
  const savedProject = useMemo(() => readSavedProject(), []);
  const initialRows = useMemo(() => savedProject?.rows ?? createInitialRows(), [savedProject]);
  const [boardName, setBoardName] = useState(savedProject?.boardName ?? defaultBoardName);
  const [projectInfo, setProjectInfo] = useState(savedProject?.projectInfo ?? defaultProjectInfo);
  const [rows, setRows] = useState(initialRows);
  const [selected, setSelected] = useState(initialRows[0]?.breakers[0]?.id ?? null);
  const [dragging, setDragging] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [originalBreaker, setOriginalBreaker] = useState(null);
  const [fidTargetRow, setFidTargetRow] = useState(null);
  const [pendingFidPhase, setPendingFidPhase] = useState(null);
  const [catalogTargetRow, setCatalogTargetRow] = useState(null);
  const [autosavedAt, setAutosavedAt] = useState(null);
  const [importError, setImportError] = useState("");
  const [capacityMessage, setCapacityMessage] = useState("");
  const [recentProjects, setRecentProjects] = useState(() => readRecentProjects());
  const [pastRows, setPastRows] = useState([]);
  const [futureRows, setFutureRows] = useState([]);

  const selectedBreaker = useMemo(() => findBreaker(rows, selected), [rows, selected]);
  const selectedRow = useMemo(() => findBreakerRow(rows, selected), [rows, selected]);
  const breakerCount = useMemo(() => getBreakerCount(rows), [rows]);
  const usedModules = useMemo(() => getTotalUsedModules(rows), [rows]);
  const totalCapacity = useMemo(() => getTotalCapacity(rows), [rows]);
  const phaseBalance = useMemo(() => calculatePhaseBalance(rows), [rows]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAutosavedAt(saveProjectToLocalStorage(boardName, rows, projectInfo));
      setRecentProjects(readRecentProjects());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [boardName, rows, projectInfo]);

  function commitRows(updater) {
    setRows((current) => {
      setPastRows((past) => [...past.slice(-19), current]);
      setFutureRows([]);
      return typeof updater === "function" ? updater(current) : updater;
    });
  }

  function showCapacityMessage(row, breaker) {
    setCapacityMessage(`${row.name || "Red"} ima kapacitet ${row.capacity}M. Element ${breaker.label || breaker.type} zauzima ${breaker.poles || 1}M.`);
  }

  function updateProjectInfo(field, value) {
    setProjectInfo((current) => ({ ...current, [field]: value }));
  }

  function addRow() {
    commitRows((current) => [
      ...current,
      {
        id: createId(),
        name: `Red ${current.length + 1}`,
        capacity: 12,
        breakers: [],
      },
    ]);
  }

  function removeRow(rowId) {
    commitRows((current) => {
      const nextRows = current.filter((row) => row.id !== rowId);
      const stillSelected = nextRows.some((row) => row.breakers.some((breaker) => breaker.id === selected));

      if (!stillSelected) {
        setSelected(nextRows[0]?.breakers[0]?.id ?? null);
        setEditorOpen(false);
      }

      return nextRows;
    });
  }

  function addCatalogItem(rowId, type) {
    const targetRow = rows.find((row) => row.id === rowId);
    const sameTypeCount = rows.flatMap((currentRow) => currentRow.breakers).filter((breaker) => breaker.type === type).length + 1;
    const breaker = createCatalogBreaker(type, sameTypeCount);

    if (!targetRow || !canFitBreaker(targetRow, breaker)) {
      if (targetRow) showCapacityMessage(targetRow, breaker);
      setCatalogTargetRow(null);
      return;
    }

    commitRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) return row;

        setCapacityMessage("");
        setSelected(breaker.id);
        return { ...row, breakers: [...row.breakers, breaker] };
      }),
    );
    setCatalogTargetRow(null);
  }

  function addBreaker(rowId) {
    addCatalogItem(rowId, "breaker");
  }

  function addFid(rowId, phase, withNeutral = false) {
    const targetRow = rows.find((row) => row.id === rowId);
    const allBreakers = rows.flatMap((currentRow) => currentRow.breakers);
    const fidCount = allBreakers.filter((breaker) => breaker.type === "fid").length + 1;
    const fid = createFid(phase, fidCount);
    const neutralCount = allBreakers.filter((breaker) => breaker.type === "neutral").length + 1;
    const neutral = createNeutralSwitch(neutralCount, fid.id);
    const newBreakers = withNeutral ? [fid, neutral] : [fid];
    const neededModules = newBreakers.reduce((total, breaker) => total + (Number(breaker.poles) || 1), 0);
    const freeModules = targetRow
      ? (Number(targetRow.capacity) || 0) - targetRow.breakers.reduce((total, breaker) => total + (Number(breaker.poles) || 1), 0)
      : 0;

    if (!targetRow || neededModules > freeModules) {
      if (targetRow) setCapacityMessage(`${targetRow.name || "Red"} ima slobodno ${freeModules}M, a FID kombinacija trazi ${neededModules}M.`);
      setFidTargetRow(null);
      setPendingFidPhase(null);
      return;
    }

    commitRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) return row;

        setSelected(fid.id);
        setCapacityMessage("");
        setEditorOpen(false);
        setFidTargetRow(null);
        setPendingFidPhase(null);
        return { ...row, breakers: [...row.breakers, ...newBreakers] };
      }),
    );
  }

  function addSpecial(rowId, type) {
    addCatalogItem(rowId, type);
  }

  function removeBreaker(rowId, breakerId) {
    commitRows((current) => {
      const breakerToRemove = findBreaker(current, breakerId);
      const idsToRemove =
        breakerToRemove?.type === "fid"
          ? new Set([
              breakerId,
              ...current
                .flatMap((row) => row.breakers)
                .filter((breaker) => breaker.type === "neutral" && breaker.linkedFidId === breakerId)
                .map((breaker) => breaker.id),
            ])
          : new Set([breakerId]);

      const nextRows = current.map((row) => ({
        ...row,
        breakers: row.breakers.filter((breaker) => !idsToRemove.has(breaker.id)),
      }));

      if (idsToRemove.has(selected)) {
        setSelected(nextRows.flatMap((row) => row.breakers)[0]?.id ?? null);
        closeEditor();
      }

      return nextRows;
    });
  }

  function updateSelected(field, value) {
    const limit =
      field === "amp" ? getAmpLimit(selectedBreaker) : field === "label" ? labelLimit : field === "description" ? descriptionLimit : value.length;
    const nextValue = value.slice(0, limit);

    commitRows((current) =>
      current.map((row) => ({
        ...row,
        breakers: row.breakers.map((breaker) => (breaker.id === selected ? { ...breaker, [field]: nextValue } : breaker)),
      })),
    );
  }

  function saveSelected() {
    setEditorOpen(false);
    setOriginalBreaker(null);
  }

  function closeEditor() {
    if (originalBreaker) {
      commitRows((current) =>
        current.map((row) => ({
          ...row,
          breakers: row.breakers.map((breaker) => (breaker.id === originalBreaker.id ? originalBreaker : breaker)),
        })),
      );
    }

    setEditorOpen(false);
    setOriginalBreaker(null);
  }

  function updateRowName(rowId, name) {
    commitRows((current) => current.map((row) => (row.id === rowId ? { ...row, name } : row)));
  }

  function updateRowCapacity(rowId, capacity) {
    const nextCapacity = Math.max(1, Math.min(72, Number(capacity) || 1));
    commitRows((current) => current.map((row) => (row.id === rowId ? { ...row, capacity: nextCapacity } : row)));
  }

  function startDrag(event, breakerId) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", breakerId);
    setDragging(breakerId);
    setSelected(breakerId);
    closeEditor();
  }

  function clearDrag() {
    setDragging(null);
    setDropTarget(null);
  }

  function allowDrop(event, rowId, breakerId = null) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTarget({ rowId, breakerId });
  }

  function dropBreaker(event, rowId, breakerId = null) {
    event.preventDefault();
    const draggedId = event.dataTransfer.getData("text/plain") || dragging;

    if (!draggedId || draggedId === breakerId) {
      clearDrag();
      return;
    }

    if (!canMoveBreaker(rows, draggedId, rowId)) {
      const targetRow = rows.find((row) => row.id === rowId);
      const breaker = findBreaker(rows, draggedId);
      if (targetRow && breaker) showCapacityMessage(targetRow, breaker);
      clearDrag();
      return;
    }

    commitRows((current) => moveBreaker(current, draggedId, rowId, breakerId));
    setSelected(draggedId);
    setCapacityMessage("");
    clearDrag();
  }

  function selectBreaker(breaker) {
    setSelected(breaker.id);
    setOriginalBreaker({ ...breaker });
    setEditorOpen(true);
  }

  function exportJson() {
    downloadProjectJson(boardName, rows, projectInfo);
  }

  async function importJsonFile(file) {
    if (!file) return;

    try {
      const project = parseProjectJson(await file.text());
      setBoardName(project.boardName);
      setProjectInfo(project.projectInfo);
      setRows(project.rows);
      setPastRows([]);
      setFutureRows([]);
      setSelected(project.rows.flatMap((row) => row.breakers)[0]?.id ?? null);
      setEditorOpen(false);
      setImportError("");
    } catch (error) {
      setImportError(error.message || "Ne mogu da ucitam JSON fajl.");
    }
  }

  function loadProject(project) {
    try {
      const normalized = parseProjectJson(JSON.stringify(project));
      setBoardName(normalized.boardName);
      setProjectInfo(normalized.projectInfo);
      setRows(normalized.rows);
      setPastRows([]);
      setFutureRows([]);
      setSelected(normalized.rows.flatMap((row) => row.breakers)[0]?.id ?? null);
      setEditorOpen(false);
      setImportError("");
    } catch {
      setImportError("Ne mogu da ucitam sacuvani projekat.");
    }
  }

  function newProject() {
    const nextRows = createBlankRows();
    setBoardName(defaultBoardName);
    setProjectInfo(defaultProjectInfo);
    setRows(nextRows);
    setPastRows([]);
    setFutureRows([]);
    setSelected(null);
    setEditorOpen(false);
  }

  function duplicateProject() {
    setBoardName(`${boardName} kopija`);
  }

  function applyTemplate(templateId) {
    const nextRows = createRowsFromTemplate(templateId);
    commitRows(nextRows);
    setSelected(nextRows.flatMap((row) => row.breakers)[0]?.id ?? null);
    setEditorOpen(false);
  }

  function undo() {
    setPastRows((past) => {
      if (past.length === 0) return past;
      const previous = past[past.length - 1];
      setFutureRows((future) => [rows, ...future].slice(0, 20));
      setRows(previous);
      setSelected(previous.flatMap((row) => row.breakers)[0]?.id ?? null);
      setEditorOpen(false);
      return past.slice(0, -1);
    });
  }

  function redo() {
    setFutureRows((future) => {
      if (future.length === 0) return future;
      const next = future[0];
      setPastRows((past) => [...past.slice(-19), rows]);
      setRows(next);
      setSelected(next.flatMap((row) => row.breakers)[0]?.id ?? null);
      setEditorOpen(false);
      return future.slice(1);
    });
  }

  return {
    boardName,
    projectInfo,
    rows,
    selected,
    selectedBreaker,
    selectedRow,
    breakerCount,
    usedModules,
    totalCapacity,
    phaseBalance,
    dragging,
    dropTarget,
    editorOpen,
    fidTargetRow,
    pendingFidPhase,
    catalogTargetRow,
    autosavedAt,
    importError,
    capacityMessage,
    recentProjects,
    canUndo: pastRows.length > 0,
    canRedo: futureRows.length > 0,
    setBoardName,
    updateProjectInfo,
    setFidTargetRow,
    setPendingFidPhase,
    setCatalogTargetRow,
    addRow,
    removeRow,
    addBreaker,
    addFid,
    addSpecial,
    addCatalogItem,
    removeBreaker,
    updateSelected,
    saveSelected,
    closeEditor,
    updateRowName,
    updateRowCapacity,
    startDrag,
    clearDrag,
    allowDrop,
    dropBreaker,
    selectBreaker,
    exportJson,
    importJsonFile,
    loadProject,
    newProject,
    duplicateProject,
    applyTemplate,
    undo,
    redo,
  };
}
