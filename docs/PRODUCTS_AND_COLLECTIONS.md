# Products & Collections Setup

Follow these steps in Shopify admin after deploying the theme.

## 1. Create tea type collections

**Products → Collections → Create collection**

Create four manual collections with these exact handles:

| Title | Handle | Suggested SEO description |
|-------|--------|---------------------------|
| Green Tea | `green-tea` | Shop premium loose leaf green tea — bright, sweet, and refreshing whole-leaf selections packed fresh to order. |
| Oolong | `oolong` | Explore premium loose leaf oolong tea — floral, layered, and perfect for multiple steeps. |
| Pu-erh | `pu-erh` | Premium loose leaf pu-erh tea — deep, smooth, and ideal for re-steeping. |
| Black Tea | `black-tea` | Premium loose leaf black tea — rich, malty, and full-bodied. |

Assign the default **collection** template (includes the Luxe Leaf collection hero).

## 2. Upload collection images (optional)

The theme shows fallback photography from `assets/` until you upload collection images:

- Green Tea → `luxe-leaf-green-tea-product.png`
- Oolong → `luxe-leaf-oolong-tea-product.png`
- Pu-erh → `luxe-leaf-puerh-tea-product.png`
- Black Tea → `luxe-leaf-black-tea-product.png`

## 3. Add products with photography

Use the bundled assets in `/assets/` as product images:

| Asset | Use for |
|-------|---------|
| `luxe-leaf-green-tea-product.png` | Green tea products |
| `luxe-leaf-oolong-tea-product.png` | Oolong products |
| `luxe-leaf-puerh-tea-product.png` | Pu-erh products |
| `luxe-leaf-black-tea-product.png` | Black tea products |
| `luxe-leaf-tea-liquor-product.png` | Second image — brewed cup + wet leaf |
| `luxe-leaf-tea-assortment-hero.png` | Gift sets / variety packs |

### Recommended product description template

```
[2–3 sentences on taste and why it's premium]

**Origin:** [Region, harvest season]
**Best for:** [Morning ritual / Afternoon / Gifting]
```

## 4. Tag products for auto brewing guides

Add one tag per product so the product page shows the correct brewing, origin, and tasting defaults:

| Tag | Tea type |
|-----|----------|
| `green-tea` | Green |
| `oolong` | Oolong |
| `pu-erh` | Pu-erh |
| `black-tea` | Black |

For **bubble tea** products, also add the `bubble-tea` tag. The product page will show dual brew guides (hot cup + batch ratios) and bubble-tea copy.

| Tag | Tea type | Use |
|-----|----------|-----|
| `bubble-tea` | Any | Hot cup + bubble tea batch brewing on product page |

### Bubble tea line (hot cup + boba)

These teas are **for drinking hot** but **mainly for bubble tea** — strong enough for milk tea bases and fruit tea builds.

| Product | Tags | Best for |
|---------|------|----------|
| Assam Black Tea | `black-tea`, `bubble-tea` | Classic milk tea / black boba base |
| Peach Oolong | `oolong`, `bubble-tea` | Peach and fruit bubble teas |
| Jasmine Green Tea | `green-tea`, `bubble-tea` | Green / jasmine bubble tea |

Sample import rows are in `docs/SAMPLE_PRODUCTS_IMPORT.csv`.

## 4b. Bubble Tea collection

**Products → Collections → Create collection**

| Title | Handle | Condition |
|-------|--------|-----------|
| Bubble Tea | `bubble-tea` | Product tag equals `bubble-tea` |

Suggested SEO description: *Premium loose leaf teas for bubble tea — Assam, peach oolong, and jasmine green. Brew hot or batch for boba.*

## 5. Optional product metafields (advanced)

Create custom metafields under **Settings → Custom data → Products**:

| Namespace & key | Type | Purpose |
|-----------------|------|---------|
| `custom.origin` | Rich text | Origin & harvest accordion |
| `custom.tasting_notes` | Rich text | Tasting notes accordion |
| `custom.brewing_guide` | Rich text | Brewing accordion |

When set, these override the tag-based defaults on the product page.

## 6. SEO titles (examples)

- Product: `Dragon Well Green Tea | Premium Loose Leaf Tea | Luxe Leaf Tea`
- Collection: `Premium Loose Leaf Green Tea | Luxe Leaf Tea`

## 7. Homepage hero image

In the theme editor, set the homepage hero image to `luxe-leaf-tea-assortment-hero.png` (upload from assets) for a premium first impression.
