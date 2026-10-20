const editorForm = document.querySelector(".letterhead-editor-form");
const previewStatus = document.querySelector("#live-preview-status");
let previewTimer;

const previewFields = {
  date: document.querySelector("#preview-date"),
  dateBox: document.querySelector("#preview-date-box"),
  reference: document.querySelector("#preview-reference"),
  refBox: document.querySelector("#preview-ref-box"),
  recipient: document.querySelector("#preview-recipient"),
  recipientWrap: document.querySelector("#preview-recipient-wrap"),
  subject: document.querySelector("#preview-subject"),
  subjectWrap: document.querySelector("#preview-subject-wrap"),
  content: document.querySelector("#preview-content"),
};

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function updateLetterheadPreview() {
  if (!editorForm) return;

  const values = Object.fromEntries(new FormData(editorForm));
  const dateStr = values.date
    ? new Date(`${values.date}T00:00:00`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";
  const subjectStr = values.subject || values.title || "";

  // Date
  if (previewFields.date) {
    previewFields.date.textContent = dateStr;
    if (previewFields.dateBox) {
      previewFields.dateBox.style.display = dateStr ? "flex" : "none";
    }
  }

  // Reference
  if (previewFields.reference) {
    previewFields.reference.textContent = values.reference || "SSE/REF/" + new Date().getFullYear();
    if (previewFields.refBox) {
      previewFields.refBox.style.display = values.reference ? "flex" : "none";
    }
  }

  // Recipient
  if (previewFields.recipient) {
    previewFields.recipient.innerHTML = escapeHtml(values.recipient || "")
      .replace(/\n/g, "<br>");
    if (previewFields.recipientWrap) {
      previewFields.recipientWrap.style.display = values.recipient ? "block" : "none";
    }
  }

  // Subject
  if (previewFields.subject) {
    previewFields.subject.textContent = subjectStr;
    if (previewFields.subjectWrap) {
      previewFields.subjectWrap.style.display = subjectStr ? "flex" : "none";
    }
  }

  // Content Paragraphs with clean spacing
  if (previewFields.content) {
    const rawContent = values.content || "";
    if (!rawContent.trim()) {
      previewFields.content.innerHTML = "<p class='placeholder-para'>Draft your document text on the left to see the official formatted letterhead preview...</p>";
    } else {
      const paragraphs = rawContent.split(/\r?\n\r?\n/);
      previewFields.content.innerHTML = paragraphs
        .map((p) => `<p class="paper-para">${escapeHtml(p).replace(/\r?\n/g, "<br>")}</p>`)
        .join("");
    }

    if (rawContent.length > 2200) {
      previewFields.content.classList.add("paper-content-multi-page");
      if (previewStatus) {
        previewStatus.textContent = "Showing page 1 preview. The generated PDF will automatically paginate onto page 2.";
      }
    } else {
      previewFields.content.classList.remove("paper-content-multi-page");
      if (previewStatus) {
        previewStatus.textContent = "Preview reflects real-time edits formatted for A4 printing.";
      }
    }
  }
}

if (editorForm) {
  editorForm.addEventListener("input", () => {
    window.clearTimeout(previewTimer);
    previewTimer = window.setTimeout(updateLetterheadPreview, 100);
  });
  editorForm.addEventListener("change", updateLetterheadPreview);
  updateLetterheadPreview();
}
