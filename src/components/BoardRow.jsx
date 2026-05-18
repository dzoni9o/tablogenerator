import { useEffect, useState } from "react";
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
          <RowCapacityInput rowId={row.id} capacity={row.capacity} onUpdateRowCapacity={onUpdateRowCapacity} />
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

function RowCapacityInput({ rowId, capacity, onUpdateRowCapacity }) {
  const [draft, setDraft] = useState(String(capacity));

  useEffect(() => {
    setDraft(String(capacity));
  }, [capacity]);

  function commitDraft() {
    if (!draft) {
      setDraft(String(capacity));
      return;
    }

    onUpdateRowCapacity(rowId, draft);
  }

  return (
    <label>
      Modula
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={draft}
        onChange={(event) => {
          const nextDraft = event.target.value.replace(/\D/g, "").slice(0, 2);
          setDraft(nextDraft);
          if (nextDraft) onUpdateRowCapacity(rowId, nextDraft);
        }}
        onBlur={commitDraft}
        onFocus={(event) => event.target.select()}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
      />
    </label>
  );
}
