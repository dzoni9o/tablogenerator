import { consumerIcons } from "../data/consumerIcons";

const colors = {
  ink: [10, 10, 10],
  softInk: [96, 96, 96],
  muted: [244, 244, 239],
  line: [214, 214, 208],
  rail: [247, 247, 244],
  brand: [255, 214, 10],
  brandSoft: [255, 246, 204],
  dangerSoft: [255, 237, 234],
  danger: [238, 54, 47],
  white: [255, 255, 255],
};

const page = {
  margin: 12,
  footerHeight: 9,
};

export async function exportBoardPdf(_boardNode, boardName, projectInfo = {}, rows = [], phaseBalance = null, options = {}) {
  const { jsPDF } = await import("jspdf/dist/jspdf.es.min.js");
  const pdf = createVectorPdf(jsPDF, boardName, projectInfo, rows, phaseBalance, options);
  await savePdf(pdf, boardName);
}

function createVectorPdf(jsPDF, boardName, projectInfo, rows, phaseBalance, options) {
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
    compress: true,
    putOnlyUsedFonts: true,
  });

  const context = {
    doc,
    boardName: cleanText(boardName || "Nova tabla"),
    pageWidth: doc.internal.pageSize.getWidth(),
    pageHeight: doc.internal.pageSize.getHeight(),
    margin: page.margin,
    contentWidth: doc.internal.pageSize.getWidth() - page.margin * 2,
    bottom: doc.internal.pageSize.getHeight() - page.margin - page.footerHeight,
    y: page.margin,
  };

  doc.setProperties({
    title: context.boardName,
    subject: "Tablo Generator izvestaj elektro table",
    creator: "Nikvolt Tablo Generator",
  });

  drawCover(context, projectInfo);
  drawMetaPanel(context, projectInfo);
  drawSummary(context, rows);

  if (options.includePhaseBalance && phaseBalance) {
    drawPhaseBalance(context, phaseBalance);
  }

  drawBoardLayout(context, rows);
  drawElementTable(context, rows);
  drawSignatures(context);
  drawFooters(context);

  return doc;
}

function drawCover(context, projectInfo) {
  const { doc, margin, contentWidth } = context;
  const title = context.boardName;
  const date = formatDate(projectInfo.date);
  const headerHeight = 34;
  const brandWidth = 46;
  const titleX = margin + brandWidth + 8;
  const titleWidth = contentWidth - brandWidth - 8;

  setDraw(doc, colors.line);
  setFill(doc, colors.white);
  doc.roundedRect(margin, context.y, contentWidth, headerHeight, 3, 3, "FD");

  setFill(doc, [38, 38, 38]);
  doc.roundedRect(margin, context.y, brandWidth, headerHeight, 3, 3, "F");
  setFont(doc, 16, "bold", colors.white);
  doc.text("nikvolt", margin + brandWidth / 2, context.y + 15, { align: "center" });
  setFill(doc, colors.brand);
  doc.rect(margin, context.y + headerHeight - 4, brandWidth, 4, "F");

  setFont(doc, 6.4, "bold", colors.softInk);
  doc.text("PROFESIONALNI IZVESTAJ ELEKTRO TABLE", titleX, context.y + 8);
  setFont(doc, 16, "bold", colors.ink);
  drawSingleLine(doc, title, titleX, context.y + 20.5, titleWidth, 16, 9.5, "bold");
  setFont(doc, 6.4, "bold", colors.softInk);
  doc.text("Nikvolt Tablo Generator", titleX, context.y + 29);
  if (date) {
    doc.text(date, margin + contentWidth - 4, context.y + 29, { align: "right" });
  }

  context.y += headerHeight + 10;
}

function drawMetaPanel(context, projectInfo) {
  const items = [
    ["Objekat", projectInfo.objectName],
    ["Adresa", projectInfo.address],
    ["Investitor", projectInfo.investor],
    ["Instalater", projectInfo.installer],
    ["Broj dokumenta", projectInfo.documentNumber],
    ["Napomena", projectInfo.note],
  ].filter(([, value]) => cleanText(value));

  if (!items.length) return;

  const cards = items;
  const gap = 3;
  const columns = 3;
  const cardWidth = (context.contentWidth - gap * (columns - 1)) / columns;
  const rows = Math.ceil(cards.length / columns);
  const cardHeight = 16;
  const panelHeight = rows * cardHeight + (rows - 1) * gap + 10;

  ensureSpace(context, panelHeight);

  const { doc, margin } = context;
  setDraw(doc, colors.line);
  setFill(doc, colors.white);
  doc.roundedRect(margin, context.y, context.contentWidth, panelHeight, 2.5, 2.5, "FD");

  cards.forEach(([label, value], index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = margin + 5 + column * (cardWidth + gap);
    const y = context.y + 5 + row * (cardHeight + gap);

    setDraw(doc, colors.line);
    setFill(doc, colors.muted);
    doc.roundedRect(x, y, cardWidth - 2, cardHeight, 2, 2, "FD");
    setFont(doc, 5.5, "bold", colors.softInk);
    doc.text(cleanText(label).toUpperCase(), x + 3, y + 5);
    setFont(doc, 7, "bold", colors.ink);
    drawWrapped(doc, cleanText(value), x + 3, y + 10.2, cardWidth - 8, 3.1, 2);
  });

  context.y += panelHeight + 6;
}

function drawSummary(context, rows) {
  const totalCapacity = rows.reduce((total, row) => total + (Number(row.capacity) || 0), 0);
  const usedModules = rows.reduce((total, row) => total + getRowUsedModules(row), 0);
  const breakerCount = rows.reduce((total, row) => total + row.breakers.length, 0);
  const items = [
    ["Redova", rows.length],
    ["Elemenata", breakerCount],
    ["Modula", `${usedModules} / ${totalCapacity}M`],
  ];

  const gap = 3;
  const boxWidth = (context.contentWidth - gap * (items.length - 1)) / items.length;
  const boxHeight = 17;
  ensureSpace(context, boxHeight + 2);

  items.forEach(([label, value], index) => {
    const x = context.margin + index * (boxWidth + gap);
    setDraw(context.doc, colors.line);
    setFill(context.doc, colors.brandSoft);
    context.doc.roundedRect(x, context.y, boxWidth, boxHeight, 2, 2, "FD");
    setFont(context.doc, 5.5, "bold", colors.softInk);
    context.doc.text(cleanText(label).toUpperCase(), x + 3, context.y + 5);
    setFont(context.doc, 10, "bold", colors.ink);
    drawSingleLine(context.doc, String(value), x + 3, context.y + 12, boxWidth - 6, 10, 6, "bold");
  });

  context.y += boxHeight + 8;
}

function drawPhaseBalance(context, phaseBalance) {
  const items = [
    ["Balans faza", phaseBalance.isBalanced ? "U balansu" : "Proveriti"],
    ["L1", `${phaseBalance.totals.L1.toFixed(0)} W`],
    ["L2", `${phaseBalance.totals.L2.toFixed(0)} W`],
    ["L3", `${phaseBalance.totals.L3.toFixed(0)} W`],
    ["Razlika", `${phaseBalance.spread.toFixed(0)} W`],
  ];
  const gap = 3;
  const boxWidth = (context.contentWidth - gap * (items.length - 1)) / items.length;
  const boxHeight = 15;
  const fillColor = phaseBalance.isBalanced ? colors.brandSoft : colors.dangerSoft;
  const borderColor = phaseBalance.isBalanced ? colors.line : colors.danger;

  ensureSpace(context, boxHeight + 3);

  items.forEach(([label, value], index) => {
    const x = context.margin + index * (boxWidth + gap);
    setDraw(context.doc, borderColor);
    setFill(context.doc, fillColor);
    context.doc.roundedRect(x, context.y, boxWidth, boxHeight, 2, 2, "FD");
    setFont(context.doc, 5.2, "bold", colors.softInk);
    context.doc.text(cleanText(label).toUpperCase(), x + 2.5, context.y + 5);
    setFont(context.doc, 7, "bold", colors.ink);
    drawSingleLine(context.doc, String(value), x + 2.5, context.y + 11, boxWidth - 5, 7, 5.2, "bold");
  });

  context.y += boxHeight + 8;
}

function drawBoardLayout(context, rows) {
  drawSectionTitle(context, "01", "Raspored table");

  if (!rows.length) {
    ensureSpace(context, 14);
    setFont(context.doc, 8, "bold", colors.softInk);
    context.doc.text("Nema unetih redova.", context.margin, context.y + 5);
    context.y += 12;
    return;
  }

  rows.forEach((row, index) => drawPdfRow(context, row, index));
  context.y += 4;
}

function drawPdfRow(context, row, index) {
  const usedModules = getRowUsedModules(row);
  const capacity = Number(row.capacity) || 0;
  const railX = context.margin;
  const railWidth = context.contentWidth;
  const headerHeight = 9;
  const layout = layoutBreakers(row.breakers || [], railX, 0, railWidth);
  const rowHeight = headerHeight + layout.height + 7;

  ensureSpace(context, rowHeight);

  const { doc } = context;
  setFont(doc, 6, "bold", colors.softInk);
  doc.text(`RED ${index + 1}`, railX, context.y + 4);
  setFont(doc, 9, "bold", colors.ink);
  drawSingleLine(doc, cleanText(row.name || `Red ${index + 1}`), railX + 17, context.y + 4, 90, 9, 6, "bold");

  setDraw(doc, colors.line);
  setFill(doc, colors.brandSoft);
  doc.roundedRect(railX + railWidth - 28, context.y - 2, 28, 7, 3.5, 3.5, "FD");
  setFont(doc, 6.2, "bold", colors.ink);
  doc.text(`${usedModules}/${capacity}M`, railX + railWidth - 14, context.y + 2.7, { align: "center" });

  const railY = context.y + headerHeight;
  drawRail(context, row.breakers || [], railX, railY, railWidth, layout);
  context.y += rowHeight;
}

function drawRail(context, breakers, x, y, width, layout) {
  const { doc } = context;
  const height = layout.height;

  setDraw(doc, [184, 190, 198]);
  setFill(doc, colors.rail);
  doc.roundedRect(x, y, width, height, 2.2, 2.2, "FD");

  setDraw(doc, [224, 224, 218]);
  doc.setLineWidth(0.12);
  for (let gridX = x + layout.padding; gridX < x + width - 1.5; gridX += layout.moduleWidth + layout.gapX) {
    doc.line(gridX, y + 1.3, gridX, y + height - 1.3);
  }

  if (!breakers.length) {
    setFont(doc, 7, "bold", colors.softInk);
    doc.text("Red je prazan.", x + 5, y + height / 2 + 2);
    return;
  }

  const breakerRows = [...new Set(layout.items.map((item) => item.y))];
  breakerRows.forEach((rowY) => {
    setFill(doc, colors.brand);
    doc.rect(x + 1.6, y + rowY + layout.breakerHeight * 0.48, width - 3.2, 0.7, "F");
  });

  layout.items.forEach((item) => drawBreakerCard(context, item.breaker, item.x, y + item.y, item.width, layout.breakerHeight));
}

function drawBreakerCard(context, breaker, x, y, width, height) {
  const { doc } = context;
  const type = breaker.type || "breaker";
  const bottomFill = type === "fid" ? colors.brandSoft : colors.muted;
  const innerX = x + 1;
  const innerWidth = Math.max(1, width - 2);

  setFill(doc, [224, 224, 218]);
  doc.roundedRect(x + 0.45, y + 0.55, width, height, 1.35, 1.35, "F");

  setDraw(doc, [184, 190, 198]);
  setFill(doc, colors.white);
  doc.roundedRect(x, y, width, height, 1.35, 1.35, "FD");

  setFill(doc, bottomFill);
  doc.rect(x + 0.25, y + height * 0.46, width - 0.5, height * 0.54 - 0.4, "F");

  setFill(doc, [246, 246, 242]);
  doc.rect(x + width - 0.85, y + 0.8, 0.45, height - 1.6, "F");

  setDraw(doc, colors.line);
  doc.line(innerX, y + 5.2, x + width - 1, y + 5.2);
  doc.line(innerX, y + 8.1, x + width - 1, y + 8.1);

  drawSingleLine(doc, cleanText(breaker.amp || "-"), innerX, y + 7.1, innerWidth, 7.2, 4.6, "bold", "center");
  drawSingleLine(doc, cleanText(breaker.label || "-"), innerX, y + 12.2, innerWidth, 4.3, 2.8, "bold", "center");

  setDraw(doc, colors.line);
  setFill(doc, colors.white);
  const iconBoxSize = Math.min(6.5, Math.max(5.2, width * 0.52));
  const iconSize = iconBoxSize * 0.78;
  const iconX = x + width / 2 - iconBoxSize / 2;
  const iconY = y + 16.5;
  doc.roundedRect(iconX, iconY, iconBoxSize, iconBoxSize, 1.05, 1.05, "FD");
  drawConsumerIcon(doc, breaker.icon, x + width / 2, iconY + iconBoxSize / 2, iconSize);

  const load = breaker.loadW || legacyLoadWatts(breaker);
  const description = load ? `${load} W - ${breaker.description || "Bez opisa"}` : breaker.description || "Bez opisa";
  setFont(doc, width < 12 ? 3 : 3.4, "bold", colors.ink);
  drawWrapped(doc, cleanText(description), innerX, y + 25.2, innerWidth, width < 12 ? 1.7 : 1.9, 2, "center");
}

function layoutBreakers(breakers, railX, railY, railWidth) {
  const moduleWidth = 8.5;
  const gapX = 0.85;
  const gapY = 1.6;
  const padding = 2;
  const breakerHeight = 29;
  const maxX = railX + railWidth - padding;
  const items = [];
  let x = railX + padding;
  let y = railY + padding;

  breakers.forEach((breaker) => {
    const modules = Math.max(1, Number(breaker.poles) || 1);
    const width = moduleWidth * modules + gapX * Math.max(0, modules - 1);

    if (x > railX + padding && x + width > maxX) {
      x = railX + padding;
      y += breakerHeight + gapY;
    }

    items.push({ breaker, x, y, width });
    x += width + gapX;
  });

  const height = items.length ? y - railY + breakerHeight + padding : 20;
  return { items, height, moduleWidth, gapX, padding, breakerHeight };
}

function drawElementTable(context, rows) {
  drawSectionTitle(context, "02", "Lista elemenata");

  if (!rows.some((row) => (row.breakers || []).length)) {
    ensureSpace(context, 12);
    setFont(context.doc, 8, "bold", colors.softInk);
    context.doc.text("Nema unetih elemenata.", context.margin, context.y + 5);
    context.y += 12;
    return;
  }

  const columns = [
    ["label", "Oznaka", 30, "center"],
    ["amp", "Tip (B16, C20...)", 34, "center"],
    ["description", "Opis", context.contentWidth - 100, "center"],
    ["load", "Snaga", 36, "center"],
  ];

  rows.forEach((row, rowIndex) => drawRowElementTable(context, row, rowIndex, columns));
  context.y += 6;
}

function drawRowElementTable(context, row, rowIndex, columns) {
  const elements = (row.breakers || []).map((breaker) => ({
    label: breaker.label || "-",
    amp: breaker.amp || "-",
    description: breaker.description || "",
    load: formatLoadW(breaker.loadW || legacyLoadWatts(breaker)),
  }));

  const rowTitle = `Red ${rowIndex + 1} - ${row.name || `Red ${rowIndex + 1}`}`;
  ensureSpace(context, 24);
  drawRowTableTitle(context, rowTitle);
  drawTableHeader(context, columns);

  if (!elements.length) {
    drawTableRow(context, columns, { label: "-", amp: "-", description: "Red je prazan.", load: "-" }, () => {
      drawRowTableTitle(context, rowTitle);
      drawTableHeader(context, columns);
    });
    context.y += 3;
    return;
  }

  elements.forEach((element) =>
    drawTableRow(context, columns, element, () => {
      drawRowTableTitle(context, rowTitle);
      drawTableHeader(context, columns);
    }),
  );
  context.y += 4;
}

function drawRowTableTitle(context, title) {
  ensureSpace(context, 9);
  setDraw(context.doc, colors.line);
  setFill(context.doc, colors.muted);
  context.doc.roundedRect(context.margin, context.y, context.contentWidth, 8, 2, 2, "FD");
  setFont(context.doc, 7, "bold", colors.ink);
  drawSingleLine(context.doc, cleanText(title), context.margin + 4, context.y + 5.3, context.contentWidth - 8, 7, 5, "bold", "center");
  context.y += 9;
}

function drawTableHeader(context, columns) {
  ensureSpace(context, 10);
  let x = context.margin;
  const height = 7;

  columns.forEach(([, label, width, align = "center"]) => {
    setDraw(context.doc, colors.line);
    setFill(context.doc, colors.brandSoft);
    context.doc.rect(x, context.y, width, height, "FD");
    setFont(context.doc, 5.5, "bold", colors.ink);
    drawSingleLine(context.doc, cleanText(label).toUpperCase(), x + 1.5, context.y + 4.7, width - 3, 5.5, 3.8, "bold", align);
    x += width;
  });

  context.y += height;
}

function drawTableRow(context, columns, element, onPageBreak = null) {
  const lineHeight = 3;
  const cellPadding = 1.5;
  const cellLines = columns.map(([key, , width]) => splitCell(context.doc, element[key], width - cellPadding * 2));
  const rowHeight = Math.max(7, Math.max(...cellLines.map((lines) => lines.length)) * lineHeight + cellPadding * 2);

  if (context.y + rowHeight > context.bottom) {
    addPage(context);
    if (onPageBreak) {
      onPageBreak();
    } else {
      drawTableHeader(context, columns);
    }
  }

  let x = context.margin;
  columns.forEach(([, , width, align = "center"], index) => {
    setDraw(context.doc, colors.line);
    setFill(context.doc, colors.white);
    context.doc.rect(x, context.y, width, rowHeight, "FD");
    setFont(context.doc, 5.8, "normal", colors.ink);
    drawTextLines(context.doc, cellLines[index], x + cellPadding, context.y + cellPadding + 2.5, lineHeight, {
      align,
      width: width - cellPadding * 2,
    });
    x += width;
  });

  context.y += rowHeight;
}

function drawSignatures(context) {
  ensureSpace(context, 28);
  const labels = ["Instalater", "Odgovorno lice / investitor", "Napomena / pecat"];
  const gap = 8;
  const width = (context.contentWidth - gap * 2) / 3;
  const y = context.y + 11;

  labels.forEach((label, index) => {
    const x = context.margin + index * (width + gap);
    setDraw(context.doc, colors.ink);
    context.doc.line(x, y, x + width, y);
    setFont(context.doc, 6, "bold", colors.softInk);
    context.doc.text(label, x, y + 5);
  });

  context.y += 27;
}

function drawSectionTitle(context, number, title) {
  ensureSpace(context, 14);
  const { doc } = context;

  setFill(doc, colors.brand);
  doc.roundedRect(context.margin, context.y, 10, 10, 5, 5, "F");
  setFont(doc, 6, "bold", colors.ink);
  doc.text(number, context.margin + 5, context.y + 6.4, { align: "center" });
  setFont(doc, 11, "bold", colors.ink);
  doc.text(title, context.margin + 14, context.y + 6.7);

  setDraw(doc, colors.line);
  doc.line(context.margin, context.y + 13, context.margin + context.contentWidth, context.y + 13);
  context.y += 18;
}

function drawFooters(context) {
  const { doc } = context;
  const totalPages = doc.getNumberOfPages();

  for (let index = 1; index <= totalPages; index += 1) {
    doc.setPage(index);
    setDraw(doc, colors.line);
    doc.line(context.margin, context.pageHeight - 10, context.pageWidth - context.margin, context.pageHeight - 10);
    setFont(doc, 6.5, "normal", colors.softInk);
    doc.text(`${context.boardName} - Strana ${index} / ${totalPages}`, context.pageWidth / 2, context.pageHeight - 5.5, { align: "center" });
  }
}

function addPage(context) {
  context.doc.addPage();
  context.y = context.margin;
}

function ensureSpace(context, neededHeight) {
  if (context.y + neededHeight > context.bottom) {
    addPage(context);
  }
}

async function savePdf(pdf, title) {
  pdf.save(`${safeFileName(title || "tabla")}.pdf`);
}

function drawConsumerIcon(doc, icon, cx, cy, size) {
  setDraw(doc, colors.ink);
  doc.setLineWidth(0.42);

  if (!icon || icon === "none") {
    drawIconText(doc, "-", cx, cy, size);
    return;
  }

  const iconDefinition = consumerIcons.find((item) => item.id === icon);
  if (iconDefinition && drawSvgPathIcon(doc, iconDefinition.path, cx, cy, size)) {
    return;
  }

  if (icon === "light" || icon === "general") {
    doc.circle(cx, cy - size * 0.13, size * 0.31, "S");
    doc.line(cx - size * 0.2, cy + size * 0.2, cx + size * 0.2, cy + size * 0.2);
    doc.line(cx - size * 0.15, cy + size * 0.38, cx + size * 0.15, cy + size * 0.38);
    doc.line(cx, cy + size * 0.2, cx, cy + size * 0.38);
    return;
  }

  if (icon === "shield") {
    doc.lines(
      [
        [size * 0.45, size * 0.2],
        [-size * 0.2, size * 0.55],
        [-size * 0.25, size * 0.1],
        [-size * 0.25, -size * 0.1],
        [-size * 0.2, -size * 0.55],
      ],
      cx - size * 0.25,
      cy - size * 0.45,
    );
    return;
  }

  if (icon === "outlet") {
    doc.roundedRect(cx - size * 0.42, cy - size * 0.5, size * 0.84, size, 0.55, 0.55, "S");
    doc.line(cx - size * 0.15, cy - size * 0.1, cx - size * 0.15, cy + size * 0.14);
    doc.line(cx + size * 0.15, cy - size * 0.1, cx + size * 0.15, cy + size * 0.14);
    doc.line(cx - size * 0.22, cy + size * 0.35, cx + size * 0.22, cy + size * 0.35);
    return;
  }

  if (icon === "oven") {
    doc.roundedRect(cx - size * 0.48, cy - size * 0.48, size * 0.96, size * 0.96, 0.4, 0.4, "S");
    doc.line(cx - size * 0.32, cy - size * 0.23, cx + size * 0.32, cy - size * 0.23);
    doc.rect(cx - size * 0.22, cy, size * 0.44, size * 0.25, "S");
    return;
  }

  if (icon === "boiler" || icon === "fridge") {
    doc.roundedRect(cx - size * 0.3, cy - size * 0.55, size * 0.6, size * 1.1, 0.5, 0.5, "S");
    doc.line(cx - size * 0.3, cy - size * 0.05, cx + size * 0.3, cy - size * 0.05);
    if (icon === "boiler") doc.circle(cx, cy + size * 0.2, size * 0.16, "S");
    else doc.line(cx - size * 0.1, cy - size * 0.3, cx - size * 0.1, cy - size * 0.15);
    return;
  }

  if (icon === "ac") {
    doc.roundedRect(cx - size * 0.52, cy - size * 0.35, size * 1.04, size * 0.48, 0.35, 0.35, "S");
    doc.line(cx - size * 0.32, cy - size * 0.1, cx + size * 0.32, cy - size * 0.1);
    doc.line(cx - size * 0.18, cy + size * 0.27, cx - size * 0.28, cy + size * 0.48);
    doc.line(cx + size * 0.18, cy + size * 0.27, cx + size * 0.28, cy + size * 0.48);
    return;
  }

  if (icon === "heat") {
    doc.lines([[size * 0.12, size * 0.2], [-size * 0.12, size * 0.22], [size * 0.12, size * 0.2]], cx - size * 0.28, cy - size * 0.48);
    doc.lines([[size * 0.12, size * 0.2], [-size * 0.12, size * 0.22], [size * 0.12, size * 0.2]], cx, cy - size * 0.48);
    doc.lines([[size * 0.12, size * 0.2], [-size * 0.12, size * 0.22], [size * 0.12, size * 0.2]], cx + size * 0.28, cy - size * 0.48);
    return;
  }

  if (icon === "washer") {
    doc.roundedRect(cx - size * 0.42, cy - size * 0.5, size * 0.84, size, 0.45, 0.45, "S");
    doc.circle(cx, cy + size * 0.13, size * 0.25, "S");
    doc.circle(cx - size * 0.22, cy - size * 0.3, size * 0.05, "S");
    return;
  }

  if (icon === "pump") {
    doc.circle(cx - size * 0.08, cy - size * 0.08, size * 0.28, "S");
    doc.line(cx - size * 0.42, cy + size * 0.3, cx + size * 0.42, cy + size * 0.3);
    doc.line(cx + size * 0.13, cy + size * 0.13, cx + size * 0.42, cy + size * 0.42);
    return;
  }

  if (icon === "bolt") {
    doc.lines(
      [
        [size * 0.3, 0],
        [-size * 0.18, size * 0.45],
        [size * 0.42, -size * 0.58],
        [-size * 0.3, 0],
        [size * 0.18, -size * 0.42],
      ],
      cx - size * 0.12,
      cy + size * 0.45,
    );
    return;
  }

  if (icon === "bell") {
    doc.lines(
      [
        [size * 0.22, -size * 0.25],
        [size * 0.22, size * 0.25],
        [-size * 0.44, 0],
        [size * 0.22, -size * 0.25],
      ],
      cx - size * 0.22,
      cy - size * 0.05,
    );
    doc.circle(cx, cy + size * 0.35, size * 0.08);
    return;
  }

  if (icon === "timer") {
    doc.circle(cx, cy, size * 0.45);
    doc.line(cx, cy, cx, cy - size * 0.28);
    doc.line(cx, cy, cx + size * 0.22, cy + size * 0.1);
    return;
  }

  if (icon === "switch" || icon === "contactor" || icon === "relay") {
    if (icon === "contactor") {
      doc.rect(cx - size * 0.48, cy - size * 0.42, size * 0.96, size * 0.84, "S");
      doc.line(cx - size * 0.28, cy - size * 0.15, cx + size * 0.28, cy - size * 0.15);
      doc.line(cx - size * 0.28, cy + size * 0.18, cx - size * 0.02, cy + size * 0.18);
      doc.line(cx + size * 0.08, cy + size * 0.18, cx + size * 0.34, cy + size * 0.18);
      return;
    }

    if (icon === "relay") {
      doc.rect(cx - size * 0.5, cy - size * 0.35, size * 0.42, size * 0.7, "S");
      doc.line(cx, cy - size * 0.22, cx + size * 0.48, cy - size * 0.22);
      doc.line(cx, cy + size * 0.22, cx + size * 0.48, cy + size * 0.22);
      return;
    }

    doc.line(cx - size * 0.45, cy + size * 0.25, cx + size * 0.45, cy - size * 0.25);
    doc.circle(cx - size * 0.48, cy + size * 0.28, size * 0.08, "S");
    doc.circle(cx + size * 0.48, cy - size * 0.28, size * 0.08, "S");
    return;
  }

  if (icon === "busbar") {
    doc.line(cx - size * 0.5, cy - size * 0.25, cx + size * 0.5, cy - size * 0.25);
    doc.line(cx - size * 0.5, cy, cx + size * 0.5, cy);
    doc.line(cx - size * 0.5, cy + size * 0.25, cx + size * 0.5, cy + size * 0.25);
    return;
  }

  drawIconText(doc, iconFallbackLabel(icon), cx, cy, size);
}

function drawSvgPathIcon(doc, svgPath, cx, cy, size) {
  const path = svgPathToPdfPath(svgPath, cx - size / 2, cy - size / 2, size / 24);
  if (!path.length) return false;

  const canSaveState = typeof doc.saveGraphicsState === "function" && typeof doc.restoreGraphicsState === "function";
  if (canSaveState) doc.saveGraphicsState();
  if (typeof doc.setLineCap === "function") doc.setLineCap("round");
  if (typeof doc.setLineJoin === "function") doc.setLineJoin("round");
  doc.path(path);
  doc.stroke();
  if (canSaveState) doc.restoreGraphicsState();
  return true;
}

function svgPathToPdfPath(svgPath, originX, originY, scale) {
  const tokens = tokenizeSvgPath(svgPath);
  const path = [];
  let cursor = { x: 0, y: 0 };
  let subpathStart = { x: 0, y: 0 };
  let command = "";
  let index = 0;

  const hasNumber = () => index < tokens.length && tokens[index].type === "number";
  const readNumber = () => (hasNumber() ? tokens[index++].value : null);
  const point = (x, y) => [originX + x * scale, originY + y * scale];
  const moveTo = (x, y) => {
    cursor = { x, y };
    subpathStart = { x, y };
    path.push({ op: "m", c: point(x, y) });
  };
  const lineTo = (x, y) => {
    cursor = { x, y };
    path.push({ op: "l", c: point(x, y) });
  };
  const curveTo = (x1, y1, x2, y2, x, y) => {
    cursor = { x, y };
    path.push({ op: "c", c: [...point(x1, y1), ...point(x2, y2), ...point(x, y)] });
  };

  try {
    while (index < tokens.length) {
      if (tokens[index].type === "command") {
        command = tokens[index++].value;
      }

      if (!command) break;
      const relative = command === command.toLowerCase();

      if (command === "Z" || command === "z") {
        path.push({ op: "h" });
        cursor = { ...subpathStart };
        command = "";
        continue;
      }

      if (command === "M" || command === "m") {
        const x = readNumber();
        const y = readNumber();
        if (x === null || y === null) break;
        moveTo(relative ? cursor.x + x : x, relative ? cursor.y + y : y);
        command = relative ? "l" : "L";
        continue;
      }

      if (command === "L" || command === "l") {
        const x = readNumber();
        const y = readNumber();
        if (x === null || y === null) break;
        lineTo(relative ? cursor.x + x : x, relative ? cursor.y + y : y);
        continue;
      }

      if (command === "H" || command === "h") {
        const x = readNumber();
        if (x === null) break;
        lineTo(relative ? cursor.x + x : x, cursor.y);
        continue;
      }

      if (command === "V" || command === "v") {
        const y = readNumber();
        if (y === null) break;
        lineTo(cursor.x, relative ? cursor.y + y : y);
        continue;
      }

      if (command === "C" || command === "c") {
        const values = [readNumber(), readNumber(), readNumber(), readNumber(), readNumber(), readNumber()];
        if (values.some((value) => value === null)) break;
        const [x1, y1, x2, y2, x, y] = values;
        curveTo(
          relative ? cursor.x + x1 : x1,
          relative ? cursor.y + y1 : y1,
          relative ? cursor.x + x2 : x2,
          relative ? cursor.y + y2 : y2,
          relative ? cursor.x + x : x,
          relative ? cursor.y + y : y,
        );
        continue;
      }

      if (command === "A" || command === "a") {
        const values = [readNumber(), readNumber(), readNumber(), readNumber(), readNumber(), readNumber(), readNumber()];
        if (values.some((value) => value === null)) break;
        const [rx, ry, rotation, largeArcFlag, sweepFlag, rawX, rawY] = values;
        const x = relative ? cursor.x + rawX : rawX;
        const y = relative ? cursor.y + rawY : rawY;
        const curves = arcToCubicCurves(cursor.x, cursor.y, rx, ry, rotation, largeArcFlag, sweepFlag, x, y);
        if (!curves.length) {
          lineTo(x, y);
        } else {
          curves.forEach((curve) => curveTo(...curve));
        }
        continue;
      }

      return [];
    }
  } catch {
    return [];
  }

  return path;
}

function tokenizeSvgPath(svgPath) {
  const tokens = [];
  const matcher = /([AaCcHhLlMmVvZz])|([-+]?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?)/g;
  let match;

  while ((match = matcher.exec(svgPath))) {
    if (match[1]) {
      tokens.push({ type: "command", value: match[1] });
    } else {
      tokens.push({ type: "number", value: Number(match[2]) });
    }
  }

  return tokens;
}

function arcToCubicCurves(x1, y1, rx, ry, rotation, largeArcFlag, sweepFlag, x2, y2) {
  const curves = [];
  let radiusX = Math.abs(rx);
  let radiusY = Math.abs(ry);

  if (!radiusX || !radiusY || (x1 === x2 && y1 === y2)) return curves;

  const phi = (rotation * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  const x1Prime = cosPhi * dx + sinPhi * dy;
  const y1Prime = -sinPhi * dx + cosPhi * dy;
  const lambda = x1Prime ** 2 / radiusX ** 2 + y1Prime ** 2 / radiusY ** 2;

  if (lambda > 1) {
    const factor = Math.sqrt(lambda);
    radiusX *= factor;
    radiusY *= factor;
  }

  const numerator = radiusX ** 2 * radiusY ** 2 - radiusX ** 2 * y1Prime ** 2 - radiusY ** 2 * x1Prime ** 2;
  const denominator = radiusX ** 2 * y1Prime ** 2 + radiusY ** 2 * x1Prime ** 2;
  const sign = Number(Boolean(largeArcFlag)) === Number(Boolean(sweepFlag)) ? -1 : 1;
  const centerFactor = sign * Math.sqrt(Math.max(0, numerator / denominator));
  const cxPrime = centerFactor * ((radiusX * y1Prime) / radiusY);
  const cyPrime = centerFactor * (-(radiusY * x1Prime) / radiusX);
  const centerX = cosPhi * cxPrime - sinPhi * cyPrime + (x1 + x2) / 2;
  const centerY = sinPhi * cxPrime + cosPhi * cyPrime + (y1 + y2) / 2;

  const startVector = [(x1Prime - cxPrime) / radiusX, (y1Prime - cyPrime) / radiusY];
  const endVector = [(-x1Prime - cxPrime) / radiusX, (-y1Prime - cyPrime) / radiusY];
  let startAngle = vectorAngle([1, 0], startVector);
  let sweepAngle = vectorAngle(startVector, endVector);

  if (!sweepFlag && sweepAngle > 0) sweepAngle -= Math.PI * 2;
  if (sweepFlag && sweepAngle < 0) sweepAngle += Math.PI * 2;

  const segments = Math.ceil(Math.abs(sweepAngle) / (Math.PI / 2));
  const segmentAngle = sweepAngle / segments;

  for (let segment = 0; segment < segments; segment += 1) {
    const angle1 = startAngle;
    const angle2 = startAngle + segmentAngle;
    curves.push(arcSegmentToCubic(centerX, centerY, radiusX, radiusY, cosPhi, sinPhi, angle1, angle2));
    startAngle = angle2;
  }

  return curves;
}

function arcSegmentToCubic(centerX, centerY, radiusX, radiusY, cosPhi, sinPhi, angle1, angle2) {
  const delta = angle2 - angle1;
  const alpha = (4 / 3) * Math.tan(delta / 4);
  const p1 = [Math.cos(angle1), Math.sin(angle1)];
  const p2 = [Math.cos(angle2), Math.sin(angle2)];
  const c1 = [p1[0] - alpha * p1[1], p1[1] + alpha * p1[0]];
  const c2 = [p2[0] + alpha * p2[1], p2[1] - alpha * p2[0]];
  const transform = ([x, y]) => [
    centerX + radiusX * (cosPhi * x - sinPhi * y),
    centerY + radiusY * (sinPhi * x + cosPhi * y),
  ];

  return [...transform(c1), ...transform(c2), ...transform(p2)];
}

function vectorAngle(from, to) {
  const dot = from[0] * to[0] + from[1] * to[1];
  const determinant = from[0] * to[1] - from[1] * to[0];
  return Math.atan2(determinant, dot);
}

function drawIconText(doc, label, cx, cy, size) {
  setFont(doc, Math.max(4, size * 1.05), "bold", colors.ink);
  doc.text(cleanText(label).slice(0, 3), cx, cy + size * 0.18, { align: "center" });
}

function iconFallbackLabel(icon) {
  const labels = {
    reserve: "R",
    main: "GP",
    spd: "SPD",
    rcbo: "FID",
  };

  return labels[icon] || "EL";
}

function drawWrapped(doc, value, x, y, width, lineHeight, maxLines, align = "left") {
  const lines = doc.splitTextToSize(cleanText(value), width).slice(0, maxLines);
  drawTextLines(doc, lines, x, y, lineHeight, { align, width });
}

function drawTextLines(doc, lines, x, y, lineHeight, options = {}) {
  const align = options.align || "left";
  const width = options.width || 0;
  const textX = align === "center" ? x + width / 2 : align === "right" ? x + width : x;

  lines.forEach((line, index) => doc.text(line, textX, y + index * lineHeight, { align }));
}

function splitCell(doc, value, width) {
  return doc.splitTextToSize(cleanText(value || "-"), width);
}

function drawSingleLine(doc, value, x, y, width, maxSize, minSize, style = "normal", align = "left") {
  const text = cleanText(value || "-");
  let size = maxSize;
  setFont(doc, size, style, colors.ink);

  while (size > minSize && doc.getTextWidth(text) > width) {
    size -= 0.3;
    setFont(doc, size, style, colors.ink);
  }

  let output = text;
  while (output.length > 1 && doc.getTextWidth(output) > width) {
    output = output.slice(0, -1);
  }

  const textX = align === "center" ? x + width / 2 : align === "right" ? x + width : x;
  doc.text(output, textX, y, { align });
}

function setFont(doc, size, style = "normal", color = colors.ink) {
  doc.setFont("helvetica", style);
  doc.setFontSize(size);
  doc.setTextColor(...color);
}

function setFill(doc, color) {
  doc.setFillColor(...color);
}

function setDraw(doc, color) {
  doc.setDrawColor(...color);
}

function getRowUsedModules(row) {
  return (row.breakers || []).reduce((total, breaker) => total + (Number(breaker.poles) || 1), 0);
}

function formatLoadW(value) {
  const text = cleanText(value);
  if (!text || text === "-") return "-";
  return /\bw\b/i.test(text) ? text : `${text} W`;
}

function breakerTypeLabel(type) {
  const labels = {
    breaker: "Osigurac",
    fid: "FID",
    neutral: "N/PE",
    bell: "Zvonce",
    timer: "Tajmer",
    contactor: "Kontaktor",
    main: "Glavni prekidac",
    spd: "Prenaponska zastita",
    rcbo: "RCBO",
    impulse: "Impulsni relej",
    reserve: "Rezerva",
    busbar: "Sabirnica",
  };

  return labels[type] || "Element";
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return cleanText(value);

  return date.toLocaleDateString("sr-RS");
}

function legacyLoadWatts(breaker) {
  const legacyKw = Number(String(breaker.loadKw || "").replace(",", "."));
  return Number.isFinite(legacyKw) && legacyKw > 0 ? String(Math.round(legacyKw * 1000)) : "";
}

function safeFileName(value) {
  return cleanText(value).replace(/[\\/:*?"<>|]/g, "-").trim() || "tabla";
}

function cleanText(value) {
  return String(value ?? "")
    .replaceAll("Đ", "Dj")
    .replaceAll("đ", "dj")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
