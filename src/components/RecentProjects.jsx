import { useState } from "react";

export function RecentProjects({ items, onLoad, onRemove }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!items.length) return null;

  return (
    <>
      <div className="recent-projects" aria-label="Poslednji projekti">
        <button type="button" className="ghost" onClick={() => setIsOpen(true)}>
          Poslednje
        </button>
      </div>
      {isOpen && (
        <div className="modal-backdrop" onClick={() => setIsOpen(false)}>
          <section className="choice-modal recent-modal" aria-label="Poslednji projekti" onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p>Poslednje</p>
                <h2>Poslednji projekti</h2>
              </div>
              <button type="button" className="close-button" onClick={() => setIsOpen(false)}>
                Zatvori
              </button>
            </div>
            <div className="recent-list">
              {items.map((item) => (
                <div className="recent-item" key={`${item.boardName}-${item.savedAt}`}>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => {
                      onLoad(item.project);
                      setIsOpen(false);
                    }}
                  >
                    {item.objectName || item.boardName}
                  </button>
                  <button type="button" className="danger recent-remove" aria-label={`Obrisi ${item.objectName || item.boardName}`} onClick={() => onRemove(item.savedAt)}>
                    x
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
