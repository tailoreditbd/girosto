const fs = require("fs");
const path = require("path");

const root = __dirname;
const partial = name => fs.readFileSync(path.join(root, "partials", name), "utf8").trim();
const shared = {
  head: partial("head-assets.html"),
  header: partial("header.html"),
  footer: partial("footer.html")
};

function pageRoot(file) {
  const relative = path.relative(path.dirname(file), root).replaceAll("\\", "/");
  return relative ? `${relative}/` : "";
}

function render(text, prefix) {
  return text.replaceAll("{{ROOT}}", prefix);
}

function replaceRegion(text, name, content) {
  const marked = new RegExp(`<!-- shared:${name}:start -->[\\s\\S]*?<!-- shared:${name}:end -->`, "i");
  if (marked.test(text)) return text.replace(marked, content);

  if (name === "head") {
    text = text.replace(/\s*<meta property="og:image"[^>]*>/gi, "");
    return text.replace(/<\/head>/i, `${content}\n</head>`);
  }
  if (name === "header") {
    const current = /(?:<a class="skip-link"[\s\S]*?<\/a>\s*)?<div class="announcement"[\s\S]*?<\/header>/i;
    return text.replace(current, content);
  }
  if (name === "footer") {
    return text.replace(/<footer class="site-footer"[\s\S]*?<\/footer>/i, content);
  }
  return text;
}

function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if ([".git", "node_modules", "partials", "pages"].includes(entry.name)) return [];
      return htmlFiles(full);
    }
    return entry.name.endsWith(".html") ? [full] : [];
  });
}

for (const file of htmlFiles(root)) {
  const prefix = pageRoot(file);
  let html = fs.readFileSync(file, "utf8");
  html = replaceRegion(html, "head", render(shared.head, prefix));
  html = replaceRegion(html, "header", render(shared.header, prefix));
  html = replaceRegion(html, "footer", render(shared.footer, prefix));
  fs.writeFileSync(file, html, "utf8");
}

console.log("Built shared head, header, and footer into every public HTML page.");

require("./build-clean-urls");
