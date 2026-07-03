# Tea Chat AI Setup

The storefront **Tea Guide** chat supports two modes:

1. **Built-in smart guide** (default) — improved intent matching, conversation memory, typing indicator
2. **GPT-powered replies** — deploy `scripts/tea-chat-api` and add the URL in theme settings

## Enable GPT replies (recommended for natural conversations)

### 1. Deploy the API

```bash
cd scripts/tea-chat-api
export OPENAI_API_KEY=sk-...
export ALLOWED_ORIGIN=https://YOUR-STORE.myshopify.com
node index.js
```

Deploy to Cloudflare Workers, Vercel, Railway, or Fly.io. The endpoint must accept `POST` with JSON:

```json
{
  "message": "What green tea do you recommend?",
  "messages": [{ "role": "user", "content": "..." }],
  "context": { "shopUrl": "/collections/all", "freeShippingUsd": "50" }
}
```

Response:

```json
{ "reply": "For a bright morning cup, I'd start with..." }
```

### 2. Connect in Shopify

1. **Online Store → Themes → Customize → Theme settings**
2. Under **Store conversion**, paste your API URL into **Tea chat AI API URL**
3. Save and publish

### 3. Test

Open the storefront, click **Tea Guide**, and ask a free-form question (not just quick-reply buttons). You should see a typing indicator, then a natural reply.

## Without the API

The built-in guide still handles:

- Greetings, thanks, follow-ups
- Tea type recommendations (green, oolong, pu-erh, black)
- Brewing temperatures and ratios
- Shipping, checkout, gifts, returns
- Keyword fallbacks for partial matches

## Privacy

Customer messages are sent to your deployed API (and OpenAI if configured). Do not log PII. Add a privacy note on your contact/FAQ page if required in your region.
