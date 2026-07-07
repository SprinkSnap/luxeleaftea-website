/**
 * Reliable cart quantity and remove controls for Luxe Leaf.
 * Uses dedicated data attributes so +/- and Remove work even when
 * Horizon's on:click delegation fails after drawer morphs.
 */

/** @param {Element | null} element */
function upgradeComponent(element) {
  if (!(element instanceof HTMLElement)) return null;
  if (element.tagName.toLowerCase().endsWith('-component')) {
    customElements.upgrade(element);
  }
  return element;
}

/** @param {Element} target */
function getCartItemsComponent(target) {
  const cartItems = target.closest('cart-items-component');
  return upgradeComponent(cartItems);
}

/** @param {Element} target */
function getCartQuantitySelector(target) {
  const selector = target.closest('cart-quantity-selector-component');
  return upgradeComponent(selector);
}

/** @param {Event} event */
function handleCartControlClick(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const cartItems = getCartItemsComponent(target);
  if (!cartItems || cartItems.classList.contains('cart-items-disabled')) return;

  const removeButton = target.closest('[data-luxe-cart-action="remove"]');
  if (removeButton instanceof HTMLElement) {
    const line = Number(removeButton.dataset.luxeCartLine);
    if (!line || typeof cartItems.onLineItemRemove !== 'function') return;

    event.preventDefault();
    cartItems.onLineItemRemove(line);
    return;
  }

  const qtyButton = target.closest('[data-luxe-cart-qty]');
  if (!(qtyButton instanceof HTMLElement)) return;

  const selector = getCartQuantitySelector(qtyButton);
  if (!selector) return;

  const action = qtyButton.dataset.luxeCartQty;
  if (action === 'increase' && typeof selector.increaseQuantity === 'function') {
    event.preventDefault();
    selector.increaseQuantity(event);
  } else if (action === 'decrease' && typeof selector.decreaseQuantity === 'function') {
    event.preventDefault();
    selector.decreaseQuantity(event);
  }
}

document.addEventListener('click', handleCartControlClick, true);
