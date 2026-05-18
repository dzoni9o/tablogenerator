export async function exportBoardPdf(boardNode, boardName, projectInfo = {}, rows = [], phaseBalance = null, options = {}) {
  if (!boardNode) return;

  const [{ jsPDF }, html2canvasModule] = await Promise.all([import("jspdf"), import("html2canvas")]);
  const html2canvas = html2canvasModule.default;
  const exportNode = boardNode.cloneNode(true);
  const exportWrap = document.createElement("div");
  const title = document.createElement("h1");
  const brand = document.createElement("div");
  const meta = document.createElement("dl");
  const elementTable = document.createElement("section");
  const signatures = document.createElement("section");

  title.textContent = boardName || "Nova tabla";
  exportWrap.className = "pdf-export";
  brand.className = "pdf-brand";
  brand.innerHTML = `<span>nik<span>·</span>volt</span><strong>Tablo Generator</strong>`;
  meta.className = "pdf-meta";
  meta.innerHTML = [
    ["Objekat", projectInfo.objectName],
    ["Adresa", projectInfo.address],
    ["Investitor", projectInfo.investor],
    ["Instalater", projectInfo.installer],
    ["Broj dokumenta", projectInfo.documentNumber],
    ["Datum", projectInfo.date],
    ["Napomena", projectInfo.note],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`)
    .join("");
  elementTable.className = "pdf-element-table";
  const printablePhaseBalance = options.includePhaseBalance ? phaseBalance : null;

  elementTable.innerHTML = createElementTable(rows, printablePhaseBalance);
  signatures.className = "pdf-signatures";
  signatures.innerHTML = `
    <div><span>Instalater</span></div>
    <div><span>Odgovorno lice / investitor</span></div>
    <div><span>Napomena / pecat</span></div>
  `;
  exportNode.querySelector(".board-head")?.remove();
  if (!options.includePhaseBalance) exportNode.querySelector(".phase-balance")?.remove();
  exportNode.querySelectorAll(".row-toolbar").forEach((node) => node.remove());
  exportNode.querySelectorAll(".phase-print-toggle").forEach((node) => node.remove());
  exportNode.querySelectorAll(".breaker.active").forEach((node) => node.classList.remove("active"));
  exportWrap.append(brand, title, meta, exportNode, elementTable, signatures);
  document.body.append(exportWrap);

  try {
    const canvas = await html2canvas(exportWrap, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
    });
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 12;
    const footerHeight = 10;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2 - footerHeight;
    const pageCanvasHeight = Math.floor((contentHeight * canvas.width) / contentWidth);
    const pageCount = Math.max(1, Math.ceil(canvas.height / pageCanvasHeight));

    for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
      if (pageIndex > 0) pdf.addPage();

      const sliceCanvas = document.createElement("canvas");
      const sliceContext = sliceCanvas.getContext("2d");
      const sourceY = pageIndex * pageCanvasHeight;
      const sliceHeight = Math.min(pageCanvasHeight, canvas.height - sourceY);

      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeight;
      sliceContext.fillStyle = "#ffffff";
      sliceContext.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      sliceContext.drawImage(canvas, 0, sourceY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

      const imageData = sliceCanvas.toDataURL("image/png");
      const imageHeight = (sliceHeight * contentWidth) / canvas.width;

      pdf.addImage(imageData, "PNG", margin, margin, contentWidth, imageHeight);
      pdf.setFontSize(9);
      pdf.setTextColor(10, 10, 10);
      pdf.text(`Strana ${pageIndex + 1} / ${pageCount}`, pageWidth / 2, pageHeight - 7, { align: "center" });
    }

    pdf.save(`${safeFileName(boardName || "tabla")}.pdf`);
  } finally {
    exportWrap.remove();
  }
}

function safeFileName(value) {
  return value.replace(/[\\/:*?"<>|]/g, "-").trim() || "tabla";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function createElementTable(rows, phaseBalance) {
  const rowsHtml = rows
    .flatMap((row) =>
      row.breakers.map(
        (breaker) => `
          <tr>
            <td>${escapeHtml(row.name)}</td>
            <td>${escapeHtml(breaker.label)}</td>
            <td>${escapeHtml(breaker.amp)}</td>
            <td>${escapeHtml(breaker.phase || "-")}</td>
            <td>${escapeHtml(breaker.loadW || legacyLoadWatts(breaker) || "-")}</td>
            <td>${escapeHtml(breaker.poles || 1)}M</td>
            <td>${escapeHtml(breaker.description || "")}</td>
          </tr>
        `,
      ),
    )
    .join("");
  const balance = phaseBalance
    ? `<p>Balans: L1 ${phaseBalance.totals.L1.toFixed(0)} W · L2 ${phaseBalance.totals.L2.toFixed(0)} W · L3 ${phaseBalance.totals.L3.toFixed(0)} W · razlika ${phaseBalance.spread.toFixed(0)} W</p>`
    : "";

  return `
    <h2>Lista elemenata</h2>
    ${balance}
    <table>
      <thead>
        <tr>
          <th>Red</th>
          <th>Oznaka</th>
          <th>Amp.</th>
          <th>Faza</th>
          <th>W</th>
          <th>Mod.</th>
          <th>Opis</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  `;
}

function legacyLoadWatts(breaker) {
  const legacyKw = Number(String(breaker.loadKw || "").replace(",", "."));
  return Number.isFinite(legacyKw) && legacyKw > 0 ? String(Math.round(legacyKw * 1000)) : "";
}
