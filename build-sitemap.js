const fs=require("fs");
const path=require("path");
const root=__dirname;
const catalog=JSON.parse(fs.readFileSync(path.join(root,"data","products.json"),"utf8"));
const slugRegistry=JSON.parse(fs.readFileSync(path.join(root,"data","product-slugs.json"),"utf8"));
const pathRegistry=JSON.parse(fs.readFileSync(path.join(root,"data","product-url-paths.json"),"utf8"));
const base="https://www.girosto.com";
const urls=["/","/shop/","/about-us","/contact-us","/service-area","/service-area/safe-food-shop-in-uttara","/delivery-policy","/privacy-policy","/refund-and-replacement-policy-girosto","/blog/HealthyLivingBlogGirosto"];
const clean=file=>file.replace(/\.html$/,"");
for(const file of fs.readdirSync(path.join(root,"shop","category")).filter(file=>file.endsWith(".html")).sort())urls.push(`/shop/category/${clean(file)}`);
for(const item of catalog.products){const slug=slugRegistry[item.id];if(!slug)throw new Error(`Missing English slug for ${item.id}`);urls.push(`/${pathRegistry[item.id]||`shop/product/${slug}`}`);}
const xml=['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',...urls.map(url=>`  <url><loc>${base}${url}</loc><changefreq>${(url.startsWith("/shop/product/")||url.startsWith("/catagories/"))?"monthly":"weekly"}</changefreq><priority>${url==="/"?"1.0":url==="/shop/"?"0.9":"0.7"}</priority></url>`),'</urlset>',''].join("\n");
fs.writeFileSync(path.join(root,"sitemap.xml"),xml,"utf8");
console.log(`Built sitemap with ${urls.length} extensionless URLs.`);