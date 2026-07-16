# Products & Collections Setup

Follow these steps in Shopify admin after deploying the theme.

The catalog currently has **12 products** defined in `scripts/generate_sample_products_csv.py` and exported to `docs/SAMPLE_PRODUCTS_IMPORT.csv`. Regenerate the CSV after editing product copy:

```bash
python3 scripts/generate_sample_products_csv.py
```

---

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

### Optional curated collections

Create additional manual collections if you want to merchandise by use case or brand:

| Title | Suggested handle | How to populate |
|-------|------------------|-----------------|
| Best Sellers | `bestsellers` | Tag products with `bestseller` |
| Milk Tea & Blending | `milk-tea` | Tag products with `milk-tea` |
| Jasmine Tea | `jasmine-tea` | Tag products with `jasmine-tea` |
| Bubble Tea Bases | `bubble-tea` | Tag products with `bubble-tea` |

---

## 2. Upload collection images (optional)

The theme shows fallback photography from `assets/` until you upload collection images:

- Green Tea → `luxe-leaf-green-tea-product.png`
- Oolong → `luxe-leaf-oolong-tea-product.png`
- Pu-erh → `luxe-leaf-puerh-tea-product.png`
- Black Tea → `luxe-leaf-black-tea-product.png`

---

## 3. Full product catalog

Import all rows from `docs/SAMPLE_PRODUCTS_IMPORT.csv`, then upload one hero image per product.

### Master reference (all 12 products)

| Product | Handle | Vendor | Size | SKU | Price | Collection tag |
|---------|--------|--------|------|-----|-------|----------------|
| Dragon Well Green Tea | `dragon-well-green-tea` | Luxe Leaf Tea | 50g | `LL-GREEN-50` | $18.00 | `green-tea` |
| Premium Jasmine Green Tea | `premium-jasmine-green-tea` | Luxe Leaf Tea | 50g | `LL-JASMINE-50` | $20.00 | `green-tea` |
| Premium Jasmine Falling Snow Tea | `premium-jasmine-falling-snow-tea` | Luxe Leaf Tea | 50g | `LL-JASMINE-FS-50` | $24.00 | `green-tea` |
| Tieguanyin Oolong | `tieguanyin-oolong` | Luxe Leaf Tea | 50g | `LL-OOLONG-50` | $22.00 | `oolong` |
| Premium Peach Oolong Tea | `premium-peach-oolong-tea` | Luxe Leaf Tea | 50g | `LL-PEACH-50` | $22.00 | `oolong` |
| Aged Yunnan Pu-erh | `aged-yunnan-puerh` | Luxe Leaf Tea | 50g | `LL-PUERH-50` | $24.00 | `pu-erh` |
| Keemun Black Tea | `keemun-black-tea` | Luxe Leaf Tea | 50g | `LL-BLACK-50` | $16.00 | `black-tea` |
| Premium Assam Black Tea | `premium-assam-black-tea` | Luxe Leaf Tea | 100g | `LL-ASSAM-100` | $22.00 | `black-tea` |
| Yunnan CTC Black Tea | `yunnan-ctc-black-tea` | Luxe Leaf Tea | 100g | `LL-YUN-CTC-100` | $19.00 | `black-tea` |
| Fujian Black Tea | `fujian-black-tea` | Luxe Leaf Tea | 50g | `LL-FJ-BLACK-50` | $18.00 | `black-tea` |
| ChaTraMue Original Thai Tea Mix 400g | `chatramue-original-thai-tea-mix-400g` | ChaTraMue | 400g | `CTR-THAI-400` | $15.00 | `black-tea` |
| Mocastar Blend Tea 金裝大排檔 | `mocastar-blend-tea-hong-kong-milk-tea` | Mocastar | 500g | `MOC-HK-500` | $18.00 | `black-tea` |

### Product images

Upload **one image only** in **Products → [product] → Media**:

| What to show | Brewed tea **and** dry loose leaf in the same frame |
|--------------|-----------------------------------------------------|
| Alt text example | “Brewed [tea name] with dry loose leaf” |
| Background | Cream or neutral — packaging optional |

Bundled theme assets (brewed cup + dry leaf):

| Product | Image file |
|---------|------------|
| Dragon Well Green Tea | `luxe-leaf-green-tea-product-2.png` |
| Premium Jasmine Green Tea | `luxe-leaf-green-tea-product-2.png` *(placeholder)* |
| Premium Jasmine Falling Snow Tea | `luxe-leaf-green-tea-product-2.png` *(placeholder)* |
| Tieguanyin Oolong | `luxe-leaf-oolong-tea-product-2.png` |
| Premium Peach Oolong Tea | `luxe-leaf-oolong-tea-product-2.png` *(placeholder)* |
| Aged Yunnan Pu-erh | `luxe-leaf-puerh-tea-product-2.png` |
| Keemun Black Tea | `luxe-leaf-black-tea-product-2.png` |
| Premium Assam Black Tea | `premium-assam-black-tea-product-2.png` |
| Yunnan CTC Black Tea | `yunnan-ctc-black-tea-product-2.png` |
| Fujian Black Tea | `fujian-black-tea-product-2.png` |
| ChaTraMue Original Thai Tea Mix 400g | `luxe-leaf-black-tea-product-2.png` *(placeholder)* |
| Mocastar Blend Tea 金裝大排檔 | `premium-assam-black-tea-product-2.png` *(placeholder)* |

These are placeholder composites until you shoot real photos. Replace in Shopify admin when ready — especially jasmine, peach, ChaTraMue, and Mocastar listings.

Until unique photos ship, product cards show a **taste / type cue** under the title (collection, search, featured, keep exploring) so SKUs stay distinguishable on desktop and mobile grids. Ready theme assets: `Jasmine-tea.png`, `Peach-oolong-tea.png`.

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

**Caffeine ranges (plain brewed tea):** green 25–35 mg · oolong 30–40 mg · pu-erh 30–45 mg · black 40–70 mg · Yunnan CTC 50–80 mg · Fujian black 35–50 mg · Assam blend 45–70 mg.

To add a new product: edit `scripts/generate_sample_products_csv.py`, run the generator, then import the updated CSV.

---

## 4. Tag products for collections

Add one **tea-type tag** per product so the four main collections auto-fill:

| Tag | Tea type |
|-----|----------|
| `green-tea` | Green |
| `oolong` | Oolong |
| `pu-erh` | Pu-erh |
| `black-tea` | Black |

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
| Premium Peach Oolong Tea | `premium-peach-oolong-tea` | `oolong`, `peach`, `peach-tea`, `milk-tea`, `bubble-tea`, `fruit-tea`, `bestseller` | `luxe-leaf-oolong-tea-product-2.png` |

### Pu-erh line

| Product | Handle | Tags | Product image |
|---------|--------|------|---------------|
| Aged Yunnan Pu-erh | `aged-yunnan-puerh` | `pu-erh`, `Pu-erh` | `luxe-leaf-puerh-tea-product-2.png` |

### Black tea line

| Product | Handle | Tags | Product image |
|---------|--------|------|---------------|
| Keemun Black Tea | `keemun-black-tea` | `black-tea`, `Black Tea` | `luxe-leaf-black-tea-product-2.png` |

### Milk tea & blending line

| Product | Handle | Tags | Product image |
|---------|--------|------|---------------|
| Premium Assam Black Tea | `premium-assam-black-tea` | `black-tea`, `assam`, `blend`, `bubble-tea`, `milk-tea`, `breakfast`, `bestseller` | `premium-assam-black-tea-product-2.png` |
| Yunnan CTC Black Tea | `yunnan-ctc-black-tea` | `black-tea`, `bubble-tea`, `ctc`, `yunnan`, `bestseller` | `yunnan-ctc-black-tea-product-2.png` |
| Fujian Black Tea | `fujian-black-tea` | `black-tea`, `fujian`, `blend-friendly` | `fujian-black-tea-product-2.png` |

### Branded tea line

Third-party blends sold under their original brand name. Vendor field in Shopify should match the brand (not Luxe Leaf Tea).

| Product | Handle | Vendor | Tags | Product image |
|---------|--------|--------|------|---------------|
| ChaTraMue Original Thai Tea Mix 400g | `chatramue-original-thai-tea-mix-400g` | ChaTraMue | `black-tea`, `thai-tea`, `chatramue`, `milk-tea`, `bubble-tea`, `iced-tea`, `bestseller` | `luxe-leaf-black-tea-product-2.png` |
| Mocastar Blend Tea 金裝大排檔 | `mocastar-blend-tea-hong-kong-milk-tea` | Mocastar | `black-tea`, `hong-kong-milk-tea`, `mocastar`, `milk-tea`, `bubble-tea`, `silk-stocking-tea`, `bestseller` | `premium-assam-black-tea-product-2.png` |

---

## 5. PDP product guide accordions

The theme section `luxe-leaf-product-guide` shows origin, tasting notes, and brewing accordions on the product page. It uses product metafields when set; otherwise it infers content from product tags and title.

Products with **custom accordion defaults** (matched by title):

| Match | Products | Custom content |
|-------|----------|----------------|
| `yunnan` + `ctc` | Yunnan CTC Black Tea | CTC origin, milk tea batch brewing |
| `fujian` + `black` | Fujian Black Tea | Fujian highland origin, blending ratios |
| `falling snow` | Premium Jasmine Falling Snow Tea | Sibao jasmine scenting, delicate brew temps |
| `jasmine` | Premium Jasmine Green Tea *(and other jasmine titles without “falling snow”)* | Yunnan Maojian + Guangxi blossoms |
| `peach` | Premium Peach Oolong Tea | Jinxuan Milk Oolong, fruit tea use cases |
| `chatramue` or `thai tea mix` | ChaTraMue Original Thai Tea Mix | Thai iced tea / Cha Yen brewing |
| `mocastar` | Mocastar Blend Tea | Hong Kong silk stocking milk tea brewing |

**Note:** `falling snow` is checked before `jasmine` so Falling Snow gets Sibao-specific copy instead of the Guangxi jasmine defaults.

---

## 6. Optional product metafields (advanced)

Only needed if you want extra content outside the main description. Brewing, origin, and nutrition now live in the product **Description** by default.

Create custom metafields under **Settings → Custom data → Products**:

| Namespace & key | Type | Purpose |
|-----------------|------|---------|
| `custom.origin` | Rich text | Optional extra origin copy |
| `custom.tasting_notes` | Rich text | Optional extra tasting copy |
| `custom.brewing_guide` | Rich text | Optional extra brewing copy |

When set, metafields override the theme’s inferred accordion content.

---

## 7. SEO titles (examples)

- Product: `Dragon Well Green Tea | Premium Loose Leaf Tea | Luxe Leaf Tea`
- Product: `Premium Jasmine Green Tea Loose Leaf | Naturally Scented | Luxe Leaf Tea`
- Product: `ChaTraMue Original Thai Tea Mix 400g | Authentic Thai Iced Tea | Luxe Leaf Tea`
- Collection: `Premium Loose Leaf Green Tea | Luxe Leaf Tea`

Full SEO titles and descriptions for every product are in `docs/SAMPLE_PRODUCTS_IMPORT.csv`.

---

## 8. Homepage hero image

In the theme editor, set the homepage hero image to `luxe-leaf-tea-assortment-hero.png` (upload from assets) for a premium first impression.
