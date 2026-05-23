import { useMemo, useState } from "react";

const breakerCurves = ["B", "C", "D"];
const breakerAmps = ["6", "10", "16", "20", "25", "35", "40", "50"];
const fidAmps = ["10", "16", "20", "25", "35", "40", "50"];
const fidSensitivities = ["30mA", "50mA", "300mA", "500mA"];

export function ProtectionChoiceModal({ mode, onCancel, onConfirm }) {
  const isFid = mode === "fid";
  const [curve, setCurve] = useState("B");
  const [fidPhase, setFidPhase] = useState("single");
  const [amp, setAmp] = useState("");
  const [customAmp, setCustomAmp] = useState("");
  const [step, setStep] = useState(isFid ? "phase" : "amp");

  const selectedAmp = useMemo(() => cleanAmp(amp === "custom" ? customAmp : amp), [amp, customAmp]);
  const canContinue = selectedAmp.length > 0;

  return (
    <div className="modal-backdrop" onMouseDown={onCancel}>
      <section className="choice-modal protection-choice-modal" aria-label={isFid ? "Dodaj FID sklopku" : "Dodaj osigurac"} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p>{isFid ? "Dodaj FID" : "Dodaj osigurac"}</p>
            <h2>{getModalTitle(isFid, step)}</h2>
          </div>
          <button type="button" className="close-button" onClick={onCancel}>
            Zatvori
          </button>
        </div>

        {!isFid && (
          <div className="choice-group">
            <span>Tip krive</span>
            <div className="segmented-options">
              {breakerCurves.map((item) => (
                <button key={item} type="button" className={curve === item ? "active" : ""} onClick={() => setCurve(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {isFid && step === "phase" ? (
          <div className="choice-group">
            <span>Tip FID sklopke</span>
            <div className="segmented-options fid-phase-options">
              <button type="button" className={fidPhase === "single" ? "active" : ""} onClick={() => setFidPhase("single")}>
                Monofazni
              </button>
              <button type="button" className={fidPhase === "three" ? "active" : ""} onClick={() => setFidPhase("three")}>
                Trofazni
              </button>
            </div>
          </div>
        ) : isFid && step === "sensitivity" ? (
          <div className="choice-group">
            <span>Osetljivost</span>
            <div className="amp-grid">
              {fidSensitivities.map((item) => (
                <button key={item} type="button" onClick={() => onConfirm({ phase: fidPhase, amp: selectedAmp, sensitivity: item })}>
                  {item}
                </button>
              ))}
            </div>
            <button type="button" className="ghost back-choice" onClick={() => setStep("amp")}>
              Nazad
            </button>
          </div>
        ) : (
          <div className="choice-group">
            <span>{isFid ? "Nazivna struja" : "Amperaza"}</span>
            <div className="amp-grid">
              {(isFid ? fidAmps : breakerAmps).map((item) => (
                <button key={item} type="button" className={amp === item ? "active" : ""} onClick={() => setAmp(item)}>
                  {item}A
                </button>
              ))}
              <button type="button" className={amp === "custom" ? "active" : ""} onClick={() => setAmp("custom")}>
                Unesi sam
              </button>
            </div>

            {amp === "custom" && (
              <label className="custom-choice">
                Unos
                <input
                  autoFocus
                  inputMode="numeric"
                  placeholder={isFid ? "npr. 63A" : "npr. 13A"}
                  value={customAmp}
                  onChange={(event) => setCustomAmp(event.target.value)}
                />
              </label>
            )}
          </div>
        )}

        {!isFid && (
          <div className="modal-actions choice-actions">
            <button type="button" className="ghost" onClick={onCancel}>
              Odustani
            </button>
            <button type="button" disabled={!canContinue} onClick={() => onConfirm({ curve, amp: selectedAmp })}>
              Dodaj {curve}
              {selectedAmp}
            </button>
          </div>
        )}

        {isFid && step === "phase" && (
          <div className="modal-actions choice-actions">
            <button type="button" className="ghost" onClick={onCancel}>
              Odustani
            </button>
            <button type="button" onClick={() => setStep("amp")}>
              Dalje
            </button>
          </div>
        )}

        {isFid && step === "amp" && (
          <div className="modal-actions choice-actions">
            <button type="button" className="ghost" onClick={onCancel}>
              Odustani
            </button>
            <button type="button" className="ghost back-choice" onClick={() => setStep("phase")}>
              Nazad
            </button>
            <button type="button" disabled={!canContinue} onClick={() => setStep("sensitivity")}>
              Dalje
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function getModalTitle(isFid, step) {
  if (!isFid) return "Izaberi parametre";
  if (step === "phase") return "Monofazni ili trofazni";
  if (step === "sensitivity") return "Izaberi osetljivost";
  return "Izaberi parametre";
}

function cleanAmp(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/A$/i, "")
    .replace(/[^\d]/g, "")
    .slice(0, 3);
}
