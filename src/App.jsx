import { useEffect, useRef, useState } from "react";
import { Board } from "./components/Board";
import { BreakerEditor } from "./components/BreakerEditor";
import { CatalogModal } from "./components/CatalogModal";
import { ElementSizeModal } from "./components/ElementSizeModal";
import { Login } from "./components/Login";
import { MojiProjektiModal } from "./components/MojiProjektiModal";
import { PdfExportModal } from "./components/PdfExportModal";
import { ProjectDetails } from "./components/ProjectDetails";
import { ProtectionChoiceModal } from "./components/ProtectionChoiceModal";
import { Topbar } from "./components/Topbar";
import { useAuth } from "./hooks/useAuth";
import { useBoardProject } from "./hooks/useBoardProject";
import { loadProject, saveProject } from "./lib/projekti";
import { supabase } from "./lib/supabase";

export default function App() {
  const { session, loading } = useAuth();
  const boardRef = useRef(null);
  const fileInputRef = useRef(null);
  const [exportError, setExportError] = useState("");
  const [exportBusy, setExportBusy] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [pdfDetailsOpen, setPdfDetailsOpen] = useState(false);
  const [printPhaseBalance, setPrintPhaseBalance] = useState(false);
  const [includePhaseBalanceInPdf, setIncludePhaseBalanceInPdf] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(() => window.matchMedia?.("(max-width: 900px)").matches ?? false);
  const [cloudId, setCloudId] = useState(null);
  const [cloudBusy, setCloudBusy] = useState(false);
  const [projektiOpen, setProjektiOpen] = useState(false);
  const project = useBoardProject();
  const autosaveLabel = project.autosavedAt
    ? `Autosave ${new Date(project.autosavedAt).toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" })}`
    : "Autosave uključen";

  useEffect(() => {
    const query = window.matchMedia?.("(max-width: 900px)");
    if (!query) return undefined;

    const update = () => setIsSmallScreen(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  if (loading) return null;
  if (!session) return <Login />;

  return (
    <main className="app">
      <Topbar
        boardName={project.boardName}
        autosaveLabel={autosaveLabel}
        cloudBusy={cloudBusy}
        onBoardNameChange={project.setBoardName}
        onExportJson={project.exportJson}
        onImportClick={() => fileInputRef.current?.click()}
        onNewProject={project.newProject}
        onSaveToCloud={saveToCloud}
        onOpenProjects={() => setProjektiOpen(true)}
        onShareProject={shareProject}
        onLogout={() => supabase.auth.signOut()}
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

      {projektiOpen && (
        <MojiProjektiModal
          onLoad={handleLoadFromCloud}
          onClose={() => setProjektiOpen(false)}
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

  async function saveToCloud() {
    try {
      setCloudBusy(true);
      setExportError("");
      const newId = await saveProject({
        id: cloudId,
        boardName: project.boardName,
        projectInfo: project.projectInfo,
        rows: project.rows,
      });
      setCloudId(newId);
      setSaveMessage("Projekat je sačuvan u oblak.");
      window.setTimeout(() => setSaveMessage(""), 3000);
    } catch {
      setExportError("Čuvanje u oblak nije uspelo. Pokušaj ponovo.");
    } finally {
      setCloudBusy(false);
    }
  }

  async function handleLoadFromCloud(id) {
    try {
      setProjektiOpen(false);
      const data = await loadProject(id);
      project.loadProjectData(data);
      setCloudId(id);
      setSaveMessage("Projekat je učitan.");
      window.setTimeout(() => setSaveMessage(""), 3000);
    } catch {
      setExportError("Učitavanje projekta nije uspelo.");
    }
  }

  async function exportPdf(options = {}) {
    try {
      setExportBusy(true);
      setExportError("");
      const { exportBoardPdf } = await import("./utils/exportPdf");
      await exportBoardPdf(boardRef.current, project.boardName, project.projectInfo, project.rows, project.phaseBalance, options);
      setPdfDetailsOpen(false);
    } catch {
      setExportError("PDF export trenutno nije uspeo. Osveži stranicu i pokušaj ponovo.");
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
      setExportError("Deljenje projekta trenutno nije uspelo. Pokušaj ponovo.");
    }
  }
}
