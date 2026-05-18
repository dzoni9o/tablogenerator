export function Topbar({ boardName, autosaveLabel, onBoardNameChange, onExportJson, onImportClick }) {
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
        <button type="button" className="ghost" onClick={onImportClick}>
          Ucitaj JSON
        </button>
        <button type="button" onClick={onExportJson}>
          Sacuvaj JSON
        </button>
      </div>
    </header>
  );
}
