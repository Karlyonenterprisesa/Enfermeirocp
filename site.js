/* O Enfermeiro CP — consentimento de cookies (Google Consent Mode v2) + partilha. Sem dependências. */
(function () {
  var KEY = 'ec_consent';
  function gt() { window.dataLayer = window.dataLayer || []; window.dataLayer.push(arguments); }
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function apply(v) {
    var s = v === 'all' ? 'granted' : 'denied';
    gt('consent', 'update', { ad_storage: s, ad_user_data: s, ad_personalization: s, analytics_storage: s });
  }

  var css = '#ec-ck{position:fixed;left:10px;right:10px;bottom:10px;z-index:2147483000;max-width:560px;margin:0 auto;background:#fff;color:#0b1220;border:1px solid #cfe0f7;border-top:4px solid #E6AF38;border-radius:14px;padding:14px 16px;box-shadow:0 10px 30px rgba(11,31,102,.35);font:13.5px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}' +
    '#ec-ck b{color:#0B1F66;font-size:14.5px}#ec-ck p{margin:6px 0 10px}#ec-ck a{color:#0148E0}' +
    '#ec-ck .r{display:flex;gap:8px;flex-wrap:wrap}#ec-ck button{flex:1 1 140px;border:0;border-radius:10px;padding:10px 12px;font:700 13.5px system-ui,sans-serif;cursor:pointer}' +
    '#ec-ck .y{background:#0148E0;color:#fff}#ec-ck .n{background:#eef3fb;color:#0B1F66;border:1px solid #cfe0f7}' +
    '.ec-share{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}.ec-share a,.ec-share button{display:inline-flex;align-items:center;gap:6px;padding:9px 13px;border-radius:99px;border:1px solid #dbe6f7;background:#fff;color:#0B1F66;font:700 13px system-ui,sans-serif;text-decoration:none;cursor:pointer}' +
    '.ec-share .wa{background:#25D366;color:#fff;border-color:#25D366}.ec-share .fb{background:#1877F2;color:#fff;border-color:#1877F2}.ec-share .tg{background:#229ED9;color:#fff;border-color:#229ED9}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function close() { var b = document.getElementById('ec-ck'); if (b) b.remove(); }
  function choose(v) { set(v); apply(v); close(); }
  function show() {
    if (document.getElementById('ec-ck')) return;
    var d = document.createElement('div'); d.id = 'ec-ck'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Cookies');
    d.innerHTML = '<b>Cookies e privacidade</b><p>Usamos cookies para medir a utilização do site e mostrar anúncios (Google Analytics e Google AdSense). Pode aceitar tudo ou ficar só com o essencial. Veja a <a href="/privacidade/">Política de Privacidade</a>.</p>' +
      '<div class="r"><button class="n" type="button" id="ec-no">Só essenciais</button><button class="y" type="button" id="ec-yes">Aceitar tudo</button></div>';
    document.body.appendChild(d);
    document.getElementById('ec-yes').onclick = function () { choose('all'); };
    document.getElementById('ec-no').onclick = function () { choose('essential'); };
  }
  window.ecCookies = function () { var b = document.getElementById('ec-ck'); if (b) b.remove(); show(); };

  function init() {
    var v = get();
    if (v) apply(v); else show();
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-share],[data-copy],[data-cookies]');
      if (!t) return;
      var url = t.getAttribute('data-url') || location.href, title = t.getAttribute('data-title') || document.title;
      if (t.hasAttribute('data-cookies')) { e.preventDefault(); window.ecCookies(); }
      else if (t.hasAttribute('data-share')) {
        if (navigator.share) { e.preventDefault(); navigator.share({ title: title, url: url }).catch(function () {}); }
      } else if (t.hasAttribute('data-copy')) {
        e.preventDefault();
        var done = function () { var o = t.textContent; t.textContent = 'Link copiado ✓'; setTimeout(function () { t.textContent = o; }, 1800); };
        if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done); else { prompt('Copie o link:', url); }
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
