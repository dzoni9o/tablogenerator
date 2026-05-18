import { useState } from "react";
import { boardTemplates } from "../data/templates";

export function TemplatePicker({ onApply }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className={isOpen ? "template-picker templates-open" : "template-picker"} aria-label="Sabloni table">
      <div className="template-picker-head">
        <span>Sabloni</span>
        <button type="button" className="ghost" onClick={() => setIsOpen((current) => !current)} aria-expanded={isOpen}>
          {isOpen ? "Sakrij" : "Prikazi"}
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
  );
}
