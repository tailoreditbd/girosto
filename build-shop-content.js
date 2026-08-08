const fs = require("fs");
const path = require("path");

const root = __dirname;
const shopFile = path.join(root, "shop", "index.html");
let html = fs.readFileSync(shopFile, "utf8");
let content = fs.readFileSync(path.join(root, "partials", "home-categories.html"), "utf8").trim();

content = content
  .replaceAll("shared:home-categories", "shared:shop-categories")
  .replace('id="categoryGrid"', 'id="shopCategoryGrid"')
  .replaceAll('href="shop/category/', 'href="category/');

const marked = /<!-- shared:shop-categories:start -->[\s\S]*?<!-- shared:shop-categories:end -->/i;
const fallback = /<div id="shopCategoryGrid" class="category-grid"><\/div>/i;
html = marked.test(html) ? html.replace(marked, content) : html.replace(fallback, content);
html = html.replace(/<script src="\.\.\/shop\.js"><\/script>/i, "");

fs.writeFileSync(shopFile, html, "utf8");
console.log("Built crawlable category links into shop/index.html.");
