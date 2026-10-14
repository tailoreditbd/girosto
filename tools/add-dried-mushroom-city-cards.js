const fs = require("fs");

const specialFile = "shop/category/girosto-special.html";
const special = fs.readFileSync(specialFile, "utf8");
const sourceCard = special.match(/<article class="ecom-card" data-product-card data-category="girosto-special"\s+data-search="[^"]*gir-188[\s\S]*?<\/article>/);
if (!sourceCard) throw new Error("Dried mushroom card not found on Girosto Special page");

const cityCard = sourceCard[0].replaceAll("../../", "../");
const cityFiles = [
  "service-area/diabari.html",
  "service-area/nikunja.html",
  "service-area/uttara.html",
];

for (const file of cityFiles) {
  let html = fs.readFileSync(file, "utf8");
  if (html.includes('data-product-id="g-188"')) continue;

  const anchorCard = html.match(/<article class="ecom-card"[\s\S]*?data-product-id="g-117"[\s\S]*?<\/article>/);
  if (!anchorCard) throw new Error(`GIR-117 anchor card not found in ${file}`);

  html = html.replace(anchorCard[0], `${anchorCard[0]}\n${cityCard}`);
  fs.writeFileSync(file, html);
}

console.log("Added dried mushroom card to all city pages.");
