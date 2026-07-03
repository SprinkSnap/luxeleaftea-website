# Inventory tracking & WeChat reorder alerts

Luxe Leaf Tea uses **Shopify’s built-in inventory tracking** plus theme badges and an optional **WeChat webhook** for low-stock reorder alerts.

## Storefront (theme)

| Feature | Where |
|---------|--------|
| Live stock on product pages | `product-inventory` block on product template |
| Low-stock badges on collection cards | `luxe-leaf-inventory-badge` snippet |
| Low-stock threshold | **Theme settings → Logo and favicon → Low stock alert threshold** (default: 10 units) |

### Enable inventory in Shopify admin

1. **Settings → Locations** — ensure a fulfillment location is active.
2. For each product variant: **Track quantity** enabled.
3. Import sample products from `docs/SAMPLE_PRODUCTS_IMPORT.csv` (includes inventory columns).

## WeChat reorder alerts (optional)

Shopify themes **cannot** send WeChat messages directly. Use the included webhook handler:

### 1. Deploy the webhook

```bash
cd scripts/wechat-inventory-webhook
# Deploy to your host (Cloudflare Workers, Vercel, Railway, etc.)
```

Set environment variables:

| Variable | Description |
|----------|-------------|
| `SHOPIFY_WEBHOOK_SECRET` | From Shopify webhook settings |
| `WECHAT_WEBHOOK_URL` | WeChat Work group robot webhook URL |
| `LOW_STOCK_THRESHOLD` | Alert when stock ≤ this number (default `10`) |

### 2. Create Shopify webhook

1. **Settings → Notifications → Webhooks → Create webhook**
2. Event: **Inventory levels update**
3. Format: JSON
4. URL: your deployed endpoint

Or use **Shopify Flow** (Shopify plan permitting):

- Trigger: Inventory quantity changed
- Condition: Quantity ≤ threshold
- Action: Send HTTP request to WeChat webhook URL

### 3. Theme setting (optional)

Paste the webhook URL in **Theme settings → WeChat reorder webhook URL** for your records. The theme displays stock; the webhook sends alerts.

## Admin email alerts (no code)

**Settings → Notifications → Staff notifications** — enable low-stock product notifications as a backup to WeChat.

## Product metafields (advanced)

Create metafield `custom.reorder_level` (integer) per SKU for SKU-specific thresholds. Extend `snippets/luxe-leaf-inventory-badge.liquid` to read this metafield when present.
