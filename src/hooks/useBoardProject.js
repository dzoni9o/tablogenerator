import { useMemo, useState } from "react";
import { createBlankRows, createInitialRows, defaultBoardName } from "../data/initialBoard";
import { defaultProjectInfo } from "../data/projectInfo";
import {
  createBreakerWithParams,
  createCatalogBreaker,
  createCustomElement,
  createFid,
  createNeutralSwitch,
  getAmpLimit,
  labelLimit,
  descriptionLimit,
} from "../utils/breakerFactory";
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
import { useProjectAutosave } from "./useProjectAutosave";
import { useTimedMessage } from "./useTimedMessage";
import { downloadProjectJson, parseProjectJson, readSavedProject, shareProjectJson } from "../utils/projectStorage";
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
  const [breakerTargetRow, setBreakerTargetRow] = useState(null);
  const [customElementTargetRow, setCustomElementTargetRow] = useState(null);
  const [catalogTargetRow, setCatalogTargetRow] = useState(null);
  const [importError, setImportError] = useState("");
  const [capacityMessage, setCapacityMessage] = useTimedMessage(2000);
  const [pastRows, setPastRows] = useState([]);
  const [futureRows, setFutureRows] = useState([]);
  const { autosavedAt } = useProjectAutosave(boardName, rows, projectInfo);

  const selectedBreaker = useMemo(() => findBreaker(rows, selected), [rows, selected]);
  const selectedRow = useMemo(() => findBreakerRow(rows, selected), [rows, selected]);
  const breakerCount = useMemo(() => getBreakerCount(rows), [rows]);
  const usedModules = useMemo(() => getTotalUsedModules(rows), [rows]);
  const totalCapacity = useMemo(() => getTotalCapacity(rows), [rows]);
  const phaseBalance = useMemo(() => calculatePhaseBalance(rows), [rows]);

  function commitRows(updater, options = {}) {
    const { history = true } = options;

    setRows((current) => {
      if (history) {
        setPastRows((past) => [...past.slice(-19), current]);
        setFutureRows([]);
      }

      return typeof updater === "function" ? updater(current) : updater;
    });
  }

  function showCapacityMessage(row, breaker) {
    setCapacityMessage({
      rowId: row.id,
      id: createId(),
      text: `${row.name || "Red"} ima kapacitet ${row.capacity}M. Element ${breaker.label || breaker.type} zauzima ${breaker.poles || 1}M.`,
    });
  }

  function updateProjectInfo(field, value) {
    setProjectInfo((current) => ({ ...current, [field]: value }));
  }

  function addRowAfter(rowId) {
    commitRows((current) => {
      const rowIndex = current.findIndex((row) => row.id === rowId);
      const nextRow = {
        id: createId(),
        name: `Red ${current.length + 1}`,
        capacity: 12,
        breakers: [],
      };

      if (rowIndex === -1) return [...current, nextRow];
      return [...current.slice(0, rowIndex + 1), nextRow, ...current.slice(rowIndex + 1)];
    });
  }

  function removeRow(rowId) {
    commitRows((current) => {
      const nextRows = current.filter((row) => row.id !== rowId);
      const safeRows = nextRows.length > 0 ? nextRows : createBlankRows();
      const stillSelected = safeRows.some((row) => row.breakers.some((breaker) => breaker.id === selected));

      if (!stillSelected) {
        setSelected(safeRows[0]?.breakers[0]?.id ?? null);
        setEditorOpen(false);
      }

      return safeRows;
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

        setCapacityMessage(null);
        setSelected(breaker.id);
        return { ...row, breakers: [...row.breakers, breaker] };
      }),
    );
    setCatalogTargetRow(null);
  }

  function addBreaker(rowId, params = null) {
    if (!params) {
      setBreakerTargetRow(rowId);
      return;
    }

    const targetRow = rows.find((row) => row.id === rowId);
    const breakerCount = rows.flatMap((currentRow) => currentRow.breakers).filter((breaker) => breaker.type === "breaker").length + 1;
    const breaker = createBreakerWithParams(breakerCount, params);

    if (!targetRow || !canFitBreaker(targetRow, breaker)) {
      if (targetRow) showCapacityMessage(targetRow, breaker);
      setBreakerTargetRow(null);
      return;
    }

    commitRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) return row;

        setCapacityMessage(null);
        setSelected(breaker.id);
        return { ...row, breakers: [...row.breakers, breaker] };
      }),
    );
    setBreakerTargetRow(null);
  }

  function addCustomElement(rowId, poles = null) {
    if (poles === null) {
      setCustomElementTargetRow(rowId);
      return;
    }

    const targetRow = rows.find((row) => row.id === rowId);
    const element = createCustomElement(poles);

    if (!targetRow || !canFitBreaker(targetRow, element)) {
      if (targetRow) showCapacityMessage(targetRow, element);
      setCustomElementTargetRow(null);
      return;
    }

    commitRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) return row;

        setCapacityMessage(null);
        setSelected(element.id);
        setOriginalBreaker(null);
        setEditorOpen(true);
        setCustomElementTargetRow(null);
        return { ...row, breakers: [...row.breakers, element] };
      }),
    );
  }

  function addFid(rowId, phaseOrParams = "single", withNeutral = false, params = {}) {
    const fidParams = typeof phaseOrParams === "object" && phaseOrParams ? phaseOrParams : params;
    const phase = typeof phaseOrParams === "string" ? phaseOrParams : fidParams.phase || "single";
    const targetRow = rows.find((row) => row.id === rowId);
    const allBreakers = rows.flatMap((currentRow) => currentRow.breakers);
    const fidCount = allBreakers.filter((breaker) => breaker.type === "fid").length + 1;
    const fid = createFid(phase, fidCount, fidParams);
    const neutralCount = allBreakers.filter((breaker) => breaker.type === "neutral").length + 1;
    const neutral = createNeutralSwitch(neutralCount, fid.id);
    const includeNeutral = Boolean(fidParams.withNeutral ?? withNeutral);
    const newBreakers = includeNeutral ? [fid, neutral] : [fid];
    const neededModules = newBreakers.reduce((total, breaker) => total + (Number(breaker.poles) || 1), 0);
    const freeModules = targetRow
      ? (Number(targetRow.capacity) || 0) - targetRow.breakers.reduce((total, breaker) => total + (Number(breaker.poles) || 1), 0)
      : 0;

    if (!targetRow || neededModules > freeModules) {
      if (targetRow) {
        setCapacityMessage({
          rowId: targetRow.id,
          id: createId(),
          text: `${targetRow.name || "Red"} ima slobodno ${freeModules}M, a FID kombinacija trazi ${neededModules}M.`,
        });
      }
      setFidTargetRow(null);
      return;
    }

    commitRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) return row;

        setSelected(fid.id);
        setCapacityMessage(null);
        setEditorOpen(false);
        setFidTargetRow(null);
        return { ...row, breakers: [...row.breakers, ...newBreakers] };
      }),
    );
  }

  function addSpecial(rowId, type) {
    addCatalogItem(rowId, type);
  }

  function removeBreaker(rowId, breakerId) {
    if (capacityMessage?.rowId === rowId) setCapacityMessage(null);

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

    commitRows(
      (current) =>
        current.map((row) => ({
          ...row,
          breakers: row.breakers.map((breaker) => (breaker.id === selected ? { ...breaker, [field]: nextValue } : breaker)),
        })),
      { history: false },
    );
  }

  function moveSelected(direction) {
    if (!selected) return;

    commitRows((current) =>
      current.map((row) => ({
        ...row,
        breakers: moveBreakerInsideRow(row.breakers, selected, direction),
      })),
    );
  }

  function moveSelectedToRow(targetRowId) {
    if (!selected) return;

    const selectedRow = findBreakerRow(rows, selected);
    if (!selectedRow || selectedRow.id === targetRowId) return;

    if (!canMoveBreaker(rows, selected, targetRowId)) {
      const targetRow = rows.find((row) => row.id === targetRowId);
      const breaker = findBreaker(rows, selected);
      if (targetRow && breaker) showCapacityMessage(targetRow, breaker);
      return;
    }

    commitRows((current) => moveBreaker(current, selected, targetRowId));
    setCapacityMessage(null);
  }

  function duplicateSelectedBreaker() {
    const breaker = selectedBreaker;
    const row = selectedRow;
    if (!breaker || !row) return;

    const clone = {
      ...breaker,
      id: createId(),
      linkedFidId: null,
      label: nextCopyLabel(breaker.label),
    };

    if (!canFitBreaker(row, clone)) {
      showCapacityMessage(row, clone);
      return;
    }

    commitRows((current) =>
      current.map((currentRow) => {
        if (currentRow.id !== row.id) return currentRow;

        const selectedIndex = currentRow.breakers.findIndex((item) => item.id === breaker.id);
        const nextBreakers = [...currentRow.breakers];
        nextBreakers.splice(selectedIndex + 1, 0, clone);
        return { ...currentRow, breakers: nextBreakers };
      }),
    );
    setSelected(clone.id);
    setOriginalBreaker(null);
    setCapacityMessage(null);
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
    commitRows((current) => current.map((row) => (row.id === rowId ? { ...row, name } : row)), { history: false });
  }

  function updateRowCapacity(rowId, capacity) {
    const nextCapacity = Math.max(1, Math.min(50, Number(capacity) || 1));
    if (capacityMessage?.rowId === rowId) setCapacityMessage(null);
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
    setCapacityMessage(null);
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

  function shareJson() {
    return shareProjectJson(boardName, rows, projectInfo);
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
      setCustomElementTargetRow(null);
      setImportError("");
    } catch (error) {
      setImportError(error.message || "Ne mogu da ucitam projektni fajl.");
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
    setCustomElementTargetRow(null);
  }

  function loadProjectData({ boardName: name, projectInfo: info, rows: newRows }) {
    setBoardName(name ?? defaultBoardName);
    setProjectInfo(info ?? defaultProjectInfo);
    setRows(newRows ?? createBlankRows());
    setPastRows([]);
    setFutureRows([]);
    setSelected(newRows?.flatMap((row) => row.breakers)[0]?.id ?? null);
    setEditorOpen(false);
    setCustomElementTargetRow(null);
    setImportError("");
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
    breakerTargetRow,
    customElementTargetRow,
    catalogTargetRow,
    autosavedAt,
    importError,
    capacityMessage,
    canUndo: pastRows.length > 0,
    canRedo: futureRows.length > 0,
    setBoardName,
    updateProjectInfo,
    setFidTargetRow,
    setBreakerTargetRow,
    setCustomElementTargetRow,
    setCatalogTargetRow,
    addRowAfter,
    removeRow,
    addBreaker,
    addFid,
    addSpecial,
    addCustomElement,
    addCatalogItem,
    removeBreaker,
    updateSelected,
    saveSelected,
    closeEditor,
    updateRowName,
    updateRowCapacity,
    moveSelected,
    moveSelectedToRow,
    duplicateSelectedBreaker,
    startDrag,
    clearDrag,
    allowDrop,
    dropBreaker,
    selectBreaker,
    exportJson,
    shareJson,
    importJsonFile,
    newProject,
    loadProjectData,
    undo,
    redo,
  };
}

function moveBreakerInsideRow(breakers, breakerId, direction) {
  const index = breakers.findIndex((breaker) => breaker.id === breakerId);
  if (index < 0) return breakers;

  const targetIndex = direction === "left" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= breakers.length) return breakers;

  const next = [...breakers];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}

function nextCopyLabel(label = "") {
  const cleanLabel = String(label || "").trim();
  const base = cleanLabel || "EL";
  return base.length >= labelLimit ? base : `${base}K`.slice(0, labelLimit);
}
