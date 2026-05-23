import { ProjectDetails } from "./ProjectDetails";

export function PdfExportModal({ projectInfo, exportBusy, onCancel, onConfirm, onUpdate }) {
  return (
    <div className="modal-backdrop" onMouseDown={exportBusy ? undefined : onCancel}>
      <section className="choice-modal pdf-details-modal" aria-label="Podaci za PDF" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p>Izvoz u PDF</p>
            <h2>Generalije</h2>
          </div>
          <button type="button" className="close-button" disabled={exportBusy} onClick={onCancel}>
            Zatvori
          </button>
        </div>

        <ProjectDetails className="project-details-compact" projectInfo={projectInfo} title="Podaci za izvestaj" onUpdate={onUpdate} />

        <div className="modal-actions">
          <button type="button" className="ghost" disabled={exportBusy} onClick={onCancel}>
            Odustani
          </button>
          <button type="button" className="pdf-action" disabled={exportBusy} onClick={onConfirm}>
            {exportBusy ? "Priprema PDF..." : "Izvezi u PDF"}
          </button>
        </div>
      </section>
    </div>
  );
}
