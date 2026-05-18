export function createPdfReport(boardName, projectInfo, rows, phaseBalance, options) {
  const printablePhaseBalance = options.includePhaseBalance ? phaseBalance : null;
  const report = document.createElement("article");
  const totalCapacity = rows.reduce((total, row) => total + (Number(row.capacity) || 0), 0);
  const usedModules = rows.reduce((total, row) => total + getRowUsedModules(row), 0);
  const breakerCount = rows.reduce((total, row) => total + row.breakers.length, 0);

  report.className = "pdf-export pdf-report";
  report.innerHTML = `
    <header class="pdf-cover">
      <div class="pdf-brand">
        <span><strong>nik</strong><em>volt</em></span>
        <small>Tablo Generator</small>
      </div>
      <div class="pdf-title-block">
        <p>Profesionalni izvestaj elektro table</p>
        <h1>${escapeHtml(boardName || "Nova tabla")}</h1>
      </div>
    </header>

    <section class="pdf-meta-panel">
      <div class="pdf-meta">${createMetaItems(projectInfo)}</div>
    </section>

    <section class="pdf-summary" aria-label="Sazetak">
      <div><span>Redova</span><strong>${rows.length}</strong></div>
      <div><span>Elemenata</span><strong>${breakerCount}</strong></div>
      <div><span>Modula</span><strong>${usedModules} / ${totalCapacity}M</strong></div>
      <div><span>Datum</span><strong>${escapeHtml(formatDate(projectInfo.date))}</strong></div>
    </section>

    ${printablePhaseBalance ? createPhaseBalance(printablePhaseBalance) : ""}

    <section class="pdf-board-layout">
      <div class="pdf-section-title">
        <span>01</span>
        <h2>Raspored table</h2>
      </div>
      <div class="pdf-rows">${rows.map(createPdfRow).join("")}</div>
    </section>

    <section class="pdf-element-table">
      <div class="pdf-section-title">
        <span>02</span>
        <h2>Lista elemenata</h2>
      </div>
      ${createElementTable(rows)}
    </section>

    <section class="pdf-signatures">
      <div><span>Instalater</span></div>
      <div><span>Odgovorno lice / investitor</span></div>
      <div><span>Napomena / pecat</span></div>
    </section>
  `;

  return report;
}

export function safeFileName(value) {
  return value.replace(/[\\/:*?"<>|]/g, "-").trim() || "tabla";
}

function createMetaItems(projectInfo) {
  const items = [
    ["Objekat", projectInfo.objectName],
    ["Adresa", projectInfo.address],
    ["Investitor", projectInfo.investor],
    ["Instalater", projectInfo.installer],
    ["Broj dokumenta", projectInfo.documentNumber],
    ["Datum", formatDate(projectInfo.date)],
    ["Napomena", projectInfo.note],
  ];
  const filledItems = items.filter(([, value]) => value);

  if (!filledItems.length) {
    return `<div><dt>Dokumentacija</dt><dd>Nisu uneti dodatni podaci.</dd></div>`;
  }

  return filledItems.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
}

function createPhaseBalance(phaseBalance) {
  return `
    <section class="${phaseBalance.isBalanced ? "pdf-phase-balance" : "pdf-phase-balance warning"}">
      <strong>Balans faza</strong>
      <span>L1 ${phaseBalance.totals.L1.toFixed(0)} W</span>
      <span>L2 ${phaseBalance.totals.L2.toFixed(0)} W</span>
      <span>L3 ${phaseBalance.totals.L3.toFixed(0)} W</span>
      <em>Razlika ${phaseBalance.spread.toFixed(0)} W</em>
    </section>
  `;
}

function createPdfRow(row, index) {
  const usedModules = getRowUsedModules(row);
  const capacity = Number(row.capacity) || 0;
  const breakers = row.breakers.length ? row.breakers.map(createBreakerCard).join("") : `<p class="pdf-empty-row">Red je prazan.</p>`;

  return `
    <section class="pdf-row">
      <header>
        <div>
          <span>Red ${index + 1}</span>
          <h3>${escapeHtml(row.name || `Red ${index + 1}`)}</h3>
        </div>
        <strong>${usedModules}/${capacity}M</strong>
      </header>
      <div class="pdf-breaker-row">${breakers}</div>
    </section>
  `;
}

function createBreakerCard(breaker) {
  const modules = Number(breaker.poles) || 1;
  const load = breaker.loadW || legacyLoadWatts(breaker);
  const typeClass = breaker.type === "fid" ? " fid" : breaker.type === "neutral" ? " neutral" : breaker.type === "bell" ? " bell" : "";

  return `
    <article class="pdf-breaker${typeClass}" style="--module-span: ${modules}">
      <strong>${escapeHtml(breaker.amp || "-")}</strong>
      <span>${escapeHtml(breaker.label || "-")}</span>
      <em>${escapeHtml(breaker.phase || "-")}</em>
      <small>${modules}M${load ? ` / ${escapeHtml(load)} W` : ""}</small>
      <p>${escapeHtml(breaker.description || "Bez opisa")}</p>
    </article>
  `;
}

function createElementTable(rows) {
  const rowsHtml = rows
    .flatMap((row, rowIndex) =>
      row.breakers.map((breaker, breakerIndex) => {
        const load = breaker.loadW || legacyLoadWatts(breaker) || "-";

        return `
          <tr>
            <td>${rowIndex + 1}.${breakerIndex + 1}</td>
            <td>${escapeHtml(row.name)}</td>
            <td>${escapeHtml(breaker.label)}</td>
            <td>${escapeHtml(breaker.amp)}</td>
            <td>${escapeHtml(breakerTypeLabel(breaker.type))}</td>
            <td>${escapeHtml(breaker.phase || "-")}</td>
            <td>${escapeHtml(load)}</td>
            <td>${escapeHtml(breaker.poles || 1)}M</td>
            <td>${escapeHtml(breaker.description || "")}</td>
          </tr>
        `;
      }),
    )
    .join("");

  return `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Red</th>
          <th>Oznaka</th>
          <th>Amp.</th>
          <th>Element</th>
          <th>Faza</th>
          <th>Snaga</th>
          <th>Mod.</th>
          <th>Opis</th>
        </tr>
      </thead>
      <tbody>${rowsHtml || `<tr><td colspan="9">Nema unetih elemenata.</td></tr>`}</tbody>
    </table>
  `;
}

function getRowUsedModules(row) {
  return row.breakers.reduce((total, breaker) => total + (Number(breaker.poles) || 1), 0);
}

function breakerTypeLabel(type) {
  const labels = {
    breaker: "Osigurac",
    fid: "FID",
    neutral: "N/PE",
    bell: "Zvonce",
    timer: "Tajmer",
    contactor: "Kontaktor",
    surge: "Prenaponska zastita",
    meter: "Merac",
    busbar: "Sina",
  };

  return labels[type] || "Element";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("sr-RS");
}

function legacyLoadWatts(breaker) {
  const legacyKw = Number(String(breaker.loadKw || "").replace(",", "."));
  return Number.isFinite(legacyKw) && legacyKw > 0 ? String(Math.round(legacyKw * 1000)) : "";
}
