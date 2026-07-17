/**
 * Mobile commerce bar, shipping nudge, and reliable search/checkout actions.
 */
import { StandardEvents } from '@shopify/events';

(function initMobileCommerce() {
  if (window.__luxeMobileCommerceInit) return;
  window.__luxeMobileCommerceInit = true;

  const NUDGE_HEIGHT_FALLBACK = '3.5rem';
  const NUDGE_HEIGHT_SUCCESS_FALLBACK = '3rem';

  let nudgeResizeObserver = null;
  let barResizeObserver = null;

  const syncMobileBarHeight = () => {
    const bar = document.querySelector('[data-mobile-shop-bar]');
    if (!(bar instanceof HTMLElement)) {
      document.documentElement.style.setProperty('--luxe-mobile-bar-height', '0px');
      return;
    }

    const style = window.getComputedStyle(bar);
    if (style.display === 'none' || style.visibility === 'hidden') {
      document.documentElement.style.setProperty('--luxe-mobile-bar-height', '0px');
      return;
    }

    const height = Math.ceil(bar.getBoundingClientRect().height);
    document.documentElement.style.setProperty(
      '--luxe-mobile-bar-height',
      height > 0 ? `${height}px` : '0px'
    );
  };

  const observeMobileBarHeight = () => {
    const bar = document.querySelector('[data-mobile-shop-bar]');
    if (!(bar instanceof HTMLElement)) {
      syncMobileBarHeight();
      return;
    }

    if (barResizeObserver) {
      barResizeObserver.disconnect();
    }

    barResizeObserver = new ResizeObserver(() => {
      syncMobileBarHeight();
    });
    barResizeObserver.observe(bar);
    syncMobileBarHeight();
  };

  const syncNudgeHeight = () => {
    const nudge = document.querySelector('[data-shipping-nudge]');
    if (!(nudge instanceof HTMLElement) || nudge.hidden) {
      document.documentElement.style.setProperty('--luxe-shipping-nudge-height', '0px');
      document.body.classList.remove('luxe-has-shipping-nudge');
      return;
    }

    const height = `${Math.ceil(nudge.getBoundingClientRect().height)}px`;
    document.documentElement.style.setProperty('--luxe-shipping-nudge-height', height);
    document.body.classList.add('luxe-has-shipping-nudge');
  };

  const observeNudgeHeight = () => {
    const nudge = document.querySelector('[data-shipping-nudge]');
    if (!(nudge instanceof HTMLElement)) return;

    if (nudgeResizeObserver) {
      nudgeResizeObserver.disconnect();
    }

    nudgeResizeObserver = new ResizeObserver(() => {
      syncNudgeHeight();
    });
    nudgeResizeObserver.observe(nudge);
    syncNudgeHeight();
  };

  const getShippingConfig = () => {
    const body = document.body;
    const nudge = document.querySelector('[data-shipping-nudge]');
    const threshold = Number(body.dataset.freeShippingThreshold || nudge?.dataset.threshold) || 5000;
    const standardRate = Number(body.dataset.standardShippingRate || nudge?.dataset.standardRate) || 595;
    const thresholdLabel =
      nudge?.dataset.thresholdLabel || body.dataset.freeShippingThresholdLabel || formatMoney(threshold);
    const standardRateLabel =
      nudge?.dataset.standardRateLabel || body.dataset.standardShippingRateLabel || formatMoney(standardRate);

    return { threshold, standardRate, thresholdLabel, standardRateLabel };
  };

  const getCanadaTaxRateBps = () => {
    const canadaTax = window.LuxeLeaf?.CanadaTax;
    // Optional province estimate only — never required for Pay.
    if (canadaTax?.isLocationComplete?.()) {
      return canadaTax.getTaxRateBps();
    }
    return 0;
  };

  const getCanadaTaxLabel = () => {
    const canadaTax = window.LuxeLeaf?.CanadaTax;
    if (canadaTax?.isLocationComplete?.()) {
      return canadaTax.getTaxLabel();
    }
    return 'Tax';
  };

  const hasTaxEstimate = () => Boolean(window.LuxeLeaf?.CanadaTax?.isLocationComplete?.());

  const syncTaxLabels = () => {
    const label = getCanadaTaxLabel();
    document.querySelectorAll('[data-ca-tax-label]').forEach((el) => {
      el.textContent = hasTaxEstimate() ? label : 'Tax';
    });
  };

  const renderTaxValue = (taxAmount) => {
    if (!hasTaxEstimate()) {
      return '<span class="luxe-shipping-totals__at-checkout" data-ca-tax-prompt>Calculated at checkout</span>';
    }
    if (taxAmount > 0) {
      return `${formatMoney(taxAmount)} <span class="luxe-shipping-totals__est">est.</span>`;
    }
    return '<span class="luxe-shipping-totals__at-checkout">Calculated at checkout</span>';
  };

  const formatMoney = (cents) => {
    if (window.Shopify?.formatMoney) {
      return Shopify.formatMoney(cents, window.theme?.moneyFormat || '${{amount}}');
    }
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getShippingEstimate = (merchandiseTotal) => {
    const { threshold, standardRate } = getShippingConfig();
    const subtotal = merchandiseTotal;
    const qualifiesFree = merchandiseTotal >= threshold;
    const shippingCost = qualifiesFree ? 0 : standardRate;
    const taxableBase = subtotal + shippingCost;
    const taxRateBps = getCanadaTaxRateBps();
    const taxAmount = taxRateBps > 0 ? Math.round((taxableBase * taxRateBps) / 10000) : 0;
    const grandTotal = taxableBase + taxAmount;
    const remaining = Math.max(0, threshold - merchandiseTotal);
    const progress = Math.min(100, Math.round((merchandiseTotal * 100) / threshold));

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
      taxReady: hasTaxEstimate(),
    };
  };

  const syncCartConversion = (cart) => {
    const conversion = document.querySelector('[data-cart-conversion]');
    if (!(conversion instanceof HTMLElement) || cart.item_count === 0) return;

    const { qualifiesFree, shippingCost, grandTotal, taxAmount, subtotal, remaining, progress } =
      getShippingEstimate(cart.total_price);
    const { thresholdLabel, standardRateLabel } = getShippingConfig();
    const payTotal = hasTaxEstimate() ? grandTotal : subtotal + shippingCost;

    const progressText = conversion.querySelector('[data-shipping-progress-text]');
    const progressEl = conversion.querySelector('[data-shipping-progress]');
    const progressBar = conversion.querySelector('[data-shipping-progress-bar]');
    const subtotalInline = conversion.querySelector('[data-cart-subtotal-inline]');
    const rateValue = conversion.querySelector('[data-shipping-rate-value]');
    const taxInline = conversion.querySelector('[data-tax-value-inline]');
    const totalInline = conversion.querySelector('[data-estimated-total-inline]');

    if (progressText) {
      progressText.innerHTML = `Add <strong>${formatMoney(remaining)}</strong> for free Canada-wide shipping over ${thresholdLabel}`;
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
      taxInline.innerHTML = renderTaxValue(taxAmount);
    }
    if (totalInline) {
      totalInline.innerHTML = hasTaxEstimate()
        ? `Pay <strong>${formatMoney(payTotal)}</strong> below — includes tax estimate`
        : `Pay <strong>${formatMoney(payTotal)}</strong> below — tax finalized at checkout`;
    }

    document.querySelectorAll('[data-checkout-button-text]').forEach((checkoutText) => {
      checkoutText.textContent = `Pay ${formatMoney(payTotal)} — Guest checkout`;
    });

    const checkoutButton = document.querySelector('.cart__checkout-button[data-checkout-estimated-total]');
    if (checkoutButton instanceof HTMLElement) {
      checkoutButton.dataset.checkoutEstimatedTotal = String(payTotal);
    }

    syncTaxLabels();
    conversion.classList.toggle('luxe-cart-conversion--free-shipping', qualifiesFree);
  };

  const syncShippingTotals = (cart) => {
    const totals = document.querySelector('[data-shipping-totals]');
    if (!(totals instanceof HTMLElement) || cart.item_count === 0) return;

    const { qualifiesFree, shippingCost, grandTotal, taxAmount, subtotal, remaining } = getShippingEstimate(
      cart.total_price
    );
    const { thresholdLabel, standardRateLabel } = getShippingConfig();
    const payTotal = hasTaxEstimate() ? grandTotal : subtotal + shippingCost;

    const subtotalValue = totals.querySelector('[data-cart-subtotal-value]');
    const hint = totals.querySelector('[data-shipping-hint]');
    const shippingValue = totals.querySelector('[data-shipping-cost-value]');
    const taxValue = totals.querySelector('[data-tax-value]');
    const estimatedTotalEl = totals.querySelector('[data-estimated-total-value]');
    const checkoutButtons = document.querySelectorAll('[data-checkout-button-text]');

    if (subtotalValue) {
      subtotalValue.textContent = formatMoney(subtotal);
    }

    if (shippingValue) {
      shippingValue.innerHTML = qualifiesFree
        ? '<span class="luxe-shipping-totals__free">Free</span>'
        : standardRateLabel;
    }
    if (taxValue) {
      taxValue.innerHTML = renderTaxValue(taxAmount);
    }
    if (hint) {
      hint.classList.toggle('luxe-shipping-totals__hint--success', qualifiesFree);
      hint.innerHTML = qualifiesFree
        ? 'Free Canada-wide shipping unlocked on this order'
        : `Add <strong>${formatMoney(remaining)}</strong> for free Canada-wide shipping over ${thresholdLabel}`;
    }
    if (estimatedTotalEl) {
      estimatedTotalEl.textContent = formatMoney(payTotal);
    }
    checkoutButtons.forEach((checkoutText) => {
      checkoutText.textContent = `Pay ${formatMoney(payTotal)} — Guest checkout`;
    });
    const checkoutButton = document.querySelector('.cart__checkout-button[data-checkout-estimated-total]');
    if (checkoutButton instanceof HTMLElement) {
      checkoutButton.dataset.checkoutEstimatedTotal = String(payTotal);
    }
    syncTaxLabels();
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
      document.body.classList.remove('luxe-has-shipping-nudge');
      return;
    }

    const { qualifiesFree, shippingCost, grandTotal, subtotal, remaining, progress } = getShippingEstimate(
      cart.total_price
    );
    const { thresholdLabel, standardRateLabel } = getShippingConfig();
    const payTotal = hasTaxEstimate() ? grandTotal : subtotal + shippingCost;

    const textEl = nudge.querySelector('[data-shipping-nudge-text]');
    const rateEl = nudge.querySelector('[data-shipping-nudge-rate]');
    const barEl = nudge.querySelector('[data-shipping-nudge-bar]');
    const progressEl = nudge.querySelector('[data-shipping-nudge-progress]');

    nudge.classList.toggle('luxe-shipping-nudge--success', qualifiesFree);

    if (textEl) {
      textEl.innerHTML = qualifiesFree
        ? '<strong>Free Canada-wide shipping unlocked!</strong> Secure your tea before you go.'
        : `Add <strong>${formatMoney(remaining)}</strong> for free Canada-wide shipping over ${thresholdLabel}`;
    }
    if (rateEl) {
      rateEl.textContent = qualifiesFree
        ? `Pay ${formatMoney(payTotal)} · Guest checkout in seconds`
        : `Canada-wide shipping ${standardRateLabel} · Pay ${formatMoney(payTotal)}`;
    }
    if (barEl instanceof HTMLElement) {
      barEl.style.width = `${qualifiesFree ? 100 : progress}%`;
    }
    if (progressEl instanceof HTMLElement) {
      progressEl.setAttribute('aria-valuenow', String(qualifiesFree ? 100 : progress));
    }

    nudge.hidden = false;
    document.documentElement.style.setProperty(
      '--luxe-shipping-nudge-height',
      qualifiesFree ? NUDGE_HEIGHT_SUCCESS_FALLBACK : NUDGE_HEIGHT_FALLBACK
    );
    requestAnimationFrame(() => {
      observeNudgeHeight();
      syncNudgeHeight();
    });
  };

  /** Drop stale syncs when quantity changes fire back-to-back. */
  let syncBarGeneration = 0;

  /**
   * Refresh shipping nudge / drawer totals / mobile bar from the live cart.
   * Cart line events are dispatched before /cart/change.js finishes, so we
   * must await event.promise before reading /cart.js — otherwise "Add $X for
   * free shipping" stays on the previous amount until a full page refresh.
   * @param {Event & { promise?: Promise<unknown> }} [event]
   */
  const syncBar = async (event) => {
    const generation = ++syncBarGeneration;
    const bar = document.querySelector('[data-mobile-shop-bar]');

    try {
      if (event?.promise) {
        try {
          await event.promise;
        } catch {
          /* mutation failed — still re-read cart so UI matches server */
        }
      }

      if (generation !== syncBarGeneration) return;

      const res = await fetch('/cart.js', {
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok || generation !== syncBarGeneration) return;
      const cart = await res.json();
      if (generation !== syncBarGeneration) return;

      syncShippingNudge(cart);
      syncCartConversion(cart);
      syncShippingTotals(cart);

      if (bar) {
        const checkoutButton = bar.querySelector('[data-mobile-checkout]');
        const cartBtn = bar.querySelector('[data-mobile-cart-toggle]');
        const countEl = bar.querySelector('[data-mobile-cart-count]');
        const cartLabel = bar.querySelector('[data-mobile-cart-label]');

        if (cart.item_count > 0) {
          bar.classList.add('luxe-mobile-bar--has-cart');
        } else {
          bar.classList.remove('luxe-mobile-bar--has-cart');
        }

        if (checkoutButton instanceof HTMLButtonElement) {
          checkoutButton.hidden = cart.item_count === 0;
          checkoutButton.textContent = 'Checkout';
          checkoutButton.setAttribute('aria-label', 'Go to secure checkout');
        }

        if (cartBtn instanceof HTMLElement) {
          cartBtn.hidden = false;
          cartBtn.setAttribute(
            'aria-label',
            cart.item_count > 0
              ? `View bag — ${cart.item_count} ${cart.item_count === 1 ? 'item' : 'items'}`
              : 'View bag'
          );
        }

        if (cartLabel instanceof HTMLElement) {
          cartLabel.textContent = cart.item_count > 0 ? `Bag (${cart.item_count})` : 'Bag';
        }

        if (countEl instanceof HTMLElement) {
          countEl.textContent = String(cart.item_count);
          countEl.hidden = cart.item_count === 0;
        }
      }
    } catch {
      /* cart fetch failed — keep server-rendered state */
    }
  };

  function isBagTrigger(element) {
    return Boolean(
      element.closest(
        '[data-luxe-open-cart],[data-shipping-nudge-cart],[data-mobile-cart-toggle],[data-testid="cart-drawer-trigger"],[aria-controls="cart-drawer"]'
      )
    );
  }

  function goToCheckout(event) {
    if (event?.target instanceof Element && isBagTrigger(event.target)) return;

    if (event) {
      event.preventDefault();
    }

    window.location.assign('/checkout');
  }

  function bindCheckoutActions() {
    document.addEventListener(
      'click',
      (event) => {
        if (!(event.target instanceof Element)) return;
        if (isBagTrigger(event.target)) return;

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

  function getMainPdpAddToCartButton() {
    return (
      document.querySelector('product-form-component [ref="addToCartButton"]') ||
      document.querySelector('.buy-buttons-block [ref="addToCartButton"]') ||
      document.querySelector('.buy-buttons-block button[name="add"]') ||
      document.querySelector('sticky-add-to-cart [ref="addToCartButton"]')
    );
  }

  function syncPdpBuyBarAtc() {
    const bar = document.querySelector('[data-pdp-buy-bar]');
    const atcBtn = bar?.querySelector('[data-mobile-pdp-atc]');
    if (!(atcBtn instanceof HTMLButtonElement)) return;

    const mainBtn = getMainPdpAddToCartButton();
    const longLabel = atcBtn.querySelector('[data-mobile-pdp-atc-label]');
    const shortLabel = atcBtn.querySelector('[data-mobile-pdp-atc-short]');

    if (!(mainBtn instanceof HTMLButtonElement)) {
      atcBtn.disabled = false;
      if (longLabel) longLabel.textContent = 'Add to Bag';
      if (shortLabel) shortLabel.textContent = 'Add';
      return;
    }

    const unavailable = mainBtn.disabled || mainBtn.getAttribute('aria-disabled') === 'true';
    atcBtn.disabled = unavailable;

    if (unavailable) {
      if (longLabel) longLabel.textContent = 'Sold out';
      if (shortLabel) shortLabel.textContent = 'Out';
      atcBtn.setAttribute('aria-label', 'Sold out');
    } else if (atcBtn.dataset.added === 'true') {
      if (longLabel) longLabel.textContent = 'Added';
      if (shortLabel) shortLabel.textContent = 'Added';
    } else {
      if (longLabel) longLabel.textContent = 'Add to Bag';
      if (shortLabel) shortLabel.textContent = 'Add';
      const productTitle = document.querySelector('h1')?.textContent?.trim();
      atcBtn.setAttribute(
        'aria-label',
        productTitle ? `Add ${productTitle} to bag` : 'Add to bag'
      );
    }
  }

  function bindPdpBuyBar() {
    if (!document.querySelector('[data-pdp-buy-bar]')) return;

    document.addEventListener(
      'click',
      (event) => {
        const atcBtn = event.target instanceof Element ? event.target.closest('[data-mobile-pdp-atc]') : null;
        if (!(atcBtn instanceof HTMLButtonElement) || atcBtn.disabled) return;

        event.preventDefault();
        event.stopPropagation();

        const mainBtn = getMainPdpAddToCartButton();
        if (!(mainBtn instanceof HTMLButtonElement) || mainBtn.disabled) {
          syncPdpBuyBarAtc();
          return;
        }

        mainBtn.dataset.puppet = 'true';
        mainBtn.click();

        atcBtn.dataset.added = 'true';
        syncPdpBuyBarAtc();
        window.setTimeout(() => {
          atcBtn.removeAttribute('data-added');
          syncPdpBuyBarAtc();
        }, 1200);
      },
      true
    );

    document.addEventListener(StandardEvents.cartLinesUpdate, () => {
      window.setTimeout(syncPdpBuyBarAtc, 50);
    });
    document.addEventListener(StandardEvents.productSelect, () => {
      window.setTimeout(syncPdpBuyBarAtc, 50);
    });

    syncPdpBuyBarAtc();
    window.setTimeout(syncPdpBuyBarAtc, 300);
    window.setTimeout(syncPdpBuyBarAtc, 1000);
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

  async function refreshCartPricing() {
    try {
      const res = await fetch('/cart.js', { headers: { Accept: 'application/json' } });
      if (!res.ok) return;
      const cart = await res.json();
      syncCartConversion(cart);
      syncShippingTotals(cart);
      syncShippingNudge(cart);

      const bar = document.querySelector('[data-mobile-shop-bar]');
      if (bar && cart.item_count > 0) {
        const checkoutButton = bar.querySelector('[data-mobile-checkout]');
        if (checkoutButton instanceof HTMLButtonElement) {
          checkoutButton.textContent = 'Checkout';
          checkoutButton.setAttribute('aria-label', 'Go to secure checkout');
        }
      }
    } catch {
      /* keep server-rendered state */
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    syncBar();
    syncDrawerChrome();
    bindMobileMenuToggle();
    bindCheckoutActions();
    bindPdpBuyBar();
    bindSearchActions();
    bindShippingNudgeActions();
    observeMobileBarHeight();
    observeNudgeHeight();
    refreshCartPricing();
  });
  // Keep --luxe-mobile-bar-height / --luxe-shipping-nudge-height accurate so
  // Contact sticky Call·Email·Chat sits flush above Menu·Shop·Bag.
  window.addEventListener(
    'resize',
    () => {
      syncMobileBarHeight();
      syncNudgeHeight();
    },
    { passive: true }
  );
  window.addEventListener('pageshow', () => {
    observeMobileBarHeight();
    observeNudgeHeight();
    syncMobileBarHeight();
    syncNudgeHeight();
  });
  document.addEventListener('luxe:ca-location-change', refreshCartPricing);
  document.addEventListener(StandardEvents.cartLinesUpdate, syncBar);
  document.addEventListener('theme-drawer:open', (event) => {
    if (/** @type {Element} */ (event.target).id === 'cart-drawer') syncDrawerChrome();
  });
  document.addEventListener('theme-drawer:close', (event) => {
    if (/** @type {Element} */ (event.target).id === 'cart-drawer') syncDrawerChrome();
  });
})();
