import { useEffect, useState } from "react";
import { deleteProject, listProjects } from "../lib/projekti";

export function MojiProjektiModal({ onLoad, onClose }) {
  const [projekti, setProjekti] = useState(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    listProjects()
      .then(setProjekti)
      .catch(() => setError("Nije moguće učitati projekte."));
  }, []);

  async function handleDelete(id, event) {
    event.stopPropagation();
    if (!window.confirm("Obriši ovaj projekat iz oblaka?")) return;
    setDeleting(id);
    try {
      await deleteProject(id);
      setProjekti((current) => current.filter((p) => p.id !== id));
    } catch {
      setError("Brisanje nije uspelo.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <strong>Moji projekti</strong>
          <button type="button" className="ghost icon-button" onClick={onClose} aria-label="Zatvori">
            ✕
          </button>
        </div>

        {error && <p className="login-error" style={{ margin: "0 0 12px" }}>{error}</p>}

        {projekti === null && !error && <p style={{ color: "var(--ink-soft)" }}>Učitavanje…</p>}

        {projekti !== null && projekti.length === 0 && (
          <p style={{ color: "var(--ink-soft)" }}>Nema sačuvanih projekata u oblaku.</p>
        )}

        {projekti !== null && projekti.length > 0 && (
          <ul className="projekti-lista">
            {projekti.map((p) => (
              <li key={p.id} className="projekat-stavka" onClick={() => onLoad(p.id)}>
                <div className="projekat-info">
                  <span className="projekat-naziv">{p.naziv || "Bez naziva"}</span>
                  <span className="projekat-datum">
                    {new Date(p.updated_at).toLocaleString("sr-RS", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <button
                  type="button"
                  className="ghost icon-button projekat-brisi"
                  disabled={deleting === p.id}
                  onClick={(e) => handleDelete(p.id, e)}
                  aria-label="Obriši projekat"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
