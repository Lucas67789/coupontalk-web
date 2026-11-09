// Runs before the page links are parsed, including before React hydration.
export const affiliateClickCapture = String.raw`(function () {
  var key = 'ct_pending_affiliate_clicks';
  var queue = [];
  try { queue = JSON.parse(sessionStorage.getItem(key) || '[]'); } catch (_) {}
  if (!Array.isArray(queue)) queue = [];
  queue = queue.filter(function (x) { return x && Date.now() - x.time < 86400000; }).slice(-50);
  function save() { try { sessionStorage.setItem(key, JSON.stringify(queue)); } catch (_) {} }
  window.__ctAffiliateClicks = {
    pending: function () { return queue.slice(); },
    ack: function (id) { queue = queue.filter(function (x) { return x.id !== id; }); save(); }
  };
  function capture(event) {
    if (event.type === 'auxclick' && event.button !== 1) return;
    var a = event.target && event.target.closest && event.target.closest('a[rel~="sponsored"]');
    if (!a || location.pathname.indexOf('/admin') === 0) return;
    var isTest = new URLSearchParams(location.search).get('ct_test') === '1';
    try { isTest = isTest || localStorage.getItem('ct_analytics_test') === '1'; } catch (_) {}
    queue.push({id: crypto.randomUUID(), time: Date.now(), path: location.pathname,
      target_url: a.href, store_id: a.dataset.storeAffiliate,
      button_label: (a.textContent || '제휴 링크').trim().slice(0, 100), is_test: isTest});
    queue = queue.slice(-50); save();
    window.dispatchEvent(new Event('ct:affiliate-click'));
  }
  document.addEventListener('click', capture, true);
  document.addEventListener('auxclick', capture, true);
})();`;
