import { useEffect, useState } from "react";

export function Topbar({
  boardName,
  autosaveLabel,
  cloudBusy,
  onBoardNameChange,
  onExportJson,
  onImportClick,
  onNewProject,
  onSaveToCloud,
  onOpenProjects,
  onShareProject,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [smallScreen, setSmallScreen] = useState(() => window.matchMedia?.("(max-width: 900px)").matches ?? false);
  const mobileActions = [
    { title: "Novi projekat", text: "Prazna tabla sa jednim redom", onClick: onNewProject },
    { title: "Sačuvaj u oblak", text: "Čuvaj projekat na svom nalogu", onClick: onSaveToCloud, primary: true },
    { title: "Moji projekti", text: "Učitaj projekat iz oblaka", onClick: onOpenProjects },
    { title: "Izvezi .tgen", text: "Preuzmi projekat kao fajl", onClick: onExportJson },
    { title: "Uvezi .tgen", text: "Otvori .tgen fajl", onClick: onImportClick },
    onShareProject ? { title: "Podeli .tgen", text: "Pošalji projekat drugoj osobi", onClick: onShareProject } : null,
    { title: "Odjava", text: "Izloguj se iz aplikacije", onClick: onLogout },
  ].filter(Boolean);

  useEffect(() => {
    const query = window.matchMedia?.("(max-width: 900px)");
    if (!query) return undefined;

    const update = () => {
      setSmallScreen(query.matches);
      if (!query.matches) setMenuOpen(false);
    };

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;

    function closeOnEscape(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  function runAction(action) {
    setMenuOpen(false);
    action.onClick();
  }

  return (
    <>
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
        <div className="topbar-actions desktop-project-actions">
          <span className="autosave-status">{autosaveLabel}</span>
          <div className="project-actions">
            <button type="button" className="ghost" onClick={onNewProject}>
              Novi projekat
            </button>
            <button type="button" className="ghost" onClick={onOpenProjects}>
              Moji projekti
            </button>
            <button type="button" className="ghost" onClick={onImportClick}>
              Uvezi .tgen
            </button>
            <button type="button" className="ghost" onClick={onExportJson}>
              Izvezi .tgen
            </button>
            <button type="button" disabled={cloudBusy} onClick={onSaveToCloud}>
              {cloudBusy ? "Čuvanje…" : "Sačuvaj u oblak"}
            </button>
            <button type="button" className="ghost" onClick={onLogout}>
              Odjava
            </button>
          </div>
        </div>
        <button
          type="button"
          className={`floating-menu-button${menuOpen ? " open" : ""}`}
          aria-label="Meni"
          aria-expanded={menuOpen}
          aria-controls="project-menu"
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span className="hamburger-lines" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
        </button>
      </header>

      {smallScreen && menuOpen && (
        <div className="floating-menu-backdrop" onClick={() => setMenuOpen(false)}>
          <section id="project-menu" className="floating-menu-panel" aria-label="Projektni meni" onClick={(event) => event.stopPropagation()}>
            <div className="floating-menu-head">
              <p>Meni</p>
              <strong>Projekat</strong>
            </div>

            <div className="floating-menu-grid">
              {mobileActions.map((action) => (
                <button
                  key={action.title}
                  type="button"
                  className={action.primary ? "menu-card primary" : "menu-card"}
                  disabled={action.onClick === onSaveToCloud && cloudBusy}
                  onClick={() => runAction(action)}
                >
                  <span className="menu-card-title">
                    {action.onClick === onSaveToCloud && cloudBusy ? "Čuvanje…" : action.title}
                  </span>
                  <span className="menu-card-text">{action.text}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
