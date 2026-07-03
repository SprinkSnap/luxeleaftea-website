# Luxe Leaf Tea store experience

Custom boutique layer on Horizon — designed for premium **drinkable loose leaf tea** conversion.

## What’s included

### In-store shopping feel
- **Store experience section** — sensory 3-step journey (choose → pack fresh → steep)
- **Boutique design system** — jade/gold/cream palette, rounded cards, premium buttons
- **Mobile shop bar** — sticky “Shop Tea” + cart on phones

### Conversion & checkout speed
- **Cart drawer** with auto-open after add-to-cart (enable in theme settings)
- **Free shipping progress bar** ($50 threshold, configurable in cents)
- **Checkout CTA copy** — “Checkout Now — Secure Payment”
- **Add to bag CTA** — “Add to Bag — Checkout in Seconds”
- **Shop Pay / accelerated checkout** on product pages

### AI tea guide chat
- Floating **Mei — Tea Guide** assistant (rule-based, human tone)
- Answers brewing, shipping, tea type, and shop questions
- **Talk to our team** opens Shopify Inbox when installed
- Enable/disable: **Theme settings → Enable Luxe Leaf Tea AI chat guide**

### Inventory
- Stock badges on product cards and PDP
- Low-stock threshold in theme settings
- WeChat alerts: see `docs/INVENTORY_WECHAT_SETUP.md`

### SEO
- Existing JSON-LD in `snippets/meta-tags.liquid`
- GA4 `add_to_cart` and `begin_checkout` events via `luxe-leaf-tea-chat.js`

## Theme settings checklist

| Setting | Recommended |
|---------|-------------|
| Cart type | Drawer |
| Auto-open cart drawer | On |
| Quick add | On |
| Mobile quick add | On |
| Brand navigation | On |
| Tea chat enabled | On |
| Free shipping threshold | 5000 (= $50) |
| Low stock threshold | 10 |

## Shopify admin checklist

1. Install **Shopify Inbox** for live human chat (pairs with AI guide)
2. Enable **Shop Pay** and accelerated checkout
3. Import products from `docs/SAMPLE_PRODUCTS_IMPORT.csv`
4. Create collections per `docs/PRODUCTS_AND_COLLECTIONS.md`
5. Set GA4 ID in theme settings
6. Deploy WeChat webhook per inventory doc (optional)

## Limitations (Shopify platform)

- **Checkout** runs on Shopify’s secure hosted checkout — themes cannot replace payment processing.
- **WeChat alerts** require a webhook or Shopify Flow + external URL.
- **Full LLM AI** requires an app or custom backend; the theme includes a smart rule-based guide plus Inbox escalation.
