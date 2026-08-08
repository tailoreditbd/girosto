const GIROSTO_SPREADSHEET_ID = "1I4nDR0qpOjPeSQiVWCkfnUqf2NzGyUtwj_jks_NW3Aw";
const CONTACT_HEADERS_ = ["Submission ID", "Submitted At", "Full Name", "Phone", "Email", "Message", "Source Page", "User Agent", "Status"];
const ORDER_HEADERS_ = ["Order ID", "Submitted At", "Customer Name", "Phone", "Email", "Delivery Area", "Address", "Notes", "Payment Method", "Subtotal (BDT)", "Delivery Charge (BDT)", "Total (BDT)", "Item Count", "Items", "Source Page", "User Agent", "Status"];

function doGet() {
  return jsonResponse_({ ok: true, service: "Girosto website submissions" });
}

function setupGirostoSheets() {
  const spreadsheet = SpreadsheetApp.openById(GIROSTO_SPREADSHEET_ID);
  ensureSheet_(spreadsheet, "orders", ORDER_HEADERS_);
  ensureSheet_(spreadsheet, "contacts", CONTACT_HEADERS_);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const payload = JSON.parse((e.postData && e.postData.contents) || "{}");
    if (payload.website) throw new Error("Spam submission rejected.");
    const spreadsheet = SpreadsheetApp.openById(GIROSTO_SPREADSHEET_ID);
    if (payload.type === "contact") return saveContact_(spreadsheet, payload);
    if (payload.type === "order") return saveOrder_(spreadsheet, payload);
    throw new Error("Unknown submission type.");
  } catch (error) {
    return jsonResponse_({ ok: false, error: String(error.message || error) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function saveContact_(spreadsheet, data) {
  require_(data.fullName, "Full name");
  require_(data.phone, "Phone");
  require_(data.email, "Email");
  if (!/^\S+@\S+\.\S+$/.test(String(data.email))) throw new Error("A valid email is required.");
  const id = clean_(data.submissionId || ("CON-" + Date.now()), 80);
  ensureSheet_(spreadsheet, "contacts", CONTACT_HEADERS_).appendRow([
    id, date_(data.submittedAt), safeCell_(data.fullName, 120), safeCell_(data.phone, 30),
    safeCell_(data.email, 160), safeCell_(data.message || "", 2000),
    safeCell_(data.sourcePage || "", 500), safeCell_(data.userAgent || "", 500), "New"
  ]);
  return jsonResponse_({ ok: true, id: id });
}

function saveOrder_(spreadsheet, data) {
  require_(data.orderId, "Order ID");
  require_(data.customerName, "Customer name");
  require_(data.phone, "Phone");
  require_(data.email, "Email");
  require_(data.deliveryArea, "Delivery area");
  require_(data.address, "Address");
  if (!Array.isArray(data.items) || !data.items.length) throw new Error("Order items are required.");
  const id = clean_(data.orderId, 80);
  ensureSheet_(spreadsheet, "orders", ORDER_HEADERS_).appendRow([
    id, date_(data.submittedAt), safeCell_(data.customerName, 120), safeCell_(data.phone, 30),
    safeCell_(data.email, 160), safeCell_(data.deliveryArea, 180), safeCell_(data.address, 1000),
    safeCell_(data.notes || "", 1500), "Cash on delivery", number_(data.subtotal),
    number_(data.deliveryCharge), number_(data.total),
    data.items.reduce(function (sum, item) { return sum + number_(item.qty); }, 0),
    safeCell_(JSON.stringify(data.items), 45000), safeCell_(data.sourcePage || "", 500),
    safeCell_(data.userAgent || "", 500), "New"
  ]);
  return jsonResponse_({ ok: true, id: id });
}

function ensureSheet_(spreadsheet, name, headers) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  const range = sheet.getRange(1, 1, 1, headers.length);
  const current = range.getDisplayValues()[0];
  const empty = current.every(function (value) { return !String(value).trim(); });
  if (empty) {
    range.setValues([headers]);
    range.setFontWeight("bold").setBackground("#e6e6e6").setWrap(true);
    sheet.setFrozenRows(1);
    sheet.setColumnWidths(1, headers.length, 145);
    sheet.getRange(2, 2, sheet.getMaxRows() - 1, 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");
    if (name === "orders") {
      sheet.setColumnWidths(7, 2, 240);
      sheet.setColumnWidths(14, 3, 280);
      sheet.getRange(2, 10, sheet.getMaxRows() - 1, 3).setNumberFormat("৳#,##0");
      setStatusValidation_(sheet, 17, ["New", "Confirmed", "Processing", "Delivered", "Cancelled"]);
    } else {
      sheet.setColumnWidths(6, 3, 260);
      setStatusValidation_(sheet, 9, ["New", "Replied", "Closed"]);
    }
    if (!sheet.getFilter()) sheet.getRange(1, 1, sheet.getMaxRows(), headers.length).createFilter();
  } else if (current.join("\u001f") !== headers.join("\u001f")) {
    throw new Error("The " + name + " sheet headers do not match the Girosto submission layout.");
  }
  return sheet;
}

function setStatusValidation_(sheet, column, values) {
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(values, true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, column, sheet.getMaxRows() - 1, 1).setDataValidation(rule);
}

function require_(value, label) {
  if (!String(value || "").trim()) throw new Error(label + " is required.");
}

function clean_(value, maxLength) {
  return String(value == null ? "" : value).trim().slice(0, maxLength);
}

function safeCell_(value, maxLength) {
  const text = clean_(value, maxLength);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function date_(value) {
  const date = value ? new Date(value) : new Date();
  return isNaN(date.getTime()) ? new Date() : date;
}

function number_(value) {
  const number = Number(value);
  return isFinite(number) ? number : 0;
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}