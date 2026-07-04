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

function initBrandMobileMenu() {
  const panel = document.getElementById('LuxeBrandMenuPanel');
  if (!panel) return;

  const toggles = document.querySelectorAll('[data-luxe-nav-toggle]');
  const closes = document.querySelectorAll('[data-luxe-nav-close]');

  const isOpen = () => !panel.hidden;

  const setOpen = (open) => {
    panel.hidden = !open;
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    toggles.forEach((toggle) => toggle.setAttribute('aria-expanded', open ? 'true' : 'false'));
    document.documentElement.style.overflow = open ? 'hidden' : '';
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

  panel.querySelectorAll('a[href]').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) setOpen(false);
  });
}

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(forceDesktopMenu, 120);
});

document.addEventListener('DOMContentLoaded', () => {
  forceDesktopMenu();
  initBrandMobileMenu();
});

forceDesktopMenu();
requestAnimationFrame(forceDesktopMenu);
