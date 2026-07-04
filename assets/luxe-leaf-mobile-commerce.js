/**
 * Mobile commerce bar, shipping nudge, and reliable search/checkout actions.
 */
import { StandardEvents } from '@shopify/events';

(function initMobileCommerce() {
  if (window.__luxeMobileCommerceInit) return;
  window.__luxeMobileCommerceInit = true;

  const NUDGE_HEIGHT = '4.5rem';
  const NUDGE_HEIGHT_SUCCESS = '3.75rem';

  const getShippingConfig = () => {
    const body = document.body;
    const nudge = document.querySelector('[data-shipping-nudge]');
    const totals = document.querySelector('[data-shipping-totals]');
    const conversion = document.querySelector('[data-cart-conversion]');
    const threshold = Number(body.dataset.freeShippingThreshold || nudge?.dataset.threshold) || 5000;
    const standardRate = Number(body.dataset.standardShippingRate || nudge?.dataset.standardRate) || 595;
    const taxRateBps =
      Number(
        body.dataset.estimatedTaxRateBps ||
          nudge?.dataset.taxRateBps ||
          totals?.dataset.taxRateBps ||
          conversion?.dataset.taxRateBps
      ) || 0;
    const thresholdLabel =
      nudge?.dataset.thresholdLabel || body.dataset.freeShippingThresholdLabel || formatMoney(threshold);
    const standardRateLabel =
      nudge?.dataset.standardRateLabel || body.dataset.standardShippingRateLabel || formatMoney(standardRate);

    return { threshold, standardRate, taxRateBps, thresholdLabel, standardRateLabel };
  };

  const formatMoney = (cents) => {
    if (window.Shopify?.formatMoney) {
      return Shopify.formatMoney(cents, window.theme?.moneyFormat || '${{amount}}');
    }
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getShippingEstimate = (cartTotal, itemsSubtotal = null) => {
    const { threshold, standardRate, taxRateBps } = getShippingConfig();
    const subtotal = itemsSubtotal ?? cartTotal;
    const qualifiesFree = cartTotal >= threshold;
    const shippingCost = qualifiesFree ? 0 : standardRate;
    const taxableBase = subtotal + shippingCost;
    const taxAmount = taxRateBps > 0 ? Math.round((taxableBase * taxRateBps) / 10000) : 0;
    const grandTotal = taxableBase + taxAmount;
    const remaining = Math.max(0, threshold - cartTotal);
    const progress = Math.min(100, Math.round((cartTotal * 100) / threshold));

    return {
      qualifiesFree,
      shippingCost,
      taxAmount,
      subtotal,
      grandTotal,
      estimatedTotal: grandTotal,
      remaining,
      progress,
      threshold,
      standardRate,
    };
  };

  const syncCartConversion = (cart) => {
    const conversion = document.querySelector('[data-cart-conversion]');
    if (!(conversion instanceof HTMLElement) || cart.item_count === 0) return;

    const { qualifiesFree, shippingCost, grandTotal, taxAmount, subtotal, remaining, progress } = getShippingEstimate(
      cart.total_price,
      cart.items_subtotal_price
    );
    const { thresholdLabel, standardRateLabel } = getShippingConfig();

    const progressText = conversion.querySelector('[data-shipping-progress-text]');
    const progressEl = conversion.querySelector('[data-shipping-progress]');
    const progressBar = conversion.querySelector('[data-shipping-progress-bar]');
    const subtotalInline = conversion.querySelector('[data-cart-subtotal-inline]');
    const rateValue = conversion.querySelector('[data-shipping-rate-value]');
    const taxInline = conversion.querySelector('[data-tax-value-inline]');
    const totalInline = conversion.querySelector('[data-estimated-total-inline]');

    if (progressText) {
      progressText.innerHTML = `Add <strong>${formatMoney(remaining)}</strong> for free shipping over ${thresholdLabel}`;
      progressText.hidden = qualifiesFree;
    }
    if (progressEl instanceof HTMLElement) {
      progressEl.hidden = qualifiesFree;
      progressEl.setAttribute('aria-valuenow', String(progress));
    }
    if (progressBar instanceof HTMLElement) {
      progressBar.style.width = `${progress}%`;
    }

    if (subtotalInline) {
      subtotalInline.textContent = formatMoney(subtotal);
    }
    if (rateValue) {
      rateValue.innerHTML = qualifiesFree ? '<strong>Free</strong>' : `<strong>${standardRateLabel}</strong>`;
    }
    if (taxInline) {
      taxInline.innerHTML =
        taxAmount > 0 ? `<strong>${formatMoney(taxAmount)}</strong>` : 'At checkout';
    }
    if (totalInline) {
      totalInline.innerHTML = `Total <strong>${formatMoney(grandTotal)}</strong> — tap Pay below`;
    }

    conversion.classList.toggle('luxe-cart-conversion--free-shipping', qualifiesFree);
  };

  const syncShippingTotals = (cart) => {
    const totals = document.querySelector('[data-shipping-totals]');
    if (!(totals instanceof HTMLElement) || cart.item_count === 0) return;

    const { qualifiesFree, grandTotal, taxAmount, subtotal, remaining } = getShippingEstimate(
      cart.total_price,
      cart.items_subtotal_price
    );
    const { thresholdLabel, standardRateLabel } = getShippingConfig();

    const subtotalValue = totals.querySelector('[data-cart-subtotal-value]');
    const hint = totals.querySelector('[data-shipping-hint]');
    const shippingValue = totals.querySelector('[data-shipping-cost-value]');
    const taxValue = totals.querySelector('[data-tax-value]');
    const estimatedTotalEl = totals.querySelector('[data-estimated-total-value]');
    const checkoutText = document.querySelector('[data-checkout-button-text]');

    if (subtotalValue) {
      subtotalValue.textContent = formatMoney(subtotal);
    }

    if (shippingValue) {
      shippingValue.innerHTML = qualifiesFree
        ? '<span class="luxe-shipping-totals__free">Free</span>'
        : standardRateLabel;
    }
    if (taxValue) {
      taxValue.innerHTML =
        taxAmount > 0
          ? `${formatMoney(taxAmount)} <span class="luxe-shipping-totals__est">est.</span>`
          : '<span class="luxe-shipping-totals__at-checkout">At checkout</span>';
    }
    if (hint) {
      hint.classList.toggle('luxe-shipping-totals__hint--success', qualifiesFree);
      hint.innerHTML = qualifiesFree
        ? 'Free shipping unlocked on this order'
        : `Add <strong>${formatMoney(remaining)}</strong> for free shipping over ${thresholdLabel}`;
    }
    if (estimatedTotalEl) {
      estimatedTotalEl.textContent = formatMoney(grandTotal);
    }
    if (checkoutText) {
      checkoutText.textContent = `Pay ${formatMoney(grandTotal)} — Guest checkout`;
    }
  };

  /**
   * @param {object} cart
   */
  const syncShippingNudge = (cart) => {
    const nudge = document.querySelector('[data-shipping-nudge]');
    if (!(nudge instanceof HTMLElement)) return;

    if (cart.item_count === 0) {
      nudge.hidden = true;
      document.documentElement.style.setProperty('--luxe-shipping-nudge-height', '0px');
      return;
    }

    const { qualifiesFree, estimatedTotal, remaining, progress } = getShippingEstimate(
      cart.total_price,
      cart.items_subtotal_price
    );
    const { thresholdLabel, standardRateLabel } = getShippingConfig();

    const textEl = nudge.querySelector('[data-shipping-nudge-text]');
    const rateEl = nudge.querySelector('[data-shipping-nudge-rate]');
    const barEl = nudge.querySelector('[data-shipping-nudge-bar]');
    const progressEl = nudge.querySelector('[data-shipping-nudge-progress]');
    const exploreBtn = nudge.querySelector('[data-shipping-nudge-explore]');
    const cartBtn = nudge.querySelector('[data-shipping-nudge-cart]');
    const checkoutBtn = nudge.querySelector('[data-shipping-nudge-checkout]');

    nudge.classList.toggle('luxe-shipping-nudge--success', qualifiesFree);

    if (textEl) {
      textEl.innerHTML = qualifiesFree
        ? '<strong>Free shipping unlocked!</strong> Secure your tea before you go.'
        : `Add <strong>${formatMoney(remaining)}</strong> for free shipping over ${thresholdLabel}`;
    }
    if (rateEl) {
      rateEl.textContent = qualifiesFree
        ? `Pay ${formatMoney(estimatedTotal)} total · Checkout in seconds`
        : `Standard shipping ${standardRateLabel} · Pay ${formatMoney(estimatedTotal)} total`;
    }
    if (barEl instanceof HTMLElement) {
      barEl.style.width = `${qualifiesFree ? 100 : progress}%`;
    }
    if (progressEl instanceof HTMLElement) {
      progressEl.setAttribute('aria-valuenow', String(qualifiesFree ? 100 : progress));
    }

    if (exploreBtn instanceof HTMLElement) {
      exploreBtn.hidden = qualifiesFree;
    }
    if (cartBtn instanceof HTMLElement) {
      cartBtn.hidden = false;
    }
    if (checkoutBtn instanceof HTMLElement) {
      checkoutBtn.hidden = false;
      checkoutBtn.textContent = `Pay · ${formatMoney(estimatedTotal)}`;
    }

    nudge.hidden = false;
    document.documentElement.style.setProperty(
      '--luxe-shipping-nudge-height',
      qualifiesFree ? NUDGE_HEIGHT_SUCCESS : NUDGE_HEIGHT
    );
  };

  const syncBar = async () => {
    const bar = document.querySelector('[data-mobile-shop-bar]');

    try {
      const res = await fetch('/cart.js', { headers: { Accept: 'application/json' } });
      if (!res.ok) return;
      const cart = await res.json();
      const { estimatedTotal } = getShippingEstimate(cart.total_price);

      if (bar) {
        const checkoutButton = bar.querySelector('[data-mobile-checkout]');
        const cartBtn = bar.querySelector('[data-mobile-cart-toggle]');
        const countEl = bar.querySelector('[data-mobile-cart-count]');

        if (cart.item_count > 0) {
          bar.classList.add('luxe-mobile-bar--has-cart');
          if (checkoutButton) {
            checkoutButton.hidden = false;
            checkoutButton.textContent = `Pay · ${formatMoney(estimatedTotal)}`;
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
      syncCartConversion(cart);
      syncShippingTotals(cart);
    } catch {
      /* cart fetch failed — keep server-rendered state */
    }
  };

  function goToCheckout(event) {
    if (event) {
      event.preventDefault();
    }

    window.location.assign('/checkout');
  }

  function bindCheckoutActions() {
    document.addEventListener(
      'click',
      (event) => {
        const button = event.target.closest('[data-shipping-nudge-checkout], [data-mobile-checkout]');
        if (!(button instanceof HTMLButtonElement) || button.disabled || button.hidden) return;

        goToCheckout(event);
      },
      true
    );

    document.addEventListener(
      'click',
      (event) => {
        const button = event.target.closest('.cart__checkout-button[name="checkout"]');
        if (!(button instanceof HTMLButtonElement) || button.disabled) return;

        const associatedForm =
          button.form ||
          (button.getAttribute('form') ? document.getElementById(button.getAttribute('form')) : null);

        if (!(associatedForm instanceof HTMLFormElement)) {
          goToCheckout(event);
        }
      },
      true
    );
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

  function syncDrawerChrome() {
    const cartDrawer = document.getElementById('cart-drawer');
    const nudge = document.querySelector('[data-shipping-nudge]');
    const bar = document.querySelector('[data-mobile-shop-bar]');
    const drawerOpen = cartDrawer?.hasAttribute('open') === true;

    document.documentElement.classList.toggle('luxe-cart-drawer-open', drawerOpen);

    if (nudge instanceof HTMLElement) {
      nudge.toggleAttribute('data-drawer-open', drawerOpen);
    }
    if (bar instanceof HTMLElement) {
      bar.toggleAttribute('data-drawer-open', drawerOpen);
    }
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
    syncDrawerChrome();
    bindMobileMenuToggle();
    bindCheckoutActions();
    bindSearchActions();
    bindShippingNudgeActions();
  });
  document.addEventListener(StandardEvents.cartLinesUpdate, syncBar);
  document.addEventListener('theme-drawer:open', (event) => {
    if (/** @type {Element} */ (event.target).id === 'cart-drawer') syncDrawerChrome();
  });
  document.addEventListener('theme-drawer:close', (event) => {
    if (/** @type {Element} */ (event.target).id === 'cart-drawer') syncDrawerChrome();
  });
})();
