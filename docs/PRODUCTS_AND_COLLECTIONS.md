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

## 3. Product photography standard (two images)

Every loose leaf product should have **two images** in this order:

| Slot | What to show | Why |
|------|----------------|-----|
| **Image 1** | **Dry loose leaf only** — pile or spread on cream/neutral background | Shows leaf quality before purchase; packaging optional (not required) |
| **Image 2** | **Brewed tea and dry loose leaf** — cup of liquor plus dry leaf in the same frame | Proves color, clarity, and leaf character together |

Upload in **Products → [product] → Media** with Image 1 first, Image 2 second. Alt text examples: “Dry loose leaf [tea name]” and “Brewed [tea name] with dry loose leaf.”

### Bundled theme assets (Image 1 → Image 2)

| Product | Image 1 (dry leaf) | Image 2 (brewed + dry leaf) |
|---------|--------------------|-----------------------------|
| Dragon Well Green Tea | `luxe-leaf-green-tea-product.png` | `luxe-leaf-green-tea-product-2.png` |
| Tieguanyin Oolong | `luxe-leaf-oolong-tea-product.png` | `luxe-leaf-oolong-tea-product-2.png` |
| Aged Yunnan Pu-erh | `luxe-leaf-puerh-tea-product.png` | `luxe-leaf-puerh-tea-product-2.png` |
| Keemun Black Tea | `luxe-leaf-black-tea-product.png` | `luxe-leaf-black-tea-product-2.png` |
| Yunnan CTC Black Tea | `yunnan-ctc-black-tea-product.png` | `yunnan-ctc-black-tea-product-2.png` |
| Fujian Black Tea | `fujian-black-tea-product.png` | `fujian-black-tea-product-2.png` |

Image 2 files in the repo are **placeholder composites** (brewed cup + dry leaf) until you shoot real product photos. Replace them in admin when ready — same filenames are not required in Shopify.

Other assets:

| Asset | Use for |
|-------|---------|
| `luxe-leaf-tea-assortment-hero.png` | Gift sets / variety packs, homepage hero |

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

### Milk tea & blending line

| Product | Handle | Tags | Image 1 | Image 2 |
|---------|--------|------|---------|---------|
| Yunnan CTC Black Tea | `yunnan-ctc-black-tea` | `black-tea`, `bubble-tea`, `ctc`, `yunnan` | `yunnan-ctc-black-tea-product.png` | `yunnan-ctc-black-tea-product-2.png` |
| Fujian Black Tea | `fujian-black-tea` | `black-tea`, `fujian`, `blend-friendly` | `fujian-black-tea-product.png` | `fujian-black-tea-product-2.png` |

Import rows are in `docs/SAMPLE_PRODUCTS_IMPORT.csv`. After import, upload **Image 1** then **Image 2** per the table in section 3.

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
