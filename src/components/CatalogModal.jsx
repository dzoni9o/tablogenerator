import { breakerCatalog } from "../data/breakerCatalog";

export function CatalogModal({ onAdd, onClose }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="choice-modal catalog-modal" aria-label="Katalog elemenata" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p>Dodaj element</p>
            <h2>Katalog table</h2>
          </div>
          <button type="button" className="close-button" onClick={onClose}>
            Zatvori
          </button>
        </div>

        <div className="catalog-grid">
          {breakerCatalog.map((item) => (
            <button key={item.type} type="button" onClick={() => onAdd(item.type)}>
              <strong>{item.label}</strong>
              <span>
                {item.poles}M · {item.amp}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
