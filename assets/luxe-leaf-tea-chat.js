/**
 * Luxe Leaf Tea Guide — conversational AI assist with smart local fallback.
 * Optional GPT backend via theme setting tea_chat_api_url.
 */
class LuxeTeaChat extends HTMLElement {
  #history = [];
  #pending = false;
  #storageKey = 'luxe-tea-chat-v1';
  #focusBeforeOpen = null;

  connectedCallback() {
    this.agentName = this.dataset.agentName || 'Mei — Tea Guide';
    this.freeShippingCents = Number(this.dataset.freeShipping) || 5000;
    this.shopUrl = this.dataset.shopUrl || '/collections/all';
    this.faqUrl = this.dataset.faqUrl || '/pages/faq';
    this.aboutUrl = this.dataset.aboutUrl || '/pages/about';
    this.contactUrl = this.dataset.contactUrl || '/pages/contact';
    this.apiUrl = (this.dataset.apiUrl || '').trim();
    this.productContext = this.readProductContext();

    this.launcher = this.querySelector('[data-chat-launcher]');
    this.panel = this.querySelector('[data-chat-panel]');
    this.messages = this.querySelector('[data-chat-messages]');
    this.quickReplies = this.querySelector('[data-chat-quick-replies]');
    this.form = this.querySelector('[data-chat-form]');
    this.input = this.querySelector('[data-chat-input]');
    this.closeBtn = this.querySelector('[data-chat-close]');
    this.inboxBtn = this.querySelector('[data-open-inbox]');
    this.shopBtn = this.querySelector('[data-chat-shop]');
    this.badge = this.querySelector('[data-chat-badge]');
    this.sendBtn = this.form?.querySelector('[type="submit"]');

    this.defaultPrompts = [
      'How are you?',
      'Which tea should I try first?',
      'How do I brew loose leaf?',
      'Free shipping?',
    ];

    this.removeAttribute('hidden');
    this.restoreSession();
    this.bindEvents();
    this.renderQuickReplies(this.defaultPrompts);
  }

  readProductContext() {
    const title =
      document.querySelector('h1.product-title, h1[data-testid="product-title"], .product-information h1')
        ?.textContent?.trim() || '';
    if (!title) return '';
    return title.slice(0, 80);
  }

  bindEvents() {
    this.launcher?.addEventListener('click', () => this.toggle());
    this.closeBtn?.addEventListener('click', () => this.toggle(false));
    this.shopBtn?.addEventListener('click', () => {
      window.location.href = this.shopUrl;
    });
    this.form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = this.input?.value?.trim();
      if (!text || this.#pending) return;
      this.input.value = '';
      this.handleUserMessage(text);
    });
    this.input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.form?.requestSubmit?.();
      }
    });
    this.inboxBtn?.addEventListener('click', () => this.openShopifyInbox());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) this.toggle(false);
    });
  }

  isOpen() {
    return Boolean(this.panel && !this.panel.hidden);
  }

  toggle(open) {
    const shouldOpen = open ?? !this.isOpen();
    this.panel.hidden = !shouldOpen;
    this.launcher?.setAttribute('aria-expanded', String(shouldOpen));
    this.classList.toggle('luxe-tea-chat--open', shouldOpen);
    document.documentElement.classList.toggle('luxe-chat-open', shouldOpen);

    if (shouldOpen) {
      this.#focusBeforeOpen = document.activeElement;
      if (this.badge) this.badge.hidden = true;
      if (!this.messages.dataset.initialized) {
        this.bootstrapConversation();
      }
      this.track('tea_chat_open');
      requestAnimationFrame(() => this.input?.focus({ preventScroll: true }));
    } else if (this.#focusBeforeOpen instanceof HTMLElement) {
      this.#focusBeforeOpen.focus({ preventScroll: true });
      this.#focusBeforeOpen = null;
    }
  }

  bootstrapConversation() {
    const restored = this.#history.length > 0;
    if (restored) {
      this.renderHistory();
      this.addAgentMessage(
        `Welcome back — I'm still here if you want to keep exploring. Ask me anything, or tap a suggestion below.`
      );
    } else {
      this.addAgentMessage(this.welcomeMessage());
    }
    this.messages.dataset.initialized = 'true';
    this.renderQuickReplies(this.defaultPrompts);
  }

  welcomeMessage() {
    const name = this.agentName.split('—')[0].trim();
    const productBit = this.productContext
      ? ` I see you're looking at <strong>${this.escapeHtml(this.productContext)}</strong> — happy to help with that tea or other options.`
      : '';
    return `Hello — I'm <strong>${name}</strong>, your tea guide at Luxe Leaf Tea.${productBit} I can help you choose premium loose leaf tea, brew the perfect cup, or answer shipping questions. What would you like to know?`;
  }

  renderQuickReplies(prompts) {
    if (!this.quickReplies) return;
    this.quickReplies.innerHTML = '';
    prompts.forEach((prompt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = prompt;
      btn.addEventListener('click', () => {
        if (this.#pending) return;
        this.handleUserMessage(prompt);
      });
      this.quickReplies.appendChild(btn);
    });
  }

  followUpsFor(text) {
    const q = this.normalize(text);
    if (this.isSmallTalk(q)) {
      return ['Which tea should I try first?', 'How do I brew loose leaf?', 'Tell me about free shipping'];
    }
    if (this.includesAny(q, ['ship', 'deliver', 'shipping', 'tracking']) || /\bfree shipping\b/.test(q)) {
      return ['Shop all teas', 'Which tea should I try first?', 'How do I brew loose leaf?'];
    }
    if (this.includesAny(q, ['brew', 'steep', 'temperature'])) {
      return ['Which tea should I try first?', 'Shop all teas', 'Free shipping?'];
    }
    if (this.includesAny(q, ['green', 'oolong', 'black', 'pu', 'recommend', 'try first'])) {
      return ['How do I brew loose leaf?', 'Shop all teas', 'Is this a good gift?'];
    }
    if (this.includesAny(q, ['gift', 'present'])) {
      return ['Shop all teas', 'Free shipping?', 'How do I brew loose leaf?'];
    }
    return this.defaultPrompts;
  }

  isSmallTalk(q) {
    return (
      /^(hi|hello|hey|howdy|greetings|good (morning|afternoon|evening))\b/.test(q) ||
      /\b(how are you|how're you|how r u|how's it going|hows it going|how have you been|what's up|whats up|sup|you good|you okay|you ok)\b/.test(
        q
      ) ||
      /\b(who are you|what('s| is) your name|what can you do|are you (a )?(real|human|bot|ai)|nice to meet you)\b/.test(
        q
      ) ||
      /^(thanks|thank you|thx|appreciate|cheers)\b/.test(q) ||
      /^(bye|goodbye|see you|talk later|gotta go)\b/.test(q) ||
      /\b(how('s| is) your day|having a good day|good day)\b/.test(q)
    );
  }

  async handleUserMessage(text) {
    this.addUserMessage(text);
    this.#history.push({ role: 'user', content: text });
    this.trimHistory();
    this.persistSession();
    this.track('tea_chat_message', { role: 'user' });

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
    this.trimHistory();
    this.persistSession();
    this.renderQuickReplies(this.followUpsFor(text));
    this.setPending(false);
    this.track('tea_chat_message', { role: 'assistant' });

    if (!this.isOpen() && this.badge) {
      this.badge.hidden = false;
    }
  }

  trimHistory() {
    while (this.#history.length > 16) this.#history.shift();
  }

  setPending(pending) {
    this.#pending = pending;
    if (this.input) this.input.disabled = pending;
    if (this.sendBtn) this.sendBtn.disabled = pending;
    this.quickReplies?.querySelectorAll('button').forEach((btn) => {
      btn.disabled = pending;
    });
  }

  showTyping() {
    this.hideTyping();
    const el = document.createElement('div');
    el.className = 'luxe-tea-chat__bubble luxe-tea-chat__bubble--agent luxe-tea-chat__typing';
    el.dataset.typing = 'true';
    el.setAttribute('aria-label', `${this.agentName} is typing`);
    el.innerHTML = '<span></span><span></span><span></span>';
    this.messages.appendChild(el);
    this.scrollMessages();
  }

  hideTyping() {
    this.messages.querySelector('[data-typing]')?.remove();
  }

  async fetchAiReply(latestMessage) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 14000);

    try {
      const res = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: latestMessage,
          messages: this.#history.slice(-10),
          context: {
            shopName: 'Luxe Leaf Tea',
            agentName: this.agentName,
            freeShippingUsd: (this.freeShippingCents / 100).toFixed(0),
            shopUrl: this.shopUrl,
            faqUrl: this.faqUrl,
            aboutUrl: this.aboutUrl,
            contactUrl: this.contactUrl,
            productTitle: this.productContext || undefined,
            pagePath: window.location.pathname,
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
    this.scrollMessages();
  }

  addAgentMessage(html) {
    const bubble = document.createElement('div');
    bubble.className = 'luxe-tea-chat__bubble luxe-tea-chat__bubble--agent';
    bubble.innerHTML = html;
    this.messages.appendChild(bubble);
    this.scrollMessages();
  }

  scrollMessages() {
    if (!this.messages) return;
    this.messages.scrollTop = this.messages.scrollHeight;
  }

  renderHistory() {
    this.messages.innerHTML = '';
    this.#history.forEach((item) => {
      if (item.role === 'user') this.addUserMessage(item.content);
      else this.addAgentMessage(this.escapeHtml(item.content).replace(/\n/g, '<br>'));
    });
  }

  persistSession() {
    try {
      sessionStorage.setItem(
        this.#storageKey,
        JSON.stringify({
          history: this.#history.slice(-16),
          savedAt: Date.now(),
        })
      );
    } catch {
      /* private mode */
    }
  }

  restoreSession() {
    try {
      const raw = sessionStorage.getItem(this.#storageKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!Array.isArray(data?.history)) return;
      // Expire after 2 hours of browsing
      if (data.savedAt && Date.now() - data.savedAt > 2 * 60 * 60 * 1000) {
        sessionStorage.removeItem(this.#storageKey);
        return;
      }
      this.#history = data.history.filter(
        (m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'
      );
    } catch {
      this.#history = [];
    }
  }

  stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || '';
  }

  escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  normalize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s'-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  includesAny(text, words) {
    const q = this.normalize(text);
    return words.some((w) => q.includes(w));
  }

  track(name, params = {}) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params);
  }

  generateReply(text) {
    const q = this.normalize(text);
    const shipping = (this.freeShippingCents / 100).toFixed(0);
    const lastUser = this.#history.filter((m) => m.role === 'user').slice(-2, -1)[0]?.content || '';
    const name = this.agentName.split('—')[0].trim();

    // Natural conversation first — answer like a person before tea intents.
    const social = this.conversationalReply(q, name);
    if (social) return social;

    if (/^(yes|yeah|yep|sure|ok|okay|please|yup)\b/.test(q) && lastUser) {
      return this.generateReply(lastUser);
    }

    const intents = [
      {
        score: () =>
          this.includesAny(q, ['shop', 'buy', 'order', 'catalog', 'collection', 'browse', 'purchase']) ? 14 : 0,
        reply: () =>
          `Our teas are hand-selected whole leaves, packed fresh after you order. <a href="${this.shopUrl}"><strong>Shop premium loose leaf tea →</strong></a>`,
      },
      {
        score: () =>
          this.includesAny(q, [
            'green',
            'oolong',
            'pu erh',
            'puerh',
            'black tea',
            'white tea',
            'herbal',
            'which tea',
            'try first',
            'recommend',
            'suggestion',
            'beginner',
            'best tea',
            'good tea',
          ])
            ? 16
            : 0,
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
        score: () =>
          this.includesAny(q, [
            'brew',
            'steep',
            'temperature',
            'gaiwan',
            'infus',
            'how long to steep',
            'how much tea',
            'grams',
            'teaspoon',
            're steep',
            'resteep',
          ]) || /\bbrew(ing)?\b/.test(q)
            ? 16
            : 0,
        reply: () =>
          `Use about <strong>2–3g whole leaves per 200ml</strong> (roughly a teaspoon). Greens ~175°F (80°C) for 2–3 min; oolongs ~195°F (90°C) with short steeps; blacks ~205°F (96°C) for 3–4 min. Whole leaves re-steep beautifully. <a href="${this.aboutUrl}">Full brewing guide →</a>`,
      },
      {
        score: () =>
          this.includesAny(q, ['ship', 'deliver', 'shipping', 'arrive', 'when will', 'tracking']) ||
          /\bfree shipping\b/.test(q)
            ? 14
            : 0,
        reply: () =>
          `We pack fresh to order and ship quickly. Enjoy <strong>free shipping on orders over $${shipping}</strong>. Most US orders arrive within a few business days. <a href="${this.shopUrl}">Shop teas →</a>`,
      },
      {
        score: () =>
          this.includesAny(q, ['price', 'cost', 'expensive', 'afford', 'budget']) || /\bhow much (is|are|does)\b/.test(q)
            ? 14
            : 0,
        reply: () =>
          `Our premium loose leaf teas are priced for whole-leaf quality — typically less per cup than café tea because leaves re-steep. <a href="${this.shopUrl}">See current prices →</a> Free shipping over $${shipping}.`,
      },
      {
        score: () =>
          this.includesAny(q, ['pay', 'payment', 'checkout', 'apple pay', 'google pay', 'credit card', 'secure'])
            ? 13
            : 0,
        reply: () =>
          `Checkout is fast and secure through Shopify — major cards, Apple Pay, and Google Pay where available. Add to bag, then tap <strong>Checkout</strong> in your cart.`,
      },
      {
        score: () => (this.includesAny(q, ['gift', 'present', 'birthday', 'holiday']) ? 12 : 0),
        reply: () =>
          `Loose leaf makes a thoughtful gift — choose a single origin or an assortment. Add a gift note at checkout. <a href="${this.shopUrl}">Browse teas to gift →</a>`,
      },
      {
        score: () => (this.includesAny(q, ['return', 'refund', 'exchange', 'policy']) ? 12 : 0),
        reply: () =>
          `We want you to love every steep. See our policies on the <a href="${this.faqUrl}">FAQ page</a>, or <a href="${this.contactUrl}">contact us</a> and we'll help personally.`,
      },
      {
        score: () =>
          this.includesAny(q, ['talk to', 'human support', 'real person', 'customer service', 'customer support'])
            ? 13
            : 0,
        reply: () =>
          `Of course — tap <strong>Talk to our team</strong> below and a real person can help with your order.`,
      },
      {
        score: () => (/\bfaq\b/.test(q) || /\b(help center|help page)\b/.test(q) ? 10 : 0),
        reply: () =>
          `Our FAQ covers shipping, brewing, and choosing teas. <a href="${this.faqUrl}">Read the FAQ →</a> Or keep chatting with me here — ask anything.`,
      },
      {
        score: () => (this.includesAny(q, ['iced', 'cold brew', 'summer']) ? 11 : 0),
        reply: () =>
          `Many of our greens and oolongs shine iced — cold brew overnight (8–12 hrs in the fridge) or flash-chill hot tea. Start with 3g per 250ml cold water.`,
      },
      {
        score: () =>
          this.includesAny(q, ['caffeine', 'caffeinated', 'decaf', 'sleep', 'evening']) ? 12 : 0,
        reply: () =>
          `Black and green teas contain caffeine; many oolongs are moderate. For evenings, try a lighter green or ask about lower-caffeine options. Pu-erh is often enjoyed later in the day.`,
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

    const wordMatch = this.matchByKeywords(q);
    if (wordMatch) return wordMatch;

    // Open conversation: acknowledge the question, answer helpfully, invite next step.
    return this.openConversationReply(text, q, name);
  }

  conversationalReply(q, name) {
    if (
      /\b(how are you|how're you|how r u|how are u|how's it going|hows it going|how have you been|you good|you okay|you ok)\b/.test(
        q
      )
    ) {
      return `I'm doing great — thank you for asking. Always glad to chat. How are <em>you</em> doing today? If you want, I can also help pick a tea or answer anything on your mind.`;
    }

    if (/\b(how's your day|how is your day|having a good day)\b/.test(q)) {
      return `It's a good day on my end — lots of tea talk and happy customers. How's your day going? I'm here if you want a brewing tip, a recommendation, or just to talk.`;
    }

    if (/^(hi|hello|hey|howdy|greetings)\b/.test(q) || /\bgood (morning|afternoon|evening)\b/.test(q)) {
      return `Hey there — nice to meet you. I'm <strong>${name}</strong>, your tea guide. How can I help today? Ask me anything — from "how are you?" to which tea to try next.`;
    }

    if (/\b(what's up|whats up|sup)\b/.test(q)) {
      return `Not much — just here ready to chat. What's up with you? Want a tea suggestion, shipping info, or something else entirely?`;
    }

    if (/\b(who are you|what('s| is) your name)\b/.test(q)) {
      return `I'm <strong>${name}</strong>, the Luxe Leaf Tea guide. I chat like a real person and can help with recommendations, brewing, shipping — or just a friendly conversation.`;
    }

    if (/\b(what can you do|how can you help|what do you (know|help with))\b/.test(q)) {
      return `I can talk with you about almost anything tea-related — recommendations, brewing, gifts, shipping — and everyday questions too. Try me: ask how I am, what tea fits your morning, or anything you're curious about.`;
    }

    if (/\b(are you (a )?(real|human|bot|ai|robot)|are you fake)\b/.test(q)) {
      return `I'm your digital tea guide — not a human, but I reply in a natural, conversational way and I'm here to be useful. For order-specific help, tap <strong>Talk to our team</strong> below.`;
    }

    if (/\b(nice to meet you|pleased to meet you)\b/.test(q)) {
      return `Nice to meet you too. I'm glad you're here. What would you like to chat about?`;
    }

    if (/^(thanks|thank you|thx|appreciate|cheers)\b/.test(q)) {
      return `You're very welcome — happy to help. Anything else on your mind?`;
    }

    if (/^(bye|goodbye|see you|talk later|gotta go|good night|goodnight)\b/.test(q)) {
      return `Take care — come back anytime. I'll be here with a warm cup of advice when you need it.`;
    }

    if (/\bi('m| am) (good|great|fine|ok|okay|well|tired|busy|happy|sad)\b/.test(q)) {
      return `Thanks for sharing that — I hear you. If a calming cup would help (or an energizing one), I can suggest something. Or keep chatting about whatever you'd like.`;
    }

    if (/\b(lol|haha|funny|joke)\b/.test(q)) {
      return `Ha — glad that landed. Want a tea recommendation while we're at it, or keep the chat going?`;
    }

    if (/\b(weather|rain|sunny|cold outside|hot outside)\b/.test(q)) {
      return `Sounds like a good day for tea either way — something iced if it's warm, or a cozy black if it's chilly. What kind of day are you having?`;
    }

    return null;
  }

  openConversationReply(rawText, q, name) {
    const short = this.escapeHtml(String(rawText || '').trim()).slice(0, 120);
    if (!short) {
      return `I'm here — ask me anything. Recommendations, brewing, shipping, or just a normal conversation.`;
    }

    // Question-style openers
    if (/\?$/.test(rawText.trim()) || /^(what|why|when|where|who|which|can|could|would|should|do|does|is|are|will)\b/.test(q)) {
      return `Good question. I may not have every answer outside tea, but I'll respond thoughtfully. On "${short}", the most helpful next step is usually: tell me a bit more, or ask me about teas, brewing, gifts, or shipping — I'm happy either way.`;
    }

    return `Got it — "${short}". I'm listening. Want me to help with a tea pick, brewing tips, shipping, or keep chatting about that?`;
  }

  matchByKeywords(q) {
    // Avoid hijacking small talk with single-word bait matches.
    if (this.isSmallTalk(q) || (q.split(' ').length <= 2 && !/\b(tea|brew|ship|shop)\b/.test(q))) {
      return null;
    }
    const hits = {
      'loose leaf': `Tell me if you prefer light, floral, or bold flavors and I'll point you to the right loose leaf. <a href="${this.shopUrl}">Shop all teas →</a>`,
      teaspoon: `For one cup, use 2–3g leaves in 200ml water. Adjust to taste — whole leaves give you room to re-steep.`,
      'filtered water': `Filtered water brings out the best in whole-leaf tea. Match temperature to type: cooler for green, hotter for black.`,
    };
    for (const [key, reply] of Object.entries(hits)) {
      if (q.includes(key)) return reply;
    }
    if (/\btea\b/.test(q) && !/\b(how are you|thank)\b/.test(q)) {
      return `Tell me if you prefer light, floral, or bold flavors and I'll point you to the right loose leaf. <a href="${this.shopUrl}">Shop all teas →</a>`;
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
