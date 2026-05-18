export async function exportBoardPdf(boardNode, boardName) {
  if (!boardNode) return;

  const [{ jsPDF }, html2canvasModule] = await Promise.all([import("jspdf"), import("html2canvas")]);
  const html2canvas = html2canvasModule.default;
  const exportNode = boardNode.cloneNode(true);
  const exportWrap = document.createElement("div");
  const title = document.createElement("h1");

  title.textContent = boardName || "Nova tabla";
  exportWrap.className = "pdf-export";
  exportNode.querySelector(".board-head")?.remove();
  exportNode.querySelectorAll(".row-toolbar").forEach((node) => node.remove());
  exportNode.querySelectorAll(".breaker.active").forEach((node) => node.classList.remove("active"));
  exportWrap.append(title, exportNode);
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
