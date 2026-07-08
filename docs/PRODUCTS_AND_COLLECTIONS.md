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

## 3. Create a product to sell

Each loose leaf product uses **one hero image** and a **single product description** that includes everything the shopper needs.

### One product image

Upload **one image only** in **Products → [product] → Media**:

| What to show | Brewed tea **and** dry loose leaf in the same frame |
|--------------|-----------------------------------------------------|
| Alt text example | “Brewed [tea name] with dry loose leaf” |
| Background | Cream or neutral — packaging optional |

Bundled theme assets (brewed cup + dry leaf):

| Product | Image file |
|---------|------------|
| Dragon Well Green Tea | `luxe-leaf-green-tea-product-2.png` |
| Premium Jasmine Green Tea | `luxe-leaf-green-tea-product-2.png` (placeholder until jasmine photos) |
| Premium Jasmine Falling Snow Tea | `luxe-leaf-green-tea-product-2.png` (placeholder until falling snow photos) |
| Tieguanyin Oolong | `luxe-leaf-oolong-tea-product-2.png` |
| Premium Peach Oolong Tea | `luxe-leaf-oolong-tea-product-2.png` (placeholder until peach photos) |
| Aged Yunnan Pu-erh | `luxe-leaf-puerh-tea-product-2.png` |
| Keemun Black Tea | `luxe-leaf-black-tea-product-2.png` |
| Premium Assam Black Tea | `premium-assam-black-tea-product-2.png` |
| Yunnan CTC Black Tea | `yunnan-ctc-black-tea-product-2.png` |
| Fujian Black Tea | `fujian-black-tea-product-2.png` |

These are placeholder composites until you shoot real photos. Replace in Shopify admin when ready.

Other assets:

| Asset | Use for |
|-------|---------|
| `luxe-leaf-*-product.png` | Collection fallbacks only (dry leaf) |
| `luxe-leaf-tea-assortment-hero.png` | Gift sets / variety packs, homepage hero |

### Product description (all in one field)

Put **description, brew instructions, and nutrition facts** in the product **Description** field (Shopify admin or CSV `Body (HTML)`). Order:

1. **Opening** — 2–3 sentences on taste and why it is premium  
2. **Origin & best for** — region and use case  
3. **How to brew** — leaf amount, water temp, steep time, re-steeps  
4. **Nutrition facts** — per 8 fl oz prepared tea (no milk/sweetener)

Copy-paste HTML template for a new product:

```html
<p>[2–3 sentences on taste and character.]</p>
<p><strong>Origin:</strong> [Region]<br><strong>Best for:</strong> [Use case]</p>
<h3>How to brew</h3>
<ul>
  <li><strong>Leaf:</strong> 3g per 150ml water</li>
  <li><strong>Water:</strong> [Temperature]</li>
  <li><strong>Steep:</strong> [Time]</li>
  <li><strong>Re-steeps:</strong> [Count]</li>
</ul>
<h3>Nutrition facts</h3>
<table>
  <tbody>
    <tr><td>Calories</td><td>0</td></tr>
    <tr><td>Total Fat</td><td>0 g</td></tr>
    <tr><td>Sodium</td><td>0 mg</td></tr>
    <tr><td>Total Carbohydrate</td><td>0 g</td></tr>
    <tr><td>Protein</td><td>0 g</td></tr>
    <tr><td>Caffeine</td><td>[range] mg</td></tr>
  </tbody>
</table>
<p><em>Per 8 fl oz (240 ml) prepared tea — 3g loose leaf, no milk or sweetener. Values are approximate. Caffeine varies with steep time and leaf amount.</em></p>
```

**Caffeine ranges (plain brewed tea):** green 25–35 mg · oolong 30–40 mg · pu-erh 30–45 mg · black 40–70 mg · Yunnan CTC 50–80 mg · Fujian black 35–50 mg.

### Quick import

Import ready-made rows from `docs/SAMPLE_PRODUCTS_IMPORT.csv` — each row already includes the full description, brew steps, and nutrition table. After import, upload the matching `*-product-2.png` as the only product image.

Regenerate the CSV after editing product copy:

```bash
python3 scripts/generate_sample_products_csv.py
```

## 4. Tag products for collections

Add one tea-type tag per product so collections auto-fill:

| Tag | Tea type |
|-----|----------|
| `green-tea` | Green |
| `oolong` | Oolong |
| `pu-erh` | Pu-erh |
| `black-tea` | Black |

### Milk tea & blending line

| Product | Handle | Tags | Product image |
|---------|--------|------|---------------|
| Premium Assam Black Tea | `premium-assam-black-tea` | `black-tea`, `assam`, `blend`, `bubble-tea`, `milk-tea`, `breakfast` | `premium-assam-black-tea-product-2.png` |
| Yunnan CTC Black Tea | `yunnan-ctc-black-tea` | `black-tea`, `bubble-tea`, `ctc`, `yunnan` | `yunnan-ctc-black-tea-product-2.png` |
| Fujian Black Tea | `fujian-black-tea` | `black-tea`, `fujian`, `blend-friendly` | `fujian-black-tea-product-2.png` |

### Green tea line

| Product | Handle | Tags | Product image |
|---------|--------|------|---------------|
| Dragon Well Green Tea | `dragon-well-green-tea` | `green-tea`, `Green Tea` | `luxe-leaf-green-tea-product-2.png` |
| Premium Jasmine Green Tea | `premium-jasmine-green-tea` | `green-tea`, `jasmine`, `jasmine-tea`, `bestseller` | `luxe-leaf-green-tea-product-2.png` |
| Premium Jasmine Falling Snow Tea | `premium-jasmine-falling-snow-tea` | `green-tea`, `jasmine`, `jasmine-tea`, `falling-snow`, `sibao`, `bestseller` | `luxe-leaf-green-tea-product-2.png` |

### Oolong line

| Product | Handle | Tags | Product image |
|---------|--------|------|---------------|
| Tieguanyin Oolong | `tieguanyin-oolong` | `oolong`, `Oolong` | `luxe-leaf-oolong-tea-product-2.png` |
| Premium Peach Oolong Tea | `premium-peach-oolong-tea` | `oolong`, `peach`, `peach-tea`, `milk-tea`, `bubble-tea`, `fruit-tea`, `bestseller` | `luxe-leaf-oolong-tea-product-2.png` (placeholder until peach photos) |

## 5. Optional product metafields (advanced)

Only needed if you want extra content outside the main description. Brewing, origin, and nutrition now live in the product **Description** by default.

Create custom metafields under **Settings → Custom data → Products**:

| Namespace & key | Type | Purpose |
|-----------------|------|---------|
| `custom.origin` | Rich text | Optional extra origin copy |
| `custom.tasting_notes` | Rich text | Optional extra tasting copy |
| `custom.brewing_guide` | Rich text | Optional extra brewing copy |

## 6. SEO titles (examples)

- Product: `Dragon Well Green Tea | Premium Loose Leaf Tea | Luxe Leaf Tea`
- Collection: `Premium Loose Leaf Green Tea | Luxe Leaf Tea`

## 7. Homepage hero image

In the theme editor, set the homepage hero image to `luxe-leaf-tea-assortment-hero.png` (upload from assets) for a premium first impression.
