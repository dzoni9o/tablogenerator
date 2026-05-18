export function Topbar({
  boardName,
  autosaveLabel,
  onBoardNameChange,
  onDuplicateProject,
  onExportJson,
  onImportClick,
  onNewProject,
  onOpenTemplates,
  recentProjectsNode,
}) {
  return (
    <header className="topbar">
      <div className="topbar-title">
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
        <div className="project-actions">
          <button type="button" className="ghost" onClick={onNewProject}>
            Novi projekat
          </button>
          <button type="button" className="ghost" onClick={onDuplicateProject}>
            Kopiraj projekat
          </button>
          <button type="button" className="ghost" onClick={onOpenTemplates}>
            Sabloni
          </button>
          {recentProjectsNode}
          <button type="button" className="ghost" onClick={onImportClick}>
            Ucitaj projekat
          </button>
          <button type="button" onClick={onExportJson}>
            Sacuvaj projekat
          </button>
        </div>
      </div>
    </header>
  );
}
