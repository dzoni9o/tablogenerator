import { TemplatePicker } from "./TemplatePicker";

export function Topbar({
  boardName,
  autosaveLabel,
  canRedo,
  canUndo,
  onBoardNameChange,
  onDuplicateProject,
  onExportJson,
  onImportClick,
  onNewProject,
  onApplyTemplate,
  onRedo,
  onUndo,
}) {
  return (
    <header className="topbar">
      <div>
        <p>Tablo generator</p>
        <input
          aria-label="Naziv table"
          className="board-name"
          value={boardName}
          onChange={(event) => onBoardNameChange(event.target.value)}
        />
      </div>
      <div className="topbar-actions">
        <span className="autosave-status">{autosaveLabel}</span>
        <button type="button" className="ghost" onClick={onNewProject}>
          Novi projekat
        </button>
        <button type="button" className="ghost" onClick={onDuplicateProject}>
          Kopiraj
        </button>
        <TemplatePicker onApply={onApplyTemplate} />
        <button type="button" className="ghost icon-button" disabled={!canUndo} onClick={onUndo} title="Undo">
          Undo
        </button>
        <button type="button" className="ghost icon-button" disabled={!canRedo} onClick={onRedo} title="Redo">
          Redo
        </button>
        <button type="button" className="ghost" onClick={onImportClick}>
          Ucitaj projekat
        </button>
        <button type="button" onClick={onExportJson}>
          Sacuvaj projekat
        </button>
      </div>
    </header>
  );
}
