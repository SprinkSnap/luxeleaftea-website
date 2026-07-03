/**
 * Luxe Leaf Tea Guide — AI-assisted chat with smart local fallback.
 * Optional GPT backend via theme setting tea_chat_api_url (see scripts/tea-chat-api).
 */
class LuxeTeaChat extends HTMLElement {
  #history = [];
  #pending = false;

  connectedCallback() {
    this.agentName = this.dataset.agentName || 'Mei — Tea Guide';
    this.freeShippingCents = Number(this.dataset.freeShipping) || 5000;
    this.shopUrl = this.dataset.shopUrl || '/collections/all';
    this.faqUrl = this.dataset.faqUrl || '/pages/faq';
    this.aboutUrl = this.dataset.aboutUrl || '/pages/about';
    this.contactUrl = this.dataset.contactUrl || '/pages/contact';
    this.apiUrl = (this.dataset.apiUrl || '').trim();

    this.launcher = this.querySelector('[data-chat-launcher]');
    this.panel = this.querySelector('[data-chat-panel]');
    this.messages = this.querySelector('[data-chat-messages]');
    this.quickReplies = this.querySelector('[data-chat-quick-replies]');
    this.form = this.querySelector('[data-chat-form]');
    this.input = this.querySelector('[data-chat-input]');
    this.closeBtn = this.querySelector('[data-chat-close]');
    this.inboxBtn = this.querySelector('[data-open-inbox]');
    this.sendBtn = this.form?.querySelector('[type="submit"]');

    this.quickPrompts = [
      'Which tea should I try first?',
      'How do I brew loose leaf?',
      'Free shipping?',
      'Shop all teas',
    ];

    this.removeAttribute('hidden');
    this.bindEvents();
    this.renderQuickReplies();
  }

  bindEvents() {
    this.launcher?.addEventListener('click', () => this.toggle(true));
    this.closeBtn?.addEventListener('click', () => this.toggle(false));
    this.form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = this.input?.value?.trim();
      if (!text || this.#pending) return;
      this.input.value = '';
      this.handleUserMessage(text);
    });
    this.inboxBtn?.addEventListener('click', () => this.openShopifyInbox());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.panel && !this.panel.hidden) this.toggle(false);
    });
  }

  toggle(open) {
    const shouldOpen = open ?? this.panel.hidden;
    this.panel.hidden = !shouldOpen;
    this.launcher.setAttribute('aria-expanded', String(shouldOpen));
    if (shouldOpen) {
      if (!this.messages.dataset.initialized) {
        this.addAgentMessage(this.welcomeMessage());
        this.messages.dataset.initialized = 'true';
      }
      this.input?.focus();
    }
  }

  welcomeMessage() {
    const name = this.agentName.split('—')[0].trim();
    return `Hello — I'm <strong>${name}</strong>, your tea guide at Luxe Leaf Tea. I can help you choose premium loose leaf tea, brew the perfect cup, or answer shipping questions. What would you like to know?`;
  }

  renderQuickReplies() {
    if (!this.quickReplies) return;
    this.quickReplies.innerHTML = '';
    this.quickPrompts.forEach((prompt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = prompt;
      btn.addEventListener('click', () => this.handleUserMessage(prompt));
      this.quickReplies.appendChild(btn);
    });
  }

  async handleUserMessage(text) {
    this.addUserMessage(text);
    this.#history.push({ role: 'user', content: text });
    if (this.#history.length > 12) this.#history.shift();

    this.setPending(true);
    this.showTyping();

    let reply;
    try {
      reply = this.apiUrl ? await this.fetchAiReply(text) : null;
    } catch {
      reply = null;
    }

    this.hideTyping();
    if (!reply) reply = this.generateReply(text);
    this.addAgentMessage(reply);
    this.#history.push({ role: 'assistant', content: this.stripHtml(reply) });
    this.setPending(false);
  }

  setPending(pending) {
    this.#pending = pending;
    if (this.input) this.input.disabled = pending;
    if (this.sendBtn) this.sendBtn.disabled = pending;
  }

  showTyping() {
    this.hideTyping();
    const el = document.createElement('div');
    el.className = 'luxe-tea-chat__bubble luxe-tea-chat__bubble--agent luxe-tea-chat__typing';
    el.dataset.typing = 'true';
    el.innerHTML = '<span></span><span></span><span></span>';
    this.messages.appendChild(el);
    this.messages.scrollTop = this.messages.scrollHeight;
  }

  hideTyping() {
    this.messages.querySelector('[data-typing]')?.remove();
  }

  async fetchAiReply(latestMessage) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: latestMessage,
          messages: this.#history.slice(-8),
          context: {
            shopName: 'Luxe Leaf Tea',
            agentName: this.agentName,
            freeShippingUsd: (this.freeShippingCents / 100).toFixed(0),
            shopUrl: this.shopUrl,
            faqUrl: this.faqUrl,
            aboutUrl: this.aboutUrl,
            contactUrl: this.contactUrl,
          },
        }),
        signal: controller.signal,
      });

      if (!res.ok) return null;
      const data = await res.json();
      return data.reply || data.message || null;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  addUserMessage(text) {
    const bubble = document.createElement('div');
    bubble.className = 'luxe-tea-chat__bubble luxe-tea-chat__bubble--user';
    bubble.textContent = text;
    this.messages.appendChild(bubble);
    this.messages.scrollTop = this.messages.scrollHeight;
  }

  addAgentMessage(html) {
    const bubble = document.createElement('div');
    bubble.className = 'luxe-tea-chat__bubble luxe-tea-chat__bubble--agent';
    bubble.innerHTML = html;
    this.messages.appendChild(bubble);
    this.messages.scrollTop = this.messages.scrollHeight;
  }

  stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || '';
  }

  normalize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s'-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  tokens(text) {
    return this.normalize(text).split(' ').filter(Boolean);
  }

  includesAny(text, words) {
    const q = this.normalize(text);
    return words.some((w) => q.includes(w));
  }

  generateReply(text) {
    const q = this.normalize(text);
    const shipping = (this.freeShippingCents / 100).toFixed(0);
    const lastUser = this.#history.filter((m) => m.role === 'user').slice(-2, -1)[0]?.content || '';

    const intents = [
      {
        score: () => (/^(hi|hello|hey|good morning|good afternoon|good evening|howdy|greetings)\b/.test(q) || q === 'hi' || q === 'hey') ? 20 : 0,
        reply: () => `${this.welcomeMessage()} Try asking about tea types, brewing, or our <a href="${this.shopUrl}">shop</a>.`,
      },
      {
        score: () => (/^(thanks|thank you|thx|appreciate)/.test(q) ? 18 : 0),
        reply: () => `You're very welcome. If you'd like a recommendation, tell me whether you prefer something light, floral, or bold — or <a href="${this.shopUrl}">browse our teas</a>.`,
      },
      {
        score: () => (/^(yes|yeah|yep|sure|ok|okay|please)\b/.test(q) && lastUser ? 12 : 0),
        reply: () => this.generateReply(lastUser),
      },
      {
        score: () => (this.includesAny(q, ['shop', 'buy', 'order', 'catalog', 'collection', 'browse', 'purchase']) ? 14 : 0),
        reply: () => `Our teas are hand-selected whole leaves, packed fresh after you order. <a href="${this.shopUrl}"><strong>Shop premium loose leaf tea →</strong></a>`,
      },
      {
        score: () => (this.includesAny(q, ['green', 'oolong', 'pu erh', 'puerh', 'black tea', 'white tea', 'herbal']) || this.includesAny(q, ['which tea', 'try first', 'recommend', 'suggestion', 'beginner', 'best tea', 'good tea']) ? 16 : 0),
        reply: () => {
          if (q.includes('green')) {
            return `Green teas like Dragon Well are bright and clean — great for mornings. Steep at ~175°F (80°C) for 2–3 minutes. <a href="${this.shopUrl}">Shop green tea →</a>`;
          }
          if (q.includes('oolong')) {
            return `Oolongs like Tieguanyin are layered and floral — perfect for multiple short steeps around 195°F (90°C). <a href="${this.shopUrl}">Shop oolong →</a>`;
          }
          if (q.includes('pu')) {
            return `Pu-erh is deep, smooth, and excellent for re-steeping — a favorite for afternoon ritual. <a href="${this.shopUrl}">Shop pu-erh →</a>`;
          }
          if (q.includes('black')) {
            return `Black teas like Keemun are malty and comforting — ideal with breakfast at ~205°F (96°C) for 3–4 minutes. <a href="${this.shopUrl}">Shop black tea →</a>`;
          }
          return `For a first cup, I'd suggest a bright <strong>green</strong> for clarity, a floral <strong>oolong</strong> for aroma, or a malty <strong>black</strong> for everyday sipping. <a href="${this.shopUrl}">Explore all teas →</a>`;
        },
      },
      {
        score: () => (this.includesAny(q, ['brew', 'steep', 'temperature', 'water', 'gaiwan', 'infus', 'how long', 'how much', 'grams', 'teaspoon', 're steep', 'resteep']) ? 16 : 0),
        reply: () => `Use about <strong>2–3g whole leaves per 200ml</strong> (roughly a teaspoon). Greens ~175°F (80°C) for 2–3 min; oolongs ~195°F (90°C) with short steeps; blacks ~205°F (96°C) for 3–4 min. Whole leaves re-steep beautifully. <a href="${this.aboutUrl}">Full brewing guide →</a>`,
      },
      {
        score: () => (this.includesAny(q, ['ship', 'deliver', 'shipping', 'arrive', 'how long', 'when will', 'tracking']) || q.includes('free') ? 14 : 0),
        reply: () => {
          if (q.includes('free') || q.includes('ship') || q.includes('deliver')) {
            return `We pack fresh to order and ship quickly. Enjoy <strong>free shipping on orders over $${shipping}</strong>. Most US orders arrive within a few business days.`;
          }
          return `Orders ship within a few business days after packing. You'll receive tracking once your tea leaves our studio.`;
        },
      },
      {
        score: () => (this.includesAny(q, ['price', 'cost', 'how much', 'expensive', 'afford', 'budget']) ? 14 : 0),
        reply: () => `Our premium loose leaf teas are priced for whole-leaf quality — typically less per cup than café tea because leaves re-steep. <a href="${this.shopUrl}">See current prices →</a> Free shipping over $${shipping}.`,
      },
      {
        score: () => (this.includesAny(q, ['pay', 'payment', 'checkout', 'apple pay', 'google pay', 'credit card', 'secure']) ? 13 : 0),
        reply: () => `Checkout is fast and secure through Shopify — major cards, Apple Pay, and Google Pay where available. Add to bag, then tap <strong>Checkout Now</strong> in your cart.`,
      },
      {
        score: () => (this.includesAny(q, ['fresh', 'quality', 'whole leaf', 'loose leaf', 'premium', 'fannings', 'dust']) ? 12 : 0),
        reply: () => `Every selection is whole-leaf tea — never dusty fannings. We pack after you order so aroma and flavor stay vivid in the cup.`,
      },
      {
        score: () => (this.includesAny(q, ['caffeine', 'caffeinated', 'decaf', 'sleep', 'evening']) ? 13 : 0),
        reply: () => `Black and green teas contain caffeine; many oolongs are moderate. For evenings, try a lighter green or ask about lower-caffeine options. Pu-erh is often enjoyed later in the day by regular tea drinkers.`,
      },
      {
        score: () => (this.includesAny(q, ['gift', 'present', 'birthday', 'holiday']) ? 12 : 0),
        reply: () => `Loose leaf makes a thoughtful gift — choose a single origin or an assortment. Add a gift note at checkout. <a href="${this.shopUrl}">Browse teas to gift →</a>`,
      },
      {
        score: () => (this.includesAny(q, ['return', 'refund', 'exchange', 'policy']) ? 12 : 0),
        reply: () => `We want you to love every steep. See our policies on the <a href="${this.faqUrl}">FAQ page</a>, or <a href="${this.contactUrl}">contact us</a> and we'll help personally.`,
      },
      {
        score: () => (this.includesAny(q, ['human', 'person', 'real', 'team', 'agent', 'support', 'talk to']) ? 13 : 0),
        reply: () => `For order-specific help, tap <strong>Talk to our team</strong> below to reach a real person via our store chat.`,
      },
      {
        score: () => (this.includesAny(q, ['stock', 'sold out', 'available', 'inventory', 'in stock']) ? 12 : 0),
        reply: () => `Stock updates live on each product page — low-stock teas show a badge. <a href="${this.shopUrl}">See what's available now →</a>`,
      },
      {
        score: () => (this.includesAny(q, ['faq', 'help', 'question']) ? 10 : 0),
        reply: () => `Our FAQ covers shipping, brewing, and choosing teas. <a href="${this.faqUrl}">Read the FAQ →</a> Or ask me anything here.`,
      },
      {
        score: () => (this.includesAny(q, ['iced', 'cold brew', 'summer']) ? 11 : 0),
        reply: () => `Many of our greens and oolongs shine iced — cold brew overnight (8–12 hrs in the fridge) or flash-chill hot tea. Start with 3g per 250ml cold water.`,
      },
      {
        score: () => (this.includesAny(q, ['discount', 'coupon', 'promo', 'code', 'sale']) ? 11 : 0),
        reply: () => `Watch our announcement bar for offers. Orders over $${shipping} always ship free — a great way to try multiple teas in one order.`,
      },
    ];

    let best = null;
    let bestScore = 0;
    for (const intent of intents) {
      const s = intent.score();
      if (s > bestScore) {
        bestScore = s;
        best = intent;
      }
    }

    if (best && bestScore >= 10) return best.reply();

    const wordMatch = this.matchByKeywords(q, shipping);
    if (wordMatch) return wordMatch;

    return `I'd love to help with that. For premium loose leaf tea, you can <a href="${this.shopUrl}">shop our collection</a>, read the <a href="${this.faqUrl}">FAQ</a>, or ask about <strong>tea types</strong>, <strong>brewing</strong>, or <strong>shipping</strong>. What matters most for your cup today?`;
  }

  matchByKeywords(q, shipping) {
    const hits = {
      tea: `Tell me if you prefer light, floral, or bold flavors and I'll point you to the right loose leaf. <a href="${this.shopUrl}">Shop all teas →</a>`,
      cup: `For one cup, use 2–3g leaves in 200ml water. Adjust to taste — whole leaves give you room to re-steep.`,
      water: `Filtered water brings out the best in whole-leaf tea. Match temperature to type: cooler for green, hotter for black.`,
      bag: `We specialize in loose leaf — whole leaves unfurl for richer flavor and better re-steeps than bags.`,
    };
    for (const [key, reply] of Object.entries(hits)) {
      if (q.includes(key)) return reply;
    }
    return null;
  }

  openShopifyInbox() {
    const shopifyChat = document.querySelector('shopify-chat');
    if (shopifyChat) {
      shopifyChat.setAttribute('open', '');
      shopifyChat.setAttribute('mode', 'standalone');
      this.toggle(false);
      return;
    }
    window.location.href = this.contactUrl;
  }
}

if (!customElements.get('luxe-tea-chat')) {
  customElements.define('luxe-tea-chat', LuxeTeaChat);
}

(function initLuxeAnalytics() {
  const pushEvent = (name, params = {}) => {
    if (typeof window.gtag === 'function') window.gtag('event', name, params);
  };
  document.addEventListener('cart:updated', () => pushEvent('add_to_cart'));
  document.addEventListener('click', (e) => {
    const checkout = e.target.closest('#checkout, .cart__checkout-button, [data-mobile-checkout]');
    if (checkout) pushEvent('begin_checkout');
  });
})();
