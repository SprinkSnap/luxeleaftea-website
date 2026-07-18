# SEO & Content Setup

Deploy the theme, then complete these steps in Shopify admin to activate structured data, blog SEO, and conversion CTAs.

## 1. Store meta description

**Settings → General → Store details**

Set the meta description to:

> Shop premium loose leaf tea from Luxe Leaf Tea. Hand-selected green, oolong, pu-erh, and black teas — packed fresh to order.

The theme adds page-type fallbacks in `snippets/meta-tags.liquid` when this field is blank.

## 2. Google Search Console & Analytics

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your store domain as a property
3. Verify ownership using the **HTML meta tag** method:
   - Copy the verification code (the `content` value only)
   - Paste it in **Theme settings → Logo and favicon → Google Search Console verification code**
4. Submit sitemap: `https://your-store.com/sitemap.xml`
5. Request indexing for the homepage after launch

For Google Analytics 4, paste your measurement ID (e.g. `G-XXXXXXXXXX`) in **Theme settings → Logo and favicon → Google Analytics 4 measurement ID**.

The theme ships `templates/robots.txt.liquid` with the standard Shopify crawl rules and sitemap reference.

## 3. Create the Tea Guides blog

**Online Store → Blog posts → Manage blogs → Add blog**

| Field | Value |
|-------|-------|
| Title | Tea Guides |
| Handle | `tea-guides` |

The homepage tea guides section, footer **Learn → Tea Guides** link, desktop/mobile **Tea Guides** nav item, and shop CTA resolve to `/blogs/tea-guides` only after this blog has published articles. Until then they fall back to FAQ/collections so links never 404.

**Where to view posts on the live site (after publish + theme Pull):**
- Desktop nav: **Tea Guides**
- Mobile: Menu leaf icon → **Tea Guides**
- Homepage: scroll to the Tea Guides section → **Browse all Tea Guides** or article cards
- Footer: **Learn → Tea Guides**
- Direct URLs: `/blogs/tea-guides` and `/blogs/tea-guides/<article-handle>`

## 4. Publish starter articles

Create these three articles in the **Tea Guides** blog. Handles must match exactly for homepage links to work.

### Article 1: How to Brew Premium Loose Leaf Tea

- **Handle:** `how-to-brew-loose-leaf-tea`
- **Suggested title:** How to Brew Premium Loose Leaf Tea
- **Target keyword:** how to brew loose leaf tea
- **Outline:**
  - Why grams matter (3g per 150ml)
  - Water temperature by tea type (green 175–185°F, oolong 195–205°F, pu-erh boiling)
  - Steep times and re-steeping
  - Link to `/collections/all` and `/collections/green-tea`

### Article 2: Best Oolong Teas for Beginners

- **Handle:** `best-oolong-teas-for-beginners`
- **Suggested title:** Best Oolong Teas for Beginners
- **Target keyword:** best oolong tea for beginners
- **Outline:**
  - What makes oolong approachable (floral, layered, forgiving)
  - Tieguanyin vs Da Hong Pao — taste profiles
  - Simple gaiwan or Western brew method
  - Link to `/collections/oolong`

### Article 3: Loose Leaf vs Tea Bags

- **Handle:** `loose-leaf-vs-tea-bags`
- **Suggested title:** Loose Leaf vs Tea Bags: Why Whole Leaves Taste Better
- **Target keyword:** loose leaf vs tea bags
- **Outline:**
  - Whole leaf vs fannings/dust
  - Aroma, clarity, and re-steeping
  - Cost per cup over multiple infusions
  - Link to `/collections/all`

Each article template includes a **Shop the collection** CTA at the bottom (`sections/luxe-leaf-article-cta.liquid`).

**Ready-to-publish copy:** See [`docs/BLOG_STARTER_CONTENT.md`](BLOG_STARTER_CONTENT.md) for full article HTML to paste into Shopify admin.

**Sample products:** Import [`docs/SAMPLE_PRODUCTS_IMPORT.csv`](SAMPLE_PRODUCTS_IMPORT.csv) and follow [`docs/STORE_LAUNCH_CHECKLIST.md`](STORE_LAUNCH_CHECKLIST.md).

## 5. Structured data (automatic)

The theme outputs JSON-LD across shared schema snippets (Organization, WebSite, FAQ, Collection, Product, breadcrumbs, BlogPosting):

| Page | Schema |
|------|--------|
| All pages | Organization, WebSite (with SearchAction) |
| Homepage | FAQPage (visible brewing FAQs only) |
| Collection | BreadcrumbList, CollectionPage, ItemList (Product image + Offer per item) |
| Product | Product (brand, SKU, offers with CA shipping/returns, image with theme fallback, aggregateRating when real reviews exist) + visible BreadcrumbList |
| Article | BlogPosting (headline, dates, author, publisher, image) + visible BreadcrumbList |
| FAQ page | FAQPage (visible accordions + JSON-LD) |

PDP Product JSON-LD lives in `snippets/luxe-leaf-product-schema.liquid` (rendered from the breadcrumbs section). It uses `product.vendor` for brand, prefers the Jasmine/Peach theme image fallback when a listing still uses a shared placeholder composite, and nests Canada-wide `shippingDetails` (free over theme threshold + standard rate) plus a 14-day `hasMerchantReturnPolicy` aligned with `snippets/luxe-leaf-policy-schema.liquid`. When Judge.me (or another reviews app) writes `reviews.rating` + `reviews.rating_count` metafields, Product JSON-LD also includes `aggregateRating` for star rich results — never fabricated.

Collection ItemList JSON-LD (`snippets/luxe-leaf-collection-schema.liquid`) nests each listing as a Product with brand, image (theme fallback when placeholders remain), and a compact Offer (price, currency, availability) so category pages carry shopping signals alongside PDPs.

Article BlogPosting JSON-LD lives in `snippets/luxe-leaf-article-schema.liquid` (also rendered from the breadcrumbs section on article pages). It emits headline, description, image (article image or OG logo fallback), `datePublished` / `dateModified`, author, publisher logo, and Tea Guides blog membership so guide posts are eligible for article rich results once published.

Visible breadcrumbs appear on collection, product, blog, article, and FAQ pages via `snippets/luxe-leaf-breadcrumbs.liquid`.

Duplicate Organization markup was removed from `sections/header.liquid` to avoid conflicting signals. The tea chat drawer does **not** emit FAQPage JSON-LD sitewide — FAQ rich results come only from visible FAQ UI on the homepage and `/pages/faq`.

## 6. Create the FAQ page

**Online Store → Pages → Add page**

| Field | Value |
|-------|-------|
| Title | FAQ |
| Handle | `faq` |
| Template | `faq` (uses `templates/page.faq.json`) |

The FAQ page includes 6 preset Q&As, FAQPage structured data for rich results, and a shop CTA. Footer links to `/pages/faq`.

## 7. Homepage conversion sections

After deploying, the homepage includes (in order):

1. Trust bar
2. Hero — single H1: **Premium Loose Leaf Tea, Packed Fresh** (brand line “Steep. Sip. Savor.” stays as eyebrow; matches OG title keyword intent)

Collection pages use the same keyword pattern via `snippets/luxe-leaf-collection-seo-name.liquid` (H1, schema `name`, breadcrumbs, and document title) — e.g. **Premium Loose Leaf Green Tea**.
3. **Featured teas** (first shoppable grid with Add to Bag)
4. **Keep exploring** (recent-views only on homepage)
5. Tea types grid
6. **Social proof** (honest brand notes by default; switch to real reviews when available)
7. **About story** (one origin narrative — not a second hero CTA block)
8. **Home FAQ** (brew Q&As + FAQPage schema; replaces a separate brewing-guide section)
9. **Tea guides hub** (live articles when published; else FAQ/collection fallbacks)
10. **Shop CTA** (final conversion block)

Below-fold narrative is intentionally lean: no duplicate store-experience or brewing-guide sections that repeated the hero CTAs and FAQ content.

## 8. Social profiles

**Theme settings → Social media**

Add Facebook, Instagram, and YouTube URLs. These populate Organization `sameAs` in structured data and footer social links.

## 9. Ongoing SEO checklist

- [ ] Add unique meta descriptions to each collection (see `docs/PRODUCTS_AND_COLLECTIONS.md`)
- [ ] Write product descriptions with origin, tasting notes, and brewing tips
- [ ] Publish 1–2 tea guide articles per month
- [ ] Install a reviews app (Judge.me, Loox, etc.) and add its widget to **Product reviews** on the product template
- [ ] Collect first approved reviews so PDP stars + Product `aggregateRating` JSON-LD can surface
- [ ] When real reviews exist, set homepage/about social proof **Presentation → Customer reviews** and paste verified quotes (or hide brand notes)
- [ ] Create FAQ page with template suffix `faq`
- [ ] Add GA4 measurement ID and Search Console verification in theme settings
- [ ] Monitor Search Console for crawl errors and keyword impressions

## 10. Collection conversion

Collection pages include a bottom CTA (`sections/luxe-leaf-collection-cta.liquid`) linking to the full catalog and Tea Guides blog — helping visitors who browse but don't add to cart immediately.
