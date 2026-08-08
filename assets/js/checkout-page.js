(function () {
  "use strict";
  const form = document.getElementById("checkoutForm");
  const summary = document.getElementById("checkoutSummary");
  const status = document.getElementById("checkoutFormStatus");
  if (!form || !summary) return;

  let pendingReference = "";
  const delivery = () => Number(form.elements.deliveryArea?.value || 0);

  function render() {
    const lines = GirostoStore.resolved();
    if (!lines.length) {
      location.href = "cart";
      return;
    }
    const totals = GirostoStore.totals(delivery());
    summary.innerHTML = `<h2 class="h4">Your order</h2>${lines.map(line => `<div class="summary-line"><span>${line.product.name} x ${line.qty}<small class="d-block text-muted">${line.variant.size}</small></span><strong>${GirostoStore.money(line.lineTotal)}</strong></div>`).join("")}<div class="summary-line border-top mt-2 pt-3"><span>Subtotal</span><strong>${GirostoStore.money(totals.subtotal)}</strong></div><div class="summary-line"><span>Delivery</span><strong>${totals.delivery ? GirostoStore.money(totals.delivery) : "Select an area"}</strong></div><div class="summary-line summary-total"><span>Grand total</span><span>${GirostoStore.money(totals.total)}</span></div><p class="checkout-note mt-3">Cash on delivery. A Girosto representative may call to confirm availability and delivery details.</p>`;
  }

  form.elements.deliveryArea.addEventListener("change", render);
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const lines = GirostoStore.resolved();
    const totals = GirostoStore.totals(delivery());
    if (!lines.length) return;

    const button = form.querySelector('[type="submit"]');
    const values = Object.fromEntries(new FormData(form).entries());
    if (values.website) return;

    pendingReference = pendingReference || `GIR-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const items = lines.map(line => ({
      id: line.id,
      name: line.product.name,
      size: line.variant.size,
      price: line.variant.price,
      qty: line.qty,
      lineTotal: line.lineTotal
    }));
    const selectedDelivery = form.elements.deliveryArea.selectedOptions[0]?.textContent.trim() || "";
    const customer = {
      name: values.name.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      deliveryArea: selectedDelivery,
      area: values.area.trim(),
      address: values.address.trim(),
      notes: values.notes.trim()
    };
    const order = {
      reference: pendingReference,
      createdAt: new Date().toISOString(),
      customer,
      items,
      ...totals,
      status: "Pending confirmation",
      payment: "Cash on delivery"
    };

    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    if (status) {
      status.className = "form-status is-pending";
      status.textContent = "Saving your order securely...";
    }

    try {
      await GirostoSubmissions.submit({
        type: "order",
        orderId: order.reference,
        submittedAt: order.createdAt,
        customerName: customer.name,
        phone: customer.phone,
        email: customer.email,
        deliveryArea: `${selectedDelivery}; District/area: ${customer.area}`,
        address: customer.address,
        notes: customer.notes,
        paymentMethod: order.payment,
        subtotal: totals.subtotal,
        deliveryCharge: totals.delivery,
        total: totals.total,
        items,
        website: values.website || "",
        sourcePage: location.href,
        userAgent: navigator.userAgent
      });
      localStorage.setItem(GirostoStore.ORDER_KEY, JSON.stringify(order));
      GirostoStore.clear();
      location.href = `order-complete?order=${encodeURIComponent(order.reference)}`;
    } catch (error) {
      if (status) {
        status.className = "form-status is-error";
        status.textContent = `${error.message} Your cart is safe; please try again or call +88 01860 963 171.`;
      }
      button.disabled = false;
      button.removeAttribute("aria-busy");
    }
  });

  render();
})();