import { useRef } from "react";
import { Board } from "./components/Board";
import { BreakerEditor } from "./components/BreakerEditor";
import { CatalogModal } from "./components/CatalogModal";
import { FidChoiceModal } from "./components/FidChoiceModal";
import { ProjectDetails } from "./components/ProjectDetails";
import { RecentProjects } from "./components/RecentProjects";
import { TemplatePicker } from "./components/TemplatePicker";
import { Topbar } from "./components/Topbar";
import { useBoardProject } from "./hooks/useBoardProject";
import { exportBoardPdf } from "./utils/exportPdf";

export default function App() {
  const boardRef = useRef(null);
  const fileInputRef = useRef(null);
  const project = useBoardProject();
  const autosaveLabel = project.autosavedAt
    ? `Autosave ${new Date(project.autosavedAt).toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" })}`
    : "Autosave ukljucen";

  return (
    <main className="app">
      <Topbar
        boardName={project.boardName}
        autosaveLabel={autosaveLabel}
        canRedo={project.canRedo}
        canUndo={project.canUndo}
        onBoardNameChange={project.setBoardName}
        onDuplicateProject={project.duplicateProject}
        onExportJson={project.exportJson}
        onImportClick={() => fileInputRef.current?.click()}
        onNewProject={project.newProject}
        onRedo={project.redo}
        onUndo={project.undo}
      />

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

      <ProjectDetails projectInfo={project.projectInfo} onUpdate={project.updateProjectInfo} />
      <TemplatePicker onApply={project.applyTemplate} />
      <RecentProjects items={project.recentProjects} onLoad={project.loadProject} />

      <section className="workspace">
        <Board
          boardRef={boardRef}
          boardName={project.boardName}
          rows={project.rows}
          breakerCount={project.breakerCount}
          totalCapacity={project.totalCapacity}
          usedModules={project.usedModules}
          phaseBalance={project.phaseBalance}
          selectedId={project.selected}
          draggingId={project.dragging}
          dropTarget={project.dropTarget}
          onAddRow={project.addRow}
          onPrint={() => window.print()}
          onExportPdf={() => exportBoardPdf(boardRef.current, project.boardName, project.projectInfo, project.rows, project.phaseBalance)}
          rowHandlers={{
            onAddBreaker: project.addBreaker,
            onAddElement: project.setCatalogTargetRow,
            onAddFid: project.setFidTargetRow,
            onAddBell: (rowId) => project.addSpecial(rowId, "bell"),
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
