const fs = require("node:fs/promises");
const path = require("node:path");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

function numberToWordsINR(amount) {
  const num = Math.round(Number(amount) || 0);
  if (num === 0) return "INR Zero Only";

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertHundreds(n) {
    let str = "";
    if (n > 99) {
      str += a[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    } else if (n > 0) {
      str += a[n];
    }
    return str.trim();
  }

  let crore = Math.floor(num / 10000000);
  let remainder = num % 10000000;
  let lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;
  let thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;
  let hundreds = remainder;

  let words = "";
  if (crore > 0) words += convertHundreds(crore) + " Crore ";
  if (lakh > 0) words += convertHundreds(lakh) + " Lakh ";
  if (thousand > 0) words += convertHundreds(thousand) + " Thousand ";
  if (hundreds > 0) words += convertHundreds(hundreds);

  return "INR " + words.trim() + " Only";
}


function wrapPdfText(text, font, fontSize, maxWidth) {
  const lines = [];
  const words = String(text || "").split(/\s+/);
  let currentLine = "";

  for (const word of words) {
    if (!word) continue;
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(testLine, fontSize) <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

async function createInvoicePdf(invoice) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  
  let sealImage = null;
  try {
    const sealBytes = await fs.readFile(path.join(__dirname, "public", "images", "company-seal.png"));
    sealImage = await pdf.embedPng(sealBytes);
  } catch (err) {
    console.warn("Could not embed seal in invoice PDF:", err.message);
  }

  const width = 595.28;
  const height = 841.89;
  const margin = 36;
  const contentWidth = width - margin * 2;
  const page = pdf.addPage([width, height]);

  const darkGreen = rgb(0.04, 0.14, 0.1);
  const gold = rgb(0.83, 0.68, 0.22);
  const borderGrey = rgb(0.8, 0.84, 0.82);
  const textDark = rgb(0.06, 0.1, 0.08);
  const textMuted = rgb(0.4, 0.46, 0.43);
  const tableBg = rgb(0.96, 0.98, 0.97);

  // Outer Box
  page.drawRectangle({
    x: margin,
    y: margin,
    width: contentWidth,
    height: height - margin * 2,
    borderColor: borderGrey,
    borderWidth: 1,
  });

  // Top Accent Banner
  page.drawRectangle({
    x: margin,
    y: height - margin - 5,
    width: contentWidth,
    height: 5,
    color: darkGreen,
  });

  // Header Left: Firm Info
  let curY = height - margin - 26;
  page.drawText("SHREE SHANTINATH ENTERPRISES", {
    x: margin + 14,
    y: curY,
    size: 15,
    font: boldFont,
    color: darkGreen,
  });

  curY -= 13;
  page.drawText("CIVIL WORKS & FOUNDATIONS  *  RENEWABLE CLEAN ENERGY", {
    x: margin + 14,
    y: curY,
    size: 7.5,
    font: boldFont,
    color: gold,
  });

  curY -= 12;
  page.drawText("Regd. Office: Jalore, Rajasthan - 343001, India", {
    x: margin + 14,
    y: curY,
    size: 8,
    font,
    color: textMuted,
  });

  curY -= 11;
  page.drawText("Phone: +91 96363 20419  |  Email: shreeshantinath.enterprises25@gmail.com", {
    x: margin + 14,
    y: curY,
    size: 7.5,
    font,
    color: textMuted,
  });

  // Header Right: TAX INVOICE & GSTIN
  page.drawText("TAX INVOICE", {
    x: width - margin - 14 - boldFont.widthOfTextAtSize("TAX INVOICE", 18),
    y: height - margin - 28,
    size: 18,
    font: boldFont,
    color: darkGreen,
  });

  const subTitle = "(Section 31 CGST Act, 2017)";
  page.drawText(subTitle, {
    x: width - margin - 14 - font.widthOfTextAtSize(subTitle, 7),
    y: height - margin - 38,
    size: 7,
    font,
    color: textMuted,
  });

  const gstinStr = "GSTIN: 08BOKPV8974D1Z5";
  page.drawText(gstinStr, {
    x: width - margin - 14 - boldFont.widthOfTextAtSize(gstinStr, 9),
    y: height - margin - 52,
    size: 9,
    font: boldFont,
    color: darkGreen,
  });

  const panStr = "STATE: RAJASTHAN (CODE: 08)";
  page.drawText(panStr, {
    x: width - margin - 14 - font.widthOfTextAtSize(panStr, 7.5),
    y: height - margin - 64,
    size: 7.5,
    font,
    color: textDark,
  });

  // Divider Line
  curY -= 10;
  page.drawLine({
    start: { x: margin, y: curY },
    end: { x: width - margin, y: curY },
    thickness: 1,
    color: borderGrey,
  });

  // Two-Column Details Bar (Billed To vs Invoice Meta)
  const metaTop = curY;
  const colMid = margin + contentWidth * 0.58;

  // Vertical Divider
  page.drawLine({
    start: { x: colMid, y: metaTop },
    end: { x: colMid, y: metaTop - 110 },
    thickness: 0.8,
    color: borderGrey,
  });

  // Left: Billed To Details
  let bY = metaTop - 14;
  page.drawText("BILLED TO (BUYER / DEVELOPER):", {
    x: margin + 12,
    y: bY,
    size: 8,
    font: boldFont,
    color: darkGreen,
  });

  bY -= 14;
  page.drawText(invoice.client_name ? invoice.client_name.slice(0, 48) : "Client Name", {
    x: margin + 12,
    y: bY,
    size: 10,
    font: boldFont,
    color: textDark,
  });

  bY -= 12;
  const addr = (invoice.client_address || "").replace(/\r?\n/g, ", ").slice(0, 60);
  if (addr) {
    page.drawText(addr, { x: margin + 12, y: bY, size: 7.5, font, color: textMuted });
    bY -= 11;
  }

  page.drawText(`GSTIN: ${invoice.client_gstin || "Unregistered"}   |   STATE: ${invoice.client_state || "Rajasthan"}`, {
    x: margin + 12,
    y: bY,
    size: 7.5,
    font,
    color: textDark,
  });

  bY -= 12;
  page.drawText(`PROJECT SITE: ${(invoice.project_site || "N/A").slice(0, 50)}`, {
    x: margin + 12,
    y: bY,
    size: 8,
    font: boldFont,
    color: textDark,
  });

  // Right: Invoice Numbers & Dates
  let rY = metaTop - 14;
  const drawMetaRow = (label, val, isBold = false) => {
    page.drawText(label, { x: colMid + 12, y: rY, size: 8, font, color: textMuted });
    page.drawText(val, {
      x: width - margin - 12 - (isBold ? boldFont : font).widthOfTextAtSize(val, 8),
      y: rY,
      size: 8,
      font: isBold ? boldFont : font,
      color: textDark,
    });
    rY -= 13;
  };

  drawMetaRow("Invoice Number:", invoice.invoice_number || "", true);
  const invDateStr = invoice.invoice_date
    ? new Date(invoice.invoice_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })
    : "";
  drawMetaRow("Invoice Date:", invDateStr);
  drawMetaRow("Place of Supply:", invoice.place_of_supply || "Rajasthan (08)", true);
  if (invoice.work_order_no) {
    drawMetaRow("Work Order / PO:", invoice.work_order_no);
  }
  drawMetaRow("Reverse Charge (RCM):", invoice.reverse_charge ? "Yes" : "No");

  // Bottom Line of Meta Box
  curY = metaTop - 110;
  page.drawLine({
    start: { x: margin, y: curY },
    end: { x: width - margin, y: curY },
    thickness: 1,
    color: borderGrey,
  });

  // Table Header
  const tableHeaderY = curY;
  page.drawRectangle({
    x: margin,
    y: tableHeaderY - 22,
    width: contentWidth,
    height: 22,
    color: darkGreen,
  });

  const colPositions = {
    sno: margin + 8,
    desc: margin + 34,
    sac: margin + 275,
    unit: margin + 328,
    qty: margin + 375,
    rate: margin + 430,
    amount: width - margin - 10,
  };

  const drawHeaderCol = (txt, x, align = "left") => {
    const textWidth = boldFont.widthOfTextAtSize(txt, 7.5);
    const startX = align === "right" ? x - textWidth : x;
    page.drawText(txt, { x: startX, y: tableHeaderY - 15, size: 7.5, font: boldFont, color: rgb(1, 1, 1) });
  };

  drawHeaderCol("#", colPositions.sno);
  drawHeaderCol("Description of Scope / Deliverables", colPositions.desc);
  drawHeaderCol("SAC", colPositions.sac);
  drawHeaderCol("Unit", colPositions.unit);
  drawHeaderCol("Qty", colPositions.qty, "right");
  drawHeaderCol("Rate (INR)", colPositions.rate, "right");
  drawHeaderCol("Taxable Value (INR)", colPositions.amount, "right");

  // Line Items
  let itemY = tableHeaderY - 36;
  const items = Array.isArray(invoice.items) && invoice.items.length ? invoice.items : [];

  items.forEach((item, index) => {
    const lineTotal = Number(item.amount || item.quantity * item.rate || 0);

    // Alternate shading
    if (index % 2 === 1) {
      page.drawRectangle({
        x: margin,
        y: itemY - 6,
        width: contentWidth,
        height: 20,
        color: tableBg,
      });
    }

    page.drawText(String(index + 1), { x: colPositions.sno, y: itemY, size: 8, font, color: textDark });
    page.drawText((item.description || "").slice(0, 52), { x: colPositions.desc, y: itemY, size: 8, font: boldFont, color: textDark });
    page.drawText(item.sac_code || "995434", { x: colPositions.sac, y: itemY, size: 8, font, color: textMuted });
    page.drawText(item.unit || "MW", { x: colPositions.unit, y: itemY, size: 8, font, color: textMuted });

    const qtyStr = Number(item.quantity || 0).toLocaleString("en-IN");
    page.drawText(qtyStr, {
      x: colPositions.qty - font.widthOfTextAtSize(qtyStr, 8),
      y: itemY,
      size: 8,
      font,
      color: textDark,
    });

    const rateStr = Number(item.rate || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
    page.drawText(rateStr, {
      x: colPositions.rate - font.widthOfTextAtSize(rateStr, 8),
      y: itemY,
      size: 8,
      font,
      color: textDark,
    });

    const totalStr = lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 });
    page.drawText(totalStr, {
      x: colPositions.amount - boldFont.widthOfTextAtSize(totalStr, 8),
      y: itemY,
      size: 8,
      font: boldFont,
      color: textDark,
    });

    itemY -= 20;
  });

  // Table Bottom Line
  const itemsEndLineY = itemY - 8;
  page.drawLine({
    start: { x: margin, y: itemsEndLineY },
    end: { x: width - margin, y: itemsEndLineY },
    thickness: 1,
    color: borderGrey,
  });

  // Totals & Remittance Section
  const totalsY = itemsEndLineY - 14;
  const splitX = margin + contentWidth * 0.52;

  // Left: Bank details & Terms
  let bankY = totalsY;
  page.drawText("BANK REMITTANCE DETAILS (FOR RTGS / NEFT):", {
    x: margin + 12,
    y: bankY,
    size: 7.5,
    font: boldFont,
    color: darkGreen,
  });

  bankY -= 13;
  page.drawText(`A/c Name:  SHREE SHANTINATH ENTERPRISES`, { x: margin + 12, y: bankY, size: 7.5, font, color: textDark });
  bankY -= 11;
  page.drawText(`Bank Name: ${invoice.bank_name || "State Bank of India"}`, { x: margin + 12, y: bankY, size: 7.5, font, color: textDark });
  bankY -= 11;
  page.drawText(`A/c Number: ${invoice.bank_account_no || "38920194821"}   |   IFSC: ${invoice.bank_ifsc || "SBIN0031168"}`, { x: margin + 12, y: bankY, size: 7.5, font: boldFont, color: textDark });
  bankY -= 11;
  page.drawText(`Branch: ${invoice.bank_branch || "Jalore Main Branch, Rajasthan"}`, { x: margin + 12, y: bankY, size: 7, font, color: textMuted });

  bankY -= 14;
  page.drawText("TERMS & CONDITIONS:", { x: margin + 12, y: bankY, size: 7, font: boldFont, color: textMuted });
  bankY -= 10;
  page.drawText("1. Certified that particulars given above are true and correct.", { x: margin + 12, y: bankY, size: 6.5, font, color: textMuted });
  bankY -= 9;
  page.drawText("2. Payment due within 30 days of invoice presentation.", { x: margin + 12, y: bankY, size: 6.5, font, color: textMuted });
  bankY -= 9;
  page.drawText("3. Subject to Jalore/Jodhpur jurisdiction only.", { x: margin + 12, y: bankY, size: 6.5, font, color: textMuted });

  // Right: Calculation Table
  let cY = totalsY;
  const drawCalcRow = (label, val) => {
    page.drawText(label, { x: splitX + 12, y: cY, size: 8, font, color: textDark });
    page.drawText(val, {
      x: width - margin - 12 - font.widthOfTextAtSize(val, 8),
      y: cY,
      size: 8,
      font,
      color: textDark,
    });
    cY -= 13;
  };

  drawCalcRow("Subtotal (Taxable):", `INR ${Number(invoice.subtotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`);

  if (Number(invoice.igst_amount || 0) > 0) {
    drawCalcRow("IGST @ 18%:", `INR ${Number(invoice.igst_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`);
  } else {
    drawCalcRow("CGST @ 9%:", `INR ${Number(invoice.cgst_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`);
    drawCalcRow("SGST @ 9%:", `INR ${Number(invoice.sgst_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`);
  }

  // TOTAL AMOUNT: Separated with clear breathing room, no strike-through
  cY -= 4;
  page.drawLine({
    start: { x: splitX + 8, y: cY },
    end: { x: width - margin - 8, y: cY },
    thickness: 1.2,
    color: darkGreen,
  });

  cY -= 14;
  page.drawText("TOTAL AMOUNT:", {
    x: splitX + 12,
    y: cY,
    size: 9.5,
    font: boldFont,
    color: darkGreen,
  });

  const grandTotalText = `INR ${Number(invoice.total_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  page.drawText(grandTotalText, {
    x: width - margin - 12 - boldFont.widthOfTextAtSize(grandTotalText, 10),
    y: cY,
    size: 10,
    font: boldFont,
    color: darkGreen,
  });

  cY -= 5;
  page.drawLine({
    start: { x: splitX + 8, y: cY },
    end: { x: width - margin - 8, y: cY },
    thickness: 1.2,
    color: darkGreen,
  });
  cY -= 2;
  page.drawLine({
    start: { x: splitX + 8, y: cY },
    end: { x: width - margin - 8, y: cY },
    thickness: 0.6,
    color: darkGreen,
  });

  // Amount In Words: Wrapped without truncation
  cY -= 13;
  page.drawText("Amount In Words:", {
    x: splitX + 12,
    y: cY,
    size: 7,
    font: boldFont,
    color: textMuted,
  });

  const fullWords = String(invoice.amount_in_words || numberToWordsINR(invoice.total_amount) || "");
  const maxWordsW = width - margin - 14 - (splitX + 12);
  const wordsLines = wrapPdfText(fullWords, boldFont, 7.5, maxWordsW);
  for (const wLine of wordsLines) {
    cY -= 10;
    page.drawText(wLine, {
      x: splitX + 12,
      y: cY,
      size: 7.5,
      font: boldFont,
      color: darkGreen,
    });
  }

  // Signatory Box
  const signY = margin + 70;
  page.drawText("For SHREE SHANTINATH ENTERPRISES", {
    x: width - margin - 14 - boldFont.widthOfTextAtSize("For SHREE SHANTINATH ENTERPRISES", 8),
    y: signY,
    size: 8,
    font: boldFont,
    color: darkGreen,
  });

  if (sealImage) {
    const sealW = 60;
    const sealH = sealW * (sealImage.height / sealImage.width);
    page.drawImage(sealImage, {
      x: width - margin - 14 - sealW,
      y: signY - sealH - 3,
      width: sealW,
      height: sealH,
      opacity: 0.85,
    });
  }

  page.drawText("Harsh Vardhan", {
    x: width - margin - 14 - boldFont.widthOfTextAtSize("Harsh Vardhan", 8.5),
    y: margin + 14,
    size: 8.5,
    font: boldFont,
    color: textDark,
  });

  const sigTitle = "Proprietor / Authorized Signatory";
  page.drawText(sigTitle, {
    x: width - margin - 14 - font.widthOfTextAtSize(sigTitle, 7),
    y: margin + 5,
    size: 7,
    font,
    color: textMuted,
  });

  return Buffer.from(await pdf.save());
}

module.exports = {
  createInvoicePdf,
  numberToWordsINR,
};
