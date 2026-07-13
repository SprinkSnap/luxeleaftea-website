/**
 * Canadian provincial tax rates for cart estimates (Canada-wide shipping only).
 * Rates are combined GST/HST/PST totals in basis points (1300 = 13%).
 */
(function initCanadaTax() {
  if (window.__luxeCanadaTaxInit) return;
  window.__luxeCanadaTaxInit = true;

  const STORAGE_KEY = 'luxe-ca-location';

  /** @type {Record<string, { name: string, rateBps: number, taxLabel: string, cities: string[] }>} */
  const CA_PROVINCES = {
    AB: { name: 'Alberta', rateBps: 500, taxLabel: 'GST 5%', cities: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'Medicine Hat'] },
    BC: {
      name: 'British Columbia',
      rateBps: 1200,
      taxLabel: 'GST + PST 12%',
      cities: ['Vancouver', 'Victoria', 'Surrey', 'Kelowna', 'Nanaimo'],
    },
    MB: {
      name: 'Manitoba',
      rateBps: 1200,
      taxLabel: 'GST + RST 12%',
      cities: ['Winnipeg', 'Brandon', 'Steinbach', 'Thompson'],
    },
    NB: { name: 'New Brunswick', rateBps: 1500, taxLabel: 'HST 15%', cities: ['Moncton', 'Saint John', 'Fredericton', 'Dieppe'] },
    NL: {
      name: 'Newfoundland and Labrador',
      rateBps: 1500,
      taxLabel: 'HST 15%',
      cities: ["St. John's", 'Mount Pearl', 'Corner Brook'],
    },
    NS: { name: 'Nova Scotia', rateBps: 1400, taxLabel: 'HST 14%', cities: ['Halifax', 'Dartmouth', 'Sydney', 'Truro'] },
    NT: { name: 'Northwest Territories', rateBps: 500, taxLabel: 'GST 5%', cities: ['Yellowknife', 'Hay River', 'Inuvik'] },
    NU: { name: 'Nunavut', rateBps: 500, taxLabel: 'GST 5%', cities: ['Iqaluit', 'Rankin Inlet', 'Arviat'] },
    ON: { name: 'Ontario', rateBps: 1300, taxLabel: 'HST 13%', cities: ['Toronto', 'Ottawa', 'Mississauga', 'Hamilton', 'London', 'Kitchener'] },
    PE: {
      name: 'Prince Edward Island',
      rateBps: 1500,
      taxLabel: 'HST 15%',
      cities: ['Charlottetown', 'Summerside', 'Stratford'],
    },
    QC: {
      name: 'Quebec',
      rateBps: 14975,
      taxLabel: 'GST + QST 14.975%',
      cities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Sherbrooke'],
    },
    SK: {
      name: 'Saskatchewan',
      rateBps: 1100,
      taxLabel: 'GST + PST 11%',
      cities: ['Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw'],
    },
    YT: { name: 'Yukon', rateBps: 500, taxLabel: 'GST 5%', cities: ['Whitehorse', 'Dawson City', 'Watson Lake'] },
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

  /** @param {string} province @param {string} city */
  function storeLocation(province, city) {
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

  /** @returns {boolean} */
  function isLocationComplete() {
    const { province, city } = getStoredLocation();
    return Boolean(province && CA_PROVINCES[province] && city && city.trim().length >= 2);
  }

  /** @param {HTMLSelectElement} select @param {string} province */
  function updateCityDatalist(select, province) {
    const root = select.closest('[data-ca-tax-selector]');
    const list = root?.querySelector('[data-ca-city-list]');
    if (!(list instanceof HTMLDataListElement)) return;

    list.innerHTML = '';
    const cities = CA_PROVINCES[province]?.cities || [];
    cities.forEach((city) => {
      const option = document.createElement('option');
      option.value = city;
      list.appendChild(option);
    });
  }

  /** @param {HTMLElement} root */
  function syncSelectorUI(root) {
    const { province, city } = getStoredLocation();
    const select = root.querySelector('[data-ca-province]');
    const input = root.querySelector('[data-ca-city]');
    const note = root.querySelector('[data-ca-tax-note]');
    const rateEl = root.querySelector('[data-ca-tax-rate]');

    if (select instanceof HTMLSelectElement && province) {
      select.value = province;
      updateCityDatalist(select, province);
    }
    if (input instanceof HTMLInputElement && city) {
      input.value = city;
    }

    const complete = isLocationComplete();
    if (note instanceof HTMLElement) {
      note.hidden = complete;
    }
    if (rateEl instanceof HTMLElement) {
      if (complete && province) {
        rateEl.hidden = false;
        rateEl.textContent = `${CA_PROVINCES[province].name} · ${getTaxLabel(province)} · Canada-wide delivery`;
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
    const input = root.querySelector('[data-ca-city]');
    if (!(select instanceof HTMLSelectElement) || !(input instanceof HTMLInputElement)) return;

    syncSelectorUI(root);

    select.addEventListener('change', () => {
      const province = select.value;
      updateCityDatalist(select, province);
      const city = input.value.trim();
      if (province && city.length >= 2) {
        storeLocation(province, city);
      } else {
        storeLocation(province, '');
        document.dispatchEvent(new CustomEvent('luxe:ca-location-change', { detail: { province, city: '' } }));
      }
      syncSelectorUI(root);
    });

    const onCityChange = () => {
      const province = select.value;
      const city = input.value.trim();
      if (province && city.length >= 2) {
        storeLocation(province, city);
      }
      syncSelectorUI(root);
    };

    input.addEventListener('change', onCityChange);
    input.addEventListener('blur', onCityChange);
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
