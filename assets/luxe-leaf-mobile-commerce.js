/**
 * Mobile commerce bar — syncs checkout total after cart changes.
 */
import { StandardEvents } from '@shopify/events';

(function initMobileCommerce() {
  const formatMoney = (cents) => {
    if (window.Shopify?.formatMoney) {
      return Shopify.formatMoney(cents, window.theme?.moneyFormat || '${{amount}}');
    }
    return `$${(cents / 100).toFixed(2)}`;
  };

  const syncBar = async () => {
    const bar = document.querySelector('[data-mobile-shop-bar]');
    if (!bar) return;

    try {
      const res = await fetch('/cart.js', { headers: { Accept: 'application/json' } });
      if (!res.ok) return;
      const cart = await res.json();

      const checkoutLink = bar.querySelector('[data-mobile-checkout]');
      const cartBtn = bar.querySelector('[data-mobile-cart-toggle]');
      const countEl = bar.querySelector('[data-mobile-cart-count]');

      if (cart.item_count > 0) {
        bar.classList.add('luxe-mobile-bar--has-cart');
        if (checkoutLink) {
          checkoutLink.hidden = false;
          checkoutLink.textContent = `Checkout · ${formatMoney(cart.total_price)}`;
        }
        if (cartBtn) cartBtn.hidden = true;
      } else {
        bar.classList.remove('luxe-mobile-bar--has-cart');
        if (checkoutLink) checkoutLink.hidden = true;
        if (cartBtn) cartBtn.hidden = false;
      }

      if (countEl) {
        countEl.textContent = cart.item_count;
        countEl.hidden = cart.item_count === 0;
      }
    } catch {
      /* cart fetch failed — keep server-rendered state */
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    syncBar();
    bindMobileMenuToggle();
    bindCheckoutFallback();
  });
  document.addEventListener(StandardEvents.cartLinesUpdate, syncBar);

  function bindCheckoutFallback() {
    document.addEventListener('click', (event) => {
      const button = event.target.closest('.cart__checkout-button[name="checkout"]');
      if (!button || button.disabled) return;
      if (button.form) return;

      const formId = button.getAttribute('form');
      if (!formId) return;

      const form = document.getElementById(formId);
      if (!form) return;

      event.preventDefault();

      if (typeof form.requestSubmit === 'function') {
        form.requestSubmit(button);
        return;
      }

      const checkoutField = document.createElement('input');
      checkoutField.type = 'hidden';
      checkoutField.name = 'checkout';
      form.appendChild(checkoutField);
      form.submit();
    });
  }

  function bindMobileMenuToggle() {
    const menuBtn = document.querySelector('[data-mobile-menu-toggle]');
    const panel = document.getElementById('LuxeBrandMenuPanel');
    if (!menuBtn || !panel) return;

    const syncExpanded = () => {
      menuBtn.setAttribute('aria-expanded', panel.hidden ? 'false' : 'true');
    };

    const observer = new MutationObserver(syncExpanded);
    observer.observe(panel, { attributes: true, attributeFilter: ['hidden'] });
    syncExpanded();
  }
})();
