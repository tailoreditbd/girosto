(function () {
  "use strict";
  const form = document.getElementById("contactForm");
  const status = document.getElementById("contactFormStatus");
  if (!form || !status) return;

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const button = form.querySelector('[type="submit"]');
    const values = Object.fromEntries(new FormData(form).entries());
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    status.className = "form-status is-pending";
    status.textContent = "Sending your message…";

    try {
      const result = await GirostoSubmissions.submit({
        type: "contact",
        submissionId: `CON-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        submittedAt: new Date().toISOString(),
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
        website: values.website || "",
        sourcePage: location.href,
        userAgent: navigator.userAgent
      });
      status.className = "form-status is-success";
      status.textContent = `Thank you. Your message has been received (${result.id}).`;
      form.reset();
    } catch (error) {
      status.className = "form-status is-error";
      status.textContent = `${error.message} You can also call or WhatsApp +88 01860 963 171.`;
    } finally {
      button.disabled = false;
      button.removeAttribute("aria-busy");
    }
  });
})();

