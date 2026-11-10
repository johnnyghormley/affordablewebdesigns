// Ad tracking for the AWD site: Meta pixel, Google Analytics 4 and Google Ads.
// Each one stays off until its ID is filled in below (IDs are public, safe to commit).
// Events: page view on load; "Lead" when the free-design form saves to the CRM; "Contact" when someone taps the phone number.
(function () {
  var META_PIXEL_ID = '1109866275080402'; // e.g. '1234567890123456'  (Meta Events Manager → Data sources → your pixel)
  var GA4_ID = 'G-G29GJ0HD20';    // e.g. 'G-ABC123XYZ'       (Google Analytics → Admin → Data streams → Web)
  var GOOGLE_ADS_ID = '';        // e.g. 'AW-123456789'      (Google Ads → Goals → Conversions → tag setup)
  var GOOGLE_ADS_LEAD_LABEL = ''; // e.g. 'AbCdEfGhIjK'      (the part after the slash in send_to: 'AW-123456789/AbCdEfGhIjK')

  if (META_PIXEL_ID) {
    /* Meta's standard pixel loader */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', META_PIXEL_ID);
    fbq('track', 'PageView');
  }

  var gId = GA4_ID || GOOGLE_ADS_ID;
  if (gId) {
    var s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + gId;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    if (GA4_ID) gtag('config', GA4_ID);
    if (GOOGLE_ADS_ID) gtag('config', GOOGLE_ADS_ID);
  }

  // Called by the form after the request is saved in the CRM.
  window.awdTrackLead = function () {
    if (window.fbq) fbq('track', 'Lead');
    if (window.gtag) {
      if (GA4_ID) gtag('event', 'generate_lead');
      if (GOOGLE_ADS_ID && GOOGLE_ADS_LEAD_LABEL) gtag('event', 'conversion', { send_to: GOOGLE_ADS_ID + '/' + GOOGLE_ADS_LEAD_LABEL });
    }
  };

  // Phone taps count as contacts.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="tel:"]');
    if (!a) return;
    if (window.fbq) fbq('track', 'Contact');
    if (window.gtag && GA4_ID) gtag('event', 'click_to_call');
    awdLogVisit('call');
  });

  // AWD's own visit counter (2026-11-10): one row per page view (and per phone tap) in the CRM's site_visits table,
  // shown on the CRM's admin-only Analytics tab. No names, emails or IP addresses: just the page, where the visitor
  // came from, a random id kept in this browser, and phone vs computer. The public key can only ADD a row.
  function awdLogVisit(event) {
    try {
      if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) || navigator.webdriver) return;
      var vid = '';
      try { vid = localStorage.getItem('awd_vid') || ''; if (!vid) { vid = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('awd_vid', vid); } } catch (e) {}
      var q = new URLSearchParams(location.search), us = q.get('utm_source'), um = q.get('utm_medium') || '';
      var source = q.get('src') || (q.get('gclid') ? 'googlead' : '') || (q.get('fbclid') && !us ? 'facebook' : '') || (us ? us + (um ? '/' + um : '') : '');
      var ref = '';
      try { if (document.referrer) { var r = new URL(document.referrer); if (r.hostname !== location.hostname) ref = r.hostname; } } catch (e) {}
      var row = { path: location.pathname.slice(0, 300), referrer: ref.slice(0, 300), source: source.slice(0, 100) || null, visitor_id: vid.slice(0, 64) || null,
                  device: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'phone' : 'computer', event: event || 'view' };
      fetch('https://mrklhkseyynmnjzbiokx.supabase.co/rest/v1/site_visits', {
        method: 'POST', keepalive: true,
        headers: { apikey: AWD_PUBLIC_KEY, Authorization: 'Bearer ' + AWD_PUBLIC_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify(row)
      }).catch(function () {});
    } catch (e) {}
  }
  var AWD_PUBLIC_KEY = 'sb_publishable_8SekgbrdzwUzWaMCohwznQ_wPZaOpDo'; // the same public key the form uses; it can only add rows
  awdLogVisit('view');
})();
