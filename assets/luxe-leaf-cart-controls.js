/**
 * Luxe Leaf cart controls — mobile-first quantity stepper and remove.
 * Posts directly to /cart/change.js and refreshes cart sections.
 */
import { CartErrorEvent, CartLinesUpdateEvent } from '@shopify/events';

/** @type {string | null} */
let pendingKey = null;

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
    doc.getElementById(`shopify-section-${sectionId}`) ?? doc.body.firstElementChild;

  if (!(fresh instanceof HTMLElement)) return;

  existing.innerHTML = fresh.innerHTML;
}

/**
 * @param {string} sectionId
 */
async function fetchSectionHtml(sectionId) {
  const url = new URL(window.location.href);
  url.searchParams.set('section_id', sectionId);
  return fetch(url.toString(), { headers: { Accept: 'text/html' } }).then((r) => r.text());
}

/**
 * @param {string[]} sectionIds
 * @param {Record<string, string>} [sections]
 */
async function refreshCartSections(sectionIds, sections = {}) {
  /** @type {((id: string, html: string, opts: { mode?: string }) => Promise<void>) | null} */
  let morphSection = null;

  try {
    ({ morphSection } = await import('@theme/section-renderer'));
  } catch {
    morphSection = null;
  }

  for (const sectionId of sectionIds) {
    let html = sections[sectionId];

    if (!html) {
      try {
        html = await fetchSectionHtml(sectionId);
      } catch {
        continue;
      }
    }

    const cartComponent = document.querySelector(`cart-items-component[data-section-id="${sectionId}"]`);
    const isDrawer = cartComponent?.hasAttribute('data-drawer');

    if (typeof morphSection === 'function') {
      try {
        await morphSection(sectionId, html, { mode: isDrawer ? 'hydration' : 'full' });
        continue;
      } catch {
        /* fall through */
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
  cartItems.querySelectorAll('.luxe-cart-stepper').forEach((stepper) => {
    stepper.classList.toggle('luxe-cart-stepper--busy', busy);
  });
}

/**
 * @param {Element} target
 */
function getLineContext(target) {
  const row = target.closest('tr[data-key]');
  const stepper = target.closest('.luxe-cart-stepper');

  const input =
    stepper?.querySelector('[data-luxe-cart-qty-input]') ??
    row?.querySelector('input[data-cart-line]');

  if (!(input instanceof HTMLInputElement)) return null;

  const line = Number(input.dataset.cartLine);
  const lineKey = input.dataset.cartKey || row?.dataset.key || '';
  const display = stepper?.querySelector('[data-luxe-cart-qty-value]');

  return {
    row,
    input,
    display,
    line,
    lineKey,
    min: Number(input.dataset.min) || 1,
    step: Number(input.dataset.step) || 1,
    max: input.dataset.max ? Number(input.dataset.max) : null,
  };
}

/**
 * @param {HTMLElement} removeButton
 */
function getRemoveContext(removeButton) {
  const line = Number(removeButton.dataset.luxeCartLine);
  const lineKey = removeButton.dataset.luxeCartKey ?? '';
  const ctx = getLineContext(removeButton);

  return {
    line: line || ctx?.line || 0,
    lineKey: lineKey || ctx?.lineKey || '',
  };
}

/**
 * @param {HTMLElement | null | undefined} display
 * @param {number} quantity
 * @param {HTMLInputElement} input
 */
function setQuantityDisplay(display, quantity, input) {
  input.value = String(quantity);
  input.defaultValue = String(quantity);
  if (display instanceof HTMLElement) {
    display.textContent = String(quantity);
  }
}

/**
 * @param {HTMLElement} cartItems
 * @param {{ line: number, lineKey: string, quantity: number }} config
 */
async function changeCartLine(cartItems, { line, lineKey, quantity }) {
  const lockKey = lineKey || String(line);
  if (!lockKey || pendingKey === lockKey) return;

  pendingKey = lockKey;
  setCartBusy(cartItems, true);

  const sectionIds = getCartSectionIds();
  /** @type {Record<string, unknown>} */
  const payload = {
    quantity,
    sections: sectionIds.join(','),
    sections_url: window.location.pathname,
  };

  if (lineKey) {
    payload.id = lineKey;
  } else {
    payload.line = line;
  }

  const deferred = CartLinesUpdateEvent.createPromise();
  document.dispatchEvent(
    new CartLinesUpdateEvent({
      action: quantity === 0 ? 'remove' : 'update',
      context: 'cart',
      lines: [{ id: lineKey || String(line), quantity }],
      promise: deferred.promise,
    })
  );

  try {
    const response = await fetch(getCartChangeUrl(), cartJsonFetch(JSON.stringify(payload)));
    const text = await response.text();
    const data = JSON.parse(text);

    if (data.errors) {
      const message = typeof data.errors === 'string' ? data.errors : JSON.stringify(data.errors);
      throw new Error(message);
    }

    await refreshCartSections(sectionIds, data.sections ?? {});

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
    pendingKey = null;
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

  const removeButton = target.closest('[data-luxe-cart-action="remove"]');
  if (removeButton instanceof HTMLElement) {
    const { line, lineKey } = getRemoveContext(removeButton);
    if (!line && !lineKey) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    changeCartLine(cartItems, { line, lineKey, quantity: 0 });
    return;
  }

  const minusBtn = target.closest('[data-luxe-cart-qty="decrease"]');
  const plusBtn = target.closest('[data-luxe-cart-qty="increase"]');
  if (!minusBtn && !plusBtn) return;

  const ctx = getLineContext(target);
  if (!ctx || ctx.input.disabled) return;

  const current = Number(ctx.input.value) || ctx.min;
  let next = current;

  if (minusBtn) {
    next = Math.max(ctx.min, current - ctx.step);
  } else {
    next = ctx.max != null ? Math.min(ctx.max, current + ctx.step) : current + ctx.step;
  }

  if (next === current) return;

  event.preventDefault();
  event.stopImmediatePropagation();

  setQuantityDisplay(ctx.display, next, ctx.input);
  changeCartLine(cartItems, { line: ctx.line, lineKey: ctx.lineKey, quantity: next });
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
