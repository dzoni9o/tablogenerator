export function ProjectDetails({ projectInfo, onUpdate, title = "Dokumentacija", className = "" }) {
  function handleLogoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => onUpdate("companyLogo", e.target.result);
    reader.readAsDataURL(file);
    event.target.value = "";
  }

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

        <div className="project-fields-divider" />

        <label>
          Naziv firme
          <input value={projectInfo.companyName ?? ""} onChange={(event) => onUpdate("companyName", event.target.value)} placeholder="Moja firma d.o.o." />
        </label>
        <label>
          Veb sajt
          <input value={projectInfo.companyWebsite ?? ""} onChange={(event) => onUpdate("companyWebsite", event.target.value)} placeholder="www.mojafirma.rs" />
        </label>
        <label>
          Telefon
          <input value={projectInfo.companyPhone ?? ""} onChange={(event) => onUpdate("companyPhone", event.target.value)} placeholder="+381 11 123 4567" />
        </label>
        <label className="field-wide">
          Logo firme (PNG/JPG)
          <div className="logo-upload-row">
            {projectInfo.companyLogo && (
              <img src={projectInfo.companyLogo} alt="Logo" className="logo-preview" />
            )}
            <input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoChange} />
            {projectInfo.companyLogo && (
              <button type="button" className="ghost" onClick={() => onUpdate("companyLogo", "")}>
                Ukloni
              </button>
            )}
          </div>
        </label>
      </div>
    </section>
  );
}
