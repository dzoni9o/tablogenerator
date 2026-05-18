import { ConsumerIcon } from "./ConsumerIcon";

export function Breaker({
  breaker,
  isActive,
  isDragging,
  isDropTarget,
  onClick,
  onDragEnd,
  onDragOver,
  onDragStart,
  onDrop,
}) {
  return (
    <button
      type="button"
      className={[
        "breaker",
        breaker.type === "fid" ? "fid" : "",
        breaker.type === "neutral" ? "neutral" : "",
        breaker.type === "bell" ? "bell" : "",
        isActive ? "active" : "",
        isDragging ? "dragging" : "",
        isDropTarget ? "drop-target" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      draggable
      style={{ "--module-span": breaker.poles || 1 }}
      onClick={onClick}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragStart={onDragStart}
      onDrop={onDrop}
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
  );
}
