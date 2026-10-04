/* Enfermeiro Competente — leitor integrado: PDF (pdf.js), zoom, imprimir, baixar, partilhar,
   lupa de imagens e impressão da secção atual. Funciona online e na versão offline (ficheiro único).
   Impressão: usa o diálogo do próprio telemóvel/Chrome (window.print). Em app Android (WebView)
   usa a ponte opcional window.ECAndroid.print(titulo) — ver docs/ANDROID.md. */
(function () {
  'use strict';
  var D = document, W = window;
  var $ = function (s, r) { return (r || D).querySelector(s); };
  var toast = function (m) { if (typeof W.showToast === 'function') W.showToast(m); else alert(m); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var TITLES = { manual: 'Manual do Sistema', gastrite: 'Manual Gastrite Ulcerativa', lnme: 'Lista Nacional de Medicamentos Essenciais' };

  /* ---------- estilos ---------- */
  var st = D.createElement('style');
  st.textContent = [
    '.ec-ov{position:fixed;inset:0;z-index:100000;background:#0b1130;display:none;flex-direction:column;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#fff}',
    '.ec-ov.on{display:flex}',
    '.ec-top{display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 8px) 10px 8px;background:#0A1850;border-bottom:2px solid #E80018}',
    '.ec-top .t{flex:1;min-width:0;font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.ec-b{border:0;border-radius:9px;background:rgba(255,255,255,.14);color:#fff;font-size:14px;font-weight:700;min-width:38px;height:38px;padding:0 10px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:5px;-webkit-tap-highlight-color:transparent}',
    '.ec-b:active{transform:scale(.95);background:rgba(255,255,255,.28)}',
    '.ec-b.red{background:#E80018}.ec-b.blue{background:#0060E8}',
    '.ec-bar{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:6px;padding:6px 8px;background:#101a4a}',
    '.ec-bar input{width:52px;height:36px;border-radius:8px;border:0;text-align:center;font-size:14px;font-weight:700}',
    '.ec-bar .pg{font-size:13px;opacity:.85}',
    '.ec-sc{flex:1;overflow:auto;-webkit-overflow-scrolling:touch;background:#3a3f5c;position:relative;touch-action:pan-x pan-y}',
    '.ec-pages{position:relative;display:flex;flex-direction:column;align-items:center;gap:8px;padding:8px;width:max-content;min-width:100%;box-sizing:border-box;transform-origin:0 0}',
    '.ec-pg{background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.4);position:relative;flex:none}',
    '.ec-pg canvas{display:block;width:100%;height:100%}',
    '.ec-pg i{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#889;font:600 13px system-ui}',
    '.ec-msg{padding:28px 18px;text-align:center;font-size:14px;line-height:1.5}',
    '.ec-msg .ec-b{margin:6px 4px}',
    '.ec-dlg{position:fixed;inset:0;z-index:100001;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center;padding:18px}',
    '.ec-dlg.on{display:flex}',
    '.ec-dlg>div{background:#fff;color:#0A1850;border-radius:16px;padding:18px;max-width:340px;width:100%;font-family:system-ui,-apple-system,Arial,sans-serif}',
    '.ec-dlg h4{margin:0 0 12px;font-size:16px}',
    '.ec-dlg label{display:flex;align-items:center;gap:8px;margin:9px 0;font-size:14px}',
    '.ec-dlg input[type=number]{width:62px;height:34px;border:1px solid #D3DAE7;border-radius:8px;text-align:center;font-size:14px}',
    '.ec-dlg .row{display:flex;gap:8px;justify-content:flex-end;margin-top:14px}',
    '.ec-dlg .ec-b{color:#0A1850;background:#EEF1F6}.ec-dlg .ec-b.blue{background:#0060E8;color:#fff}',
    '.ec-lb-sc{flex:1;overflow:auto;background:#000;display:flex;touch-action:pan-x pan-y}',
    '.ec-lb-sc img{display:block;margin:auto;width:100%;max-width:none;height:auto;flex:none}',
    '.ec-actions{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:10px 12px}',
    '.ec-actions button{flex:1 1 44%;min-width:140px;border:0;border-radius:11px;padding:11px 10px;font-size:13px;font-weight:700;cursor:pointer;background:#0060E8;color:#fff}',
    '.ec-actions button.alt{background:#EEF1F6;color:#0A1850;border:1px solid #D3DAE7}',
    '.ec-actions button:active{transform:scale(.97)}',
    'body.ec-viewing #ec-ck{display:none!important}',
    '#ec-print-area{display:none}',
    '@media print{',
    '*{-webkit-print-color-adjust:exact;print-color-adjust:exact}',
    'body.ec-printing>*:not(#ec-print-area){display:none!important}',
    'body.ec-printing #ec-print-area{display:block!important}',
    '#ec-print-area img{display:block;width:100%;max-height:270mm;object-fit:contain;break-after:page;page-break-after:always}',
    '#ec-print-area img:last-child{break-after:auto;page-break-after:auto}',
    'body.ec-print-view .top-fixed,body.ec-print-view .bottom-fixed,body.ec-print-view .back-btn,body.ec-print-view .drawer-overlay,body.ec-print-view .brand-footer,body.ec-print-view .ec-actions,body.ec-print-view #ecAppCard,body.ec-print-view .ec-ov,body.ec-print-view .ec-dlg{display:none!important}',
    'body.ec-print-view .view:not(.active){display:none!important}',
    'body.ec-print-view .acc-body{max-height:none!important;overflow:visible!important}',
    'body.ec-print-view .view.active{padding:0!important}',
    '}'
  ].join('\n');
  D.head.appendChild(st);

  /* ---------- zoom por gestos (pinça + duplo toque), partilhado ---------- */
  function zoomer(sc, o) {
    var p0 = 0, z0 = 1, pin = false, last = 0, lx = 0, ly = 0, mv = false, tgt = null;
    var dist = function (e) { var a = e.touches[0], b = e.touches[1]; return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); };
    var ctr = function (e) { var r = sc.getBoundingClientRect(); return [(e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left, (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top]; };
    var pc = [0, 0], ps = 1;
    sc.addEventListener('touchstart', function (e) {
      if (e.touches.length === 2) { pin = true; p0 = dist(e); z0 = o.get(); ps = 1; pc = ctr(e); tgt = o.target(); mv = true; }
      else { mv = false; }
    }, { passive: true });
    sc.addEventListener('touchmove', function (e) {
      if (pin && e.touches.length === 2) {
        e.preventDefault();
        ps = clamp(z0 * dist(e) / p0, o.min, o.max) / z0;
        if (tgt) { tgt.style.transformOrigin = (pc[0] + sc.scrollLeft - tgt.offsetLeft) + 'px ' + (pc[1] + sc.scrollTop - tgt.offsetTop) + 'px'; tgt.style.transform = 'scale(' + ps + ')'; }
      } else mv = true;
    }, { passive: false });
    sc.addEventListener('touchend', function (e) {
      if (pin && e.touches.length < 2) {
        pin = false;
        if (tgt) { tgt.style.transform = ''; tgt.style.transformOrigin = ''; }
        if (Math.abs(ps - 1) > 0.02) o.set(clamp(z0 * ps, o.min, o.max), pc[0], pc[1]);
        return;
      }
      if (!mv && e.changedTouches.length === 1 && e.touches.length === 0) {
        var t = e.changedTouches[0], now = Date.now(), r = sc.getBoundingClientRect();
        if (now - last < 320 && Math.hypot(t.clientX - lx, t.clientY - ly) < 30) {
          o.set(o.get() < 1.5 ? 2.5 : 1, t.clientX - r.left, t.clientY - r.top); last = 0;
        } else { last = now; lx = t.clientX; ly = t.clientY; }
      }
    }, { passive: true });
  }

  /* ---------- pdf.js ---------- */
  var libP = null;
  function loadLib() {
    if (libP) return libP;
    var c = W.__ecPdfJs || {};
    var lib = c.lib || new URL('vendor/pdfjs/pdf.min.mjs', D.baseURI).href;
    var wk = c.worker || new URL('vendor/pdfjs/pdf.worker.min.mjs', D.baseURI).href;
    libP = import(lib).then(function (m) { m.GlobalWorkerOptions.workerSrc = wk; return m; });
    libP.catch(function () { libP = null; });
    return libP;
  }

  function sync() { D.body.classList.toggle('ec-viewing', !!D.querySelector('.ec-ov.on')); }
  var V = { doc: null, zoom: 1, fit: 600, ratio: 1.414, cur: 1, n: 0, url: '', name: '', title: '', hist: false, el: null, tick: 0 };

  function build() {
    if (V.el) return;
    var el = D.createElement('div'); el.className = 'ec-ov'; el.id = 'ec-pdf'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
    el.innerHTML =
      '<div class="ec-top"><button class="ec-b" id="ecpBack" aria-label="Fechar">‹ Voltar</button><div class="t" id="ecpT"></div>' +
      '<button class="ec-b" id="ecpDl" aria-label="Baixar" title="Baixar">⬇</button><button class="ec-b" id="ecpSh" aria-label="Partilhar" title="Partilhar">⤴</button><button class="ec-b blue" id="ecpPr" aria-label="Imprimir" title="Imprimir">🖨</button></div>' +
      '<div class="ec-bar"><button class="ec-b" id="ecpM" aria-label="Menos zoom">−</button><span class="pg" id="ecpZ">100%</span><button class="ec-b" id="ecpP" aria-label="Mais zoom">+</button>' +
      '<button class="ec-b" id="ecpF" title="Ajustar à largura">⤢</button><span class="pg">Pág.</span><input id="ecpI" type="number" min="1" inputmode="numeric" aria-label="Ir para a página"><span class="pg" id="ecpN">/ 0</span><button class="ec-b red" id="ecpG">Ir</button></div>' +
      '<div class="ec-sc" id="ecpS"><div class="ec-pages" id="ecpPages"></div></div>' +
      '<div class="ec-dlg" id="ecpD"><div><h4>Imprimir PDF</h4>' +
      '<label><input type="radio" name="ecpr" value="all" checked> Todas as páginas (<span id="ecpA">0</span>)</label>' +
      '<label><input type="radio" name="ecpr" value="cur"> Só a página atual (<span id="ecpC">1</span>)</label>' +
      '<label><input type="radio" name="ecpr" value="rng"> Intervalo: <input type="number" id="ecpF1" min="1" value="1"> a <input type="number" id="ecpF2" min="1" value="1"></label>' +
      '<div class="row"><button class="ec-b" id="ecpX">Cancelar</button><button class="ec-b blue" id="ecpOk">Imprimir</button></div></div></div>';
    D.body.appendChild(el); V.el = el;
    var g = function (i) { return D.getElementById(i); };
    V.sc = g('ecpS'); V.pg = g('ecpPages');
    g('ecpBack').onclick = function () { closePdf(); };
    g('ecpM').onclick = function () { zoomTo(V.zoom / 1.25); };
    g('ecpP').onclick = function () { zoomTo(V.zoom * 1.25); };
    g('ecpF').onclick = function () { zoomTo(1); };
    g('ecpG').onclick = function () { goPage(parseInt(g('ecpI').value, 10)); };
    g('ecpI').onkeydown = function (e) { if (e.key === 'Enter') goPage(parseInt(this.value, 10)); };
    g('ecpDl').onclick = function () { download(V.url, V.name); };
    g('ecpSh').onclick = function () { share(V.url, V.name, V.title, 'application/pdf'); };
    g('ecpPr').onclick = function () {
      g('ecpA').textContent = V.n; g('ecpC').textContent = V.cur; g('ecpF1').value = V.cur; g('ecpF2').value = Math.min(V.n, V.cur + 4);
      g('ecpD').classList.add('on');
    };
    g('ecpX').onclick = function () { g('ecpD').classList.remove('on'); };
    g('ecpOk').onclick = function () {
      var m = (D.querySelector('input[name=ecpr]:checked') || {}).value, a = 1, b = V.n;
      if (m === 'cur') a = b = V.cur;
      else if (m === 'rng') { a = clamp(parseInt(g('ecpF1').value, 10) || 1, 1, V.n); b = clamp(parseInt(g('ecpF2').value, 10) || a, a, V.n); }
      g('ecpD').classList.remove('on');
      printPdfPages(a, b);
    };
    var raf = 0;
    V.sc.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; refresh(); }); }, { passive: true });
    W.addEventListener('resize', function () { if (V.el.classList.contains('on') && V.doc) { V.fit = V.sc.clientWidth - 16; resize(); refresh(); } });
    zoomer(V.sc, {
      min: 0.5, max: 5, get: function () { return V.zoom; }, target: function () { return V.pg; },
      set: function (z, ax, ay) { zoomTo(z, ax, ay); }
    });
  }

  function msg(html) { V.pg.innerHTML = '<div class="ec-msg">' + html + '</div>'; }

  function openUrl(url, name, title, page) {
    build();
    V.url = url; V.name = name || 'documento.pdf'; V.title = title || V.name; V.doc = null; V.n = 0; V.zoom = 1;
    D.getElementById('ecpT').textContent = V.title;
    D.getElementById('ecpN').textContent = '/ 0';
    V.el.classList.add('on'); D.body.style.overflow = 'hidden'; sync();
    if (!V.hist) { try { history.pushState({ ecpdf: 1 }, ''); V.hist = true; } catch (e) {} }
    msg('A abrir documento…');
    loadLib().then(function (lib) { return lib.getDocument({ url: url, isEvalSupported: false }).promise; })
      .then(function (doc) { V.doc = doc; V.n = doc.numPages; return doc.getPage(1); })
      .then(function (p) {
        var v = p.getViewport({ scale: 1 }); V.ratio = v.height / v.width; V.base = v.width;
        D.getElementById('ecpN').textContent = '/ ' + V.n; D.getElementById('ecpI').max = V.n;
        V.pg.innerHTML = '';
        for (var i = 1; i <= V.n; i++) { var d = D.createElement('div'); d.className = 'ec-pg'; d.dataset.n = i; d.innerHTML = '<i>' + i + '</i>'; V.pg.appendChild(d); }
        V.fit = V.sc.clientWidth - 16; resize(); refresh();
        if (page > 1) goPage(page);
      })
      .catch(function (err) {
        if (W.console) console.warn('Leitor PDF:', err);
        msg('Não foi possível mostrar o documento aqui.<br><button class="ec-b blue" id="ecpAlt">Abrir no navegador</button><button class="ec-b" id="ecpAlt2">Baixar</button>');
        D.getElementById('ecpAlt').onclick = function () { W.open(url, '_blank'); };
        D.getElementById('ecpAlt2').onclick = function () { download(url, V.name); };
      });
  }

  function closePdf(fromPop) {
    if (!V.el || !V.el.classList.contains('on')) return;
    V.el.classList.remove('on'); D.body.style.overflow = ''; sync();
    V.tick++; V.pg.innerHTML = '';
    if (V.doc) { try { V.doc.destroy(); } catch (e) {} V.doc = null; }
    if (V.hist && !fromPop) { V.hist = false; try { history.back(); } catch (e) {} } else V.hist = false;
  }
  W.addEventListener('popstate', function () {
    if (V.el && V.el.classList.contains('on')) closePdf(true);
    var lb = D.getElementById('ec-lb'); if (lb && lb.classList.contains('on')) closeLb(true);
  });

  function resize() {
    var w = Math.round(V.fit * V.zoom), h = Math.round(w * V.ratio);
    var ps = V.pg.children;
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i]; p.style.width = w + 'px';
      if (!p.dataset.h) p.style.height = h + 'px'; else p.style.height = Math.round(w * parseFloat(p.dataset.h)) + 'px';
      if (p.dataset.z && p.dataset.z !== String(V.zoom + '|' + V.fit)) { var c = p.querySelector('canvas'); if (c) c.remove(); p.dataset.z = ''; }
    }
    D.getElementById('ecpZ').textContent = Math.round(V.zoom * 100) + '%';
  }

  function zoomTo(z, ax, ay) {
    if (!V.doc) return;
    z = clamp(z, 0.5, 5);
    var sc = V.sc; if (ax == null) { ax = sc.clientWidth / 2; ay = sc.clientHeight / 2; }
    var fx = (sc.scrollLeft + ax) / sc.scrollWidth, fy = (sc.scrollTop + ay) / sc.scrollHeight;
    V.zoom = z; resize();
    sc.scrollLeft = fx * sc.scrollWidth - ax; sc.scrollTop = fy * sc.scrollHeight - ay;
    refresh();
  }

  function goPage(n) {
    if (!V.doc || !n) return;
    n = clamp(n, 1, V.n); var p = V.pg.children[n - 1];
    if (p) { V.sc.scrollTop = p.offsetTop - 8; V.cur = n; D.getElementById('ecpI').value = n; refresh(); }
  }

  var busy = 0;
  function refresh() {
    if (!V.doc) return;
    var sc = V.sc, r = sc.getBoundingClientRect(), ps = V.pg.children, mid = r.top + r.height / 2, cur = V.cur;
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i], b = p.getBoundingClientRect();
      if (b.top <= mid && b.bottom >= mid) cur = i + 1;
      var near = b.bottom > r.top - r.height && b.top < r.bottom + r.height;
      if (near) { if (p.dataset.z !== V.zoom + '|' + V.fit && !p.dataset.busy) renderPage(p); }
      else if (b.bottom < r.top - r.height * 3 || b.top > r.bottom + r.height * 3) { var c = p.querySelector('canvas'); if (c) { c.remove(); p.dataset.z = ''; } }
    }
    if (cur !== V.cur || !D.getElementById('ecpI').value) { V.cur = cur; var inp = D.getElementById('ecpI'); if (D.activeElement !== inp) inp.value = cur; }
  }

  function renderPage(div) {
    var tick = V.tick, key = V.zoom + '|' + V.fit, n = +div.dataset.n;
    div.dataset.busy = '1';
    V.doc.getPage(n).then(function (page) {
      if (tick !== V.tick) return;
      var v1 = page.getViewport({ scale: 1 }), ratio = v1.height / v1.width;
      if (Math.abs(ratio - V.ratio) > 0.01) { div.dataset.h = ratio; div.style.height = Math.round(div.clientWidth * ratio) + 'px'; }
      var cssW = div.clientWidth, dpr = Math.min(W.devicePixelRatio || 1, 2.5), s = cssW / v1.width * dpr;
      var px = v1.width * s * v1.height * s; if (px > 16e6) s *= Math.sqrt(16e6 / px);
      var vp = page.getViewport({ scale: s }), cv = D.createElement('canvas');
      cv.width = Math.floor(vp.width); cv.height = Math.floor(vp.height);
      return page.render({ canvasContext: cv.getContext('2d'), viewport: vp, canvas: cv }).promise.then(function () {
        if (tick !== V.tick || key !== V.zoom + '|' + V.fit) return;
        var old = div.querySelector('canvas'); if (old) old.remove();
        var i = div.querySelector('i'); if (i) i.remove();
        div.appendChild(cv); div.dataset.z = key;
      });
    }).catch(function () {}).then(function () { delete div.dataset.busy; if (tick === V.tick) refresh(); });
  }

  /* ---------- baixar / partilhar / imprimir ---------- */
  function download(url, name) {
    var a = D.createElement('a'); a.href = url; a.download = name || 'ficheiro'; a.rel = 'noopener';
    D.body.appendChild(a); a.click(); a.remove();
  }
  function share(url, name, title, type) {
    if (!navigator.share) { toast('A partilha não está disponível neste dispositivo. Use Baixar.'); return; }
    fetch(url).then(function (r) { return r.blob(); }).then(function (b) {
      var f = new File([b], name, { type: type || b.type });
      if (navigator.canShare && navigator.canShare({ files: [f] })) return navigator.share({ files: [f], title: title });
      return navigator.share({ title: title, url: W.location.href.split('#')[0] });
    }).catch(function (e) { if (e && e.name !== 'AbortError') toast('Não foi possível partilhar.'); });
  }

  function runPrint(title, node) {
    var area = D.getElementById('ec-print-area'); if (area) area.remove();
    area = D.createElement('div'); area.id = 'ec-print-area'; area.appendChild(node); D.body.appendChild(area);
    D.body.classList.add('ec-printing');
    var done = function () { D.body.classList.remove('ec-printing'); var a = D.getElementById('ec-print-area'); if (a) a.remove(); W.removeEventListener('afterprint', done); };
    W.addEventListener('afterprint', done);
    setTimeout(done, 180000);
    setTimeout(function () {
      try {
        if (W.ECAndroid && typeof W.ECAndroid.print === 'function') W.ECAndroid.print(title || 'Documento');
        else W.print();
      } catch (e) { toast('Este dispositivo não permite imprimir daqui. Use Baixar e imprima o ficheiro.'); done(); }
    }, 250);
  }

  function printPdfPages(a, b) {
    if (!V.doc) return;
    var tick = V.tick, frag = D.createDocumentFragment(), total = b - a + 1;
    msg0('A preparar páginas… 0/' + total);
    var chain = Promise.resolve();
    for (var n = a; n <= b; n++) (function (n) {
      chain = chain.then(function () {
        if (tick !== V.tick) throw 0;
        return V.doc.getPage(n).then(function (page) {
          var v1 = page.getViewport({ scale: 1 }), s = Math.min(1500 / v1.width, 2.2), vp = page.getViewport({ scale: s });
          var cv = D.createElement('canvas'); cv.width = Math.floor(vp.width); cv.height = Math.floor(vp.height);
          return page.render({ canvasContext: cv.getContext('2d'), viewport: vp, canvas: cv }).promise.then(function () {
            var im = new Image(); im.src = cv.toDataURL('image/jpeg', 0.85); frag.appendChild(im);
            cv.width = cv.height = 0; msg0('A preparar páginas… ' + (n - a + 1) + '/' + total);
          });
        });
      });
    })(n);
    chain.then(function () { msg0(''); var w = D.createElement('div'); w.appendChild(frag); runPrint(V.title, w); })
      .catch(function () { msg0(''); });
  }
  function msg0(t) {
    var el = D.getElementById('ecpProg');
    if (!t) { if (el) el.remove(); return; }
    if (!el) { el = D.createElement('div'); el.id = 'ecpProg'; el.style.cssText = 'position:absolute;left:50%;top:90px;transform:translateX(-50%);background:#0A1850;color:#fff;padding:10px 16px;border-radius:12px;z-index:5;font:700 13px system-ui;box-shadow:0 4px 14px rgba(0,0,0,.4)'; V.el.appendChild(el); }
    el.textContent = t;
  }

  /* ---------- lupa de imagens ---------- */
  var L = { z: 1, src: '', name: '', hist: false };
  function buildLb() {
    if (D.getElementById('ec-lb')) return;
    var el = D.createElement('div'); el.className = 'ec-ov'; el.id = 'ec-lb'; el.style.zIndex = 100002;
    el.innerHTML =
      '<div class="ec-top"><button class="ec-b" id="eclC">‹ Voltar</button><div class="t" id="eclT"></div>' +
      '<button class="ec-b" id="eclD" title="Baixar">⬇</button><button class="ec-b" id="eclS" title="Partilhar">⤴</button><button class="ec-b blue" id="eclP" title="Imprimir">🖨</button></div>' +
      '<div class="ec-bar"><button class="ec-b" id="eclM" aria-label="Menos zoom">−</button><span class="pg" id="eclZ">100%</span><button class="ec-b" id="eclA" aria-label="Mais zoom">+</button><button class="ec-b" id="eclF" title="Ajustar">⤢</button></div>' +
      '<div class="ec-lb-sc" id="eclSc"><img id="eclI" alt=""></div>';
    D.body.appendChild(el);
    var g = function (i) { return D.getElementById(i); };
    g('eclC').onclick = function () { closeLb(); };
    g('eclM').onclick = function () { lbZoom(L.z / 1.25); };
    g('eclA').onclick = function () { lbZoom(L.z * 1.25); };
    g('eclF').onclick = function () { lbZoom(1); };
    g('eclD').onclick = function () { download(L.src, L.name); };
    g('eclS').onclick = function () { share(L.src, L.name, L.title, ''); };
    g('eclP').onclick = function () { var im = new Image(); im.src = L.src; var w = D.createElement('div'); w.appendChild(im); runPrint(L.title, w); };
    zoomer(g('eclSc'), { min: 1, max: 6, get: function () { return L.z; }, target: function () { return null; }, set: function (z, ax, ay) { lbZoom(z, ax, ay); } });
  }
  function lbZoom(z, ax, ay) {
    z = clamp(z, 1, 6); var sc = D.getElementById('eclSc'), im = D.getElementById('eclI');
    if (ax == null) { ax = sc.clientWidth / 2; ay = sc.clientHeight / 2; }
    var fx = (sc.scrollLeft + ax) / sc.scrollWidth, fy = (sc.scrollTop + ay) / sc.scrollHeight;
    L.z = z; im.style.width = (z * 100) + '%'; D.getElementById('eclZ').textContent = Math.round(z * 100) + '%';
    sc.scrollLeft = fx * sc.scrollWidth - ax; sc.scrollTop = fy * sc.scrollHeight - ay;
  }
  function closeLb(fromPop) {
    var el = D.getElementById('ec-lb'); if (!el || !el.classList.contains('on')) return;
    el.classList.remove('on'); sync(); if (!(V.el && V.el.classList.contains('on'))) D.body.style.overflow = '';
    if (L.hist && !fromPop) { L.hist = false; try { history.back(); } catch (e) {} } else L.hist = false;
  }
  W.openLightbox = function (src, alt, filename) {
    try { var t = W.event && W.event.target; if (t && t.tagName === 'IMG') src = t.currentSrc || t.src; } catch (e) {}
    if (!src) return;
    buildLb();
    L.src = src; L.title = alt || 'Imagem';
    var ext = /^data:image\/(\w+)/.exec(src); ext = ext ? ext[1] : ((/\.(\w{3,4})(\?|$)/.exec(src) || [])[1] || 'jpg');
    L.name = (filename && /\.\w+$/.test(filename) && !/^img-/.test(filename) ? filename : (alt || 'imagem').replace(/[^\w\u00C0-\u00FF-]+/g, '-')) ; if (!/\.\w{3,4}$/.test(L.name)) L.name += '.' + ext;
    D.getElementById('eclT').textContent = L.title; D.getElementById('eclI').src = src;
    D.getElementById('ec-lb').classList.add('on'); sync(); D.body.style.overflow = 'hidden'; lbZoom(1);
    D.getElementById('eclSc').scrollTop = 0; D.getElementById('eclSc').scrollLeft = 0;
    if (!L.hist) { try { history.pushState({ eclb: 1 }, ''); L.hist = true; } catch (e) {} }
  };
  W.closeLightbox = function () { closeLb(); };

  /* ---------- API pública (usada pelos botões da app) ---------- */
  function entry(id) { return (W.PDF_LIBRARY || {})[id]; }
  W.ecOpenPdf = function (id, page) {
    var e = entry(id); if (!e) { toast('Documento indisponível de momento.'); return; }
    openUrl(e.url, e.filename || id + '.pdf', TITLES[id] || e.filename || 'Documento PDF', page || 1);
  };
  W.ecOpenPdfUrl = function (url, title) { openUrl(url, (title || 'documento').replace(/[^\w\u00C0-\u00FF-]+/g, '-') + '.pdf', title || 'Documento PDF', 1); };
  W.ecPdfPrint = function (id) {
    W.ecOpenPdf(id, 1);
    var t = setInterval(function () { if (V.doc) { clearInterval(t); var b = D.getElementById('ecpPr'); if (b) b.click(); } }, 150);
    setTimeout(function () { clearInterval(t); }, 20000);
  };
  W.ecPdfDownload = function (id) { var e = entry(id); if (e) download(e.url, e.filename || id + '.pdf'); };
  W.ecAccAll = function (viewId, btn) {
    var v = D.getElementById(viewId); if (!v) return;
    var open = !(btn && btn.dataset.open === '1');
    v.querySelectorAll('.acc').forEach(function (a) { a.classList.toggle('open', open); });
    if (btn) { btn.dataset.open = open ? '1' : ''; btn.textContent = open ? '▴ Fechar todas as classes' : '▾ Abrir todas as classes'; }
  };
  W.ecPrintSection = function () {
    try { if (typeof W.closeMenu === 'function') W.closeMenu(); } catch (e) {}
    var v = $('.view.active'); if (!v) return;
    var opened = [];
    v.querySelectorAll('.acc').forEach(function (a) { if (!a.classList.contains('open')) { a.classList.add('open'); opened.push(a); } });
    D.body.classList.add('ec-print-view');
    var done = function () { D.body.classList.remove('ec-print-view'); opened.forEach(function (a) { a.classList.remove('open'); }); W.removeEventListener('afterprint', done); };
    W.addEventListener('afterprint', done); setTimeout(done, 180000);
    setTimeout(function () {
      try { if (W.ECAndroid && typeof W.ECAndroid.print === 'function') W.ECAndroid.print(document.title); else W.print(); }
      catch (e) { toast('Este dispositivo não permite imprimir daqui.'); done(); }
    }, 400);
  };

  /* Funções antigas da app passam a usar o leitor integrado (as páginas de PDF em <iframe> não abrem no Android) */
  W.openLibraryPdf = function (id) { W.ecOpenPdf(id, 1); };
  W.openLibraryPdfAtPage = function (id, page) { W.ecOpenPdf(id, page || 1); };
  W.openLibraryPdfNewTab = function (id) { W.ecOpenPdf(id, 1); };
  W.openGastriteViewer = function () { W.ecOpenPdf('gastrite', 1); };
  W.downloadGastrite = function () { W.ecPdfDownload('gastrite'); };

  /* Ligações «Abrir PDF» da Biblioteca e das páginas públicas abrem no leitor */
  D.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]'); if (!a || a.hasAttribute('download')) return;
    var h = a.getAttribute('href') || '', t = (a.textContent || '').trim();
    if (/\.pdf($|[?#])/i.test(h) || (/^blob:/.test(a.href) && /^Abrir PDF/i.test(t))) {
      e.preventDefault(); W.ecOpenPdfUrl(a.href, a.getAttribute('title') || (a.closest('.cl-item,article,.card') || {}).title || 'Documento PDF');
    }
  }, true);

  /* Cada iframe de PDF das páginas é substituído por botão do leitor (feito por quem os criar via ecOpenPdfUrl) */
})();
