/**
 * Luxe Leaf Tea Guide — conversational assistant for premium loose leaf tea shoppers.
 * Rule-based responses with human tone; escalates to Shopify Inbox when available.
 */
class LuxeTeaChat extends HTMLElement {
  connectedCallback() {
    this.agentName = this.dataset.agentName || 'Mei — Tea Guide';
    this.freeShippingCents = Number(this.dataset.freeShipping) || 5000;
    this.shopUrl = this.dataset.shopUrl || '/collections/all';
    this.faqUrl = this.dataset.faqUrl || '/pages/faq';
    this.aboutUrl = this.dataset.aboutUrl || '/pages/about';
    this.contactUrl = this.dataset.contactUrl || '/pages/contact';

    this.launcher = this.querySelector('[data-chat-launcher]');
    this.panel = this.querySelector('[data-chat-panel]');
    this.messages = this.querySelector('[data-chat-messages]');
    this.quickReplies = this.querySelector('[data-chat-quick-replies]');
    this.form = this.querySelector('[data-chat-form]');
    this.input = this.querySelector('[data-chat-input]');
    this.closeBtn = this.querySelector('[data-chat-close]');
    this.inboxBtn = this.querySelector('[data-open-inbox]');

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
      if (!text) return;
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
        this.addAgentMessage(
          `Hi — I'm ${this.agentName.split('—')[0].trim()}. I help guests choose drinkable premium loose leaf tea, just like in our tasting room. What would you like to sip today?`
        );
        this.messages.dataset.initialized = 'true';
      }
      this.input?.focus();
    }
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

  handleUserMessage(text) {
    this.addUserMessage(text);
    window.setTimeout(() => {
      this.addAgentMessage(this.generateReply(text));
    }, 450);
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

  generateReply(text) {
    const q = text.toLowerCase();
    const shipping = (this.freeShippingCents / 100).toFixed(0);

    if (/shop|buy|collection|all tea|catalog/.test(q)) {
      return `I'd start with our curated picks — whole leaves packed fresh to order. <a href="${this.shopUrl}">Shop premium loose leaf tea →</a>`;
    }
    if (/green|oolong|pu-?erh|black|white|herbal|type|which tea|try first|recommend|beginner/.test(q)) {
      return `For a first cup, try a bright <strong>green</strong> for clarity, a layered <strong>oolong</strong> for aroma, or a malty <strong>black</strong> for everyday ritual. Browse by type on our homepage, or <a href="${this.shopUrl}">shop all teas</a>.`;
    }
    if (/brew|steep|temperature|water|gaiwan|infus|how long|how much/.test(q)) {
      return `Use 2–3g whole leaves per 200ml water. Greens ~175°F (80°C) for 2–3 min; oolongs ~195°F (90°C) with short steeps; blacks ~205°F (96°C) for 3–4 min. Re-steep whole leaves — that's the joy of loose leaf. <a href="${this.aboutUrl}">See our brewing guide →</a>`;
    }
    if (/ship|deliver|free|postage/.test(q)) {
      return `We pack fresh to order and ship quickly. Enjoy <strong>free shipping over $${shipping}</strong> on premium loose leaf tea. Most orders arrive in a few business days.`;
    }
    if (/fresh|quality|whole leaf|loose leaf|premium/.test(q)) {
      return `Every tin is hand-selected whole-leaf tea — never dusty fannings. We pack after you order so your cup stays vivid and aromatic.`;
    }
    if (/gift|present/.test(q)) {
      return `Loose leaf makes a beautiful gift — choose an assortment or a single origin with a note at checkout. <a href="${this.shopUrl}">Browse teas to gift →</a>`;
    }
    if (/return|refund|exchange/.test(q)) {
      return `We want you to love every steep. See our policies on the FAQ page, or <a href="${this.contactUrl}">contact us</a> and we'll help personally.`;
    }
    if (/human|person|team|talk|help|support|chat/.test(q)) {
      return `I'm here for quick guidance — for order-specific help, tap <strong>Talk to our team</strong> below to reach a real person via our store chat.`;
    }
    if (/stock|sold out|available|inventory/.test(q)) {
      return `Stock levels update live on each product page. Low-stock teas show a badge — grab them before they're gone. <a href="${this.shopUrl}">View what's in stock →</a>`;
    }
    if (/faq|question/.test(q)) {
      return `Our FAQ covers shipping, brewing, and freshness. <a href="${this.faqUrl}">Read the FAQ →</a>`;
    }

    return `Great question. For premium loose leaf tea, I suggest browsing our <a href="${this.shopUrl}">shop</a>, checking <a href="${this.faqUrl}">FAQ</a>, or asking about brewing, tea types, or shipping. How can I help you steep something wonderful?`;
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

/** GA4 ecommerce helpers for conversion tracking */
(function initLuxeAnalytics() {
  const pushEvent = (name, params = {}) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, params);
    }
  };

  document.addEventListener('cart:updated', () => pushEvent('add_to_cart'));
  document.addEventListener('click', (e) => {
    const checkout = e.target.closest('#checkout, .cart__checkout-button');
    if (checkout) pushEvent('begin_checkout');
  });
})();
