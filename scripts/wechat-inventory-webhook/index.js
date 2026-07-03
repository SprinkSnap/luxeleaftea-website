/**
 * WeChat Work / WeChat webhook for low-stock reorder alerts.
 * Deploy to Cloudflare Workers, Vercel, or any Node host.
 */

import crypto from 'crypto';
import { createServer } from 'http';

const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD || 10);

/**
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end('Method not allowed');
    return;
  }

  const rawBody = await readBody(req);
  const hmac = req.headers['x-shopify-hmac-sha256'];

  if (!verifyShopifyWebhook(rawBody, hmac, process.env.SHOPIFY_WEBHOOK_SECRET)) {
    res.statusCode = 401;
    res.end('Unauthorized');
    return;
  }

  const payload = JSON.parse(rawBody);
  const available = payload.available ?? payload.inventory_quantity;
  const itemName = payload.item_name || payload.sku || 'Unknown SKU';
  const location = payload.location_name || 'Default';

  if (typeof available === 'number' && available <= LOW_STOCK_THRESHOLD) {
    const message = [
      '🍃 Luxe Leaf Tea — LOW STOCK ALERT',
      `Product: ${itemName}`,
      `Location: ${location}`,
      `Remaining: ${available} units`,
      `Threshold: ${LOW_STOCK_THRESHOLD}`,
      'Action: Reorder premium loose leaf tea stock',
    ].join('\n');

    await sendWeChatMessage(process.env.WECHAT_WEBHOOK_URL, message);
  }

  res.statusCode = 200;
  res.end('OK');
}

/**
 * @param {string} url
 * @param {string} content
 */
async function sendWeChatMessage(url, content) {
  if (!url) {
    console.warn('WECHAT_WEBHOOK_URL not configured');
    return;
  }

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      msgtype: 'text',
      text: { content },
    }),
  });
}

/**
 * @param {string} body
 * @param {string | string[] | undefined} hmacHeader
 * @param {string | undefined} secret
 */
function verifyShopifyWebhook(body, hmacHeader, secret) {
  if (!secret || !hmacHeader) return false;
  const digest = crypto.createHmac('sha256', secret).update(body, 'utf8').digest('base64');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(String(hmacHeader)));
}

/**
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<string>}
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

if (process.argv[1]?.endsWith('index.js')) {
  const port = process.env.PORT || 8787;
  createServer(handler).listen(port, () => {
    console.log(`WeChat inventory webhook listening on :${port}`);
  });
}
