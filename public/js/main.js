const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-nav");
const form = document.querySelector("#enquiry-form");
const formStatus = document.querySelector("#form-status");

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Open navigation menu" : "Close navigation menu",
  );
  navigation.classList.toggle("is-open", !isOpen);
});

navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    navigation.classList.remove("is-open");
  });
});

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

document.querySelector("#year").textContent = String(new Date().getFullYear());

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const label = button.querySelector(".submit-label");
    const originalLabel = label.textContent;
    button.disabled = true;
    label.textContent = "Sending…";
    formStatus.textContent = "";
    formStatus.className = "form-status";

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "We could not send your enquiry.");
      }

      formStatus.textContent = result.message;
      formStatus.classList.add("is-success");
      form.reset();
    } catch (error) {
      formStatus.textContent = error.message;
      formStatus.classList.add("is-error");
    } finally {
      button.disabled = false;
      label.textContent = originalLabel;
    }
  });
}
