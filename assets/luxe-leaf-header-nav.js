/**
 * Keeps Luxe Leaf Tea navigation links visible on desktop.
 * Horizon's overflow-list and touch detection can hide the header menu;
 * this script forces menu mode at desktop widths for the brand theme.
 */
const BRAND_DESKTOP_MQ = window.matchMedia('(min-width: 750px)');

function applyBrandHeaderMenuStyle() {
  if (!document.body.classList.contains('luxe-leaf-theme')) return;

  const header = document.querySelector('#header-component');
  if (!header) return;

  if (BRAND_DESKTOP_MQ.matches) {
    header.dataset.menuStyle = 'menu';

    const overflowList = header.querySelector('overflow-list');
    overflowList?.removeAttribute('minimum-reached');
  }
}

applyBrandHeaderMenuStyle();
BRAND_DESKTOP_MQ.addEventListener('change', applyBrandHeaderMenuStyle);
document.addEventListener('overflowMinimum', applyBrandHeaderMenuStyle, true);
window.addEventListener('resize', applyBrandHeaderMenuStyle);

requestAnimationFrame(() => {
  applyBrandHeaderMenuStyle();
  requestAnimationFrame(applyBrandHeaderMenuStyle);
});
