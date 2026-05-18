export function RowCapacityInput({ rowId, capacity, onUpdateRowCapacity }) {
  const value = Math.max(1, Math.min(50, Number(capacity) || 1));

  return (
    <div className="row-capacity-control">
      <span>Modula</span>
      <span className="module-stepper">
        <button type="button" className="ghost" aria-label="Smanji broj modula" disabled={value <= 1} onClick={() => onUpdateRowCapacity(rowId, value - 1)}>
          -
        </button>
        <input type="text" value={value} readOnly tabIndex={-1} aria-label="Broj modula" />
        <button type="button" className="ghost" aria-label="Povecaj broj modula" disabled={value >= 50} onClick={() => onUpdateRowCapacity(rowId, value + 1)}>
          +
        </button>
      </span>
    </div>
  );
}
