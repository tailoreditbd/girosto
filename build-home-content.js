const fs = require("fs");
const path = require("path");

const root = __dirname;
const indexFile = path.join(root, "index.html");
let html = fs.readFileSync(indexFile, "utf8");

function inject(name, fallbackPattern) {
  const content = fs.readFileSync(path.join(root, "partials", `${name}.html`), "utf8").trim();
  const marked = new RegExp(`<!-- shared:${name}:start -->[\\s\\S]*?<!-- shared:${name}:end -->`, "i");
  html = marked.test(html) ? html.replace(marked, content) : html.replace(fallbackPattern, content);
}

inject("home-categories", /<div id="categoryGrid" class="category-grid"><\/div>/i);
inject("home-bestsellers", /<div id="bestSellerGrid" class="row g-4"><\/div>/i);
inject("home-faq", /<div class="accordion accordion-flush" id="faqAcc"><\/div>/i);

fs.writeFileSync(indexFile, html, "utf8");
console.log("Built crawlable homepage categories, best sellers, and FAQs into index.html.");
