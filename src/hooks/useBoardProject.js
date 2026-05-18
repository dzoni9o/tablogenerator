import { useEffect, useMemo, useState } from "react";
import { createInitialRows, defaultBoardName } from "../data/initialBoard";
import { createBell, createBreaker, createFid, createNeutralSwitch, getAmpLimit, labelLimit, descriptionLimit } from "../utils/breakerFactory";
import { findBreaker, findBreakerRow, getBreakerCount, moveBreaker } from "../utils/boardOperations";
import { downloadProjectJson, parseProjectJson, readSavedProject, saveProjectToLocalStorage } from "../utils/projectStorage";
import { createId } from "../utils/ids";

export function useBoardProject() {
  const savedProject = useMemo(() => readSavedProject(), []);
  const [boardName, setBoardName] = useState(savedProject?.boardName ?? defaultBoardName);
  const [rows, setRows] = useState(savedProject?.rows ?? createInitialRows());
  const [selected, setSelected] = useState((savedProject?.rows ?? [])[0]?.breakers[0]?.id ?? null);
  const [dragging, setDragging] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [originalBreaker, setOriginalBreaker] = useState(null);
  const [fidTargetRow, setFidTargetRow] = useState(null);
  const [pendingFidPhase, setPendingFidPhase] = useState(null);
  const [autosavedAt, setAutosavedAt] = useState(null);
  const [importError, setImportError] = useState("");

  const selectedBreaker = useMemo(() => findBreaker(rows, selected), [rows, selected]);
  const selectedRow = useMemo(() => findBreakerRow(rows, selected), [rows, selected]);
  const breakerCount = useMemo(() => getBreakerCount(rows), [rows]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAutosavedAt(saveProjectToLocalStorage(boardName, rows));
    }, 350);

    return () => window.clearTimeout(timer);
  }, [boardName, rows]);

  function addRow() {
    setRows((current) => [
      ...current,
      {
        id: createId(),
        name: `Red ${current.length + 1}`,
        breakers: [],
      },
    ]);
  }

  function removeRow(rowId) {
    setRows((current) => {
      const nextRows = current.filter((row) => row.id !== rowId);
      const stillSelected = nextRows.some((row) => row.breakers.some((breaker) => breaker.id === selected));

      if (!stillSelected) {
        setSelected(nextRows[0]?.breakers[0]?.id ?? null);
        setEditorOpen(false);
      }

      return nextRows;
    });
  }

  function addBreaker(rowId) {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) return row;

        const breaker = createBreaker(getBreakerCount(current) + 1);
        setSelected(breaker.id);
        return { ...row, breakers: [...row.breakers, breaker] };
      }),
    );
  }

  function addFid(rowId, phase, withNeutral = false) {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) return row;

        const allBreakers = current.flatMap((currentRow) => currentRow.breakers);
        const fidCount = allBreakers.filter((breaker) => breaker.type === "fid").length + 1;
        const fid = createFid(phase, fidCount);
        const neutralCount = allBreakers.filter((breaker) => breaker.type === "neutral").length + 1;
        const neutral = createNeutralSwitch(neutralCount, fid.id);

        setSelected(fid.id);
        setEditorOpen(false);
        setFidTargetRow(null);
        setPendingFidPhase(null);
        return { ...row, breakers: withNeutral ? [...row.breakers, fid, neutral] : [...row.breakers, fid] };
      }),
    );
  }

  function addSpecial(rowId, type) {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) return row;

        const allBreakers = current.flatMap((currentRow) => currentRow.breakers);
        const specialCount = allBreakers.filter((breaker) => breaker.type === type).length + 1;
        const breaker = type === "neutral" ? createNeutralSwitch(specialCount) : createBell(specialCount);

        setSelected(breaker.id);
        return { ...row, breakers: [...row.breakers, breaker] };
      }),
    );
  }

  function removeBreaker(rowId, breakerId) {
    setRows((current) => {
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

    setRows((current) =>
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
      setRows((current) =>
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
    setRows((current) => current.map((row) => (row.id === rowId ? { ...row, name } : row)));
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

    setRows((current) => moveBreaker(current, draggedId, rowId, breakerId));
    setSelected(draggedId);
    clearDrag();
  }

  function selectBreaker(breaker) {
    setSelected(breaker.id);
    setOriginalBreaker({ ...breaker });
    setEditorOpen(true);
  }

  function exportJson() {
    downloadProjectJson(boardName, rows);
  }

  async function importJsonFile(file) {
    if (!file) return;

    try {
      const project = parseProjectJson(await file.text());
      setBoardName(project.boardName);
      setRows(project.rows);
      setSelected(project.rows.flatMap((row) => row.breakers)[0]?.id ?? null);
      setEditorOpen(false);
      setImportError("");
    } catch (error) {
      setImportError(error.message || "Ne mogu da ucitam JSON fajl.");
    }
  }

  return {
    boardName,
    rows,
    selected,
    selectedBreaker,
    selectedRow,
    breakerCount,
    dragging,
    dropTarget,
    editorOpen,
    fidTargetRow,
    pendingFidPhase,
    autosavedAt,
    importError,
    setBoardName,
    setFidTargetRow,
    setPendingFidPhase,
    addRow,
    removeRow,
    addBreaker,
    addFid,
    addSpecial,
    removeBreaker,
    updateSelected,
    saveSelected,
    closeEditor,
    updateRowName,
    startDrag,
    clearDrag,
    allowDrop,
    dropBreaker,
    selectBreaker,
    exportJson,
    importJsonFile,
  };
}
