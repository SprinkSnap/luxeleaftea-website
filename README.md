# luxeleaftea-website

Premium Chinese loose-leaf tea Shopify store (Horizon theme).

## Brand logo

The Luxe Leaf Tea horizontal logo is integrated into the theme header automatically when no logo is uploaded in **Theme settings → Logo and favicon**.

## Products & collections

See [`docs/PRODUCTS_AND_COLLECTIONS.md`](docs/PRODUCTS_AND_COLLECTIONS.md) for setup steps:

- Create collections: `green-tea`, `oolong`, `pu-erh`, `black-tea`
- Upload product photos from `assets/luxe-leaf-*-product.png`
- Tag products (`green-tea`, `oolong`, `pu-erh`, `black-tea`) for auto brewing guides

## Homepage conversion setup

The homepage includes:

- Trust bar (shipping, freshness, secure checkout)
- Premium hero with Shop Collection / Explore Tea Types CTAs
- Featured teas product grid
- About / trust story section
- Brewing guide section

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

## Next steps in Shopify admin

1. Add product photos and descriptions with origin, taste notes, and brewing tips
2. Create collections by tea type (Green, Oolong, Pu-erh, etc.)
3. Set store meta description in **Settings → General**
4. Connect Google Search Console and submit sitemap (`/sitemap.xml`)
