/**
 * Optional Canadian provincial tax estimate for cart UX.
 * Never gates Pay — checkout collects address and final tax.
 */
(function initCanadaTax() {
  if (window.__luxeCanadaTaxInit) return;
  window.__luxeCanadaTaxInit = true;

  const STORAGE_KEY = 'luxe-ca-location';

  /** @type {Record<string, { name: string, rateBps: number, taxLabel: string }>} */
  const CA_PROVINCES = {
    AB: { name: 'Alberta', rateBps: 500, taxLabel: 'GST 5%' },
    BC: { name: 'British Columbia', rateBps: 1200, taxLabel: 'GST + PST 12%' },
    MB: { name: 'Manitoba', rateBps: 1200, taxLabel: 'GST + RST 12%' },
    NB: { name: 'New Brunswick', rateBps: 1500, taxLabel: 'HST 15%' },
    NL: { name: 'Newfoundland and Labrador', rateBps: 1500, taxLabel: 'HST 15%' },
    NS: { name: 'Nova Scotia', rateBps: 1400, taxLabel: 'HST 14%' },
    NT: { name: 'Northwest Territories', rateBps: 500, taxLabel: 'GST 5%' },
    NU: { name: 'Nunavut', rateBps: 500, taxLabel: 'GST 5%' },
    ON: { name: 'Ontario', rateBps: 1300, taxLabel: 'HST 13%' },
    PE: { name: 'Prince Edward Island', rateBps: 1500, taxLabel: 'HST 15%' },
    QC: { name: 'Quebec', rateBps: 14975, taxLabel: 'GST + QST 14.975%' },
    SK: { name: 'Saskatchewan', rateBps: 1100, taxLabel: 'GST + PST 11%' },
    YT: { name: 'Yukon', rateBps: 500, taxLabel: 'GST 5%' },
  };

  /** @returns {{ province?: string, city?: string }} */
  function getStoredLocation() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  /** @param {string} province @param {string} [city] */
  function storeLocation(province, city = '') {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ province, city }));
    document.dispatchEvent(new CustomEvent('luxe:ca-location-change', { detail: { province, city } }));
  }

  /** @param {string} [provinceCode] */
  function getTaxRateBps(provinceCode) {
    const code = provinceCode || getStoredLocation().province;
    if (!code || !CA_PROVINCES[code]) return 0;
    return CA_PROVINCES[code].rateBps;
  }

  /** @param {string} [provinceCode] */
  function getTaxLabel(provinceCode) {
    const code = provinceCode || getStoredLocation().province;
    if (!code || !CA_PROVINCES[code]) return 'Tax';
    return CA_PROVINCES[code].taxLabel;
  }

  /** Province selected for optional estimate (never required for Pay). */
  function isLocationComplete() {
    const { province } = getStoredLocation();
    return Boolean(province && CA_PROVINCES[province]);
  }

  /** @param {HTMLElement} root */
  function syncSelectorUI(root) {
    const { province } = getStoredLocation();
    const select = root.querySelector('[data-ca-province]');
    const note = root.querySelector('[data-ca-tax-note]');
    const rateEl = root.querySelector('[data-ca-tax-rate]');

    if (select instanceof HTMLSelectElement && province) {
      select.value = province;
      if (root instanceof HTMLDetailsElement) {
        root.open = true;
      }
    }

    const hasEstimate = isLocationComplete();
    if (note instanceof HTMLElement) {
      note.textContent = hasEstimate
        ? 'Estimate only — exact tax is confirmed with your address at checkout.'
        : 'Skip this and tap Pay — Shopify checkout calculates exact tax from your address.';
    }
    if (rateEl instanceof HTMLElement) {
      if (hasEstimate && province) {
        rateEl.hidden = false;
        rateEl.textContent = `${CA_PROVINCES[province].name} · ${getTaxLabel(province)} estimated`;
      } else {
        rateEl.hidden = true;
        rateEl.textContent = '';
      }
    }
  }

  /** @param {HTMLElement} root */
  function bindSelector(root) {
    if (root.dataset.caTaxBound === 'true') return;
    root.dataset.caTaxBound = 'true';

    const select = root.querySelector('[data-ca-province]');
    if (!(select instanceof HTMLSelectElement)) return;

    syncSelectorUI(root);

    select.addEventListener('change', () => {
      const province = select.value;
      storeLocation(province, '');
      syncSelectorUI(root);
    });
  }

  function bindAllSelectors() {
    document.querySelectorAll('[data-ca-tax-selector]').forEach((root) => {
      if (root instanceof HTMLElement) bindSelector(root);
    });
  }

  window.LuxeLeaf = window.LuxeLeaf || {};
  window.LuxeLeaf.CanadaTax = {
    getStoredLocation,
    getTaxRateBps,
    getTaxLabel,
    isLocationComplete,
    provinces: CA_PROVINCES,
  };

  bindAllSelectors();
  document.addEventListener('DOMContentLoaded', bindAllSelectors);
  document.addEventListener('shopify:section:load', bindAllSelectors);

  document.addEventListener('luxe:ca-location-change', () => {
    document.querySelectorAll('[data-ca-tax-selector]').forEach((root) => {
      if (root instanceof HTMLElement) syncSelectorUI(root);
    });
  });
})();
