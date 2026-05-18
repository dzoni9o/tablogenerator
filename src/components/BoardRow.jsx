import { useState } from "react";
import { Breaker } from "./Breaker";
import { RowCapacityInput } from "./RowCapacityInput";
import { getRowUsedModules } from "../utils/boardOperations";
import { createMobileSegments } from "../utils/mobileSegments";

export function BoardRow({
  row,
  selectedId,
  draggingId,
  dropTarget,
  onAddBreaker,
  onAddFid,
  onAddBell,
  onAddElement,
  onAddRowAfter,
  onRemoveRow,
  onRenameRow,
  onUpdateRowCapacity,
  onSelectBreaker,
  onDragStart,
  onDragEnd,
  onAllowDrop,
  onDropBreaker,
}) {
  const [mobileView, setMobileView] = useState("overview");
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const usedModules = getRowUsedModules(row);
  const isOverCapacity = usedModules > row.capacity;
  const rowClassName = [isOverCapacity ? "row row-over-capacity" : "row", mobileView === "rail" ? "mobile-rail-mode" : "mobile-overview-mode"].join(" ");
  const breakerRowClassName = [
    "breaker-row",
    "rail-breaker-row",
    dropTarget?.rowId === row.id && !dropTarget.breakerId ? "row-drop-target" : "",
  ]
    .filter(Boolean)
    .join(" ");

  function renderBreaker(breaker) {
    return (
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
    );
  }

  return (
    <section className={rowClassName} data-row-name={row.name || "Red"}>
      <div className="row-toolbar">
        <div className="row-meta">
          <input aria-label="Naziv reda" value={row.name} onChange={(event) => onRenameRow(row.id, event.target.value)} />
          <RowCapacityInput rowId={row.id} capacity={row.capacity} onUpdateRowCapacity={onUpdateRowCapacity} />
          <span className={isOverCapacity ? "capacity-pill warning" : "capacity-pill"}>
            {usedModules}/{row.capacity}M
          </span>
        </div>
        <div className="row-actions">
          <button type="button" onClick={() => onAddBreaker(row.id)}>
            Dodaj osigurac
          </button>
          <div className="row-more">
            <button type="button" className="ghost" onClick={() => setMoreMenuOpen((current) => !current)} aria-expanded={moreMenuOpen}>
              + Jos
            </button>
            {moreMenuOpen && (
              <div className="row-more-menu">
                <button
                  type="button"
                  className="ghost"
                  onClick={() => {
                    onAddElement(row.id);
                    setMoreMenuOpen(false);
                  }}
                >
                  Element
                </button>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => {
                    onAddFid(row.id);
                    setMoreMenuOpen(false);
                  }}
                >
                  FID
                </button>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => {
                    onAddBell(row.id);
                    setMoreMenuOpen(false);
                  }}
                >
                  Zvonce
                </button>
              </div>
            )}
          </div>
          <button type="button" className="danger" onClick={() => onRemoveRow(row.id)}>
            Obrisi red
          </button>
        </div>
      </div>

      <div className="mobile-row-view" aria-label="Mobilni prikaz reda">
        <span>Prikaz</span>
        <button type="button" className={mobileView === "overview" ? "" : "ghost"} onClick={() => setMobileView("overview")}>
          Pregled
        </button>
        <button type="button" className={mobileView === "rail" ? "" : "ghost"} onClick={() => setMobileView("rail")}>
          Sina
        </button>
      </div>

      <div className="mobile-overview-list" aria-label="Pregled reda po segmentima">
        {createMobileSegments(row.breakers).map((segment) => (
          <div className="mobile-segment" key={segment.start}>
            <div className="mobile-segment-head">
              <span>Moduli {segment.start}-{segment.end}</span>
              <em>{segment.used}M</em>
            </div>
            <div className="mobile-segment-grid">{segment.breakers.map(renderBreaker)}</div>
          </div>
        ))}
        {row.breakers.length === 0 && <p className="empty-row">Dodaj prvi osigurac u ovaj red.</p>}
      </div>

      <div className={breakerRowClassName} onDragOver={(event) => onAllowDrop(event, row.id)} onDrop={(event) => onDropBreaker(event, row.id)}>
        {row.breakers.map(renderBreaker)}
        {row.breakers.length === 0 && <p className="empty-row">Dodaj prvi osigurac u ovaj red.</p>}
      </div>

      <div className="row-insert">
        <button type="button" className="ghost" onClick={() => onAddRowAfter(row.id)}>
          + Dodaj red ispod
        </button>
      </div>
    </section>
  );
}
