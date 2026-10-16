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
  });
})();
