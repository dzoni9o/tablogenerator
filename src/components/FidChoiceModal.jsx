export function FidChoiceModal({ pendingPhase, onCancel, onChoosePhase, onConfirm }) {
  return (
    <div className="modal-backdrop" onMouseDown={onCancel}>
      <section className="choice-modal" aria-label="Izbor FID sklopke" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p>Dodaj FID</p>
            <h2>{pendingPhase ? "Dodati i N prekid?" : "Izaberi tip zastite"}</h2>
          </div>
          <button type="button" className="close-button" onClick={onCancel}>
            Zatvori
          </button>
        </div>

        <div className="fid-options">
          {!pendingPhase ? (
            <>
              <button type="button" onClick={() => onChoosePhase("single")}>
                <strong>Monofazni FID</strong>
                <span>Zauzima sirinu 2 osiguraca</span>
              </button>
              <button type="button" onClick={() => onChoosePhase("three")}>
                <strong>Trofazni FID</strong>
                <span>Zauzima sirinu 4 osiguraca</span>
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => onConfirm(true)}>
                <strong>Da, dodaj N prekid</strong>
                <span>Bice dodat odmah pored FID sklopke</span>
              </button>
              <button type="button" onClick={() => onConfirm(false)}>
                <strong>Ne, samo FID</strong>
                <span>FID ostaje bez dodatnog N prekida</span>
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
