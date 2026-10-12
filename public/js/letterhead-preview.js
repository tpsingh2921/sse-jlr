const editorForm = document.querySelector(".letterhead-editor-form");
const previewStatus = document.querySelector("#live-preview-status");
const previewSeal = document.querySelector(".paper-seal");
let previewTimer;

const previewFields = {
  date: document.querySelector("#preview-date"),
  recipient: document.querySelector("#preview-recipient"),
  reference: document.querySelector("#preview-reference"),
  subject: document.querySelector("#preview-subject"),
  content: document.querySelector("#preview-content"),
};

function updateLetterheadPreview() {
  const values = Object.fromEntries(new FormData(editorForm));
  const date = values.date
    ? new Date(`${values.date}T00:00:00`)
        .toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
    : "";
  const subject = values.subject || values.title;

  previewFields.date.textContent = date;
  previewFields.recipient.textContent = values.recipient;
  previewFields.reference.textContent = values.reference
    ? `Reference: ${values.reference}`
    : "";
  previewFields.subject.textContent = subject;
  previewFields.content.textContent = values.content;

  previewFields.date.hidden = !date;
  previewFields.recipient.hidden = !values.recipient;
  previewFields.reference.hidden = !values.reference;
  previewFields.subject.parentElement.hidden = !subject;
  previewFields.content.hidden = !values.content;
  previewFields.content.classList.toggle(
    "paper-content-continues",
    values.content.length > 2400,
  );
  previewSeal.hidden = values.content.length > 2400;

  previewStatus.textContent =
    values.content.length > 2400
      ? "Preview shows page one. The downloaded PDF continues onto additional A4 pages."
      : "Preview updates as you edit. The PDF download is formatted for A4 printing.";
}

editorForm.addEventListener("input", () => {
  window.clearTimeout(previewTimer);
  previewTimer = window.setTimeout(updateLetterheadPreview, 120);
});

editorForm.addEventListener("change", updateLetterheadPreview);
updateLetterheadPreview();
