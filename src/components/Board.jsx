import { BoardRow } from "./BoardRow";

export function Board({
  boardRef,
  boardName,
  rows,
  breakerCount,
  totalCapacity,
  usedModules,
  phaseBalance,
  printPhaseBalance,
  includePhaseBalanceInPdf,
  exportBusy,
  onPrintPhaseBalanceChange,
  onIncludePhaseBalanceInPdfChange,
  selectedId,
  draggingId,
  dropTarget,
  onPrint,
  onExportPdf,
  rowHandlers,
}) {
  const phaseBalanceClassName = [
    phaseBalance.isBalanced ? "phase-balance" : "phase-balance warning",
    printPhaseBalance || includePhaseBalanceInPdf ? "print-enabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section ref={boardRef} className="board" aria-label="Raspored osiguraca" data-board-name={boardName || "Nova tabla"}>
      <div className="board-head">
        <strong>{boardName || "Nova tabla"}</strong>
        <div className="board-actions">
          <span>
            {rows.length} redova / {breakerCount} elemenata / {usedModules} od {totalCapacity}M
          </span>
          <button type="button" className="ghost" onClick={onPrint}>
            Stampaj
          </button>
          <button type="button" className="pdf-action" disabled={exportBusy} onClick={onExportPdf}>
            {exportBusy ? "Priprema PDF..." : "Izvezi u PDF"}
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

      <div className={phaseBalanceClassName}>
        <strong>Balans faza</strong>
        <span>L1 {phaseBalance.totals.L1.toFixed(0)} W</span>
        <span>L2 {phaseBalance.totals.L2.toFixed(0)} W</span>
        <span>L3 {phaseBalance.totals.L3.toFixed(0)} W</span>
        <em>Razlika {phaseBalance.spread.toFixed(0)} W</em>
        <label className="phase-print-toggle phase-print-desktop">
          <input type="checkbox" checked={printPhaseBalance} onChange={(event) => onPrintPhaseBalanceChange(event.target.checked)} />
          Stampaj
        </label>
        <label className="phase-print-toggle phase-pdf-mobile">
          <input
            type="checkbox"
            checked={includePhaseBalanceInPdf}
            onChange={(event) => onIncludePhaseBalanceInPdfChange(event.target.checked)}
          />
          Dodaj u PDF
        </label>
      </div>
    </section>
  );
}
