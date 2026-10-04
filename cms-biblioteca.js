/* Biblioteca ligada ao CMS: lê conteudo.json (gerado no build) e mostra artigos, vídeos, PDFs, notícias e curiosidades. */
(function () {
  var T = { artigos: ['Artigos', '📰'], videos: ['Vídeos', '▶️'], documentos: ['Documentos', '📄'], noticias: ['Notícias', '🗞️'], curiosidades: ['Curiosidades', '💡'] };
  var all = [], cur = 'todos', shown = 10, box;
  var css = '#cmsLib{margin:6px 12px 14px}#cmsLib h3{margin:10px 2px 4px;font-size:16px;color:var(--azul-escuro)}.cl-chips{display:flex;gap:6px;overflow-x:auto;padding:4px 0 8px}.cl-chip{flex:none;border:1px solid var(--borda);background:#fff;color:var(--azul-escuro);border-radius:99px;padding:6px 12px;font-size:13px;font-weight:600;cursor:pointer}.cl-chip.on{background:var(--azul-escuro);color:#fff}.cl-card{background:#fff;border:1px solid var(--borda);border-left:4px solid var(--dourado);border-radius:12px;padding:10px;margin:8px 0}.cl-row{display:flex;gap:10px}.cl-row img{width:84px;height:64px;object-fit:cover;border-radius:8px;flex:none}.cl-t{font-weight:700;color:var(--azul-escuro);font-size:14.5px;line-height:1.3}.cl-s{font-size:12.5px;color:var(--texto-suave);margin-top:2px}.cl-m{font-size:11.5px;color:#7a8aa3;margin-top:3px}.cl-b{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.cl-b a,.cl-b button{border:0;background:var(--azul);color:#fff;border-radius:9px;padding:8px 13px;font-size:13px;font-weight:700;text-decoration:none;cursor:pointer}.cl-b .alt{background:#EDF4FE;color:var(--azul-escuro)}.cl-v{position:relative;padding-bottom:56.25%;height:0;margin-top:8px;border-radius:10px;overflow:hidden;background:#000}.cl-v iframe{position:absolute;inset:0;width:100%;height:100%;border:0}.cl-n{font-size:13px;color:var(--texto-suave);padding:8px 2px}';
  function e(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function d(s) { var x = new Date(s); return isNaN(x) ? '' : x.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' }); }
  function card(i) {
    var b = '';
    if (i.youtube) b += '<button type="button" data-yt="' + e(i.youtube) + '">▶ Ver aqui</button>';
    if (i.ficheiro) b += '<a href="' + e(i.ficheiro) + '" target="_blank" rel="noopener">Abrir PDF</a>';
    b += '<a class="' + (i.youtube || i.ficheiro ? 'alt' : '') + '" href="' + e(i.url) + '">' + (i.youtube || i.ficheiro ? 'Página' : 'Ler') + '</a>';
    return '<div class="cl-card"><div class="cl-row">' + (i.imagem ? '<img loading="lazy" alt="" src="' + e(i.imagem) + '">' : '') +
      '<div><div class="cl-t">' + e(i.titulo) + '</div>' + (i.resumo ? '<div class="cl-s">' + e(i.resumo) + '</div>' : '') +
      '<div class="cl-m">' + T[i.tipo][1] + ' ' + T[i.tipo][0].replace(/s$/, '') + ' · ' + d(i.data) + '</div></div></div><div class="cl-b">' + b + '</div></div>';
  }
  function draw() {
    var list = all.filter(function (i) { return cur === 'todos' || i.tipo === cur; });
    var chips = '<button type="button" class="cl-chip' + (cur === 'todos' ? ' on' : '') + '" data-t="todos">Tudo (' + all.length + ')</button>';
    Object.keys(T).forEach(function (k) {
      var n = all.filter(function (i) { return i.tipo === k; }).length;
      if (n) chips += '<button type="button" class="cl-chip' + (cur === k ? ' on' : '') + '" data-t="' + k + '">' + T[k][0] + ' (' + n + ')</button>';
    });
    box.innerHTML = '<h3>Novidades e conteúdos</h3><div class="cl-chips">' + chips + '</div>' + list.slice(0, shown).map(card).join('') +
      (list.length > shown ? '<div class="cl-b"><button type="button" class="alt" data-more="1">Ver mais</button></div>' : '');
  }
  function init() {
    var view = document.getElementById('view-biblioteca'); if (!view) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    box = document.createElement('div'); box.id = 'cmsLib';
    var anchor = view.querySelector('.search-mini'); view.insertBefore(box, anchor || view.lastElementChild);
    box.addEventListener('click', function (ev) {
      var t = ev.target.closest('[data-t],[data-yt],[data-more]'); if (!t) return;
      if (t.dataset.t) { cur = t.dataset.t; shown = 10; draw(); }
      else if (t.dataset.more) { shown += 10; draw(); }
      else {
        var c = t.closest('.cl-card'), v = c.querySelector('.cl-v');
        if (v) { v.remove(); t.textContent = '▶ Ver aqui'; return; }
        v = document.createElement('div'); v.className = 'cl-v';
        v.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + e(t.dataset.yt) + '?autoplay=1&rel=0" title="Vídeo" allow="autoplay;encrypted-media;picture-in-picture;fullscreen" allowfullscreen></iframe>';
        c.appendChild(v); t.textContent = '✕ Fechar';
      }
    });
    fetch('conteudo.json', { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
      all = j.itens || []; if (all.length) draw(); else box.innerHTML = '<div class="cl-n">Ainda não há conteúdos publicados.</div>';
    }).catch(function () { box.innerHTML = '<div class="cl-n">Novidades indisponíveis de momento (sem ligação).</div>'; });
    if (location.hash === '#biblioteca' && typeof showView === 'function') showView('biblioteca');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
