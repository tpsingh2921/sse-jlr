document.querySelectorAll("[data-confirm-delete]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    const title = form.dataset.confirmDelete;
    if (!window.confirm(`Permanently delete "${title}"? This cannot be undone.`)) {
      event.preventDefault();
    }
  });
});
