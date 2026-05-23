import { useEffect, useState } from "react";

export function Topbar({
  boardName,
  autosaveLabel,
  onBoardNameChange,
  onExportJson,
  onImportClick,
  onNewProject,
  onShareProject,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [smallScreen, setSmallScreen] = useState(() => window.matchMedia?.("(max-width: 900px)").matches ?? false);
  const mobileActions = [
    { title: "Novi projekat", text: "Prazna tabla sa jednim redom", onClick: onNewProject },
    { title: "Sacuvaj projekat", text: "Preuzmi projekat u fajl", onClick: onExportJson, primary: true },
    { title: "Ucitaj projekat", text: "Otvori postojeci projekat", onClick: onImportClick },
    onShareProject ? { title: "Podeli projekat", text: "Posalji projekat drugoj osobi", onClick: onShareProject } : null,
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
            <button type="button" className="ghost" onClick={onImportClick}>
              Ucitaj projekat
            </button>
            <button type="button" onClick={onExportJson}>
              Sacuvaj projekat
            </button>
          </div>
        </div>
        {
          <button
            type="button"
            className={`floating-menu-button${menuOpen ? " open" : ""}`}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 50,
              height: 50,
              zIndex: 3,
              placeItems: "center",
              borderRadius: 999,
              background: menuOpen ? "#ffd60a" : "#0a0a0a",
              border: "1px solid rgba(10, 10, 10, 0.16)",
              color: menuOpen ? "#0a0a0a" : "#ffffff",
              boxShadow: "0 12px 34px rgba(10, 10, 10, 0.22), 0 0 0 4px rgba(255, 214, 10, 0.14)",
              padding: 0,
            }}
            aria-label="Meni"
            aria-expanded={menuOpen}
            aria-controls="project-menu"
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span className="hamburger-lines" style={{ width: 24, display: "grid", gap: 4 }} aria-hidden="true">
              <span style={{ height: 2, borderRadius: 999, background: "currentColor" }} />
              <span style={{ height: 2, borderRadius: 999, background: "currentColor" }} />
              <span style={{ height: 2, borderRadius: 999, background: "currentColor" }} />
              <span style={{ height: 2, borderRadius: 999, background: "currentColor" }} />
            </span>
          </button>
        }
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
                  onClick={() => runAction(action)}
                >
                  <span className="menu-card-title">{action.title}</span>
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
