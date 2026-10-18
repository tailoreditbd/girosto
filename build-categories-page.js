const fs = require('fs');
const path = require('path');
const root = __dirname;
const shop = fs.readFileSync(path.join(root, 'shop/index.html'), 'utf8');
const source = fs.readFileSync(path.join(root, 'partials/home-categories.html'), 'utf8');
const cards = source.match(/<a class="cat-card"[\s\S]*?<\/a>/g);
if (!cards?.length) throw new Error('No category cards found');
// Reuse the exact shop section so its carousel, copy, and spacing stay in sync.
const section = shop.match(/<section class="section-space category-section">[\s\S]*?<\/section>/)?.[0];
if (!section) throw new Error('Shop category section not found');
const main = '<main id="main">' + section.replaceAll('href="category/', 'href="shop/category/') + '</main>';
let html = shop.replace(/<main\b[^>]*>[\s\S]*?<\/main>/, main)
  .replace(/<title>[\s\S]*?<\/title>/, '<title>Food Categories | Girosto</title>')
  .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="Browse Girosto food categories, including rice, oils, spices, honey, nuts, dairy, and everyday pantry essentials.">')
  .replace(/<link rel="canonical"[^>]*>/g, '')
  .replace('</head>', '<link rel="canonical" href="https://www.girosto.com/categories">\n</head>')
  .replace(/<!-- commerce:catalog-script:start -->[\s\S]*?<!-- commerce:catalog-script:end -->/g, '')
  .replace(/((?:href|src)=["'])\.\.\//g, '$1');
for (const name of ['header', 'footer']) {
 const partial = fs.readFileSync(path.join(root, 'partials', name + '.html'), 'utf8').trim().replaceAll('{{ROOT}}', './');
 html = html.replace(new RegExp(`<!-- shared:${name}:start -->[\\s\\S]*?<!-- shared:${name}:end -->`), partial);
}
html = html.replace(/(href=["'][^"']+)\.html(["'])/g, '$1$2');
fs.writeFileSync(path.join(root, 'categories.html'), html);
console.log(`Built categories.html with ${cards.length} category cards.`);
