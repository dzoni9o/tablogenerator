import { useMemo, useState } from "react";

const moduleOptions = [1, 2, 3, 4, 6, 8, 12];

export function ElementSizeModal({ onCancel, onConfirm }) {
  const [modules, setModules] = useState(1);
  const [customModules, setCustomModules] = useState("");
  const selectedModules = useMemo(() => {
    if (modules !== "custom") return modules;
    return Math.max(1, Math.min(50, Number(customModules) || 0));
  }, [customModules, modules]);
  const canConfirm = selectedModules > 0;

  return (
    <div className="modal-backdrop" onMouseDown={onCancel}>
      <section className="choice-modal element-size-modal" aria-label="Velicina elementa" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p>Dodaj element</p>
            <h2>Koliko mesta zauzima?</h2>
          </div>
          <button type="button" className="close-button" onClick={onCancel}>
            Zatvori
          </button>
        </div>

        <div className="choice-group">
          <span>Broj modula</span>
          <div className="amp-grid module-choice-grid">
            {moduleOptions.map((option) => (
              <button key={option} type="button" className={modules === option ? "active" : ""} onClick={() => setModules(option)}>
                {option}M
              </button>
            ))}
            <button type="button" className={modules === "custom" ? "active" : ""} onClick={() => setModules("custom")}>
              Unesi
            </button>
          </div>

          {modules === "custom" && (
            <label className="custom-choice">
              Mesta
              <input
                autoFocus
                inputMode="numeric"
                placeholder="1-50"
                value={customModules}
                onChange={(event) => setCustomModules(event.target.value.replace(/\D/g, "").slice(0, 2))}
              />
            </label>
          )}
        </div>

        <div className="modal-actions choice-actions">
          <button type="button" className="ghost" onClick={onCancel}>
            Odustani
          </button>
          <button type="button" disabled={!canConfirm} onClick={() => onConfirm(selectedModules)}>
            Dodaj element
          </button>
        </div>
      </section>
    </div>
  );
}
