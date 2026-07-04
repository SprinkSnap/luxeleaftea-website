/**
 * AJAX add-to-cart for browse rails — stay on page, refresh cart drawer, sync mobile bar.
 */
import { CartLinesUpdateEvent, CartErrorEvent, StandardEvents } from '@shopify/events';

const BROWSE_FORM_SELECTOR =
  '.luxe-keep-exploring__form, .luxe-featured__form, .luxe-cart-upsell__form';

const ADDING_CLASS = 'luxe-browse-atc--adding';
const SUCCESS_CLASS = 'luxe-browse-atc--success';

/**
 * @returns {string[]}
 */
function getCartSectionIds() {
  const ids = [];
  document.querySelectorAll('cart-items-component').forEach((item) => {
    if (item instanceof HTMLElement && item.dataset.sectionId) {
      ids.push(item.dataset.sectionId);
    }
  });
  return ids;
}

/**
 * @param {HTMLButtonElement} button
 * @param {string} label
 */
function setButtonLabel(button, label) {
  if (!button.dataset.defaultLabel) {
    button.dataset.defaultLabel = button.textContent?.trim() ?? 'Add to Bag';
  }
  button.textContent = label;
}

/**
 * @param {HTMLButtonElement} button
 */
function resetButton(button) {
  button.classList.remove(ADDING_CLASS, SUCCESS_CLASS);
  button.disabled = false;
  button.textContent = button.dataset.defaultLabel ?? 'Add to Bag';
}

/**
 * @param {HTMLFormElement} form
 * @param {SubmitEvent} event
 */
async function handleBrowseAdd(form, event) {
  event.preventDefault();

  const button = form.querySelector('button[type="submit"], button[name="add"]');
  if (!(button instanceof HTMLButtonElement) || button.disabled) return;

  const variantId = form.querySelector('input[name="id"]')?.value;
  if (!variantId) return;

  button.disabled = true;
  button.classList.add(ADDING_CLASS);
  setButtonLabel(button, 'Adding…');

  const deferred = CartLinesUpdateEvent.createPromise();
  const sectionIds = getCartSectionIds();

  document.dispatchEvent(
    new CartLinesUpdateEvent({
      action: 'add',
      context: 'product',
      lines: [{ merchandiseId: String(variantId), quantity: 1 }],
      promise: deferred.promise,
    })
  );

  try {
    const cartAddUrl = window.Theme?.routes?.cart_add_url ?? '/cart/add.js';
    const response = await fetch(cartAddUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{ id: Number(variantId), quantity: 1 }],
        sections: sectionIds.join(','),
        sections_url: window.location.pathname,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.status) {
      throw new Error(data.description || data.message || 'Add to cart failed');
    }

    const cartResponse = await fetch('/cart.js', { headers: { Accept: 'application/json' } });
    const cart = cartResponse.ok ? await cartResponse.json() : data;

    deferred.resolve({
      cart: CartLinesUpdateEvent.createCartFromAjaxResponse(cart),
      detail: {
        items: cart.items ?? data.items,
        sections: data.sections,
        itemCount: 1,
        source: 'luxe-browse-atc',
        didError: false,
      },
    });

    button.classList.remove(ADDING_CLASS);
    button.classList.add(SUCCESS_CLASS);
    setButtonLabel(button, 'Added ✓');

    window.Shopify?.actions?.openCart?.();

    window.setTimeout(() => resetButton(button), 1800);
  } catch (error) {
    deferred.resolve({ ok: false });

    document.dispatchEvent(
      new CartErrorEvent({
        error: error instanceof Error ? error.message : 'Add to cart failed',
        code: 'INVALID',
      })
    );

    resetButton(button);
  }
}

function bindBrowseAddToCart() {
  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (!form.matches(BROWSE_FORM_SELECTOR)) return;
    handleBrowseAdd(form, event);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindBrowseAddToCart, { once: true });
} else {
  bindBrowseAddToCart();
}
