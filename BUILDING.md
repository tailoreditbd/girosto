# Building the Girosto static site

Girosto uses build-time HTML partials. The published files contain complete HTML, so navigation, category cards, products, FAQs, and category-page copy remain visible in page source to crawlers and visitors without JavaScript.

## Common files

- `partials/head-assets.html` — favicons and social-sharing images
- `partials/header.html` — announcement bar and global navigation
- `partials/footer.html` — global footer and policy links
- `partials/home-categories.html` — homepage and shop category cards
- `partials/home-bestsellers.html` — homepage best-seller cards
- `partials/home-faq.html` — homepage FAQ accordion
- `category-page.js` — category-page content data used by the build step

Paths inside common files use `{{ROOT}}`. The build replaces it with the correct relative path for root, shop, blog, and category pages.

## Rebuild after a common change

From this directory run:

```powershell
node build-all.js
```

Commit and deploy the generated HTML files together with the partials and build scripts. GitHub Pages can serve the generated HTML directly; no server-side includes or client-side rendering are required.

## Ecommerce catalog workflow

The workbook at `shop/Girosto Price List- 10-07-2026 - Retail.xlsx` is the product source. It currently imports 195 products and preserves repeated rows as pack-size variants.

After changing the workbook, run:

```powershell
php import-products.php
node build-all.js
```

The import creates `data/products.json`. The commerce build then creates `assets/js/products.js`, 195 crawlable pages under `shop/product/`, actual product cards on the homepage/shop/category pages, and an updated sitemap.

Customer-facing commerce pages:

- `search.html` — live name, category, SKU, and pack-size search
- `cart.html` — browser-persistent cart
- `checkout.html` — delivery details and cash-on-delivery order creation
- `order-complete.html` — order reference, summary, and WhatsApp handoff

The checkout is intentionally static-hosting compatible. Orders are stored in the customer's browser and must be sent or confirmed with Girosto; there is no server-side order database or online payment gateway.
