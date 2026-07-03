/**
 * Luxe Leaf Tea — GPT-powered chat API for the storefront tea guide.
 * Deploy to Cloudflare Workers, Vercel, Railway, or any Node host.
 *
 * Env:
 *   OPENAI_API_KEY — required
 *   OPENAI_MODEL   — optional (default gpt-4o-mini)
 *   ALLOWED_ORIGIN — optional CORS origin (default *)
 */

import { createServer } from 'http';

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

const SYSTEM_TEMPLATE = `You are {agentName}, a warm and professional tea guide for Luxe Leaf Tea, a premium loose leaf tea boutique.

Rules:
- Answer in 2–4 short sentences. Be helpful, confident, and friendly — never robotic.
- Recommend whole-leaf teas and link paths when relevant: shop {shopUrl}, FAQ {faqUrl}, about {aboutUrl}, contact {contactUrl}.
- Free shipping threshold: ${'{freeShippingUsd}'} USD.
- You sell green, oolong, pu-erh, and black loose leaf teas packed fresh to order.
- For order-specific issues, suggest "Talk to our team" in the chat widget.
- Do not invent products, prices, or policies. If unsure, direct to FAQ or contact.
- Plain text only — no markdown. You may include simple HTML links like <a href="...">text</a>.`;

/**
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }));
    return;
  }

  try {
    const body = JSON.parse(await readBody(req));
    const context = body.context || {};
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const latest = body.message || messages[messages.length - 1]?.content || '';

    const system = SYSTEM_TEMPLATE.replace('{agentName}', context.agentName || 'Mei — Tea Guide')
      .replace('{shopUrl}', context.shopUrl || '/collections/all')
      .replace('{faqUrl}', context.faqUrl || '/pages/faq')
      .replace('{aboutUrl}', context.aboutUrl || '/pages/about')
      .replace('{contactUrl}', context.contactUrl || '/pages/contact')
      .replace('{freeShippingUsd}', context.freeShippingUsd || '50');

    const chatMessages = [
      { role: 'system', content: system },
      ...messages.slice(-8).map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content || '').slice(0, 2000),
      })),
    ];

    if (latest && chatMessages[chatMessages.length - 1]?.content !== latest) {
      chatMessages.push({ role: 'user', content: String(latest).slice(0, 2000) });
    }

    const reply = await callOpenAI(chatMessages);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ reply }));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message || 'Server error' }));
  }
}

async function callOpenAI(messages) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.65,
      max_tokens: 280,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || 'Let me connect you with our team for that question.';
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

if (process.argv[1]?.includes('tea-chat-api')) {
  const port = Number(process.env.PORT || 8788);
  createServer(handler).listen(port, () => {
    console.log(`Tea chat API listening on :${port}`);
  });
}
