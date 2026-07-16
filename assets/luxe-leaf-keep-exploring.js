/**
 * Hydrates Keep exploring rails with recently viewed products from localStorage.
 */
import { RecentlyViewed } from '@theme/recently-viewed-products';
import { sectionRenderer } from '@theme/section-renderer';

/**
 * @param {HTMLElement} section
 */
async function hydrateKeepExploring(section) {
  const sectionId = section.dataset.sectionId;
  if (!sectionId || section.dataset.keepExploringHydrated === 'true') return;

  const recentOnly = section.dataset.recentOnly === 'true';
  const viewed = RecentlyViewed.getProducts();
  const excludeId = section.dataset.excludeProductId;
  const filtered = excludeId
    ? viewed.filter((id) => String(id) !== String(excludeId))
    : viewed;

  if (filtered.length === 0) {
    if (recentOnly) {
      section.hidden = true;
      section.classList.add('luxe-keep-exploring--pending');
    }
    return;
  }

  const searchBase = window.Theme?.routes?.search_url ?? '/search';
  const url = new URL(searchBase, window.location.origin);
  url.searchParams.set('q', filtered.map((id) => `id:${id}`).join(' OR '));
  url.searchParams.set('resources[type]', 'product');

  try {
    const markup = await sectionRenderer.getSectionHTML(sectionId, false, url);
    const parsed = new DOMParser().parseFromString(markup, 'text/html');
    const freshSection = parsed.querySelector('[data-keep-exploring]');
    const freshRail = parsed.querySelector('[data-keep-exploring-rail]');
    const liveRail = section.querySelector('[data-keep-exploring-rail]');

    if (!freshRail || !liveRail || !freshRail.children.length) {
      if (recentOnly) {
        section.hidden = true;
        section.classList.add('luxe-keep-exploring--pending');
      }
      return;
    }

    liveRail.replaceChildren(...freshRail.children);

    if (freshSection) {
      const freshEyebrow = freshSection.querySelector('[data-keep-exploring-eyebrow]');
      const freshHeading = freshSection.querySelector('[data-keep-exploring-heading]');
      const freshIntro = freshSection.querySelector('[data-keep-exploring-intro]');
      const liveEyebrow = section.querySelector('[data-keep-exploring-eyebrow]');
      const liveHeading = section.querySelector('[data-keep-exploring-heading]');
      const liveIntro = section.querySelector('[data-keep-exploring-intro]');

      if (freshEyebrow && liveEyebrow) liveEyebrow.textContent = freshEyebrow.textContent;
      if (freshHeading && liveHeading) liveHeading.textContent = freshHeading.textContent;
      if (freshIntro && liveIntro) liveIntro.textContent = freshIntro.textContent;
      section.classList.add('luxe-keep-exploring--recent');
    }

    if (recentOnly) {
      section.hidden = false;
      section.classList.remove('luxe-keep-exploring--pending');
    }

    section.dataset.keepExploringHydrated = 'true';
  } catch {
    if (recentOnly) {
      section.hidden = true;
      section.classList.add('luxe-keep-exploring--pending');
    }
    /* otherwise keep server-rendered fallback */
  }
}

function initKeepExploring() {
  document.querySelectorAll('[data-keep-exploring]').forEach((section) => {
    if (section instanceof HTMLElement) hydrateKeepExploring(section);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initKeepExploring, { once: true });
} else {
  initKeepExploring();
}

document.addEventListener('shopify:section:load', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  target.querySelectorAll('[data-keep-exploring]').forEach((section) => {
    if (section instanceof HTMLElement) {
      section.dataset.keepExploringHydrated = '';
      hydrateKeepExploring(section);
    }
  });
});
