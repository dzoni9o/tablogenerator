import { useState } from "react";
import { boardTemplates } from "../data/templates";

export function TemplatePicker({ onApply }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" className="ghost" onClick={() => setIsOpen(true)}>
        Sabloni
      </button>
      {isOpen && (
        <div className="modal-backdrop" onMouseDown={() => setIsOpen(false)}>
          <section className="choice-modal template-modal" aria-label="Sabloni table" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p>Sabloni</p>
                <h2>Izaberi sablon table</h2>
              </div>
              <button type="button" className="close-button" onClick={() => setIsOpen(false)}>
                Zatvori
              </button>
            </div>
            <div className="template-options">
              {boardTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className="ghost"
                  onClick={() => {
                    onApply(template.id);
                    setIsOpen(false);
                  }}
                >
                  {template.label}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
