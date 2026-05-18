import { Breaker } from "./Breaker";
import { getRowUsedModules } from "../utils/boardOperations";

export function BoardRow({
  row,
  selectedId,
  draggingId,
  dropTarget,
  onAddBreaker,
  onAddFid,
  onAddBell,
  onAddElement,
  onRemoveRow,
  onRenameRow,
  onUpdateRowCapacity,
  onSelectBreaker,
  onDragStart,
  onDragEnd,
  onAllowDrop,
  onDropBreaker,
}) {
  const usedModules = getRowUsedModules(row);
  const isOverCapacity = usedModules > row.capacity;

  return (
    <section className={isOverCapacity ? "row row-over-capacity" : "row"} data-row-name={row.name || "Red"}>
      <div className="row-toolbar">
        <div className="row-meta">
          <input aria-label="Naziv reda" value={row.name} onChange={(event) => onRenameRow(row.id, event.target.value)} />
          <label>
            Modula
            <input
              type="number"
              min="1"
              max="72"
              value={row.capacity}
              onChange={(event) => onUpdateRowCapacity(row.id, event.target.value)}
            />
          </label>
          <span className={isOverCapacity ? "capacity-pill warning" : "capacity-pill"}>
            {usedModules}/{row.capacity}M
          </span>
        </div>
        <div>
          <button type="button" onClick={() => onAddBreaker(row.id)}>
            + Osigurac
          </button>
          <button type="button" className="ghost" onClick={() => onAddElement(row.id)}>
            + Element
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
