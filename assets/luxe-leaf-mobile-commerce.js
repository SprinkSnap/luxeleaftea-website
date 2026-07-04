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
  });
  document.addEventListener(StandardEvents.cartLinesUpdate, syncBar);

  function bindMobileMenuToggle() {
    const menuBtn = document.querySelector('[data-mobile-menu-toggle]');
    const drawerDetails = document.getElementById('Details-menu-drawer-container');
    if (!menuBtn || !drawerDetails) return;

    const syncExpanded = () => {
      menuBtn.setAttribute('aria-expanded', drawerDetails.hasAttribute('open') ? 'true' : 'false');
    };

    drawerDetails.addEventListener('toggle', syncExpanded);
    syncExpanded();
  }
})();
