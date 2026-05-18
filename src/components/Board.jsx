import { BoardRow } from "./BoardRow";

export function Board({
  boardRef,
  boardName,
  rows,
  breakerCount,
  selectedId,
  draggingId,
  dropTarget,
  onAddRow,
  onPrint,
  onExportPdf,
  rowHandlers,
}) {
  return (
    <section ref={boardRef} className="board" aria-label="Raspored osiguraca" data-board-name={boardName || "Nova tabla"}>
      <div className="board-head">
        <strong>{boardName || "Nova tabla"}</strong>
        <div className="board-actions">
          <span>
            {rows.length} redova / {breakerCount} osiguraca
          </span>
          <button type="button" onClick={onAddRow}>
            + Dodaj red
          </button>
          <button type="button" className="ghost" onClick={onPrint}>
            Stampaj
          </button>
          <button type="button" className="ghost" onClick={onExportPdf}>
            Izvezi u PDF
          </button>
        </div>
      </div>

      <div className="rows">
        {rows.map((row) => (
          <BoardRow
            key={row.id}
            row={row}
            selectedId={selectedId}
            draggingId={draggingId}
            dropTarget={dropTarget}
            {...rowHandlers}
          />
        ))}
      </div>
    </section>
  );
}
