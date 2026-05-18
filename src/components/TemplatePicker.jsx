import { boardTemplates } from "../data/templates";

export function TemplatePicker({ onApply, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="choice-modal template-modal" aria-label="Sabloni table" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p>Sabloni</p>
            <h2>Izaberi sablon table</h2>
          </div>
          <button type="button" className="close-button" onClick={onClose}>
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
                onClose();
              }}
            >
              {template.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
