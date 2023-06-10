// eslint-disable-next-line import/no-cycle
import { sampleRUM, fetchPlaceholders } from './lib-franklin.js';

async function loadLinkedInTracking() {
  const placeholders = await fetchPlaceholders();
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

async function loadGoogleTagManager() {
  const placeholders = await fetchPlaceholders();
  // google tag manager
  const { gtmId } = placeholders;
  // eslint-disable-next-line
  (function (w, d, s, l, i) { w[l] = w[l] || []; w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' }); var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f); })(window, document, 'script', 'dataLayer', gtmId);
}

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
loadGoogleTagManager();
loadLinkedInTracking();
