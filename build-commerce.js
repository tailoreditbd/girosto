const fs=require("fs");
const path=require("path");
const root=__dirname;
const catalog=JSON.parse(fs.readFileSync(path.join(root,"data","products.json"),"utf8"));
const categoryCarouselTemplate=fs.readFileSync(path.join(root,"partials","home-categories.html"),"utf8").trim();
const slugRegistry=JSON.parse(fs.readFileSync(path.join(root,"data","product-slugs.json"),"utf8"));
const imageRegistry=JSON.parse(fs.readFileSync(path.join(root,"data","product-images.json"),"utf8"));
const products=catalog.products;
const categoryImages=Object.fromEntries(catalog.categories.map(category=>[category.slug,`assets/img/product-fallback/${category.slug}.jpg`]));
for(const item of products){const mapped=imageRegistry[item.id];item.slug=slugRegistry[item.id];item.images=Array.isArray(mapped)?mapped:mapped?[mapped]:[];item.image=item.images[0]||null;item.categoryImage=categoryImages[item.category];if(!item.slug)throw new Error(`Missing English slug for ${item.id}`);}
const esc=value=>String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const firstAvailable=item=>item.variants.findIndex(variant=>variant.price!==null);
const money=value=>`৳${Number(value).toLocaleString("en-BD")}`;
const replaceRegion=(html,name,content,fallback="</main>")=>{const pattern=new RegExp(`<!-- commerce:${name}:start -->[\\s\\S]*?<!-- commerce:${name}:end -->`,"i");const block=`<!-- commerce:${name}:start -->\n${content}\n<!-- commerce:${name}:end -->`;return pattern.test(html)?html.replace(pattern,block):html.replace(fallback,`${block}\n${fallback}`)};
const addCatalogScript=(html,prefix)=>replaceRegion(html,"catalog-script",`<script src="${prefix}assets/js/products.js"></script>`,`</body>`);
const placeAfterPageHero=(html,name,content)=>{const region=new RegExp(`<!-- commerce:${name}:start -->[\\s\\S]*?<!-- commerce:${name}:end -->`,"i");const hero=/(<section class="page-hero">[\s\S]*?<\/section>)/i;html=html.replace(region,"");if(!hero.test(html))throw new Error(`Page hero not found while placing ${name}`);return html.replace(hero,`$1\n<!-- commerce:${name}:start -->\n${content}\n<!-- commerce:${name}:end -->`)};
const categoryCarousel=prefix=>categoryCarouselTemplate.replace(/<!-- shared:home-categories:(?:start|end) -->\s*/g,"").replaceAll('href="shop/category/',`href="${prefix}shop/category/`).replaceAll('src="assets/img/category/',`src="${prefix}assets/img/category/`).replace('id="categoryGrid"','id="categoryGridBrowse"').replace('src="assets/js/category-carousel.js"',`src="${prefix}assets/js/category-carousel.js"`);

function card(item,prefix=""){
  const index=firstAvailable(item),variant=index>=0?item.variants[index]:null;
  const sizes=item.variants.map(v=>v.size).join(" · ");
  const search=esc(`${item.name} ${item.categoryName} ${item.sku} ${sizes}`.toLocaleLowerCase());
  const visualImage=item.image||categoryImages[item.category];
  const visualAlt=item.image?item.name:`${item.categoryName} artwork for ${item.name}`;
  const visual=`<img class="ecom-image${item.image?"":" ecom-image-artwork"}" src="${prefix}${esc(visualImage)}" alt="${esc(visualAlt)}" loading="lazy" decoding="async">`;
  return `<article class="ecom-card" data-product-card data-category="${esc(item.category)}" data-search="${search}"><a class="ecom-visual" href="${prefix}shop/product/${item.slug}.html" aria-label="View ${esc(item.name)}"><span class="ecom-badge">${esc(item.categoryName)}</span>${visual}</a><div class="ecom-card-body"><p class="ecom-category">${esc(item.categoryName)}</p><h3><a href="${prefix}shop/product/${item.slug}.html">${esc(item.name)}</a></h3><p class="ecom-pack">${esc(sizes)}</p><p class="ecom-price">${variant?money(variant.price):"Currently unavailable"}</p><div class="ecom-actions"><a class="btn btn-outline-primary rounded-pill" href="${prefix}shop/product/${item.slug}.html">View</a><button class="btn btn-primary btn-icon rounded-circle" type="button" data-add-to-cart data-product-id="${item.id}" data-variant-index="${Math.max(index,0)}" ${variant?"":"disabled"} aria-label="Add ${esc(item.name)} to cart"><i class="bi bi-bag-plus"></i></button></div></div></article>`;
}

fs.mkdirSync(path.join(root,"assets","js"),{recursive:true});
fs.writeFileSync(path.join(root,"assets","js","products.js"),`window.GIROSTO_CATALOG=${JSON.stringify(catalog)};\n`,"utf8");

const indexFile=path.join(root,"index.html");
let home=fs.readFileSync(indexFile,"utf8");
const featured=products.filter(item=>item.featured).slice(0,4);
const homeProducts=`<!-- shared:home-bestsellers:start -->\n<div id="bestSellerGrid" class="commerce-grid">${featured.map(item=>card(item,"")).join("")}</div>\n<!-- shared:home-bestsellers:end -->`;
home=home.replace(/<!-- shared:home-bestsellers:start -->[\s\S]*?<!-- shared:home-bestsellers:end -->/i,homeProducts);
home=addCatalogScript(home,"");
fs.writeFileSync(indexFile,home,"utf8");

const shopFile=path.join(root,"shop","index.html");
let shop=fs.readFileSync(shopFile,"utf8");
const options=catalog.categories.map(category=>`<option value="${category.slug}">${esc(category.name)}</option>`).join("");
const shopSection=`<section class="commerce-section" id="products"><div class="container"><div class="section-heading"><div><p class="section-kicker">Workbook catalog</p><h2 class="section-title">All Girosto products</h2></div><span id="catalogCount" class="catalog-count">${products.length} products</span></div><div class="catalog-toolbar"><div class="catalog-search"><label class="visually-hidden" for="catalogFilter">Filter products</label><input id="catalogFilter" type="search" placeholder="Filter by name, SKU, or pack size"><button type="button" aria-label="Filter"><i class="bi bi-search"></i></button></div><label class="visually-hidden" for="catalogCategory">Category</label><select id="catalogCategory"><option value="">All categories</option>${options}</select></div><div class="commerce-grid">${products.map(item=>card(item,"../")).join("")}</div></div></section><script src="../assets/js/catalog-filter.js" defer></script>`;
shop=replaceRegion(shop,"shop-products",shopSection);
shop=addCatalogScript(shop,"../");
fs.writeFileSync(shopFile,shop,"utf8");

for(const category of catalog.categories){
  const file=path.join(root,"shop","category",category.file);if(!fs.existsSync(file))continue;
  let html=fs.readFileSync(file,"utf8");const items=products.filter(item=>item.category===category.slug);
  const section=`<section class="commerce-section category-products" id="products"><div class="container"><div class="section-heading"><div><p class="section-kicker">Available products</p><h2 class="section-title">Shop ${esc(category.name)}</h2></div><span class="catalog-count">${items.length} products</span></div><div class="commerce-grid mt-5">${items.map(item=>card(item,"../../")).join("")}</div></div></section>`;
  const browser=`<section class="commerce-section category-browser" aria-labelledby="allCategoryTitle"><div class="container"><div class="section-heading"><div><p class="section-kicker">Browse the pantry</p><h2 class="section-title" id="allCategoryTitle">Explore all categories</h2></div></div><div class="mt-4">${categoryCarousel("../../")}</div></div></section>`;
  html=placeAfterPageHero(html,"category-products",section);html=replaceRegion(html,"category-browser",browser);html=addCatalogScript(html,"../../");fs.writeFileSync(file,html,"utf8");
}

const productDir=path.join(root,"shop","product");fs.mkdirSync(productDir,{recursive:true});
for(const filename of fs.readdirSync(productDir)){if(/^g-\d+(?:-\d+)?\.html$/i.test(filename))fs.unlinkSync(path.join(productDir,filename));}
for(const item of products){
  const categoryHref=`../category/${item.categoryFile}`;
  const optionsHtml=item.variants.map((variant,index)=>`<option value="${index}" ${variant.price===null?"disabled":""} data-price="${variant.price??""}">${esc(variant.size)} — ${variant.price===null?"Unavailable":money(variant.price)}</option>`).join("");
  const start=Math.max(firstAvailable(item),0),startVariant=item.variants[start];
  const gallery=item.images.length?item.images.map(image=>`<img class="product-image" src="../../${esc(image)}" alt="${esc(item.name)}" decoding="async">`).join(""):`<img class="product-image product-image-artwork" src="../../${esc(categoryImages[item.category])}" alt="${esc(`${item.categoryName} artwork for ${item.name}`)}" decoding="async">`;
  const offers=item.variants.filter(v=>v.price!==null).map(v=>({"@type":"Offer",priceCurrency:"BDT",price:v.price,availability:"https://schema.org/InStock",url:`https://www.girosto.com/shop/product/${item.slug}.html`}));
  const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(item.name)} | Girosto</title><meta name="description" content="${esc(item.description)}"><meta name="robots" content="noindex, follow"><link rel="canonical" href="https://www.girosto.com/shop/product/${item.slug}.html"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Baloo+Da+2:wght@400;500;600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"><link rel="stylesheet" href="../../styles.css"><script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"Product",name:item.name,sku:item.sku,description:item.description,brand:{"@type":"Brand",name:"Girosto"},category:item.categoryName,image:item.images.length?item.images.map(image=>`https://www.girosto.com/${image}`):undefined,offers})}</script><!-- shared:head:start --><!-- shared:head:end --></head><body><!-- shared:header:start --><!-- shared:header:end --><main id="main"><section class="product-detail"><div class="container"><p class="breadcrumbs"><a href="../../index.html">Home</a> / <a href="../index.html">Shop</a> / <a href="${categoryHref}">${esc(item.categoryName)}</a> / ${esc(item.name)}</p><div class="row g-5 align-items-start"><div class="col-lg-6"><div class="product-gallery${item.images.length>1?" product-gallery-grid":""}">${gallery}</div></div><div class="col-lg-6 product-info"><p class="product-category">${esc(item.categoryName)}</p><h1>${esc(item.name)}</h1><p class="product-sku">SKU: ${esc(item.sku)}</p><p>${esc(item.description)}</p><p id="productPrice" class="product-price">${startVariant?.price!==null?money(startVariant.price):"Currently unavailable"}</p><div class="product-options"><div><label for="productVariant">Pack size</label><select id="productVariant">${optionsHtml}</select></div><div class="qty-row"><div><label for="productQty">Quantity</label><input id="productQty" type="number" min="1" max="99" value="1"></div><div class="d-grid align-content-end"><button id="productAdd" class="btn btn-primary btn-lg rounded-pill" type="button" data-add-to-cart data-product-id="${item.id}" data-variant-select="productVariant" data-qty-input="productQty">Add to cart <i class="bi bi-bag-plus"></i></button></div></div><button id="productBuy" class="btn btn-outline-primary btn-lg rounded-pill" type="button">Buy now</button></div><div class="product-benefits"><div><i class="bi bi-patch-check"></i>Carefully selected</div><div><i class="bi bi-box-seam"></i>Thoughtfully packed</div><div><i class="bi bi-truck"></i>Delivery support</div></div><p class="checkout-note mt-4">Product availability, appearance, and delivery time may vary. Contact Girosto if you need sourcing or ingredient details.</p></div></div></div></section></main><!-- shared:footer:start --><!-- shared:footer:end --><script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script><script src="../../assets/js/products.js"></script><script src="../../assets/js/product-page.js" defer></script></body></html>`;
  fs.writeFileSync(path.join(productDir,`${item.slug}.html`),html,"utf8");
}

console.log(`Built ${products.length} product pages and connected catalog grids.`);
