import { consumerIcons } from "../data/consumerIcons";
import { descriptionLimit, getAmpLimit, labelLimit } from "../utils/breakerFactory";

export function BreakerEditor({ selectedBreaker, selectedRow, onClose, onRemove, onSave, onUpdate }) {
  if (!selectedBreaker || !selectedRow) return null;

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="breaker-modal" aria-label="Izmena osiguraca" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p>Izabran osigurac</p>
            <h2>{selectedBreaker.label || "Bez oznake"}</h2>
          </div>
          <button type="button" className="close-button" onClick={onClose}>
            Zatvori
          </button>
        </div>

        <label>
          Oznaka
          <input maxLength={labelLimit} value={selectedBreaker.label} onChange={(event) => onUpdate("label", event.target.value)} />
        </label>
        <label>
          Amperaza
          <input
            maxLength={getAmpLimit(selectedBreaker)}
            value={selectedBreaker.amp}
            onChange={(event) => onUpdate("amp", event.target.value)}
          />
        </label>
        <label>
          Opis za korisnika
          <textarea
            rows="5"
            maxLength={descriptionLimit}
            value={selectedBreaker.description}
            readOnly={selectedBreaker.type === "neutral"}
            onChange={(event) => onUpdate("description", event.target.value)}
          />
        </label>
        {selectedBreaker.type !== "bell" && selectedBreaker.type !== "neutral" && selectedBreaker.type !== "fid" && (
          <label>
            Slicica potrosaca
            <select value={selectedBreaker.icon || "light"} onChange={(event) => onUpdate("icon", event.target.value)}>
              {consumerIcons.map((icon) => (
                <option key={icon.id} value={icon.id}>
                  {icon.label}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="modal-actions">
          <button type="button" className="danger" onClick={() => onRemove(selectedRow.id, selectedBreaker.id)}>
            Obrisi osigurac
          </button>
          <button type="button" onClick={onSave}>
            Sacuvaj
          </button>
        </div>
      </section>
    </div>
  );
}
