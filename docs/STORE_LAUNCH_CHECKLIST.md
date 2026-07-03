# Store Launch Checklist

Complete these steps in order to activate conversion and SEO across the Luxe Leaf Tea theme.

## 1. Deploy theme to Shopify

**GitHub `main` is updated — but your live store does not change until you sync and publish the theme in Shopify admin.**

### Option A — GitHub-connected theme (recommended)

1. Shopify admin → **Online Store → Themes**
2. If you already connected this repo: click **Actions → Pull from GitHub** (or wait for auto-sync if enabled)
3. If not connected yet:
   - **Add theme → Connect from GitHub**
   - Select `SprinkSnap/luxeleaftea-website` and branch **`main`**
4. Open **Customize** on the updated theme and confirm sections load (store experience, tea chat, cart drawer)
5. Click **Publish** — the live site only updates after publish

### Option B — Shopify CLI

```bash
shopify theme pull --store YOUR-STORE.myshopify.com   # optional backup
shopify theme push --store YOUR-STORE.myshopify.com --path . --branch main
```

Then **Publish** the pushed theme in admin.

### After publishing

- Hard-refresh the storefront (Ctrl+Shift+R / Cmd+Shift+R) or use a private window
- Confirm you see: tea-themed header icons, **Mei — Tea Guide** chat button (bottom-right), mobile **Shop Tea** bar

### Troubleshooting “website did not update”

| Cause | Fix |
|-------|-----|
| PR not merged | Ensure `main` on GitHub includes latest commits (PR #14+) |
| Theme not synced | Pull from GitHub or `shopify theme push` |
| Theme not **published** | Only the **published** theme is live — preview themes are not |
| Wrong theme published | Publish the GitHub-connected Luxe Leaf theme, not an old Horizon copy |
### Troubleshooting “still looks like Horizon theme”

**Most common cause:** the live store is still running an old published theme. GitHub updates do not go live automatically.

**Do this now (2 minutes):**

1. Shopify admin → **Online Store → Themes**
2. Find the theme connected to **`SprinkSnap/luxeleaftea-website`** branch **`main`**
3. **Actions → Pull from GitHub** (wait until it finishes)
4. Click **Publish** on that theme (not Preview)
5. Hard-refresh your storefront (Ctrl+Shift+R)

**How to confirm you published the right theme:** After publish, the homepage should show **“Steep. Sip. Savor.”** (not a generic Horizon hero), a **dark jade** announcement bar, **serif** headlines, and a **Tea Guide** chat button bottom-right.

| Cause | Fix |
|-------|-----|
| Old theme still **published** | Online Store → Themes → **Publish** the GitHub `main` theme |
| Never pulled after merge | **Actions → Pull from GitHub** then **Publish** |
| Wrong theme connected | Connect `SprinkSnap/luxeleaftea-website` branch **`main`**, not stock Horizon |
| Theme editor cached settings | Pull latest `main` — Luxe CSS now loads even if admin settings differ |
| Browser cache | Hard refresh; look for **jade footer**, **serif headings**, Luxe featured teas with “Add to Bag” pills |

## 2. Import sample products

**Products → Import**

1. Import [`SAMPLE_PRODUCTS_IMPORT.csv`](SAMPLE_PRODUCTS_IMPORT.csv)
2. After import, upload product images from theme assets:
   - Dragon Well → `luxe-leaf-green-tea-product.png`
   - Tieguanyin → `luxe-leaf-oolong-tea-product.png`
   - Pu-erh → `luxe-leaf-puerh-tea-product.png`
   - Keemun → `luxe-leaf-black-tea-product.png`
3. Add second image (`luxe-leaf-tea-liquor-product.png`) where helpful

See [`PRODUCTS_AND_COLLECTIONS.md`](PRODUCTS_AND_COLLECTIONS.md) for collection setup.

## 3. Create collections

Create manual collections with handles: `green-tea`, `oolong`, `pu-erh`, `black-tea`. Assign products by tag.

## 4. Create pages

| Page | Handle | Template |
|------|--------|----------|
| About | `about` | `about` |
| FAQ | `faq` | `faq` |
| Contact | `contact` | default |

## 5. Create Tea Guides blog

- Blog handle: `tea-guides`
- Publish 3 articles from [`BLOG_STARTER_CONTENT.md`](BLOG_STARTER_CONTENT.md)

## 6. Theme settings

**Theme settings → Logo and favicon → SEO & analytics**

- GA4 measurement ID
- Google Search Console verification code

**Settings → General**

- Store meta description (see [`SEO_SETUP.md`](SEO_SETUP.md))

## 7. Search Console

1. Verify domain
2. Submit `https://your-store.com/sitemap.xml`
3. Request indexing for homepage, collections, FAQ, and blog articles

## 8. Verify live

- [ ] Homepage sections render (hero, tea types, FAQ, guides, CTA)
- [ ] Product pages show brewing accordions and internal links
- [ ] Collection pages show hero + bottom CTA
- [ ] Cart shows trust line
- [ ] FAQ page at `/pages/faq`
- [ ] Blog at `/blogs/tea-guides`
- [ ] No Liquid errors in theme preview

## 9. Ongoing

- Replace placeholder social proof with real reviews
- Publish 1–2 tea guide articles per month
- Monitor Search Console for impressions and crawl issues
