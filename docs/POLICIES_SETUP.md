# Legal policies setup (Luxe Leaf Tea)

The theme includes premium **policy pages**, **default policy copy**, and **smart footer links** that resolve to the correct URL once policies or fallback pages exist.

## Fix "Page not found" (404) on policy links

Shopify `/policies/…` URLs **only work after policies are created in admin**. If Terms, Refund, or Shipping show 404, use **Option A** (recommended) or **Option B**:

### Option A — Shopify policies (recommended, ~2 minutes)

1. Open **Settings → Policies** in Shopify admin.
2. Open each policy: **Terms of service**, **Refund policy**, **Shipping policy**, **Privacy policy**.
3. Click **Create from template** (or open the existing policy).
4. Either customize the text, or leave the body **empty** — the theme shows Luxe Leaf default copy on the branded policy template.
5. Click **Save** on each policy.
6. **Online Store → Themes → Pull from GitHub → Publish**.

Live URLs (after save):

| Policy | URL |
|--------|-----|
| Privacy Policy | `/policies/privacy-policy` |
| Terms of Service | `/policies/terms-of-service` |
| Refund Policy | `/policies/refund-policy` |
| Shipping Policy | `/policies/shipping-policy` |

### Option B — Theme page fallbacks (no Shopify policies required)

Create pages in **Online Store → Pages** with these exact handles and templates:

| Page title | Handle (URL) | Theme template |
|------------|--------------|----------------|
| Terms of Service | `terms-of-service` | `terms-of-service` |
| Refund Policy | `refund-policy` | `refund-policy` |
| Shipping Policy | `shipping-policy` | `shipping-policy` |
| Privacy Policy | `privacy-policy` | `privacy-policy` |

**Quick one-page fallback:** Create one page titled **Legal** with handle `legal` and template **legal**. Footer links jump to `#terms-of-service`, `#refund-policy`, etc. on `/pages/legal` until individual pages or Shopify policies exist.

Leave page content **empty** — the theme renders full default policy copy.

## How footer links resolve

Priority (automatic):

1. **Shopify policy** (if saved in Settings → Policies)
2. **Individual theme page** (`/pages/terms-of-service`, etc.)
3. **Legal hub page** (`/pages/legal#terms-of-service`, etc.)

## Footer override

With **Brand navigation** enabled (Theme settings → Luxe Leaf), the theme **always** renders the Luxe Leaf footer snippet from `layout/theme.liquid` — not Horizon's default footer from `footer-group.json`.

Policy links appear in three places:

| Location | What you see |
|----------|----------------|
| **Footer → Legal** accordion | Privacy, Terms, Refund, Shipping |
| **Footer bottom bar** | "Policies" label + 2×2 grid on mobile |
| **Mobile menu** (hamburger) | "Policies" block with four links |

## Policy page features (mobile + SEO)

Each policy page includes:

| Feature | Purpose |
|---------|---------|
| **Policy switcher pills** | Swipe between Privacy, Terms, Refunds, Shipping on mobile |
| **Highlight cards** | Key facts (free shipping, 14-day guarantee, etc.) |
| **On-this-page nav** | Jump links to sections on mobile |
| **Bottom CTA** | Policy-specific shop or contact buttons |
| **JSON-LD** | WebPage schema; MerchantReturnPolicy; OfferShippingDetails |

## Theme files

| File | Purpose |
|------|---------|
| `templates/policy.json` | Native Shopify policy layout |
| `templates/page.terms-of-service.json` | Page fallback for Terms |
| `templates/page.refund-policy.json` | Page fallback for Refund |
| `templates/page.shipping-policy.json` | Page fallback for Shipping |
| `templates/page.privacy-policy.json` | Page fallback for Privacy |
| `templates/page.legal.json` | All policies on one page |
| `sections/luxe-leaf-policy-page.liquid` | Branded single-policy page |
| `sections/luxe-leaf-legal-hub.liquid` | All-in-one legal hub |
| `snippets/luxe-leaf-policy-url.liquid` | Smart URL resolver |
| `snippets/luxe-leaf-policy-default-content.liquid` | Default copy when admin body is empty |
| `snippets/luxe-leaf-policy-links.liquid` | Footer, sidebar, and switcher links |
| `snippets/luxe-leaf-policy-schema.liquid` | Structured data |

## Shipping values in policies

Default policy text uses theme settings:

- **Free shipping threshold:** Theme settings → Luxe Leaf → Checkout & shipping (`free_shipping_threshold`, default $50.00)
- **Standard shipping rate:** `standard_shipping_rate` (default $9.95 Canada-wide)

## Legal note

Default policy text is a starting template only — **not legal advice**. Have a qualified attorney review policies for your jurisdiction, products, and marketing practices.

## Customize in admin

After policies are created in **Settings → Policies**, any text you save there replaces the theme defaults on the live site.
