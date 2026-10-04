/* Card pequeno «Download aplicativo» na tela inicial (só no site online).
   Link: conteudo/site.json → appDownloadUrl (ou /admin → Definições do site). */
(function () {
  var D = document, W = window, deferred = null;
  W.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; });
  var st = D.createElement('style');
  st.textContent = '#ecAppCard{display:flex;align-items:center;gap:9px;width:max-content;max-width:calc(100% - 24px);margin:2px auto 8px;padding:5px 12px 5px 6px;border-radius:999px;text-decoration:none;cursor:pointer;border:0;color:#fff;background:linear-gradient(110deg,#0A1850 0%,#0060E8 100%);box-shadow:0 3px 10px rgba(10,24,80,.28),inset 0 0 0 1px rgba(255,255,255,.12);position:relative;overflow:hidden;font-family:inherit;-webkit-tap-highlight-color:transparent}' +
    '#ecAppCard::after{content:"";position:absolute;right:0;top:0;bottom:0;width:4px;background:#E80018}' +
    '#ecAppCard:active{transform:scale(.97)}' +
    '#ecAppCard .ic{width:28px;height:28px;border-radius:50%;background:#fff;color:#E80018;display:flex;align-items:center;justify-content:center;flex:none}' +
    '#ecAppCard .tx{display:flex;flex-direction:column;line-height:1.1;text-align:left;padding-right:6px}' +
    '#ecAppCard b{font-size:12.5px;font-weight:800;letter-spacing:.1px}' +
    '#ecAppCard small{font-size:9.5px;opacity:.82;font-weight:600}';
  D.head.appendChild(st);
  function standalone() { return (W.matchMedia && W.matchMedia('(display-mode: standalone)').matches) || W.navigator.standalone; }
  function mount() {
    var strip = D.querySelector('#view-home .quick-strip');
    if (!strip || D.getElementById('ecAppCard') || standalone()) return;
    var url = String(W.EC_APP_URL || '').trim();
    var c = D.createElement(url ? 'a' : 'button');
    c.id = 'ecAppCard'; c.type = 'button';
    c.setAttribute('aria-label', 'Download aplicativo');
    if (url) { c.href = url; c.target = '_blank'; c.rel = 'noopener'; }
    else c.onclick = function () {
      if (deferred) { deferred.prompt(); deferred = null; }
      else if (typeof W.showToast === 'function') W.showToast('O aplicativo estará disponível em breve.');
    };
    c.innerHTML = '<span class="ic"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/></svg></span><span class="tx"><b>Download aplicativo</b><small>Enfermeiro Competente</small></span>';
    strip.insertAdjacentElement('afterend', c);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', mount); else mount();
})();
