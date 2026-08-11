# Girosto — Static Site (HTML5 / CSS3 / Bootstrap 5 / JS)

A lookalike static build of the Girosto homepage, ready for **GitHub Pages**.

## Files
- `index.html` — semantic HTML5 with full SEO meta, Open Graph, Twitter cards, JSON-LD (Organization, LocalBusiness/GroceryStore, FAQPage), Bootstrap 5 markup.
- `styles.css` — custom theme on top of Bootstrap 5 (organic green + cream palette, Fraunces + Inter fonts).
- `script.js` — renders category grid, best-seller cards and FAQ accordion.
- `assets/` — hero and lifestyle images.
- `robots.txt`, `sitemap.xml` — crawler directives.

## Deploy on GitHub Pages
1. Create a repo (e.g. `username.github.io` for a user site, or any repo for a project site).
2. Copy the contents of this folder to the repo root.
3. Push to the `main` branch.
4. In **Settings → Pages**, set **Source = Deploy from a branch**, branch `main`, folder `/ (root)`.
5. Your site will be live at `https://<user-or-org>.github.io/` (or `https://<user>.github.io/<repo>/`).

If you use a project-site URL, replace every `https://www.girosto.com/` occurrence in `index.html`, `robots.txt` and `sitemap.xml` with your real base URL, and update the `<link rel="canonical">` accordingly.

## Analytics & Verification
Inside `<head>` in `index.html` you'll find commented placeholders — uncomment and paste your IDs:

- **Google Search Console** — `<meta name="google-site-verification" ...>`
- **Bing Webmaster / Microsoft Clarity site owner** — `<meta name="msvalidate.01" ...>`
- **Google Analytics 4** — replace `G-XXXXXXX`
- **Google Tag Manager** — replace `GTM-XXXXXXX` (also uncomment the `<noscript>` iframe in `<body>`)
- **Microsoft Clarity** — replace `CLARITY_ID`

## Contact / Brand data baked into the source
- Phone: +880 1860 963 171 · WhatsApp: https://wa.me/8801860963171
- Email: info@tailoreditbd.com
- Address: House 30, Road 4, Sector 5, Uttara, Dhaka 1230, Bangladesh
- Facebook, Instagram, YouTube, Messenger, LinkedIn links in footer + JSON-LD `sameAs`.
- Google Maps: https://maps.app.goo.gl/9LHRnCvAgqHiK96z8

## SEO checklist covered
- Single H1, semantic `<header> <main> <section> <article> <footer> <address> <figure> <figcaption> <blockquote> <cite>`
- `<strong>`, `<b>`, `<em>`, `<q>`, `<cite>` used meaningfully
- `alt` text on every image, `width`/`height` for CLS
- Descriptive `<title>` + meta description, keywords, canonical
- Open Graph + Twitter card + `og:image`
- Geo meta tags (Dhaka)
- JSON-LD: Organization, GroceryStore/LocalBusiness, FAQPage
- `robots.txt` + `sitemap.xml`
- Mobile-first responsive (Bootstrap 5)
- Skip-to-content link, ARIA labels, accessible accordion
