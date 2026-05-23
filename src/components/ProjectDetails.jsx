export function ProjectDetails({ projectInfo, onUpdate, title = "Dokumentacija", className = "" }) {
  return (
    <section className={["project-details", className].filter(Boolean).join(" ")} aria-label={title}>
      <div>
        <h2>{title}</h2>
      </div>
      <div className="project-fields">
        <label>
          Objekat
          <input value={projectInfo.objectName} onChange={(event) => onUpdate("objectName", event.target.value)} />
        </label>
        <label>
          Adresa
          <input value={projectInfo.address} onChange={(event) => onUpdate("address", event.target.value)} />
        </label>
        <label>
          Investitor
          <input value={projectInfo.investor} onChange={(event) => onUpdate("investor", event.target.value)} />
        </label>
        <label>
          Instalater
          <input value={projectInfo.installer} onChange={(event) => onUpdate("installer", event.target.value)} />
        </label>
        <label>
          Broj dokumenta
          <input value={projectInfo.documentNumber} onChange={(event) => onUpdate("documentNumber", event.target.value)} />
        </label>
        <label>
          Datum
          <input type="date" value={projectInfo.date} onChange={(event) => onUpdate("date", event.target.value)} />
        </label>
        <label className="field-wide">
          Napomena
          <textarea rows={3} value={projectInfo.note} onChange={(event) => onUpdate("note", event.target.value)} />
        </label>
      </div>
    </section>
  );
}
