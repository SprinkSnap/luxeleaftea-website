/**
 * Self-contained cart quantity and remove controls for Luxe Leaf.
 * Calls /cart/change.js directly and refreshes cart sections — does not rely
 * on Horizon component upgrades (which can fail when theme modules 404).
 */
import { CartErrorEvent, CartLinesUpdateEvent } from '@shopify/events';

/** @type {number | null} */
let pendingLine = null;

/**
 * @returns {string[]}
 */
function getCartSectionIds() {
  /** @type {string[]} */
  const ids = [];
  document.querySelectorAll('cart-items-component').forEach((item) => {
    if (item instanceof HTMLElement && item.dataset.sectionId) {
      ids.push(item.dataset.sectionId);
    }
  });
  return ids;
}

/**
 * @returns {string}
 */
function getCartChangeUrl() {
  const base = window.Theme?.routes?.cart_change_url ?? '/cart/change';
  return base.endsWith('.js') ? base : `${base.replace(/\/$/, '')}.js`;
}

/**
 * @param {string} body
 */
function cartJsonFetch(body) {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body,
  };
}

/**
 * @param {string} sectionId
 * @param {string} html
 */
function replaceSectionMarkup(sectionId, html) {
  const existing = document.getElementById(`shopify-section-${sectionId}`);
  if (!existing) return;

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const fresh =
    doc.getElementById(`shopify-section-${sectionId}`) ??
    doc.body.firstElementChild;

  if (!(fresh instanceof HTMLElement)) return;

  existing.innerHTML = fresh.innerHTML;
}

/**
 * @param {string[]} sectionIds
 * @param {Record<string, string>} sections
 */
async function refreshCartSections(sectionIds, sections) {
  /** @type {((sectionId: string, html: string, options: { mode?: string }) => Promise<void>) | null} */
  let morphSection = null;

  try {
    ({ morphSection } = await import('@theme/section-renderer'));
  } catch {
    morphSection = null;
  }

  for (const sectionId of sectionIds) {
    const html = sections[sectionId];
    if (!html) continue;

    const cartComponent = document.querySelector(`cart-items-component[data-section-id="${sectionId}"]`);
    const isDrawer = cartComponent?.hasAttribute('data-drawer');

    if (typeof morphSection === 'function') {
      try {
        await morphSection(sectionId, html, { mode: isDrawer ? 'hydration' : 'full' });
        continue;
      } catch {
        /* fall through to DOM replace */
      }
    }

    replaceSectionMarkup(sectionId, html);
  }
}

/**
 * @param {HTMLElement} cartItems
 * @param {boolean} busy
 */
function setCartBusy(cartItems, busy) {
  cartItems.classList.toggle('cart-items-disabled', busy);
}

/**
 * @param {Element} target
 */
function getLineContext(target) {
  const row = target.closest('tr[data-key]');
  if (!row) return null;

  const input = row.querySelector('input[data-cart-line]');
  if (!(input instanceof HTMLInputElement)) return null;

  const line = Number(input.dataset.cartLine);
  if (!line) return null;

  return { row, input, line };
}

/**
 * @param {HTMLElement} removeButton
 */
function getRemoveLine(removeButton) {
  const fromData = Number(removeButton.dataset.luxeCartLine);
  if (fromData) return fromData;

  const onClick = removeButton.getAttribute('on:click') ?? '';
  const match = onClick.match(/onLineItemRemove\/(\d+)/);
  if (match) return Number(match[1]);

  return getLineContext(removeButton)?.line ?? 0;
}

/**
 * @param {HTMLElement} cartItems
 * @param {number} line
 * @param {number} quantity
 */
async function changeCartLine(cartItems, line, quantity) {
  if (!line || pendingLine === line) return;

  pendingLine = line;
  setCartBusy(cartItems, true);

  const sectionIds = getCartSectionIds();
  const body = JSON.stringify({
    line,
    quantity,
    sections: sectionIds.join(','),
    sections_url: window.location.pathname,
  });

  const deferred = CartLinesUpdateEvent.createPromise();
  document.dispatchEvent(
    new CartLinesUpdateEvent({
      action: quantity === 0 ? 'remove' : 'update',
      context: 'cart',
      lines: [{ quantity }],
      promise: deferred.promise,
    })
  );

  try {
    const response = await fetch(getCartChangeUrl(), cartJsonFetch(body));
    const text = await response.text();
    const data = JSON.parse(text);

    if (data.errors) {
      const message = typeof data.errors === 'string' ? data.errors : JSON.stringify(data.errors);
      throw new Error(message);
    }

    if (data.sections) {
      await refreshCartSections(sectionIds, data.sections);
    }

    deferred.resolve({
      cart: CartLinesUpdateEvent.createCartFromAjaxResponse(data),
      detail: {
        sections: data.sections,
        items: data.items,
        itemCount: data.item_count,
        source: 'luxe-leaf-cart-controls',
        didError: false,
      },
    });
  } catch (error) {
    deferred.reject(error);
    document.dispatchEvent(
      new CartErrorEvent({
        error: error instanceof Error ? error.message : 'Cart update failed',
        code: 'SERVICE_UNAVAILABLE',
      })
    );
  } finally {
    pendingLine = null;
    setCartBusy(cartItems, false);
  }
}

/**
 * @param {Event} event
 */
function handleCartControl(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const cartItems = target.closest('cart-items-component');
  if (!(cartItems instanceof HTMLElement) || cartItems.classList.contains('cart-items-disabled')) {
    return;
  }

  const removeButton = target.closest(
    '[data-luxe-cart-action="remove"], .cart-items__remove, .cart-items__remove-link'
  );
  if (removeButton instanceof HTMLElement) {
    const line = getRemoveLine(removeButton);
    if (!line) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    changeCartLine(cartItems, line, 0);
    return;
  }

  const minusBtn = target.closest('[data-luxe-cart-qty="decrease"], .quantity-minus');
  const plusBtn = target.closest('[data-luxe-cart-qty="increase"], .quantity-plus');
  const qtyButton = minusBtn || plusBtn;
  if (!(qtyButton instanceof HTMLElement)) return;

  const ctx = getLineContext(qtyButton);
  if (!ctx || ctx.input.disabled) return;

  const { input, line } = ctx;
  const min = Number(input.min) || 1;
  const step = Number(input.step) || 1;
  const max = input.max ? Number(input.max) : null;
  const current = Number(input.value) || min;

  let next = current;
  if (minusBtn) {
    next = Math.max(min, current - step);
  } else {
    next = max != null ? Math.min(max, current + step) : current + step;
  }

  if (next === current) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  input.value = String(next);
  changeCartLine(cartItems, line, next);
}

function initCartControls() {
  document.querySelectorAll('cart-items-component.cart-items-disabled').forEach((el) => {
    el.classList.remove('cart-items-disabled');
  });

  document.addEventListener('click', handleCartControl, true);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCartControls, { once: true });
} else {
  initCartControls();
}
