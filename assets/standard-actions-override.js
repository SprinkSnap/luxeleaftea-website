/**
 * Horizon overrides for Shopify.actions:
 * - updateCart: emit events from the cart drawer scope.
 * - openCart: open the cart drawer (fall back to /cart when absent).
 */

function init() {
  const actions = window.Shopify?.actions;
  if (!actions) return;

  actions.updateCart.configure({
    eventTarget: () => document.querySelector('theme-drawer#cart-drawer') ?? document,
  });

  actions.openCart.configure({
    async handler() {
      /** @type {HTMLElement & { open?: () => void; toggle?: () => void } | null} */
      const drawer = document.querySelector('theme-drawer#cart-drawer, #cart-drawer');

      if (drawer && customElements.get('theme-drawer')) {
        await customElements.whenDefined('theme-drawer');
        customElements.upgrade(drawer);
      }

      if (typeof drawer?.open === 'function') {
        drawer.open();
        return;
      }

      if (typeof drawer?.toggle === 'function') {
        drawer.toggle();
        return;
      }

      window.location.href = Theme.routes.cart_url || '/cart';
    },
  });
}

if (window.Shopify?.actions) {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init, { once: true });
}
