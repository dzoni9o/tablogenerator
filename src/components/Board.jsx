import { BoardRow } from "./BoardRow";

export function Board({
  boardRef,
  boardName,
  rows,
  breakerCount,
  totalCapacity,
  usedModules,
  phaseBalance,
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
            {rows.length} redova / {breakerCount} elemenata / {usedModules} od {totalCapacity}M
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

      <div className={phaseBalance.isBalanced ? "phase-balance" : "phase-balance warning"}>
        <strong>Balans faza</strong>
        <span>L1 {phaseBalance.totals.L1.toFixed(1)} kW</span>
        <span>L2 {phaseBalance.totals.L2.toFixed(1)} kW</span>
        <span>L3 {phaseBalance.totals.L3.toFixed(1)} kW</span>
        <em>Razlika {phaseBalance.spread.toFixed(1)} kW</em>
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
