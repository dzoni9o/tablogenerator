import React, { useMemo, useRef, useState } from "react";

const createBreaker = (index) => ({
  id: crypto.randomUUID(),
  type: "breaker",
  poles: 1,
  icon: "light",
  label: `F${index}`,
  amp: "B16",
  description: "Novi osigurac",
});

const createFid = (phase, index) => ({
  id: crypto.randomUUID(),
  type: "fid",
  poles: phase === "three" ? 4 : 2,
  icon: "shield",
  label: phase === "three" ? `FID 3F ${index}` : `FID 1F ${index}`,
  amp: phase === "three" ? "40A/4P" : "40A/2P",
  description: phase === "three" ? "Trofazna FID zastita" : "Monofazna FID zastita",
});

const createNeutralSwitch = (index, linkedFidId = null) => ({
  id: crypto.randomUUID(),
  type: "neutral",
  poles: 2,
  icon: "none",
  linkedFidId,
  label: `N ${index}`,
  amp: "2P",
  description: "Zastitnik od prekida nultog voda",
});

const createBell = (index) => ({
  id: crypto.randomUUID(),
  type: "bell",
  poles: 1,
  icon: "bell",
  label: `ZV${index}`,
  amp: "230V",
  description: "Zvonce",
});

const consumerIcons = [
  { id: "light", label: "Sijalica", path: "M12 3a5 5 0 0 0-3 9v2h6v-2a5 5 0 0 0-3-9Zm-2 14h4m-3 3h2" },
  { id: "outlet", label: "Uticnica", path: "M7 5h10v14H7V5Zm3 5v3m4-3v3m-5 3h6" },
  { id: "oven", label: "Rerna", path: "M5 5h14v14H5V5Zm3 3h8m-7 4h6v4H9v-4Zm8-4h.01" },
  { id: "boiler", label: "Bojler", path: "M8 3h8v18H8V3Zm2 4h4m-2 3a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z" },
  { id: "ac", label: "Klima", path: "M4 6h16v7H4V6Zm2 3h12m-9 7c1 1 1 2 0 3m4-3c1 1 1 2 0 3m4-3c1 1 1 2 0 3" },
  { id: "heat", label: "Grejanje", path: "M8 19c-2-2-2-4 0-6c2-2 2-4 0-6m4 12c-2-2-2-4 0-6c2-2 2-4 0-6m4 12c-2-2-2-4 0-6c2-2 2-4 0-6" },
  { id: "washer", label: "Ves masina", path: "M6 4h12v16H6V4Zm3 3h.01M12 10a4 4 0 1 0 0 8a4 4 0 0 0 0-8Z" },
  { id: "fridge", label: "Frizider", path: "M8 3h8v18H8V3Zm0 8h8m-5-5v2m0 6v2" },
  { id: "pump", label: "Pumpa", path: "M5 13h8a4 4 0 0 0 0-8H9v8m4 0 5 5m-9-9h4m-8 8h5" },
  { id: "shield", label: "Zastita", path: "M12 3 19 6v5c0 5-3 8-7 10c-4-2-7-5-7-10V6l7-3Zm-3 8 2 2 4-5" },
  { id: "bell", label: "Zvonce", path: "M15 17H9m6 0a3 3 0 0 1-6 0m6 0h4l-2-3V9a5 5 0 0 0-10 0v5l-2 3h4m3-14V2" },
  { id: "general", label: "Ostalo", path: "M12 5v14m-7-7h14" },
];

function ConsumerIcon({ name }) {
  const icon = consumerIcons.find((item) => item.id === name) ?? consumerIcons[0];

  return (
    <svg className="consumer-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={icon.path} />
    </svg>
  );
}

const getAmpLimit = (breaker) => (breaker?.type === "fid" ? 10 : 4);
const labelLimit = 5;
const descriptionLimit = 70;

const initialRows = [
  {
    id: crypto.randomUUID(),
    name: "Red 1",
    breakers: [
      {
        id: crypto.randomUUID(),
        type: "fid",
        poles: 2,
        label: "FID",
        amp: "40A/2P",
        description: "Zastitna sklopka",
      },
      { id: crypto.randomUUID(), label: "F1", amp: "B10", description: "Rasveta dnevna soba" },
      { id: crypto.randomUUID(), label: "F2", amp: "B16", description: "Uticnice kuhinja" },
    ],
  },
];

function moveBreaker(rows, breakerId, targetRowId, targetBreakerId = null) {
  let movedBreaker = null;

  const rowsWithoutBreaker = rows.map((row) => {
    const breakers = row.breakers.filter((breaker) => {
      if (breaker.id !== breakerId) return true;
      movedBreaker = breaker;
      return false;
    });

    return { ...row, breakers };
  });

  if (!movedBreaker) return rows;

  return rowsWithoutBreaker.map((row) => {
    if (row.id !== targetRowId) return row;

    const insertIndex = targetBreakerId
      ? row.breakers.findIndex((breaker) => breaker.id === targetBreakerId)
      : row.breakers.length;
    const safeIndex = insertIndex < 0 ? row.breakers.length : insertIndex;
    const nextBreakers = [...row.breakers];

    nextBreakers.splice(safeIndex, 0, movedBreaker);
    return { ...row, breakers: nextBreakers };
  });
}

export default function App() {
  const boardRef = useRef(null);
  const [boardName, setBoardName] = useState("Spratna tabla ST-1");
  const [rows, setRows] = useState(initialRows);
  const [selected, setSelected] = useState(initialRows[0].breakers[0].id);
  const [dragging, setDragging] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [originalBreaker, setOriginalBreaker] = useState(null);
  const [fidTargetRow, setFidTargetRow] = useState(null);
  const [pendingFidPhase, setPendingFidPhase] = useState(null);

  const selectedBreaker = useMemo(() => {
    return rows.flatMap((row) => row.breakers).find((breaker) => breaker.id === selected) ?? null;
  }, [rows, selected]);

  const selectedRow = useMemo(() => {
    return rows.find((row) => row.breakers.some((breaker) => breaker.id === selected)) ?? null;
  }, [rows, selected]);

  const breakerCount = rows.reduce((total, row) => total + row.breakers.length, 0);

  function addRow() {
    const nextRow = {
      id: crypto.randomUUID(),
      name: `Red ${rows.length + 1}`,
      breakers: [],
    };

    setRows((current) => [...current, nextRow]);
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

        const breaker = createBreaker(breakerCount + 1);
        setSelected(breaker.id);
        return { ...row, breakers: [...row.breakers, breaker] };
      }),
    );
  }

  function addFid(rowId, phase, withNeutral = false) {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) return row;

        const fidCount =
          current.flatMap((currentRow) => currentRow.breakers).filter((breaker) => breaker.type === "fid").length + 1;
        const fid = createFid(phase, fidCount);
        const allBreakers = current.flatMap((currentRow) => currentRow.breakers);
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
      const breakerToRemove = current.flatMap((row) => row.breakers).find((breaker) => breaker.id === breakerId);
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
        const fallback = nextRows.flatMap((row) => row.breakers)[0]?.id ?? null;
        setSelected(fallback);
        closeEditor();
      }

      return nextRows;
    });
  }

  function updateSelected(field, value) {
    const limit =
      field === "amp"
        ? getAmpLimit(selectedBreaker)
        : field === "label"
          ? labelLimit
          : field === "description"
            ? descriptionLimit
            : value.length;
    const nextValue = value.slice(0, limit);

    setRows((current) =>
      current.map((row) => ({
        ...row,
        breakers: row.breakers.map((breaker) =>
          breaker.id === selected ? { ...breaker, [field]: nextValue } : breaker,
        ),
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

  async function exportPdf() {
    if (!boardRef.current) return;

    const [{ jsPDF }, html2canvasModule] = await Promise.all([import("jspdf"), import("html2canvas")]);
    const html2canvas = html2canvasModule.default;
    const exportNode = boardRef.current.cloneNode(true);
    const exportWrap = document.createElement("div");
    const title = document.createElement("h1");

    title.textContent = boardName || "Nova tabla";
    exportWrap.className = "pdf-export";
    exportNode.querySelector(".board-head")?.remove();
    exportNode.querySelectorAll(".row-toolbar").forEach((node) => node.remove());
    exportNode.querySelectorAll(".breaker.active").forEach((node) => node.classList.remove("active"));
    exportWrap.append(title, exportNode);
    document.body.append(exportWrap);

    try {
      const canvas = await html2canvas(exportWrap, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const footerHeight = 10;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2 - footerHeight;
      const pageCanvasHeight = Math.floor((contentHeight * canvas.width) / contentWidth);
      const pageCount = Math.max(1, Math.ceil(canvas.height / pageCanvasHeight));

      for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
        if (pageIndex > 0) pdf.addPage();

        const sliceCanvas = document.createElement("canvas");
        const sliceContext = sliceCanvas.getContext("2d");
        const sourceY = pageIndex * pageCanvasHeight;
        const sliceHeight = Math.min(pageCanvasHeight, canvas.height - sourceY);

        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeight;
        sliceContext.fillStyle = "#ffffff";
        sliceContext.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        sliceContext.drawImage(canvas, 0, sourceY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

        const imageData = sliceCanvas.toDataURL("image/png");
        const imageHeight = (sliceHeight * contentWidth) / canvas.width;

        pdf.addImage(imageData, "PNG", margin, margin, contentWidth, imageHeight);
        pdf.setFontSize(9);
        pdf.setTextColor(105, 114, 125);
        pdf.text(`Strana ${pageIndex + 1} / ${pageCount}`, pageWidth / 2, pageHeight - 7, { align: "center" });
      }

      pdf.save(`${(boardName || "tabla").replace(/[\\/:*?"<>|]/g, "-")}.pdf`);
    } finally {
      exportWrap.remove();
    }
  }

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <p>Elektro tabla</p>
          <input
            aria-label="Naziv table"
            className="board-name"
            value={boardName}
            onChange={(event) => setBoardName(event.target.value)}
          />
        </div>
      </header>

      <section className="workspace">
        <section ref={boardRef} className="board" aria-label="Raspored osiguraca" data-board-name={boardName || "Nova tabla"}>
          <div className="board-head">
            <strong>{boardName || "Nova tabla"}</strong>
            <div className="board-actions">
              <span>
                {rows.length} redova / {breakerCount} osiguraca
              </span>
              <button type="button" onClick={addRow}>
                + Dodaj red
              </button>
              <button type="button" className="ghost" onClick={() => window.print()}>
                Stampaj
              </button>
              <button type="button" className="ghost" onClick={exportPdf}>
                Izvezi u PDF
              </button>
            </div>
          </div>

          <div className="rows">
            {rows.map((row) => (
              <section className="row" key={row.id} data-row-name={row.name || "Red"}>
                <div className="row-toolbar">
                  <input
                    aria-label="Naziv reda"
                    value={row.name}
                    onChange={(event) => updateRowName(row.id, event.target.value)}
                  />
                  <div>
                    <button type="button" onClick={() => addBreaker(row.id)}>
                      + Osigurac
                    </button>
                    <button type="button" className="ghost" onClick={() => setFidTargetRow(row.id)}>
                      + FID
                    </button>
                    <button type="button" className="ghost" onClick={() => addSpecial(row.id, "bell")}>
                      + Zvonce
                    </button>
                    <button type="button" className="ghost" onClick={() => removeRow(row.id)}>
                      Obrisi red
                    </button>
                  </div>
                </div>

                <div
                  className={
                    dropTarget?.rowId === row.id && !dropTarget.breakerId ? "breaker-row row-drop-target" : "breaker-row"
                  }
                  onDragOver={(event) => allowDrop(event, row.id)}
                  onDrop={(event) => dropBreaker(event, row.id)}
                >
                  {row.breakers.map((breaker) => (
                    <button
                      type="button"
                      className={[
                        "breaker",
                        breaker.type === "fid" ? "fid" : "",
                        breaker.type === "neutral" ? "neutral" : "",
                        breaker.type === "bell" ? "bell" : "",
                        breaker.id === selected ? "active" : "",
                        breaker.id === dragging ? "dragging" : "",
                        dropTarget?.breakerId === breaker.id ? "drop-target" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      draggable
                      key={breaker.id}
                      style={{ "--module-span": breaker.poles || 1 }}
                      onClick={() => {
                        setSelected(breaker.id);
                        setOriginalBreaker({ ...breaker });
                        setEditorOpen(true);
                      }}
                      onDragEnd={clearDrag}
                      onDragOver={(event) => {
                        event.stopPropagation();
                        allowDrop(event, row.id, breaker.id);
                      }}
                      onDragStart={(event) => startDrag(event, breaker.id)}
                      onDrop={(event) => {
                        event.stopPropagation();
                        dropBreaker(event, row.id, breaker.id);
                      }}
                    >
                      <strong>{breaker.amp || "-"}</strong>
                      <span className="breaker-label">{breaker.label || "-"}</span>
                      {breaker.icon !== "none" ? (
                        <span className="icon-slot" aria-hidden="true">
                          <ConsumerIcon name={breaker.icon} />
                        </span>
                      ) : (
                        <span className="icon-slot empty" aria-hidden="true" />
                      )}
                      <small>{breaker.description || "Bez opisa"}</small>
                    </button>
                  ))}

                  {row.breakers.length === 0 && <p className="empty-row">Dodaj prvi osigurac u ovaj red.</p>}
                </div>
              </section>
            ))}
          </div>
        </section>
      </section>

      {editorOpen && selectedBreaker && selectedRow && (
        <div className="modal-backdrop" onMouseDown={closeEditor}>
          <section className="breaker-modal" aria-label="Izmena osiguraca" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p>Izabran osigurac</p>
                <h2>{selectedBreaker.label || "Bez oznake"}</h2>
              </div>
              <button type="button" className="close-button" onClick={closeEditor}>
                Zatvori
              </button>
            </div>

            <label>
              Oznaka
              <input
                maxLength={labelLimit}
                value={selectedBreaker.label}
                onChange={(event) => updateSelected("label", event.target.value)}
              />
            </label>
            <label>
              Amperaza
              <input
                maxLength={getAmpLimit(selectedBreaker)}
                value={selectedBreaker.amp}
                onChange={(event) => updateSelected("amp", event.target.value)}
              />
            </label>
            <label>
              Opis za korisnika
              <textarea
                rows="5"
                maxLength={descriptionLimit}
                value={selectedBreaker.description}
                readOnly={selectedBreaker.type === "neutral"}
                onChange={(event) => updateSelected("description", event.target.value)}
              />
            </label>
            {selectedBreaker.type !== "bell" && selectedBreaker.type !== "neutral" && selectedBreaker.type !== "fid" && (
              <label>
                Slicica potrosaca
                <select value={selectedBreaker.icon || "light"} onChange={(event) => updateSelected("icon", event.target.value)}>
                  {consumerIcons.map((icon) => (
                    <option key={icon.id} value={icon.id}>
                      {icon.label}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="modal-actions">
              <button type="button" className="danger" onClick={() => removeBreaker(selectedRow.id, selectedBreaker.id)}>
                Obrisi osigurac
              </button>
              <button type="button" onClick={saveSelected}>
                Sacuvaj
              </button>
            </div>
          </section>
        </div>
      )}

      {fidTargetRow && (
        <div
          className="modal-backdrop"
          onMouseDown={() => {
            setFidTargetRow(null);
            setPendingFidPhase(null);
          }}
        >
          <section className="choice-modal" aria-label="Izbor FID sklopke" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p>Dodaj FID</p>
                <h2>{pendingFidPhase ? "Dodati i N prekid?" : "Izaberi tip zastite"}</h2>
              </div>
              <button
                type="button"
                className="close-button"
                onClick={() => {
                  setFidTargetRow(null);
                  setPendingFidPhase(null);
                }}
              >
                Zatvori
              </button>
            </div>

            <div className="fid-options">
              {!pendingFidPhase ? (
                <>
                  <button type="button" onClick={() => setPendingFidPhase("single")}>
                    <strong>Monofazni FID</strong>
                    <span>Zauzima sirinu 2 osiguraca</span>
                  </button>
                  <button type="button" onClick={() => setPendingFidPhase("three")}>
                    <strong>Trofazni FID</strong>
                    <span>Zauzima sirinu 4 osiguraca</span>
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => addFid(fidTargetRow, pendingFidPhase, true)}>
                    <strong>Da, dodaj N prekid</strong>
                    <span>Bice dodat odmah pored FID sklopke</span>
                  </button>
                  <button type="button" onClick={() => addFid(fidTargetRow, pendingFidPhase, false)}>
                    <strong>Ne, samo FID</strong>
                    <span>FID ostaje bez dodatnog N prekida</span>
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
