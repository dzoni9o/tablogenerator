import "../styles/pdfReport.css";
import { createPdfReport, safeFileName } from "./pdfReportTemplate";

export async function exportBoardPdf(_boardNode, boardName, projectInfo = {}, rows = [], phaseBalance = null, options = {}) {
  const [{ jsPDF }, html2canvasModule] = await Promise.all([import("jspdf"), import("html2canvas")]);
  const html2canvas = html2canvasModule.default;
  const exportWrap = createPdfReport(boardName, projectInfo, rows, phaseBalance, options);

  document.body.append(exportWrap);

  try {
    const canvas = await html2canvas(exportWrap, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      windowWidth: 1120,
    });

    saveCanvasAsPdf(canvas, boardName);
  } finally {
    exportWrap.remove();
  }

  function saveCanvasAsPdf(canvas, title) {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const footerHeight = 9;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2 - footerHeight;
    const pageCanvasHeight = Math.floor((contentHeight * canvas.width) / contentWidth);
    const pageCount = Math.max(1, Math.ceil(canvas.height / pageCanvasHeight));

    for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
      if (pageIndex > 0) pdf.addPage();
      addPageSlice(pdf, canvas, pageIndex, pageCanvasHeight, contentWidth, margin);
      pdf.setFontSize(8);
      pdf.setTextColor(85, 85, 85);
      pdf.text(`${title || "Tablo generator"} - Strana ${pageIndex + 1} / ${pageCount}`, pageWidth / 2, pageHeight - 6, { align: "center" });
    }

    pdf.save(`${safeFileName(title || "tabla")}.pdf`);
  }
}

function addPageSlice(pdf, canvas, pageIndex, pageCanvasHeight, contentWidth, margin) {
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
}
