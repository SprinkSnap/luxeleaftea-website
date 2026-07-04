/**
 * Reliable cart drawer open/toggle for header bag, mobile bar, and nudge CTAs.
 * Loaded after cart-drawer markup so theme-drawer is always present.
 */

const TOGGLE_SELECTOR =
  '[data-cart-drawer-toggle], [data-testid="cart-drawer-trigger"], button[aria-controls="cart-drawer"]';

/** @type {Promise<void> | null} */
let drawerReadyPromise = null;
let toggleLock = false;

function whenDrawerReady() {
  if (!drawerReadyPromise) {
    drawerReadyPromise = (async () => {
      const drawer = document.querySelector('theme-drawer#cart-drawer, #cart-drawer');
      if (!drawer) return;

      if (customElements.get('theme-drawer')) {
        await customElements.whenDefined('theme-drawer');
      }

      customElements.upgrade(drawer);
    })();
  }

  return drawerReadyPromise;
}

async function openCartDrawer() {
  if (window.Shopify?.actions?.openCart) {
    try {
      await window.Shopify.actions.openCart();
      return;
    } catch {
      /* fall through to direct drawer control */
    }
  }

  await whenDrawerReady();

  const drawer = document.querySelector('theme-drawer#cart-drawer, #cart-drawer');
  /** @type {{ toggle?: () => void; open?: () => void } | null} */
  const drawerHost = drawer;

  if (drawerHost && typeof drawerHost.toggle === 'function') {
    drawerHost.toggle();
    return;
  }

  if (drawerHost && typeof drawerHost.open === 'function') {
    drawerHost.open();
    return;
  }

  window.location.assign(window.Theme?.routes?.cart_url || '/cart');
}

/**
 * @param {Event} event
 */
function handleCartIntent(event) {
  const trigger = event.target.closest(TOGGLE_SELECTOR);
  if (!(trigger instanceof HTMLElement) || trigger.hidden || trigger.disabled) return;

  if (toggleLock) return;
  toggleLock = true;
  window.setTimeout(() => {
    toggleLock = false;
  }, 400);

  event.preventDefault();
  event.stopImmediatePropagation();
  openCartDrawer();
}

document.addEventListener('click', handleCartIntent, true);
