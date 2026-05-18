import { boardTemplates } from "../data/templates";

export function TemplatePicker({ onApply }) {
  return (
    <section className="template-picker" aria-label="Sabloni table">
      <span>Sabloni</span>
      {boardTemplates.map((template) => (
        <button key={template.id} type="button" className="ghost" onClick={() => onApply(template.id)}>
          {template.label}
        </button>
      ))}
    </section>
  );
}
