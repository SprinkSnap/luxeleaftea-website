/**
 * Luxe Leaf Tea navigation — reliable menu on mobile, forced desktop links.
 * Replaces Horizon drawer (scroll-lock freeze) and overflow-list hiding.
 */
const DESKTOP_MQ = window.matchMedia('(min-width: 750px)');

function forceDesktopMenu() {
  if (!document.body.classList.contains('luxe-leaf-theme')) return;

  const header = document.querySelector('#header-component');
  if (!header || !DESKTOP_MQ.matches) return;

  header.dataset.menuStyle = 'menu';
  header.querySelector('overflow-list')?.removeAttribute('minimum-reached');
}

/**
 * @param {HTMLAnchorElement} link
 * @param {Event} event
 * @param {() => void} closeMenu
 */
function navigateFromMenuLink(link, event, closeMenu) {
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#')) return;

  if (link.target === '_blank') return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (href.startsWith('tel:') || href.startsWith('mailto:')) return;

  const destination = link.href;
  if (!destination) return;

  const current = window.location.href.split('#')[0];
  if (destination.split('#')[0] === current) {
    closeMenu();
    return;
  }

  event.preventDefault();
  event.stopImmediatePropagation();

  // Do not hide the overlay before navigating — iOS Safari can cancel the request.
  window.location.href = destination;
}

function initBrandMobileMenu() {
  const panel = document.getElementById('LuxeBrandMenuPanel');
  if (!panel || panel.dataset.luxeNavBound === 'true') return;

  panel.dataset.luxeNavBound = 'true';

  // Move panel to body so it overlays the full page above header/content.
  if (panel.parentElement !== document.body) {
    document.body.appendChild(panel);
  }

  const toggles = document.querySelectorAll('[data-luxe-nav-toggle]');
  const closes = panel.querySelectorAll('[data-luxe-nav-close]');

  const isOpen = () => !panel.hidden;

  const setOpen = (open) => {
    panel.hidden = !open;
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    toggles.forEach((toggle) => toggle.setAttribute('aria-expanded', open ? 'true' : 'false'));
    document.documentElement.style.overflow = open ? 'hidden' : '';
    document.documentElement.classList.toggle('luxe-menu-open', open);
  };

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      setOpen(!isOpen());
    });
  });

  closes.forEach((closeEl) => {
    closeEl.addEventListener('click', () => setOpen(false));
  });

  panel.addEventListener(
    'click',
    (event) => {
      const link = event.target.closest('a[href]');
      if (!(link instanceof HTMLAnchorElement) || !panel.contains(link)) return;
      navigateFromMenuLink(link, event, () => setOpen(false));
    },
    true
  );

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) setOpen(false);
  });
}

/**
 * Footer Shop / Learn / Legal:
 * Desktop = always-open link columns (no dead accordion chrome).
 * Mobile = compact accordion for conversion.
 */
function syncFooterAccordions() {
  const panels = document.querySelectorAll('[data-footer-accordion]');
  if (!panels.length) return;

  panels.forEach((panel) => {
    if (!(panel instanceof HTMLDetailsElement)) return;

    if (DESKTOP_MQ.matches) {
      panel.open = true;
      panel.dataset.footerDesktop = 'true';
    } else {
      delete panel.dataset.footerDesktop;
      if (panel.dataset.footerUserToggled !== 'true') {
        panel.open = false;
      }
    }
  });
}

function initFooterAccordions() {
  const panels = document.querySelectorAll('[data-footer-accordion]');
  if (!panels.length) return;

  panels.forEach((panel) => {
    if (!(panel instanceof HTMLDetailsElement)) return;

    panel.addEventListener('toggle', () => {
      if (panel.dataset.footerDesktop === 'true') {
        panel.open = true;
        return;
      }
      panel.dataset.footerUserToggled = 'true';
    });

    const summary = panel.querySelector('summary');
    summary?.addEventListener('click', (event) => {
      if (panel.dataset.footerDesktop === 'true') {
        event.preventDefault();
      }
    });
  });

  syncFooterAccordions();
}

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    forceDesktopMenu();
    syncFooterAccordions();
  }, 120);
});

document.addEventListener('DOMContentLoaded', () => {
  forceDesktopMenu();
  initBrandMobileMenu();
  initFooterAccordions();
});

forceDesktopMenu();
requestAnimationFrame(forceDesktopMenu);
syncFooterAccordions();
