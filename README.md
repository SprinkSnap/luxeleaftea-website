# luxeleaftea-website

Premium loose leaf tea Shopify store (Horizon theme).

## Brand logo

The Luxe Leaf Tea horizontal logo is integrated into the theme header automatically when no logo is uploaded in **Theme settings → Logo and favicon**.

## Products & collections

See [`docs/PRODUCTS_AND_COLLECTIONS.md`](docs/PRODUCTS_AND_COLLECTIONS.md) for setup steps.

**Quick start:** [`docs/STORE_LAUNCH_CHECKLIST.md`](docs/STORE_LAUNCH_CHECKLIST.md) · import [`docs/SAMPLE_PRODUCTS_IMPORT.csv`](docs/SAMPLE_PRODUCTS_IMPORT.csv)

- Create collections: `green-tea`, `oolong`, `pu-erh`, `black-tea`
- Upload product photos from `assets/luxe-leaf-*-product.png`
- Tag products (`green-tea`, `oolong`, `pu-erh`, `black-tea`) for auto brewing guides

## SEO & content

See [`docs/SEO_SETUP.md`](docs/SEO_SETUP.md) for:

- Google Search Console and sitemap submission
- Tea Guides blog setup (`tea-guides` handle)
- Three starter article outlines for organic traffic
- JSON-LD structured data (Organization, FAQ, Breadcrumbs, BlogPosting)

The theme includes enhanced meta tags, `robots.txt.liquid`, homepage FAQ schema + visible FAQ section, visible breadcrumbs, FAQ page, collection CTAs, product internal links, GA4/Search Console hooks, and blog/article conversion CTAs.

## Homepage conversion setup

The homepage includes:

- Trust bar (shipping, freshness, secure checkout)
- Premium hero with Shop Collection / Explore Tea Types CTAs
- Tea types grid (green, oolong, pu-erh, black)
- Featured teas product grid
- About / trust story section
- Brewing guide section
- Visible home FAQ (matches FAQ schema)
- Social proof (customer quotes)
- Tea guides hub (SEO content links)
- Final shop CTA

## About page

Create a page in Shopify admin:

1. **Online Store → Pages → Add page**
2. Title: `About` (handle will be `about`)
3. Template suffix: `about` (uses `templates/page.about.json`)

## Navigation

Brand navigation is enabled by default (**Theme settings → Luxe Leaf Tea**):

- Shop Tea → `/collections/all`
- Collections → `/collections`
- Our Story → `/pages/about`
- Contact → `/pages/contact`

Footer also links to **Tea Guides** → `/blogs/tea-guides` and **FAQ** → `/pages/faq`.

## FAQ page

Create a page in Shopify admin:

1. **Online Store → Pages → Add page**
2. Title: `FAQ` (handle will be `faq`)
3. Template suffix: `faq` (uses `templates/page.faq.json`)

## Analytics & Search Console

In **Theme settings → Logo and favicon → SEO & analytics**:

- Paste your GA4 measurement ID (`G-XXXXXXXXXX`)
- Paste your Google Search Console verification code

## Next steps in Shopify admin

1. Add product photos and descriptions with origin, taste notes, and brewing tips
2. Create collections by tea type (Green, Oolong, Pu-erh, Black)
3. Set store meta description in **Settings → General**
4. Create the **Tea Guides** blog and publish starter articles ([`docs/BLOG_STARTER_CONTENT.md`](docs/BLOG_STARTER_CONTENT.md))
5. Connect Google Search Console and submit sitemap (`/sitemap.xml`)
6. Create the **FAQ** page with template suffix `faq`
7. Add GA4 and Search Console verification in theme settings
