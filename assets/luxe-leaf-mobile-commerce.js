/**
 * Mobile commerce bar, shipping nudge, and reliable search/checkout actions.
 */
import { StandardEvents } from '@shopify/events';

(function initMobileCommerce() {
  if (window.__luxeMobileCommerceInit) return;
  window.__luxeMobileCommerceInit = true;

  const NUDGE_HEIGHT = '3.25rem';

  const formatMoney = (cents) => {
    if (window.Shopify?.formatMoney) {
      return Shopify.formatMoney(cents, window.theme?.moneyFormat || '${{amount}}');
    }
    return `$${(cents / 100).toFixed(2)}`;
  };

  /**
   * @param {object} cart
   */
  const syncShippingNudge = (cart) => {
    const nudge = document.querySelector('[data-shipping-nudge]');
    if (!(nudge instanceof HTMLElement)) return;

    const threshold = Number(nudge.dataset.threshold) || 5000;
    const thresholdLabel = nudge.dataset.thresholdLabel || formatMoney(threshold);
    const textEl = nudge.querySelector('[data-shipping-nudge-text]');
    const barEl = nudge.querySelector('[data-shipping-nudge-bar]');
    const progressEl = nudge.querySelector('[data-shipping-nudge-progress]');

    const showNudge = cart.item_count > 0 && cart.total_price < threshold;

    if (!showNudge) {
      nudge.hidden = true;
      document.documentElement.style.setProperty('--luxe-shipping-nudge-height', '0px');
      return;
    }

    const remaining = threshold - cart.total_price;
    const progress = Math.min(100, Math.round((cart.total_price * 100) / threshold));

    if (textEl) {
      textEl.innerHTML = `Add <strong>${formatMoney(remaining)}</strong> for free shipping over ${thresholdLabel}`;
    }
    if (barEl instanceof HTMLElement) {
      barEl.style.width = `${progress}%`;
    }
    if (progressEl instanceof HTMLElement) {
      progressEl.setAttribute('aria-valuenow', String(progress));
    }

    nudge.hidden = false;
    document.documentElement.style.setProperty('--luxe-shipping-nudge-height', NUDGE_HEIGHT);
  };

  const syncBar = async () => {
    const bar = document.querySelector('[data-mobile-shop-bar]');

    try {
      const res = await fetch('/cart.js', { headers: { Accept: 'application/json' } });
      if (!res.ok) return;
      const cart = await res.json();

      if (bar) {
        const checkoutButton = bar.querySelector('[data-mobile-checkout]');
        const cartBtn = bar.querySelector('[data-mobile-cart-toggle]');
        const countEl = bar.querySelector('[data-mobile-cart-count]');

        if (cart.item_count > 0) {
          bar.classList.add('luxe-mobile-bar--has-cart');
          if (checkoutButton) {
            checkoutButton.hidden = false;
            checkoutButton.textContent = `Checkout · ${formatMoney(cart.total_price)}`;
          }
          if (cartBtn) cartBtn.hidden = true;
        } else {
          bar.classList.remove('luxe-mobile-bar--has-cart');
          if (checkoutButton) checkoutButton.hidden = true;
          if (cartBtn) cartBtn.hidden = false;
        }

        if (countEl) {
          countEl.textContent = cart.item_count;
          countEl.hidden = cart.item_count === 0;
        }
      }

      syncShippingNudge(cart);
    } catch {
      /* cart fetch failed — keep server-rendered state */
    }
  };

  function submitCartCheckout(form) {
    if (!form) return false;

    let checkoutInput = form.querySelector('input[name="checkout"]');
    if (!checkoutInput) {
      checkoutInput = document.createElement('input');
      checkoutInput.type = 'hidden';
      checkoutInput.name = 'checkout';
      checkoutInput.value = '';
      form.appendChild(checkoutInput);
    }

    form.method = 'post';
    form.action = form.action || window.Theme?.routes?.cart_url || '/cart';
    form.submit();
    return true;
  }

  function bindCheckoutActions() {
    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-mobile-checkout], .cart__checkout-button[name="checkout"]');
      if (!button || button.disabled || button.hidden) return;

      const form =
        button.form ||
        (button.getAttribute('form') ? document.getElementById(button.getAttribute('form')) : null) ||
        button.closest('form');

      event.preventDefault();

      if (submitCartCheckout(form)) return;

      window.location.href = '/checkout';
    });
  }

  function bindSearchActions() {
    document.addEventListener(
      'click',
      (event) => {
        const button = event.target.closest('.search-action button');
        if (!button) return;

        const modal = document.getElementById('search-modal');
        if (!modal) return;

        const openSearch = () => {
          if (typeof modal.showDialog === 'function') {
            modal.showDialog();
            return;
          }

          customElements.whenDefined('dialog-component').then(() => {
            customElements.upgrade(modal);
            modal.showDialog?.();
          });
        };

        openSearch();
      },
      true
    );
  }

  function bindShippingNudgeActions() {
    document.addEventListener('click', (event) => {
      const exploreBtn = event.target.closest('[data-shipping-nudge-explore]');
      if (!exploreBtn) return;

      const target =
        document.querySelector('[data-keep-exploring]') ||
        document.getElementById('shop-by-type') ||
        document.getElementById('featured-teas');

      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      const nudge = document.querySelector('[data-shipping-nudge]');
      const shopUrl = nudge instanceof HTMLElement ? nudge.dataset.shopUrl : null;
      if (shopUrl) {
        window.location.href = shopUrl;
      }
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

  document.addEventListener('DOMContentLoaded', () => {
    syncBar();
    bindMobileMenuToggle();
    bindCheckoutActions();
    bindSearchActions();
    bindShippingNudgeActions();
  });
  document.addEventListener(StandardEvents.cartLinesUpdate, syncBar);
})();
