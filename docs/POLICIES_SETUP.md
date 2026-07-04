# Legal policies setup (Luxe Leaf Tea)

The theme includes a premium **policy page template** and **default policy copy** for all four standard Shopify policies. Footer links point to each policy automatically.

## Quick setup (Shopify admin)

1. Open **Settings → Policies** in Shopify admin.
2. For each policy below, click **Create from template** (or open the existing policy).
3. Either:
   - **Option A (recommended):** Customize the policy text for your business in the admin editor, or
   - **Option B:** Leave the policy body **empty** — the theme shows built-in Luxe Leaf default text until you add admin copy.
4. Click **Save** on each policy.
5. In the theme editor, **Pull from GitHub** (if needed) and **Publish**.

## Footer override

With **Brand navigation** enabled (Theme settings → Luxe Leaf), the theme **always** renders the Luxe Leaf footer snippet from `layout/theme.liquid` — not Horizon’s default footer from `footer-group.json`. This prevents Shopify theme-editor syncs from replacing your footer and hiding policy links.

To customize footer copy, edit defaults in `snippets/luxe-leaf-brand-footer-content.liquid`, or turn off brand navigation and configure the **Luxe Leaf footer** section via `footer-group.json` in the theme editor.

## Policy URLs

| Policy | URL |
|--------|-----|
| Privacy Policy | `/policies/privacy-policy` |
| Terms of Service | `/policies/terms-of-service` |
| Refund Policy | `/policies/refund-policy` |
| Shipping Policy | `/policies/shipping-policy` |

Policy links appear in three places (mobile-first, high-contrast tap targets):

| Location | What you see |
|----------|----------------|
| **Footer → Legal** accordion | Privacy, Terms, Refund, Shipping |
| **Footer bottom bar** | “Policies” label + 2×2 grid on mobile, 4-up row on desktop |
| **Mobile menu** (hamburger) | “Policies” block with the same four links |

Links use Shopify admin policy URLs when policies exist; otherwise they fall back to `/policies/…` paths above.

## Theme files

| File | Purpose |
|------|---------|
| `templates/policy.json` | Branded policy page layout |
| `sections/luxe-leaf-policy-page.liquid` | Policy page styling + sidebar |
| `snippets/luxe-leaf-policy-default-content.liquid` | Default copy when admin policy is empty |
| `snippets/luxe-leaf-policy-links.liquid` | Footer + sidebar policy links |

## Shipping values in policies

Default policy text uses theme settings:

- **Free shipping threshold:** Theme settings → Luxe Leaf → Checkout & shipping (`free_shipping_threshold`, default $50.00)
- **Standard shipping rate:** `standard_shipping_rate` (default $5.95)

Update these in **Theme settings** before publishing policies so shipping copy matches checkout.

## Legal note

Default policy text is a starting template only — **not legal advice**. Have a qualified attorney review policies for your jurisdiction, products, and marketing practices (email, ads, international sales).

## Customize in admin

After policies are created, any text you save in **Settings → Policies** replaces the theme defaults on the live site.
