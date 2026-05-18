import { Breaker } from "./Breaker";

export function BoardRow({
  row,
  selectedId,
  draggingId,
  dropTarget,
  onAddBreaker,
  onAddFid,
  onAddBell,
  onRemoveRow,
  onRenameRow,
  onSelectBreaker,
  onDragStart,
  onDragEnd,
  onAllowDrop,
  onDropBreaker,
}) {
  return (
    <section className="row" data-row-name={row.name || "Red"}>
      <div className="row-toolbar">
        <input aria-label="Naziv reda" value={row.name} onChange={(event) => onRenameRow(row.id, event.target.value)} />
        <div>
          <button type="button" onClick={() => onAddBreaker(row.id)}>
            + Osigurac
          </button>
          <button type="button" className="ghost" onClick={() => onAddFid(row.id)}>
            + FID
          </button>
          <button type="button" className="ghost" onClick={() => onAddBell(row.id)}>
            + Zvonce
          </button>
          <button type="button" className="ghost" onClick={() => onRemoveRow(row.id)}>
            Obrisi red
          </button>
        </div>
      </div>

      <div
        className={dropTarget?.rowId === row.id && !dropTarget.breakerId ? "breaker-row row-drop-target" : "breaker-row"}
        onDragOver={(event) => onAllowDrop(event, row.id)}
        onDrop={(event) => onDropBreaker(event, row.id)}
      >
        {row.breakers.map((breaker) => (
          <Breaker
            key={breaker.id}
            breaker={breaker}
            isActive={breaker.id === selectedId}
            isDragging={breaker.id === draggingId}
            isDropTarget={dropTarget?.breakerId === breaker.id}
            onClick={() => onSelectBreaker(breaker)}
            onDragEnd={onDragEnd}
            onDragOver={(event) => {
              event.stopPropagation();
              onAllowDrop(event, row.id, breaker.id);
            }}
            onDragStart={(event) => onDragStart(event, breaker.id)}
            onDrop={(event) => {
              event.stopPropagation();
              onDropBreaker(event, row.id, breaker.id);
            }}
          />
        ))}

        {row.breakers.length === 0 && <p className="empty-row">Dodaj prvi osigurac u ovaj red.</p>}
      </div>
    </section>
  );
}
