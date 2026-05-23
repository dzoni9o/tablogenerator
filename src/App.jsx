import { useEffect, useRef, useState } from "react";
import { Board } from "./components/Board";
import { BreakerEditor } from "./components/BreakerEditor";
import { CatalogModal } from "./components/CatalogModal";
import { ElementSizeModal } from "./components/ElementSizeModal";
import { PdfExportModal } from "./components/PdfExportModal";
import { ProjectDetails } from "./components/ProjectDetails";
import { ProtectionChoiceModal } from "./components/ProtectionChoiceModal";
import { Topbar } from "./components/Topbar";
import { useBoardProject } from "./hooks/useBoardProject";

export default function App() {
  const boardRef = useRef(null);
  const fileInputRef = useRef(null);
  const [exportError, setExportError] = useState("");
  const [exportBusy, setExportBusy] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [pdfDetailsOpen, setPdfDetailsOpen] = useState(false);
  const [printPhaseBalance, setPrintPhaseBalance] = useState(false);
  const [includePhaseBalanceInPdf, setIncludePhaseBalanceInPdf] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(() => window.matchMedia?.("(max-width: 900px)").matches ?? false);
  const project = useBoardProject();
  const autosaveLabel = project.autosavedAt
    ? `Autosave ${new Date(project.autosavedAt).toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" })}`
    : "Autosave ukljucen";

  useEffect(() => {
    const query = window.matchMedia?.("(max-width: 900px)");
    if (!query) return undefined;

    const update = () => setIsSmallScreen(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <main className="app">
      <Topbar
        boardName={project.boardName}
        autosaveLabel={autosaveLabel}
        onBoardNameChange={project.setBoardName}
        onExportJson={project.exportJson}
        onImportClick={() => fileInputRef.current?.click()}
        onNewProject={project.newProject}
        onShareProject={shareProject}
      />

      <aside className="history-dock" aria-label="Istorija izmena">
        <button type="button" className="ghost icon-button" disabled={!project.canUndo} onClick={project.undo} title="Undo">
          Undo
        </button>
        <button type="button" className="ghost icon-button" disabled={!project.canRedo} onClick={project.redo} title="Redo">
          Redo
        </button>
      </aside>

      <input
        ref={fileInputRef}
        className="visually-hidden"
        type="file"
        accept="application/json,.json,.tgen"
        onChange={(event) => {
          project.importJsonFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {project.importError && <p className="import-error">{project.importError}</p>}
      {exportError && <p className="import-error">{exportError}</p>}
      {saveMessage && (
        <p className="capacity-toast success" role="status" aria-live="polite">
          {saveMessage}
        </p>
      )}
      {project.capacityMessage && (
        <p key={project.capacityMessage.id} className="capacity-toast" role="status" aria-live="polite">
          {project.capacityMessage.text}
        </p>
      )}

      <section className="workspace">
        <Board
          boardRef={boardRef}
          boardName={project.boardName}
          rows={project.rows}
          breakerCount={project.breakerCount}
          totalCapacity={project.totalCapacity}
          usedModules={project.usedModules}
          phaseBalance={project.phaseBalance}
          printPhaseBalance={printPhaseBalance}
          includePhaseBalanceInPdf={includePhaseBalanceInPdf}
          exportBusy={exportBusy}
          onPrintPhaseBalanceChange={setPrintPhaseBalance}
          onIncludePhaseBalanceInPdfChange={setIncludePhaseBalanceInPdf}
          selectedId={project.selected}
          draggingId={project.dragging}
          dropTarget={project.dropTarget}
          onPrint={() => window.print()}
          onExportPdf={() => {
            if (isSmallScreen) {
              setPdfDetailsOpen(true);
              return;
            }

            exportPdf({ includePhaseBalance: printPhaseBalance });
          }}
          rowHandlers={{
            onAddBreaker: project.addBreaker,
            onAddElement: project.addCustomElement,
            onAddCatalog: project.setCatalogTargetRow,
            onAddFid: project.setFidTargetRow,
            onAddBell: (rowId) => project.addSpecial(rowId, "bell"),
            onAddRowAfter: project.addRowAfter,
            onRemoveRow: project.removeRow,
            onRenameRow: project.updateRowName,
            onUpdateRowCapacity: project.updateRowCapacity,
            onSelectBreaker: project.selectBreaker,
            onDragStart: project.startDrag,
            onDragEnd: project.clearDrag,
            onAllowDrop: project.allowDrop,
            onDropBreaker: project.dropBreaker,
          }}
        />
      </section>

      <ProjectDetails className="desktop-project-details" projectInfo={project.projectInfo} onUpdate={project.updateProjectInfo} />

      {project.editorOpen && (
        <BreakerEditor
          rows={project.rows}
          selectedBreaker={project.selectedBreaker}
          selectedRow={project.selectedRow}
          onClose={project.closeEditor}
          onDuplicate={project.duplicateSelectedBreaker}
          onMove={project.moveSelected}
          onMoveToRow={project.moveSelectedToRow}
          onRemove={project.removeBreaker}
          onSave={project.saveSelected}
          onUpdate={project.updateSelected}
        />
      )}

      {pdfDetailsOpen && (
        <PdfExportModal
          exportBusy={exportBusy}
          projectInfo={project.projectInfo}
          onCancel={() => setPdfDetailsOpen(false)}
          onConfirm={() => exportPdf({ includePhaseBalance: includePhaseBalanceInPdf })}
          onUpdate={project.updateProjectInfo}
        />
      )}

      {project.customElementTargetRow && (
        <ElementSizeModal
          onCancel={() => project.setCustomElementTargetRow(null)}
          onConfirm={(modules) => project.addCustomElement(project.customElementTargetRow, modules)}
        />
      )}

      {project.breakerTargetRow && (
        <ProtectionChoiceModal
          mode="breaker"
          onCancel={() => project.setBreakerTargetRow(null)}
          onConfirm={(values) => project.addBreaker(project.breakerTargetRow, values)}
        />
      )}

      {project.catalogTargetRow && (
        <CatalogModal
          onAdd={(type) => project.addCatalogItem(project.catalogTargetRow, type)}
          onClose={() => project.setCatalogTargetRow(null)}
        />
      )}

      {project.fidTargetRow && (
        <ProtectionChoiceModal
          mode="fid"
          onCancel={() => {
            project.setFidTargetRow(null);
          }}
          onConfirm={(values) => project.addFid(project.fidTargetRow, values)}
        />
      )}
    </main>
  );

  async function exportPdf(options = {}) {
    try {
      setExportBusy(true);
      setExportError("");
      const { exportBoardPdf } = await import("./utils/exportPdf");
      await exportBoardPdf(boardRef.current, project.boardName, project.projectInfo, project.rows, project.phaseBalance, options);
      setPdfDetailsOpen(false);
    } catch {
      setExportError("PDF export trenutno nije uspeo. Osvezi stranicu i pokusaj ponovo.");
    } finally {
      setExportBusy(false);
    }
  }

  async function shareProject() {
    try {
      setExportError("");
      setSaveMessage("");
      await project.shareJson();
      setSaveMessage("Projekat je spreman za deljenje.");
      window.setTimeout(() => setSaveMessage(""), 3000);
    } catch {
      setSaveMessage("");
      setExportError("Deljenje projekta trenutno nije uspelo. Pokusaj ponovo.");
    }
  }
}
