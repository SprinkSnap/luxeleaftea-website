/**
 * Live-updates the PDP cart-aware free-shipping callout when variant or cart changes.
 */
import { StandardEvents } from '@shopify/events';

(function initPdpFreeShip() {
  if (window.__luxePdpFreeShipInit) return;
  window.__luxePdpFreeShipInit = true;

  const formatMoney = (cents) => {
    if (window.Shopify?.formatMoney) {
      return Shopify.formatMoney(cents, window.theme?.moneyFormat || '${{amount}}');
    }
    return `$${(Number(cents) / 100).toFixed(2)}`;
  };

  const getNodes = () => document.querySelectorAll('[data-pdp-free-ship]');

  const readCartTotal = (fallback) => {
    const fromDom = document.querySelector('[data-pdp-free-ship]')?.dataset.cartTotal;
    const parsed = Number(fromDom);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const buildMessage = (threshold, cartTotal, variantPrice, thresholdLabel) => {
    const remaining = Math.max(0, threshold - cartTotal);
    const afterRemaining = Math.max(0, threshold - (cartTotal + variantPrice));

    if (cartTotal >= threshold) {
      return { state: 'unlocked', text: "You've unlocked free Canada-wide shipping" };
    }
    if (remaining > 0 && variantPrice >= remaining) {
      return { state: 'unlocks', text: 'This tea unlocks free Canada-wide shipping' };
    }
    if (remaining > 0 && afterRemaining > 0) {
      return {
        state: 'closer',
        text: `After this, ${formatMoney(afterRemaining)} to free Canada-wide shipping`,
      };
    }
    if (remaining > 0) {
      return { state: 'unlocks', text: 'This tea unlocks free Canada-wide shipping' };
    }
    return {
      state: 'threshold',
      text: `Free Canada-wide shipping over ${thresholdLabel || formatMoney(threshold)}`,
    };
  };

  const applyMessage = (el, threshold, cartTotal, variantPrice) => {
    const textEl = el.querySelector('[data-pdp-free-ship-text]');
    if (!textEl) return;

    const thresholdLabel = el.dataset.thresholdLabel || '';
    const { state, text } = buildMessage(threshold, cartTotal, variantPrice, thresholdLabel);

    textEl.textContent = text;
    el.dataset.cartTotal = String(cartTotal);
    el.dataset.variantPrice = String(variantPrice);
    el.classList.remove(
      'luxe-pdp-buy-signals__ship--threshold',
      'luxe-pdp-buy-signals__ship--unlocks',
      'luxe-pdp-buy-signals__ship--unlocked',
      'luxe-pdp-buy-signals__ship--closer'
    );
    el.classList.add(`luxe-pdp-buy-signals__ship--${state}`);
  };

  const refreshAll = ({ cartTotal, variantPrice } = {}) => {
    getNodes().forEach((el) => {
      const threshold = Number(el.dataset.threshold) || 5000;
      const nextCart = cartTotal != null ? cartTotal : Number(el.dataset.cartTotal) || 0;
      const nextPrice =
        variantPrice != null ? variantPrice : Number(el.dataset.variantPrice) || 0;
      applyMessage(el, threshold, nextCart, nextPrice);
    });
  };

  document.addEventListener(StandardEvents.productSelect, (event) => {
    const target = event.target;
    if (!(target instanceof Element) || target.closest('product-card')) return;

    event.promise
      ?.then(({ resource: variant }) => {
        const price = Number(variant?.price ?? variant?.price?.amount);
        // Shopify variant.price is usually cents number in theme events; guard both.
        const cents =
          Number.isFinite(price) && price < 1000000
            ? price
            : Math.round(Number(variant?.price) || 0);
        if (!Number.isFinite(cents)) return;
        refreshAll({ variantPrice: cents });
      })
      .catch((error) => {
        if (error?.name !== 'AbortError') {
          console.warn('[pdp-free-ship] productSelect rejected:', error);
        }
      });
  });

  const refreshFromCartJs = async () => {
    try {
      const res = await fetch('/cart.js', {
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) return;
      const json = await res.json();
      if (Number.isFinite(json?.total_price)) {
        refreshAll({ cartTotal: json.total_price });
      }
    } catch {
      /* keep last known cart total */
    }
  };

  document.addEventListener(StandardEvents.cartLinesUpdate, (event) => {
    const sync = () => refreshFromCartJs();
    if (event.promise instanceof Promise) {
      event.promise.finally(sync);
    } else {
      sync();
    }
  });

  // Initial sync in case HTML was cached ahead of cart
  refreshAll({ cartTotal: readCartTotal(0) });
})();
