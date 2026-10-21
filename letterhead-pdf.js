const fs = require("node:fs/promises");
const path = require("node:path");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

function printablePdfText(value) {
  return String(value || "")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[·•]/g, "·")
    .replace(/[^\x20-\x7e\xa0-\xff]/g, "?");
}

function wrapPdfText(text, font, fontSize, maxWidth) {
  const lines = [];
  for (const paragraph of String(text || "").split(/\r?\n/)) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }

    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      const safeWord = printablePdfText(word);
      const candidate = line ? `${line} ${safeWord}` : safeWord;
      if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
        line = candidate;
        continue;
      }

      if (line) {
        lines.push(line);
      }
      line = "";
      for (const character of safeWord) {
        const candidateCharacter = line + character;
        if (font.widthOfTextAtSize(candidateCharacter, fontSize) > maxWidth && line) {
          lines.push(line);
          line = character;
        } else {
          line = candidateCharacter;
        }
      }
    }
    if (line) {
      lines.push(line);
    }
  }
  return lines;
}

async function createLetterheadPdf(document) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const markFont = await pdf.embedFont(StandardFonts.TimesRomanBold);



  const width = 595.28;
  const height = 841.89;
  const margin = 54;
  const bodyWidth = width - margin * 2;
  const bodyTop = 672;
  const footerTop = 110;
  const lineHeight = 16.5;
  const fontSize = 10;

  const green = rgb(0.04, 0.14, 0.1);
  const gold = rgb(0.83, 0.68, 0.22);
  const textDark = rgb(0.05, 0.1, 0.08);
  const textMuted = rgb(0.38, 0.44, 0.4);
  const lightGrey = rgb(0.88, 0.91, 0.89);
  const subjectBg = rgb(0.97, 0.98, 0.96);

  let page;
  let y;

  const drawBrandMark = (target, x, centerY) => {
    target.drawCircle({
      x: x + 20,
      y: centerY,
      size: 15,
      color: green,
      borderColor: gold,
      borderWidth: 1.5,
    });
    target.drawCircle({
      x: x + 20,
      y: centerY,
      size: 11.5,
      borderColor: rgb(0.89, 0.77, 0.44),
      borderWidth: 0.6,
    });
    target.drawText("S", {
      x: x + 20 - markFont.widthOfTextAtSize("S", 16) / 2,
      y: centerY - 5.5,
      size: 16,
      font: markFont,
      color: rgb(1, 1, 1),
    });
    for (let ray = 0; ray < 8; ray += 1) {
      const angle = (Math.PI * 2 * ray) / 8;
      target.drawLine({
        start: {
          x: x + 20 + Math.cos(angle) * 17,
          y: centerY + Math.sin(angle) * 17,
        },
        end: {
          x: x + 20 + Math.cos(angle) * 20,
          y: centerY + Math.sin(angle) * 20,
        },
        thickness: 1.2,
        color: gold,
      });
    }
  };

  const addPage = () => {
    page = pdf.addPage([width, height]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(1, 1, 1),
    });

    // Top Gold Edge Ribbon
    page.drawRectangle({
      x: 0,
      y: height - 4,
      width,
      height: 4,
      color: gold,
    });

    // Header Band
    page.drawRectangle({
      x: 0,
      y: height - 104,
      width,
      height: 100,
      color: green,
    });

    // Gold Divider Below Header
    page.drawRectangle({
      x: 0,
      y: height - 107,
      width,
      height: 3,
      color: gold,
    });

    // Brand Mark
    drawBrandMark(page, margin, height - 52);

    // Header Typography
    page.drawText("SHREE SHANTINATH ENTERPRISES", {
      x: margin + 50,
      y: height - 44,
      size: 15,
      font: boldFont,
      color: rgb(1, 1, 1),
      characterSpacing: 1.2,
    });

    page.drawText("CIVIL WORKS & FOUNDATIONS  *  CLEAN ENERGY INFRASTRUCTURE", {
      x: margin + 51,
      y: height - 60,
      size: 7.5,
      font: boldFont,
      color: gold,
      characterSpacing: 1.2,
    });

    page.drawText("GOVT. REGD. MSME  *  ISO & SAFETY COMPLIANT (STP & SOS PROTOCOLS)", {
      x: margin + 51,
      y: height - 76,
      size: 6.5,
      font,
      color: rgb(0.8, 0.92, 0.84),
      characterSpacing: 0.8,
    });

    // Right Header Tax Box
    const gstLine = "GSTIN: 08BOKPV8974D1Z5";
    page.drawText(gstLine, {
      x: width - margin - boldFont.widthOfTextAtSize(gstLine, 8),
      y: height - 44,
      size: 8,
      font: boldFont,
      color: gold,
    });

    const stateLine = "STATE: RAJASTHAN (08)";
    page.drawText(stateLine, {
      x: width - margin - font.widthOfTextAtSize(stateLine, 7),
      y: height - 72,
      size: 7,
      font,
      color: rgb(0.78, 0.85, 0.8),
    });

    // Bottom Footer Band
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: 80,
      color: green,
    });

    page.drawRectangle({
      x: 0,
      y: 80,
      width,
      height: 2.5,
      color: gold,
    });

    page.drawText("HEAD OFFICE: Jalore, Rajasthan - 343001, India  *  Serving Renewable Energy Projects Pan-India", {
      x: margin,
      y: 56,
      size: 7,
      font: boldFont,
      color: gold,
      characterSpacing: 0.6,
    });

    page.drawText("Phone: +91 96363 20419   |   Email: shreeshantinath.enterprises25@gmail.com", {
      x: margin,
      y: 38,
      size: 7.5,
      font,
      color: rgb(0.92, 0.95, 0.92),
    });

    page.drawText("BUILT WITH INTEGRITY  *  COMMITTED TO ZERO-HARM SAFETY  *  CIVIL PARTNER FOR A GREENER TOMORROW", {
      x: margin,
      y: 20,
      size: 6.5,
      font,
      color: rgb(0.72, 0.82, 0.75),
      characterSpacing: 0.8,
    });

    y = bodyTop;
  };

  const ensureSpace = async (needed = lineHeight) => {
    if (y - needed < footerTop) {
      addPage();
    }
  };

  const drawWrapped = async (text, selectedFont = font, size = fontSize, indent = 0) => {
    const lines = wrapPdfText(text, selectedFont, size, bodyWidth - indent);
    for (const line of lines) {
      await ensureSpace();
      if (line) {
        page.drawText(line, {
          x: margin + indent,
          y,
          size,
          font: selectedFont,
          color: textDark,
        });
      }
      y -= lineHeight;
    }
  };

  // Start Page 1
  addPage();

  // Document Metadata Bar (Ref No on Left, Date on Right)
  const refText = document.reference ? `REF: ${printablePdfText(document.reference)}` : "";
  const dateText = document.date
    ? `DATE: ${new Date(`${document.date}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" })}`
    : `DATE: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`;

  if (refText) {
    page.drawText(refText, {
      x: margin,
      y,
      size: 8.5,
      font: boldFont,
      color: textMuted,
    });
  }

  page.drawText(dateText, {
    x: width - margin - boldFont.widthOfTextAtSize(dateText, 8.5),
    y,
    size: 8.5,
    font: boldFont,
    color: textMuted,
  });

  y -= 10;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 0.8,
    color: lightGrey,
  });
  y -= 16;

  // Recipient Block
  if (document.recipient) {
    page.drawText("To,", { x: margin, y, size: 8.5, font: boldFont, color: textMuted });
    y -= 14;
    await drawWrapped(document.recipient, boldFont, 9.5, 10);
    y -= 10;
  }

  // Subject Banner
  const subjectText = document.subject || document.title || "";
  if (subjectText) {
    await ensureSpace(36);
    page.drawRectangle({
      x: margin,
      y: y - 18,
      width: bodyWidth,
      height: 24,
      color: subjectBg,
      borderColor: lightGrey,
      borderWidth: 0.6,
    });

    page.drawRectangle({
      x: margin,
      y: y - 18,
      width: 3.5,
      height: 24,
      color: gold,
    });

    page.drawText("SUBJECT:", {
      x: margin + 10,
      y: y - 11,
      size: 8,
      font: boldFont,
      color: gold,
      characterSpacing: 0.6,
    });

    const safeSub = printablePdfText(subjectText).slice(0, 80);
    page.drawText(safeSub, {
      x: margin + 64,
      y: y - 11,
      size: 9,
      font: boldFont,
      color: textDark,
    });

    y -= 34;
  }

  // Content Body
  const paragraphs = String(document.content || "").split(/\r?\n\r?\n/);
  for (const para of paragraphs) {
    if (!para.trim()) continue;
    await drawWrapped(para, font, fontSize);
    y -= 6; // Extra paragraph gap
  }

  // Sign-off Block (Clean space for physical rubber stamp & signature)
  const manualStampSpace = 48;
  const neededSignoffSpace = manualStampSpace + 58;

  if (y - neededSignoffSpace < footerTop) {
    addPage();
  }

  const signoffX = width - margin - 150;
  y -= 8;
  page.drawText("Yours faithfully,", { x: signoffX, y, size: 8.5, font, color: textMuted });
  y -= 13;
  page.drawText("For SHREE SHANTINATH ENTERPRISES", { x: signoffX, y, size: 8, font: boldFont, color: green });
  y -= 6 + manualStampSpace;

  page.drawText("Harsh Vardhan", { x: signoffX, y, size: 9.5, font: boldFont, color: textDark });
  y -= 11;
  page.drawText("Proprietor / Authorized Signatory", { x: signoffX, y, size: 7.5, font, color: textMuted });

  return Buffer.from(await pdf.save());
}

module.exports = {
  createLetterheadPdf,
  wrapPdfText,
  printablePdfText,
};
