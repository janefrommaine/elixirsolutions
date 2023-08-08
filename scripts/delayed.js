// eslint-disable-next-line import/no-cycle
import { sampleRUM, fetchPlaceholders } from './lib-franklin.js';

function loadLinkedInTracking(placeholders) {
  const { linkedinPartnerId } = placeholders;

  // eslint-disable-next-line no-underscore-dangle
  window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
  // eslint-disable-next-line no-underscore-dangle
  window._linkedin_data_partner_ids.push(linkedinPartnerId);

  ((l) => {
    if (!l) {
      window.lintrk = (a, b) => { window.lintrk.q.push([a, b]); };
      window.lintrk.q = [];
    }
    const s = document.getElementsByTagName('script')[0];
    const b = document.createElement('script');
    b.type = 'text/javascript';
    b.async = true;
    b.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
    s.parentNode.insertBefore(b, s);
  })(window.lintrk);
}

function loadGoogleTagManager(placeholders) {
  // google tag manager
  const { gtmId } = placeholders;
  // eslint-disable-next-line
  (function (w, d, s, l, i) { w[l] = w[l] || []; w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' }); var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f); })(window, document, 'script', 'dataLayer', gtmId);
}

function loadHubSpot(placeholders) {
  const hsScriptEl = document.createElement('script');
  hsScriptEl.type = 'text/javascript';
  hsScriptEl.async = true;
  hsScriptEl.defer = true;
  hsScriptEl.setAttribute('id', 'hs-script-loader');
  hsScriptEl.src = `//js.hs-scripts.com/${placeholders.hubspotPortalId}.js`;
  document.querySelector('head').append(hsScriptEl);
}

async function loadDelayed() {
  // Core Web Vitals RUM collection
  sampleRUM('cwv');

  // add more delayed functionality here
  const placeholders = await fetchPlaceholders();
  loadHubSpot(placeholders);
  loadGoogleTagManager(placeholders);
  loadLinkedInTracking(placeholders);
}

loadDelayed();
