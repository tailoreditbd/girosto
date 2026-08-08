const fs = require("fs");
const path = require("path");

const root = __dirname;

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

function cleanUrl(url) {
  if (!url || /^(?:[a-z]+:|#|\/\/)/i.test(url)) return url;
  const match = url.match(/^([^?#]*)([?#].*)?$/);
  if (!match) return url;
  let pathname = match[1];
  const suffix = match[2] || "";
  if (pathname.endsWith("index.html")) pathname = pathname.slice(0, -"index.html".length) || "./";
  else if (pathname.endsWith(".html")) pathname = pathname.slice(0, -".html".length);
  return pathname + suffix;
}

let changed = 0;
for (const file of htmlFiles(root)) {
  const source = fs.readFileSync(file, "utf8");
  let output = source.replace(/\b(href|action)=(['"])([^'"]+)\2/gi, (full, attribute, quote, url) => {
    return `${attribute}=${quote}${cleanUrl(url)}${quote}`;
  });
  output = output.replace(/https:\/\/girostobd\.github\.io(\/[^"'<>\s]*?)\.html\b/g, "https://girostobd.github.io$1");
  if (output !== source) {
    fs.writeFileSync(file, output, "utf8");
    changed += 1;
  }
}

console.log(`Built extensionless internal, canonical, and structured-data URLs into ${changed} HTML pages.`);