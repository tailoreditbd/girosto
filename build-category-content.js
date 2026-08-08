const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = __dirname;
const categoryDir = path.join(root, "shop", "category");
const categoryScript = fs.readFileSync(path.join(root, "category-page.js"), "utf8");
const escapeHtml = value => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

for (const filename of fs.readdirSync(categoryDir).filter(name => name.endsWith(".html"))) {
  const nodes = Object.fromEntries(["categoryName", "categoryIntro", "collectionTitle", "usage", "related"].map(id => [id, { textContent: "", innerHTML: "" }]));
  const description = { content: "" };
  const document = {
    body: { dataset: { category: filename } },
    title: "",
    querySelector: selector => selector === 'meta[name="description"]' ? description : null,
    getElementById: id => nodes[id]
  };
  vm.runInNewContext(categoryScript, { document });

  const file = path.join(categoryDir, filename);
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(document.title)}</title>`);
  html = html.replace(/<meta name="description" content="[\s\S]*?">/i, `<meta name="description" content="${escapeHtml(description.content)}">`);
  html = html.replace(/<h1 id="categoryName">[\s\S]*?<\/h1>/i, `<h1 id="categoryName">${escapeHtml(nodes.categoryName.textContent)}</h1>`);
  html = html.replace(/<p id="categoryIntro" class="lead">[\s\S]*?<\/p>/i, `<p id="categoryIntro" class="lead">${escapeHtml(nodes.categoryIntro.textContent)}</p>`);
  html = html.replace(/<h2 id="collectionTitle">[\s\S]*?<\/h2>/i, `<h2 id="collectionTitle">${escapeHtml(nodes.collectionTitle.textContent)}</h2>`);
  html = html.replace(/<span id="usage">[\s\S]*?<\/span>/i, `<span id="usage">${escapeHtml(nodes.usage.textContent)}</span>`);
  html = html.replace(/<div id="related" class="related-links">[\s\S]*?<\/div>/i, `<div id="related" class="related-links">${nodes.related.innerHTML}</div>`);
  html = html.replace(/<script src="\.\.\/\.\.\/category-page\.js"><\/script>/i, "");
  fs.writeFileSync(file, html, "utf8");
}

console.log("Built unique SEO content into all category pages.");
