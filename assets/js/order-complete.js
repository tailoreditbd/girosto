(function () {
  "use strict";
  const root = document.getElementById("orderComplete");
  if (!root) return;

  const safe = value => String(value == null ? "" : value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  let order;
  try {
    order = JSON.parse(localStorage.getItem(GirostoStore.ORDER_KEY) || "null");
  } catch (_) {
    order = null;
  }

  const requested = new URLSearchParams(location.search).get("order");
  if (!order || (requested && requested !== order.reference)) {
    root.innerHTML = '<div class="order-success"><div class="success-icon"><i class="bi bi-receipt"></i></div><h1>Order details not found</h1><p>This browser does not have a matching recent order.</p><a class="btn btn-primary rounded-pill" href="shop/">Return to shop</a></div>';
    return;
  }

  const subtotal = Number(order.subtotal) || order.items.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
  const delivery = Number(order.delivery) || 0;
  const total = Number(order.total) || subtotal + delivery;
  const createdAt = new Date(order.createdAt);
  const orderDate = Number.isNaN(createdAt.getTime()) ? "" : createdAt.toLocaleString("en-BD", {
    dateStyle: "medium",
    timeStyle: "short"
  });
  const deliveryLabel = order.customer.deliveryArea || (delivery === 60 ? "Inside Dhaka" : delivery === 120 ? "Outside Dhaka" : "");
  const itemRows = order.items.map(item => `<tr><td><strong>${safe(item.name)}</strong><small>${safe(item.size)}</small></td><td>${Number(item.qty)}</td><td>${GirostoStore.money(item.price)}</td><td>${GirostoStore.money(item.lineTotal)}</td></tr>`).join("");

  const invoice = `<article class="invoice-card" id="invoiceCard">
    <header class="invoice-heading"><div><p class="invoice-brand">GIROSTO</p><p>Organic food and everyday essentials</p></div><div><span>Invoice</span><strong>${safe(order.reference)}</strong></div></header>
    <div class="invoice-meta"><div><span>Order date</span><strong>${safe(orderDate)}</strong></div><div><span>Payment</span><strong>${safe(order.payment || "Cash on delivery")}</strong></div><div><span>Status</span><strong>${safe(order.status || "Pending confirmation")}</strong></div></div>
    <section class="invoice-customer"><h2>Deliver to</h2><p><strong>${safe(order.customer.name)}</strong><br>${safe(order.customer.phone)}${order.customer.email ? `<br>${safe(order.customer.email)}` : ""}<br>${safe(order.customer.address)}, ${safe(order.customer.area)}${deliveryLabel ? `<br>${safe(deliveryLabel)}` : ""}</p></section>
    <div class="invoice-table-wrap"><table class="invoice-table"><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead><tbody>${itemRows}</tbody></table></div>
    <div class="invoice-totals"><div><span>Subtotal</span><strong>${GirostoStore.money(subtotal)}</strong></div><div><span>Delivery</span><strong>${GirostoStore.money(delivery)}</strong></div><div class="invoice-grand-total"><span>Grand total</span><strong>${GirostoStore.money(total)}</strong></div></div>
    ${order.customer.notes ? `<p class="invoice-notes"><strong>Order notes:</strong> ${safe(order.customer.notes)}</p>` : ""}
    <footer class="invoice-footer">Girosto will call to confirm product availability and delivery time. Thank you for choosing Girosto.</footer>
  </article>`;

  const message = [
    `New Girosto order: ${order.reference}`,
    `Name: ${order.customer.name}`,
    `Phone: ${order.customer.phone}`,
    `Address: ${order.customer.address}, ${order.customer.area}`,
    "",
    ...order.items.map(item => `${item.name} - ${item.size} x ${item.qty} = ${GirostoStore.money(item.lineTotal)}`),
    "",
    `Delivery: ${GirostoStore.money(delivery)}`,
    `Grand total: ${GirostoStore.money(total)}`
  ].join("\n");

  root.innerHTML = `<div class="order-success"><div class="success-icon"><i class="bi bi-check2"></i></div><p class="section-kicker">Order received</p><h1>Thank you, ${safe(order.customer.name)}.</h1><p>Your order has been saved and is awaiting confirmation from Girosto.</p>${invoice}<div class="invoice-actions"><button class="btn btn-primary rounded-pill px-4" type="button" id="downloadInvoice"><i class="bi bi-download"></i> Download invoice</button><button class="btn btn-outline-primary rounded-pill px-4" type="button" id="printInvoice"><i class="bi bi-printer"></i> Print / Save PDF</button><a class="btn btn-outline-success rounded-pill px-4" href="https://wa.me/8801860963171?text=${encodeURIComponent(message)}" rel="noopener">WhatsApp <i class="bi bi-whatsapp"></i></a><a class="btn btn-link px-3" href="shop/">Continue shopping</a></div></div>`;

  document.getElementById("printInvoice")?.addEventListener("click", () => window.print());
  document.getElementById("downloadInvoice")?.addEventListener("click", () => {
    const documentHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Girosto invoice ${safe(order.reference)}</title><style>body{margin:0;padding:32px;color:#19261f;font:14px Arial,sans-serif}.invoice-card{max-width:850px;margin:auto;border:1px solid #d9ddd8;padding:32px}.invoice-heading,.invoice-meta,.invoice-totals div{display:flex;justify-content:space-between;gap:20px}.invoice-heading{border-bottom:2px solid #214b35;padding-bottom:20px}.invoice-brand{margin:0;color:#214b35;font-size:28px;font-weight:700}.invoice-heading p{margin:4px 0}.invoice-heading span,.invoice-meta span,.invoice-customer h2{color:#657168;font-size:11px;text-transform:uppercase;letter-spacing:.08em}.invoice-heading>div:last-child{text-align:right}.invoice-heading strong{display:block;margin-top:6px}.invoice-meta{padding:20px 0;border-bottom:1px solid #ddd}.invoice-meta div{display:flex;flex-direction:column}.invoice-customer{padding:20px 0}.invoice-customer h2{margin:0 0 8px}.invoice-customer p{line-height:1.6}.invoice-table{width:100%;border-collapse:collapse}.invoice-table th,.invoice-table td{padding:12px;border-bottom:1px solid #ddd;text-align:left}.invoice-table th{background:#f7f3ea}.invoice-table th:nth-child(n+2),.invoice-table td:nth-child(n+2){text-align:right}.invoice-table small{display:block;color:#657168;margin-top:4px}.invoice-totals{width:min(360px,100%);margin:20px 0 20px auto}.invoice-totals div{padding:7px 0}.invoice-grand-total{border-top:2px solid #214b35;margin-top:6px;padding-top:12px!important;font-size:18px}.invoice-notes,.invoice-footer{padding-top:16px;border-top:1px solid #ddd}.invoice-footer{text-align:center;color:#657168;font-size:12px}</style></head><body>${invoice}</body></html>`;
    const url = URL.createObjectURL(new Blob([documentHtml], { type: "text/html;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `Girosto-Invoice-${order.reference}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });
})();