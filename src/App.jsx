import { useRef, useState } from "react";
import { Board } from "./components/Board";
import { BreakerEditor } from "./components/BreakerEditor";
import { CatalogModal } from "./components/CatalogModal";
import { FidChoiceModal } from "./components/FidChoiceModal";
import { ProjectDetails } from "./components/ProjectDetails";
import { RecentProjects } from "./components/RecentProjects";
import { TemplatePicker } from "./components/TemplatePicker";
import { Topbar } from "./components/Topbar";
import { useBoardProject } from "./hooks/useBoardProject";

export default function App() {
  const boardRef = useRef(null);
  const fileInputRef = useRef(null);
  const [exportError, setExportError] = useState("");
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [printPhaseBalance, setPrintPhaseBalance] = useState(false);
  const project = useBoardProject();
  const autosaveLabel = project.autosavedAt
    ? `Autosave ${new Date(project.autosavedAt).toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" })}`
    : "Autosave ukljucen";

  return (
    <main className="app">
      <Topbar
        boardName={project.boardName}
        autosaveLabel={autosaveLabel}
        onBoardNameChange={project.setBoardName}
        onDuplicateProject={project.duplicateProject}
        onExportJson={project.exportJson}
        onImportClick={() => fileInputRef.current?.click()}
        onNewProject={project.newProject}
        onOpenTemplates={() => setTemplatePickerOpen(true)}
        recentProjectsNode={<RecentProjects items={project.recentProjects} onLoad={project.loadProject} onRemove={project.removeRecentProject} />}
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
        accept="application/json,.json"
        onChange={(event) => {
          project.importJsonFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {project.importError && <p className="import-error">{project.importError}</p>}
      {exportError && <p className="import-error">{exportError}</p>}
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
          onPrintPhaseBalanceChange={setPrintPhaseBalance}
          selectedId={project.selected}
          draggingId={project.dragging}
          dropTarget={project.dropTarget}
          onPrint={() => window.print()}
          onExportPdf={async () => {
            try {
              setExportError("");
              const { exportBoardPdf } = await import("./utils/exportPdf");
              await exportBoardPdf(boardRef.current, project.boardName, project.projectInfo, project.rows, project.phaseBalance, {
                includePhaseBalance: printPhaseBalance,
              });
            } catch {
              setExportError("PDF export trenutno nije uspeo. Osvezi stranicu i pokusaj ponovo.");
            }
          }}
          rowHandlers={{
            onAddBreaker: project.addBreaker,
            onAddElement: project.setCatalogTargetRow,
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

      <ProjectDetails projectInfo={project.projectInfo} onUpdate={project.updateProjectInfo} />

      {project.editorOpen && (
        <BreakerEditor
          selectedBreaker={project.selectedBreaker}
          selectedRow={project.selectedRow}
          onClose={project.closeEditor}
          onRemove={project.removeBreaker}
          onSave={project.saveSelected}
          onUpdate={project.updateSelected}
        />
      )}

      {templatePickerOpen && (
        <TemplatePicker
          onApply={project.applyTemplate}
          onClose={() => {
            setTemplatePickerOpen(false);
          }}
        />
      )}

      {project.catalogTargetRow && (
        <CatalogModal
          onAdd={(type) => project.addCatalogItem(project.catalogTargetRow, type)}
          onClose={() => project.setCatalogTargetRow(null)}
        />
      )}

      {project.fidTargetRow && (
        <FidChoiceModal
          pendingPhase={project.pendingFidPhase}
          onCancel={() => {
            project.setFidTargetRow(null);
            project.setPendingFidPhase(null);
          }}
          onChoosePhase={project.setPendingFidPhase}
          onConfirm={(withNeutral) => project.addFid(project.fidTargetRow, project.pendingFidPhase, withNeutral)}
        />
      )}
    </main>
  );
}
