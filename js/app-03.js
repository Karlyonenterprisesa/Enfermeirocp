// === core.js ===
// ===== core.js — utilitários e comportamento partilhados por todas as páginas =====

function showView(name){
  const target = document.getElementById('view-' + name);
  if(target){
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    target.classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.nav === name));
    window.scrollTo({top:0, behavior:'instant' in window ? 'instant' : 'auto'});
  } else {
    showToast('Secção indisponível de momento.'); if(name !== 'home') showView('home');
  }
}

// O cabeçalho (topo) permanece fixo; só o banner se oculta/mostra (ver script do banner).

// ===== Lightbox de imagens: zoom + download (injectado uma vez em cada página) =====
(function(){
  function ensureLightbox(){
    if(document.getElementById('imgLightbox')) return;
    var el = document.createElement('div');
    el.id = 'imgLightbox';
    el.className = 'lightbox-overlay';
    el.innerHTML =
      '<div class="lightbox-box">' +
        '<button class="lightbox-close" aria-label="Fechar" onclick="closeLightbox()">✕</button>' +
        '<div class="lightbox-imgwrap" id="lightboxImgWrap">' +
          '<img id="lightboxImg" src="" alt="">' +
        '</div>' +
        '<div class="lightbox-actions">' +
          '<span class="lightbox-hint">Toque na imagem para ampliar</span>' +
          '<a id="lightboxDownload" class="lightbox-download" download>⬇ Descarregar</a>' +
        '</div>' +
      '</div>';
    el.addEventListener('click', function(e){ if(e.target === el) closeLightbox(); });
    document.body.appendChild(el);
    document.getElementById('lightboxImg').addEventListener('click', function(){
      this.classList.toggle('zoomed');
    });
  }
  window.openLightbox = function(src, alt, filename){
    ensureLightbox();
    try{ var _ev=window.event, _t=_ev&&_ev.target; if(_t&&_t.tagName==='IMG'&&/^data:/.test(_t.src)) src=_t.src; }catch(e){}
    var img = document.getElementById('lightboxImg');
    img.src = src; img.alt = alt || '';
    img.classList.remove('zoomed');
    document.getElementById('lightboxImgWrap').scrollTop = 0;
    document.getElementById('lightboxImgWrap').scrollLeft = 0;
    var dl = document.getElementById('lightboxDownload');
    dl.href = src; dl.setAttribute('download', filename || (alt || 'imagem').replace(/\s+/g,'-') + (/^data:image\/webp/.test(src)?'.webp':'.jpg'));
    document.getElementById('imgLightbox').classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  window.closeLightbox = function(){
    var lb = document.getElementById('imgLightbox');
    if(lb) lb.classList.remove('open');
    document.body.style.overflow = '';
  };
})();

// Códigos NANDA-I: ver CODES_2024 (todos os 277 diagnósticos têm código).


// ===== Ocultar imagens de ferramentas/procedimentos até o utilizador pedir =====
// Todas as imagens marcadas com a classe "zoomable-img" (pulsos, sinais vitais,
// procedimentos, escalas, etc.) começam ocultas; só aparecem depois de o
// utilizador clicar no botão "Visualizar imagem".
function initImageReveal(){
  document.querySelectorAll('img.zoomable-img:not(.img-hide-processed)').forEach(function(img){
    img.classList.add('img-hide-processed');
    // Na página Início (Galeria de Apoio, etc.) as imagens permanecem sempre
    // visíveis — o botão "Visualizar imagem" só se aplica às restantes secções.
    if (img.closest('#view-home')) return;
    img.style.display = 'none';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'img-reveal-btn';
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg> Visualizar imagem';
    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'img-close-btn';
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="13" height="13"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Fechar imagem';
    closeBtn.style.display = 'none';
    btn.addEventListener('click', function(){
      img.style.display = 'block';
      btn.style.display = 'none';
      closeBtn.style.display = 'flex';
    });
    closeBtn.addEventListener('click', function(){
      img.style.display = 'none';
      closeBtn.style.display = 'none';
      btn.style.display = 'flex';
    });
    img.parentNode.insertBefore(btn, img);
    img.parentNode.insertBefore(closeBtn, img.nextSibling);
  });
}
window.addEventListener('load', initImageReveal);

// ===== Menu lateral =====
function openMenu(){ document.getElementById('drawerOverlay').classList.add('open'); }
function closeMenu(){ document.getElementById('drawerOverlay').classList.remove('open'); }

// ===== Pesquisa global (Início) =====
function _norm(t){return (t||'').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
var GS_VIEWS=[['diagnosticos','Diagnósticos de Enfermagem'],['avaliacao','Avaliação e Exame Físico'],['procedimentos','Procedimentos'],['urgencia','Urgência e Emergência'],['escalas','Escalas Clínicas'],['exames','Exames Laboratoriais'],['medicamentos','Medicamentos'],['casos-clinicos','Casos Clínicos'],['glossario','Termos Médicos'],['biblioteca','Biblioteca']];
function runGlobalSearch(){
  var inp=document.getElementById('searchInputGlobal');
  var term=inp.value.trim(); if(!term) return;
  var q=_norm(term);
  var box=document.getElementById('globalSearchResults');
  if(!box){
    box=document.createElement('div'); box.id='globalSearchResults'; box.className='gs-results';
    var sb=inp.closest('.searchbar'); sb.parentNode.insertBefore(box, sb.nextSibling);
  }
  box.dataset.q=term; box.innerHTML='';
  var total=0;
  GS_VIEWS.forEach(function(v){
    var n=0;
    if(v[0]==='diagnosticos'){
      if(typeof DATA_2024!=='undefined'){
        DATA_2024.forEach(function(d){ d.classes.forEach(function(c){ c.diagnosticos.forEach(function(x){ if(_norm(x).indexOf(q)>-1) n++; }); }); });
      }
    } else {
      var el=document.getElementById('view-'+v[0]); if(!el) return;
      el.querySelectorAll('.acc').forEach(function(a){ if(_norm(a.textContent).indexOf(q)>-1) n++; });
    }
    if(!n) return;
    total+=n;
    var b=document.createElement('button'); b.type='button'; b.className='gs-hit';
    b.innerHTML='<span></span><b></b>'; b.firstChild.textContent=v[1]; b.lastChild.textContent=n;
    b.addEventListener('click',function(){ openSearchHit(v[0]); });
    box.appendChild(b);
  });
  if(!total){
    var e=document.createElement('div'); e.className='gs-empty'; e.textContent='Sem resultados para «'+term+'». Tente outra palavra.';
    box.appendChild(e);
  }
}
function openSearchHit(id){
  var box=document.getElementById('globalSearchResults'); var term=box?box.dataset.q:'';
  showView(id);
  if(id==='diagnosticos'){
    var si=document.getElementById('searchInput');
    if(si){ si.value=term; si.dispatchEvent(new Event('input')); }
  } else {
    var mi=document.querySelector('#view-'+id+' .search-mini input');
    if(mi) mi.value=term;
    filterAcc(id, term);
    var first=document.querySelector('#view-'+id+' .acc:not([style*="display: none"])');
    if(first) first.classList.add('open');
  }
}
(function(){
  document.addEventListener('DOMContentLoaded',function(){
    var inp=document.getElementById('searchInputGlobal'), clr=document.getElementById('clearBtnGlobal'); if(!inp) return;
    inp.addEventListener('input',function(){
      if(clr) clr.classList.toggle('show', !!inp.value);
      if(!inp.value){ var b=document.getElementById('globalSearchResults'); if(b) b.remove(); }
    });
    if(clr) clr.addEventListener('click',function(){ var b=document.getElementById('globalSearchResults'); if(b) b.remove(); });
  });
})();

// ===== Placeholder / Acordeão genérico =====
function buildPlaceholderView(id, title, desc, chips, img){
  if(document.getElementById('view-' + id)) return; // evita views duplicadas (ex.: biblioteca, especialidades)
  const div = document.createElement('div');
  div.className = 'view';
  div.id = 'view-' + id;
  div.innerHTML =
    '<div style="padding:10px 12px 0;">' +
      '<button class="back-btn" style="background:rgba(11,31,102,.08);color:var(--azul-escuro);" onclick="showView(\'home\')">‹ Início</button>' +
    '</div>' +
    '<div class="placeholder">' +
      (img ? '<img src="' + img + '" style="width:100%;max-width:240px;border-radius:12px;margin-bottom:16px;" alt="' + title + '">' : '<div class="pico">🚧</div>') +
      '<h3>' + title + '</h3>' +
      '<p>' + desc + '</p>' +
      (chips ? '<div class="chip-row">' + chips.map(c => '<span class="chip">' + c + '</span>').join('') + '</div>' : '') +
    '</div>';
  document.getElementById('app').insertBefore(div, document.querySelector('.bottom-fixed'));
}
function buildAccordionView(id, title, intro, items){
  const div = document.createElement('div');
  div.className = 'view';
  div.id = 'view-' + id;
  const itemsHtml = items.map((it, idx) => `
    <div class="acc" id="${id}-acc-${idx}">
      <div class="acc-head" onclick="this.parentElement.classList.toggle('open')">
        <div class="a-icon" style="background:${it.bg};color:${it.fg};">${it.icon}</div>
        <div class="a-txt"><div class="a-title">${it.title}</div><div class="a-sub">${it.sub}</div></div>
        <div class="a-chev">▾</div>
      </div>
      <div class="acc-body"><div class="acc-in">${it.body}</div></div>
    </div>`).join('');
  div.innerHTML = `
    <div style="padding:10px 12px 0;">
      <button class="back-btn" style="background:rgba(11,31,102,.08);color:var(--azul-escuro);" onclick="showView('ferramentas')">‹ Ferramentas</button>
    </div>
    <div class="section-title" style="margin-top:14px;">${title}</div>
    <div style="margin:0 12px 4px;font-size:12px;color:var(--texto-suave);">${intro}</div>
    <div class="search-mini">
      <input type="text" placeholder="Pesquisar em ${title.toLowerCase()}..." oninput="filterAcc('${id}', this.value)">
    </div>
    ${itemsHtml}
    <footer style="margin:16px 8px 6px;">Conteúdo de apoio à prática clínica. Utilize sempre em conjunto com protocolos institucionais e julgamento profissional.</footer>
  `;
  document.getElementById('app').insertBefore(div, document.querySelector('.bottom-fixed'));
}
function filterAcc(id, term){
  term = (term||'').trim().toLowerCase();
  document.querySelectorAll('#view-' + id + ' .acc').forEach(acc=>{
    const text = _norm(acc.textContent);
    acc.style.display = (!term || text.includes(_norm(term))) ? '' : 'none';
  });
}

const ICON_SCALE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M4 19h16"/><rect x="6" y="10" width="3" height="9"/><rect x="11" y="6" width="3" height="13"/><rect x="16" y="13" width="3" height="6"/></svg>';
const ICON_PROC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M12 2v6M12 16v6M4.9 4.9l4.2 4.2M14.9 14.9l4.2 4.2M2 12h6M16 12h6M4.9 19.1l4.2-4.2M14.9 9.1l4.2-4.2"/></svg>';
const ICON_EXAM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M9 2v6L4 20a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3L15 8V2"/><line x1="9" y1="2" x2="15" y2="2"/></svg>';
const ICON_ALERT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M4 15l5-10 3 6 2-3 6 7"/><circle cx="12" cy="12" r="10"/></svg>';

// ================= ESCALAS CLÍNICAS =================

// ===== Utilitários de texto/pesquisa =====
function escapeAttr(s){
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function classify(nome){
  if(/^Risco de/i.test(nome)) return 'risco';
  if(/^Disposição para/i.test(nome)) return 'disposicao';
  return 'atual';
}
function highlight(text, term){
  if(!term) return text;
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if(idx===-1) return text;
  return text.slice(0,idx) + '<mark>' + text.slice(idx, idx+term.length) + '</mark>' + text.slice(idx+term.length);
}
function normalize(s){
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
}

// Fábrica: cria uma instância independente do navegador de domínios/classes/diagnósticos
// (usada na secção "Diagnósticos de Enfermagem" — os domínios da Taxonomia NANDA-I
// correspondem às Necessidades Humanas Básicas, explicado directamente nessa secção)


// === pdf-viewer.js ===
// ===== pdf-viewer.js v2.5 — Visualizador PDF/Word =====

// ─── 1. CSS GLOBAL ────────────────────────────────────────────────────────────
(function injectStyles(){
  if(document.getElementById('ec-pv-styles')) return;
  var s = document.createElement('style');
  s.id = 'ec-pv-styles';
  s.textContent = `
.acc-in h4 {
  text-align: center;
  font-weight: 800;
  font-size: 12.5px;
  color: var(--azul-escuro);
  text-transform: uppercase;
  letter-spacing: .4px;
  margin: 14px 0 6px;
}
.section-title {
  text-align: center;
  font-weight: 800;
}
/* Contorno + relevo nos títulos das secções (mesmo contorno dos cards, ex.: Manual do Sistema) */
.section-title {
  background: #fff;
  border: 1px solid var(--borda);
  border-radius: 12px;
  padding: 10px 14px;
  box-shadow: 0 3px 8px rgba(11,31,102,.14), 0 1px 2px rgba(11,31,102,.10), inset 0 1px 0 #fff;
}
.a-title { font-weight: 800; }
.word-viewer-area {
  background: #fff;
  border: 1px solid var(--borda);
  border-radius: 12px;
  padding: 16px;
  margin-top: 14px;
  font-size: 13px;
  line-height: 1.7;
  color: #1a1a1a;
  max-height: 520px;
  overflow-y: auto;
  display: none;
}
.word-viewer-area h1,
.word-viewer-area h2,
.word-viewer-area h3 {
  text-align: center;
  font-weight: 800;
  color: var(--azul-escuro);
  margin: 14px 0 8px;
}
.word-viewer-area table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  margin: 10px 0;
}
.word-viewer-area td,
.word-viewer-area th {
  border: 1px solid #ddd;
  padding: 6px 8px;
}
.word-viewer-area th {
  background: #EEF1F6;
  font-weight: 700;
  text-align: center;
}
.viewer-close-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fbe4e8;
  color: #E80018;
  border: 1px solid #f6c9ce;
  border-radius: 8px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
}
.word-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  font-size: 12.5px;
  color: var(--texto-suave);
}
`;
  document.head.appendChild(s);
})();

// ─── 2. BIBLIOTECA DE PDFs ────────────────────────────────────────────────────
window.PDF_LIBRARY = window.PDF_LIBRARY || {};

function registerLibraryPdf(id, base64Data, filename){
  window.PDF_LIBRARY[id] = { url: base64Data, data: null, filename: filename };
}

function _pdfB64toBlob(b64Data, contentType){
  var sliceSize = 512;
  var byteCharacters = atob(b64Data);
  var byteArrays = [];
  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize);
    var byteNumbers = new Array(slice.length);
    for (var i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);
    byteArrays.push(new Uint8Array(byteNumbers));
  }
  return new Blob(byteArrays, { type: contentType || 'application/pdf' });
}

function openLibraryPdf(id){
  var entry = window.PDF_LIBRARY[id];
  var area  = document.getElementById('pdf-area-' + id);
  if (!entry || !area) return;
  if (area.style.display === 'block') { area.style.display = 'none'; return; }
  var iframe = document.getElementById('pdf-iframe-' + id);
  if (iframe && (!iframe.src || iframe.src === 'about:blank')) {
    iframe.src = entry.url;
  }
  area.style.display = 'block';
  area.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function openLibraryPdfAtPage(id, page){
  var entry  = window.PDF_LIBRARY[id];
  var area   = document.getElementById('pdf-area-' + id);
  var iframe = document.getElementById('pdf-iframe-' + id);
  if (!entry || !area || !iframe) return;
  iframe.src = entry.url + '#page=' + page;
  area.style.display = 'block';
  area.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function downloadLibraryPdf(id){
  var entry = window.PDF_LIBRARY[id];
  if (!entry) return;
  var a = document.createElement('a');
  a.href = entry.url; a.download = entry.filename || (id + '.pdf');
  document.body.appendChild(a); a.click(); a.remove();
}

function openLibraryPdfNewTab(id){
  var entry = window.PDF_LIBRARY[id];
  if (entry) window.open(entry.url, '_blank', 'noopener');
}

function libraryPdfButtons(id){
  return '<div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">' +
    '<button onclick="openLibraryPdf(\'' + id + '\')" style="background:#0060E8;color:#fff;border:none;border-radius:10px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16"><path d="M14 3v4a1 1 0 001 1h4"/><path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"/></svg>' +
      'Visualizar PDF' +
    '</button>' +
    '<button onclick="downloadLibraryPdf(\'' + id + '\')" style="background:#EEF1F6;color:#000000;border:1px solid #000000;border-radius:10px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
      'Baixar PDF' +
    '</button>' +
  '</div>';
}

function libraryPdfViewerBlock(id, title){
  return '<div id="pdf-area-' + id + '" style="display:none;margin-top:14px;border-radius:12px;overflow:hidden;border:1px solid var(--borda);">' +
    '<div style="display:flex;justify-content:space-between;gap:8px;padding:6px 10px;background:#F5F6FA;border-bottom:1px solid var(--borda);">' +
      '<button class="viewer-close-btn" onclick="openLibraryPdfNewTab(\'' + id + '\')">↗ Abrir noutra janela</button>' +
      '<button class="viewer-close-btn" onclick="document.getElementById(\'pdf-area-' + id + '\').style.display=\'none\'">✕ Fechar Visualizador</button>' +
    '</div>' +
    '<iframe id="pdf-iframe-' + id + '" style="width:100%;height:520px;border:none;" title="' + (title || 'Documento PDF') + '"></iframe>' +
  '</div>';
}

// ─── 3. BIBLIOTECA DE WORD (.docx) ───────────────────────────────────────────
window.WORD_LIBRARY = window.WORD_LIBRARY || {};

function registerLibraryWord(id, base64Data, filename){
  window.WORD_LIBRARY[id] = { data: base64Data, filename: filename };
}

function _loadMammoth(callback){
  if(window.mammoth){ callback(); return; }
  var s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js';
  s.onload = callback;
  s.onerror = function(){
    showToast('Não foi possível carregar o visualizador de Word. Verifique a ligação à internet e tente novamente.');
  };
  document.head.appendChild(s);
}

function openLibraryWord(id){
  var entry = window.WORD_LIBRARY[id];
  var area  = document.getElementById('word-area-' + id);
  if (!entry || !area) return;
  if (area.style.display === 'block') { area.style.display = 'none'; return; }
  if (area.dataset.loaded === '1') {
    area.style.display = 'block';
    area.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  area.style.display = 'block';
  area.innerHTML = '<div class="word-loading"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="20" height="20"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> A carregar documento…</div>';
  area.scrollIntoView({ behavior: 'smooth', block: 'start' });
  _loadMammoth(function(){
    try {
      var binary = atob(entry.data);
      var bytes  = new Uint8Array(binary.length);
      for(var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      mammoth.convertToHtml({ arrayBuffer: bytes.buffer }).then(function(result){
        var closeBtn = '<div style="display:flex;justify-content:flex-end;padding:6px 0 10px;">' +
          '<button class="viewer-close-btn" onclick="document.getElementById(\'word-area-' + id + '\').style.display=\'none\'">✕ Fechar Visualizador</button>' +
          '</div>';
        area.innerHTML = closeBtn + result.value;
        area.dataset.loaded = '1';
        area.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }).catch(function(err){
        area.innerHTML = '<div style="padding:16px;color:#E80018;font-size:12.5px;">Erro ao converter documento: ' + err.message + '</div>';
      });
    } catch(e) {
      area.innerHTML = '<div style="padding:16px;color:#E80018;font-size:12.5px;">Erro: ' + e.message + '</div>';
    }
  });
}

function downloadLibraryWord(id){
  var entry = window.WORD_LIBRARY[id];
  if (!entry) return;
  var binary = atob(entry.data);
  var bytes  = new Uint8Array(binary.length);
  for(var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  var blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href = url;
  a.download = entry.filename || (id + '.docx');
  a.click();
  setTimeout(function(){ URL.revokeObjectURL(url); }, 5000);
}

function libraryWordButtons(id){
  return '<div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">' +
    '<button onclick="openLibraryWord(\'' + id + '\')" style="background:#246E29;color:#fff;border:none;border-radius:10px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16"><path d="M14 3v4a1 1 0 001 1h4"/><path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"/><path d="M9 13h6M9 17h4"/></svg>' +
      'Visualizar Word' +
    '</button>' +
    '<button onclick="downloadLibraryWord(\'' + id + '\')" style="background:#EEF1F6;color:#000000;border:1px solid #000000;border-radius:10px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
      'Baixar Word (.docx)' +
    '</button>' +
  '</div>';
}

function libraryWordViewerBlock(id, title){
  return '<div id="word-area-' + id + '" class="word-viewer-area" title="' + (title || 'Documento Word') + '"></div>';
}

// ─── 4. REGISTOS AUTOMÁTICOS ──────────────────────────────────────────────────
(function registerExistingGastrite(){
  function tryRegister(){
    if (typeof window.GASTRITE_PDF_B64 !== 'undefined')
      registerLibraryPdf('gastrite', window.GASTRITE_PDF_B64, 'Manual_Gastrite_Ulcerativa_Karlyon_2026.pdf');
  }
  tryRegister();
  window.addEventListener('load', tryRegister);
})();

(function registerSystemManual(){
  function tryRegister(){
    if (typeof window.MANUAL_PDF_B64 !== 'undefined')
      registerLibraryPdf('manual', window.MANUAL_PDF_B64, 'Enfermeiro_Competente_Manual.pdf');
  }
  tryRegister();
  window.addEventListener('load', tryRegister);
})();


// === data-diagnosticos.js ===
// Dados NANDA-I (Diagnósticos) — usados apenas em diagnosticos.html

const CODES_2021 = {
  "Diminuição do envolvimento de atividades diversivas": "00097",
  "Prontidão para melhorar a alfabetização em saúde": "00262",
  "Estilo de vida sedentário": "00168",
  "Risco de tentativa de fuga": "00290",
  "Síndrome do idoso frágil": "00257",
  "Risco para síndrome de idoso frágil": "00231",
  "Prontidão para envolvimento aprimorado de exercícios": "00307",
  "Saúde comunitária deficiente": "00215",
  "Comportamento de saúde sujeito a risco": "00188",
  "Comportamentos ineficazes de manutenção da saúde": "00292",
  "Autogestão ineficaz da saúde": "00276",
  "Prontidão para autogestão aprimorada da saúde": "00293",
  "Autogestão ineficaz da saúde da família": "00294",
  "Comportamentos de manutenção doméstica ineficazes": "00300",
  "Risco de comportamentos de manutenção doméstica ineficazes": "00308",
  "Prontidão para comportamentos de manutenção doméstica aprimorados": "00309",
  "Proteção ineficaz": "00043"
};

const DATA_2021 = [{"dominio": "Domínio 1. Promoção da saúde", "classes": [{"classe": "Classe 1. Conscientização sobre saúde", "diagnosticos": ["Diminuição do envolvimento de atividades diversivas", "Prontidão para melhorar a alfabetização em saúde", "Estilo de vida sedentário"]}, {"classe": "Classe 2. Gestão de saúde", "diagnosticos": ["Risco de tentativa de fuga", "Síndrome do idoso frágil", "Risco para síndrome de idoso frágil", "Prontidão para envolvimento aprimorado de exercícios", "Saúde comunitária deficiente", "Comportamento de saúde sujeito a risco", "Comportamentos ineficazes de manutenção da saúde", "Autogestão ineficaz da saúde", "Prontidão para autogestão aprimorada da saúde", "Autogestão ineficaz da saúde da família", "Comportamentos de manutenção doméstica ineficazes", "Risco de comportamentos de manutenção doméstica ineficazes", "Prontidão para comportamentos de manutenção doméstica aprimorados", "Proteção ineficaz"]}]}, {"dominio": "Domínio 2. Nutrição", "classes": [{"classe": "Classe 1. Ingestão", "diagnosticos": ["Nutrição desequilibrada: menos do que as necessidades corporais", "Prontidão para nutrição aprimorada", "Produção insuficiente de leite materno", "Amamentação ineficaz", "Amamentação interrompida", "Prontidão para amamentação aprimorada", "Dinâmica alimentar ineficaz de adolescentes", "Dinâmica alimentar infantil ineficaz", "Dinâmica de alimentação infantil ineficaz", "Obesidade", "Sobrepeso", "Risco de excesso de peso", "Resposta ineficaz de sucção e deglutição do bebê", "Deglutição prejudicada"]}, {"classe": "Classe 2. Digestão", "diagnosticos": []}, {"classe": "Classe 3. Absorção", "diagnosticos": []}, {"classe": "Classe 4. Metabolismo", "diagnosticos": ["Risco de nível instável de glicose no sangue", "Hiperbilirrubinemia neonatal", "Risco de hiperbilirrubinemia neonatal", "Risco de função hepática prejudicada", "Risco para síndrome metabólica"]}, {"classe": "Classe 5. Hidratação", "diagnosticos": ["Risco de desequilíbrio eletrolítico", "Risco de volume de fluido desequilibrado", "Volume de fluido deficiente", "Risco de volume de fluido deficiente", "Excesso de volume de fluido"]}]}, {"dominio": "Domínio 3. Eliminação e troca", "classes": [{"classe": "Classe 1. Função urinária", "diagnosticos": ["Incontinência urinária associada à deficiência", "Eliminação urinária prejudicada", "Incontinência urinária mista", "Incontinência urinária de esforço", "Incontinência urinária de urgência", "Risco de incontinência urinária de urgência", "Retenção urinária", "Risco de retenção urinária"]}, {"classe": "Classe 2. Função gastrointestinal", "diagnosticos": ["Constipação", "Risco de constipação", "Constipação percebida", "Constipação funcional crônica", "Risco de constipação funcional crônica", "Continência intestinal prejudicada", "Diarréia", "Motilidade gastrointestinal disfuncional", "Risco de motilidade gastrointestinal disfuncional"]}, {"classe": "Classe 3. Função tegumentar", "diagnosticos": []}, {"classe": "Classe 4. Função respiratória", "diagnosticos": ["Troca gasosa prejudicada"]}]}, {"dominio": "Domínio 4. Atividade/repouso", "classes": [{"classe": "Classe 1. Sono/repouso", "diagnosticos": ["Insônia", "Privação de sono", "Prontidão para sono aprimorado", "Padrão de sono perturbado"]}, {"classe": "Classe 2. Atividade/exercício", "diagnosticos": ["Diminuição da tolerância à atividade", "Risco de diminuição da tolerância à atividade", "Risco para síndrome de desuso", "Mobilidade na cama prejudicada", "Mobilidade física prejudicada", "Mobilidade em cadeira de rodas prejudicada", "Capacidade de sentar-se prejudicada", "Capacidade de ficar em pé prejudicada", "Capacidade de transferência prejudicada", "Caminhada prejudicada"]}, {"classe": "Classe 3. Balanço de energia", "diagnosticos": ["Campo de energia desequilibrado", "Fadiga", "Vadiagem"]}, {"classe": "Classe 4. Respostas cardiovasculares/pulmonares", "diagnosticos": ["Padrão respiratório ineficaz", "Diminuição do débito cardíaco", "Risco de diminuição do débito cardíaco", "Risco de função cardiovascular prejudicada", "Autogestão de linfedema ineficaz", "Risco de autogestão ineficaz de linfedema", "Ventilação espontânea prejudicada", "Risco de pressão arterial instável", "Risco de trombose", "Risco de diminuição da perfusão tissular cardíaca", "Risco de perfusão tissular cerebral ineficaz", "Perfusão tissular periférica ineficaz", "Risco de perfusão tissular periférica ineficaz", "Resposta disfuncional ao desmame ventilatório", "Resposta disfuncional ao desmame ventilatório em adultos"]}, {"classe": "Classe 5. Autocuidado", "diagnosticos": ["Déficit de autocuidado no banho", "Déficit de autocuidado de vestir", "Déficit de autocuidado alimentar", "Déficit de autocuidado com banheiro", "Prontidão para autocuidado aprimorado", "Auto-negligência"]}]}, {"dominio": "Domínio 5. Percepção/cognição", "classes": [{"classe": "Classe 1. Atenção", "diagnosticos": ["Negligência unilateral"]}, {"classe": "Classe 2. Orientação", "diagnosticos": []}, {"classe": "Classe 3. Sensação/percepção", "diagnosticos": []}, {"classe": "Classe 4. Cognição", "diagnosticos": ["Confusão aguda", "Risco de confusão aguda", "Confusão crônica", "Controle emocional instável", "Controle de impulso ineficaz", "Conhecimento deficiente", "Prontidão para conhecimento aprimorado", "Memória prejudicada", "Processo de pensamento perturbado"]}, {"classe": "Classe 5. Comunicação", "diagnosticos": ["Prontidão para comunicação aprimorada", "Comunicação verbal prejudicada"]}]}, {"dominio": "Domínio 6. Autopercepção", "classes": [{"classe": "Classe 1. Autoconceito", "diagnosticos": ["Desesperança", "Prontidão para esperança aumentada", "Risco de comprometimento da dignidade humana", "Identidade pessoal perturbada", "Risco de identidade pessoal perturbada", "Prontidão para autoconceito aprimorado"]}, {"classe": "Classe 2. Autoestima", "diagnosticos": ["Baixa autoestima crônica", "Risco de baixa autoestima crônica", "Baixa autoestima situacional", "Risco de baixa autoestima situacional"]}, {"classe": "Classe 3. Imagem corporal", "diagnosticos": ["Imagem corporal perturbada"]}]}, {"dominio": "Domínio 7. Relação de função", "classes": [{"classe": "Classe 1. Funções de cuidado", "diagnosticos": ["Paternidade prejudicada", "Risco para paternidade prejudicada", "Prontidão para paternidade aprimorada", "Tensão de papel de cuidador", "Risco para tensão de papel de cuidador"]}, {"classe": "Classe 2. Relações familiares", "diagnosticos": ["Risco de apego prejudicado", "Síndrome de identidade familiar perturbada", "Risco para síndrome de identidade familiar perturbada", "Processos familiares disfuncionais", "Processos familiares interrompidos", "Prontidão para processos familiares aprimorados"]}, {"classe": "Classe 3. Desempenho do papel", "diagnosticos": ["Relacionamento ineficaz", "Risco de relacionamento ineficaz", "Prontidão para relacionamento aprimorado", "Conflito de papel parental", "Desempenho de papel ineficaz", "Interação social prejudicada"]}]}, {"dominio": "Domínio 8. Sexualidade", "classes": [{"classe": "Classe 1. Identidade sexual", "diagnosticos": []}, {"classe": "Classe 2. Função sexual", "diagnosticos": ["Disfunção sexual", "Padrão de sexualidade ineficaz"]}, {"classe": "Classe 3. Reprodução", "diagnosticos": ["Processo de procriação ineficaz", "Risco de processo de procriação ineficaz", "Prontidão para o processo reprodutivo aprimorado", "Risco de díade materno-fetal perturbada"]}]}, {"dominio": "Domínio 9. Enfrentamento/tolerância ao estresse", "classes": [{"classe": "Classe 1. Respostas pós-trauma", "diagnosticos": ["Risco de transição de imigração complicada", "Síndrome pós-trauma", "Risco para síndrome pós-trauma", "Síndrome de estupro-trauma", "Síndrome de estresse de realocação", "Risco para síndrome de estresse de realocação"]}, {"classe": "Classe 2. Respostas de enfrentamento", "diagnosticos": ["Planejamento de atividades ineficazes", "Risco de planejamento de atividades ineficazes", "Ansiedade", "Enfrentamento defensivo", "Enfrentamento ineficaz", "Prontidão para enfrentamento aprimorado", "Enfrentamento ineficaz da comunidade", "Prontidão para enfrentamento aprimorado da comunidade", "Enfrentamento familiar comprometido", "Enfrentamento familiar incapacitado", "Prontidão para enfrentamento familiar aprimorado", "Ansiedade relacionada à morte", "Negação ineficaz", "Medo", "Luto desadaptativo", "Risco de luto não adaptativo", "Prontidão para luto intensificado", "Regulação do humor prejudicada", "Impotência", "Risco de impotência", "Prontidão para potência aprimorada", "Resiliência prejudicada", "Risco de resiliência prejudicada", "Prontidão para maior resiliência", "Tristeza crônica", "Sobrecarga de estresse"]}, {"classe": "Classe 3. Estresse neurocomportamental", "diagnosticos": ["Síndrome de abstinência aguda de substância", "Risco para síndrome de abstinência de substância aguda", "Disreflexia autonômica", "Risco para disreflexia autonômica", "Síndrome de abstinência neonatal", "Comportamento infantil desorganizado", "Risco de comportamento infantil desorganizado", "Prontidão para comportamento infantil organizado aprimorado"]}]}, {"dominio": "Domínio 10. Princípios de vida", "classes": [{"classe": "Classe 1. Valores", "diagnosticos": []}, {"classe": "Classe 2. Crenças", "diagnosticos": ["Prontidão para um maior bem-estar espiritual"]}, {"classe": "Classe 3. Congruência de valor/crença/ação", "diagnosticos": ["Prontidão para tomada de decisão aprimorada", "Conflito de decisão", "Tomada de decisão emancipada prejudicada", "Risco para tomada de decisão emancipada prejudicada", "Prontidão para tomada de decisão emancipada aprimorada", "Angústia moral", "Religiosidade prejudicada", "Risco para religiosidade prejudicada", "Prontidão para maior religiosidade", "Angústia espiritual", "Risco de angústia espiritual"]}]}, {"dominio": "Domínio 11. Segurança/proteção", "classes": [{"classe": "Classe 1. Infecção", "diagnosticos": ["Risco de infecção", "Risco de infecção de sítio cirúrgico"]}, {"classe": "Classe 2. Lesão física", "diagnosticos": ["Desobstrução ineficaz das vias aéreas", "Risco de aspiração", "Risco de sangramento", "Dentição prejudicada", "Risco de olho seco", "Autogestão ineficaz de olho seco", "Risco de boca seca", "Risco de quedas em adultos", "Risco de criança cair", "Risco de lesão", "Risco de lesão da córnea", "Lesão do complexo areolar-mamilo", "Risco de lesão do complexo areolopapilar", "Risco de lesão do trato urinário", "Risco de lesão de posicionamento perioperatória", "Risco de lesão térmica", "Integridade da membrana mucosa oral prejudicada", "Risco de integridade da membrana mucosa oral prejudicada", "Risco de disfunção neurovascular periférica", "Risco de trauma físico", "Risco de trauma vascular", "Lesão por pressão em adulto", "Risco de lesão por pressão em adulto", "Lesão por pressão em criança", "Risco de lesão por pressão infantil", "Lesão por pressão neonatal", "Risco de lesão por pressão neonatal", "Risco de choque", "Integridade da pele prejudicada", "Risco de integridade da pele prejudicada", "Risco de morte infantil súbita", "Risco de sufocação", "Recuperação cirúrgica retardada", "Risco de recuperação cirúrgica retardada", "Integridade do tecido prejudicada", "Risco de integridade do tecido prejudicada"]}, {"classe": "Classe 3. Violência", "diagnosticos": ["Risco de mutilação genital feminina", "Risco de violência dirigida por outros", "Risco de violência autodirigida", "Auto-mutilação", "Risco de automutilação", "Risco de comportamento suicida"]}, {"classe": "Classe 4. Riscos ambientais", "diagnosticos": ["Contaminação", "Risco de contaminação", "Risco de lesão ocupacional", "Risco de envenenamento"]}, {"classe": "Classe 5. Processos defensivos", "diagnosticos": ["Risco de reação adversa ao meio de contraste iodado", "Risco de reação alérgica", "Risco de reação alérgica ao látex"]}, {"classe": "Classe 6. Termorregulação", "diagnosticos": ["Hipertermia", "Hipotermia", "Risco de hipotermia", "Hipotermia neonatal", "Risco de hipotermia neonatal", "Risco de hipotermia perioperatória", "Termorregulação ineficaz", "Risco de termorregulação ineficaz"]}]}, {"dominio": "Domínio 12. Conforto", "classes": [{"classe": "Classe 1. Conforto físico", "diagnosticos": ["Conforto prejudicado", "Prontidão para maior conforto", "Náusea", "Dor aguda", "Dor crônica", "Síndrome de dor crônica", "Dor do parto"]}, {"classe": "Classe 2. Conforto ambiental", "diagnosticos": ["Conforto prejudicado", "Prontidão para maior conforto"]}, {"classe": "Classe 3. Conforto social", "diagnosticos": ["Conforto prejudicado", "Prontidão para maior conforto", "Risco de solidão", "Isolamento social"]}]}, {"dominio": "Domínio 13. Crescimento/desenvolvimento", "classes": [{"classe": "Classe 1. Crescimento", "diagnosticos": []}, {"classe": "Classe 2. Desenvolvimento", "diagnosticos": ["Desenvolvimento infantil retardado", "Risco de atraso no desenvolvimento infantil", "Atraso no desenvolvimento motor infantil", "Risco de atraso no desenvolvimento motor infantil"]}]}];

const CODES_2024={'Comportamentos sedentários excessivos':'00296','Risco de comportamentos sedentários excessivos':'00310','Engajamento diminuído em atividades de recreação':'00097','Risco de engajamento diminuído em atividades de recreação':'00299','Campo de energia desequilibrado':'00050','Autogestão ineficaz da saúde':'00078','Risco de autogestão ineficaz da saúde':'00082','Disposição para autogestão da saúde melhorada':'00162','Gestão ineficaz da saúde familiar':'00080','Risco de gestão ineficaz da saúde familiar':'00081','Gestão ineficaz da saúde da comunidade':'00076','Risco de gestão ineficaz da saúde da comunidade':'00077','Autogestão ineficaz da boca seca':'00228','Risco de autogestão ineficaz da boca seca':'00229','Autogestão ineficaz da dor':'00226','Autogestão ineficaz da fadiga':'00227','Risco de autogestão ineficaz do padrão de glicemia':'00179','Autogestão ineficaz da náusea':'00001','Autogestão ineficaz do linfedema':'00243','Risco de autogestão ineficaz do linfedema':'00244','Disposição para autogestão do peso melhorada':'00193','Autogestão ineficaz do sobrepeso':'00232','Risco de autogestão ineficaz do sobrepeso':'00233','Autogestão ineficaz do baixo peso':'00234','Risco de autogestão ineficaz do baixo peso':'00235','Autogestão ineficaz do ressecamento ocular':'00230','Comportamentos ineficazes de manutenção da saúde':'00099','Risco de comportamentos ineficazes de manutenção da saúde':'00100','Comportamentos ineficazes de manutenção do lar':'00102','Risco de comportamentos ineficazes de manutenção do lar':'00103','Disposição para comportamentos melhorados de manutenção do lar':'00163','Disposição para engajamento em exercícios melhorado':'00305','Letramento em saúde inadequado':'00164','Risco de letramento em saúde inadequado':'00165','Disposição para letramento em saúde melhorado':'00166','Disposição para envelhecimento saudável melhorado':'00313','Síndrome da fragilidade do idoso':'00257','Risco de síndrome da fragilidade do idoso':'00258','Ingestão nutricional inadequada':'00002','Risco de ingestão nutricional inadequada':'00003','Disposição para ingestão nutricional melhorada':'00173','Ingestão nutricional proteico-calórica inadequada':'00005','Risco de ingestão nutricional proteico-calórica inadequada':'00006','Amamentação ineficaz':'00104','Risco de amamentação ineficaz':'00105','Amamentação exclusiva conturbada':'00106','Risco de amamentação exclusiva conturbada':'00107','Disposição para amamentação melhorada':'00173','Produção inadequada de leite humano':'00194','Risco de produção inadequada de leite humano':'00195','Dinâmica de alimentação ineficaz do lactente':'00108','Dinâmica alimentar ineficaz da criança':'00109','Dinâmica alimentar ineficaz do adolescente':'00110','Deglutição prejudicada':'00103','Hiperbilirrubinemia neonatal':'00194','Risco de hiperbilirrubinemia neonatal':'00195','Risco de equilíbrio hidreletrolítico prejudicado':'00007','Risco de equilíbrio do volume de líquidos prejudicado':'00025','Volume de líquidos excessivo':'00026','Risco de volume de líquidos excessivo':'00027','Volume de líquidos inadequado':'00028','Risco de volume de líquidos inadequado':'00029','Eliminação urinária prejudicada':'00016','Risco de retenção urinária':'00023','Incontinência urinária associada à incapacidade':'00017','Incontinência urinária de esforço':'00018','Incontinência urinária de urgência':'00019','Risco de incontinência urinária de urgência':'00020','Incontinência urinária mista':'00021','Motilidade gastrintestinal prejudicada':'00196','Risco de motilidade gastrintestinal prejudicada':'00197','Eliminação intestinal prejudicada':'00011','Risco de eliminação intestinal prejudicada':'00012','Constipação funcional crônica':'00013','Risco de constipação funcional crônica':'00014','Continência fecal prejudicada':'00015','Risco de continência fecal prejudicada':'00015','Troca de gases prejudicada':'00030','Padrão de sono ineficaz':'00095','Risco de padrão de sono ineficaz':'00096','Disposição para padrão de sono melhorado':'00165','Comportamentos ineficazes de higiene do sono':'00231','Risco de comportamentos ineficazes de higiene do sono':'00232','Mobilidade física prejudicada':'00085','Risco de mobilidade física prejudicada':'00086','Mobilidade prejudicada com cadeira de rodas':'00087','Mobilidade no leito prejudicada':'00088','Habilidade de deambulação prejudicada':'00089','Habilidade de ficar em pé prejudicada':'00090','Habilidade de sentar-se prejudicada':'00091','Habilidade de transferência prejudicada':'00092','Tolerância à atividade diminuída':'00093','Risco de tolerância à atividade diminuída':'00094','Carga excessiva de fadiga':'00093','Recuperação cirúrgica prejudicada':'00198','Risco de recuperação cirúrgica prejudicada':'00199','Risco de função cardiovascular prejudicada':'00200','Risco de débito cardíaco diminuído':'00201','Risco de pressão arterial desequilibrada':'00202','Risco de perfusão tissular cerebral ineficaz':'00203','Perfusão tissular periférica ineficaz':'00204','Risco de perfusão tissular periférica ineficaz':'00205','Padrão respiratório ineficaz':'00032','Ventilação espontânea prejudicada':'00033','Resposta prejudicada ao desmame ventilatório da criança':'00034','Resposta prejudicada ao desmame ventilatório do adulto':'00035','Síndrome da habilidade de autocuidado diminuída':'00260','Risco de síndrome da habilidade de autocuidado diminuída':'00261','Disposição para habilidades de autocuidado melhoradas':'00262','Habilidade de banhar-se diminuída':'00108','Habilidade de cuidados pessoais diminuída':'00109','Habilidade de utilizar o vaso sanitário diminuída':'00110','Habilidade de vestir-se diminuída':'00111','Habilidade de alimentar-se diminuída':'00102','Comportamentos ineficazes de higiene oral':'00223','Risco de comportamentos ineficazes de higiene oral':'00224','Confusão aguda':'00128','Risco de confusão aguda':'00129','Confusão crônica':'00130','Controle de impulsos ineficaz':'00222','Processos de pensamento conturbados':'00131','Conhecimento de saúde inadequado':'00126','Disposição para conhecimento de saúde melhorado':'00161','Memória prejudicada':'00131','Tomada de decisão prejudicada':'00127','Disposição para tomada de decisão melhorada':'00162','Tomada de decisão emancipada prejudicada':'00242','Risco de tomada de decisão emancipada prejudicada':'00243','Disposição para tomada de decisão emancipada melhorada':'00244','Comunicação verbal prejudicada':'00051','Risco de comunicação verbal prejudicada':'00052','Disposição para comunicação verbal melhorada':'00053','Disposição para autoconceito melhorado':'00167','Identidade pessoal conturbada':'00121','Síndrome da identidade familiar conturbada':'00263','Risco de síndrome da identidade familiar conturbada':'00264','Risco de dignidade humana prejudicada':'00174','Disposição para identidade social como pessoa transgênero melhorada':'00308','Autoestima inadequada crônica':'00119','Risco de autoestima inadequada crônica':'00122','Autoestima inadequada situacional':'00120','Risco de autoestima inadequada situacional':'00123','Autoeficácia em saúde inadequada':'00324','Imagem corporal conturbada':'00118','Comportamentos parentais prejudicados':'00056','Risco de comportamentos parentais prejudicados':'00057','Disposição para comportamentos parentais melhorados':'00058','Conflito excessivo no papel parental':'00059','Padrões de interação familiar conturbados':'00060','Risco de padrões de interação familiar conturbados':'00061','Processos familiares prejudicados':'00058','Disposição para processos familiares melhorados':'00159','Risco de comportamentos de apego conturbados':'00054','Desempenho de papel ineficaz':'00055','Relacionamento ineficaz com o parceiro íntimo':'00223','Risco de relacionamento ineficaz com o parceiro íntimo':'00224','Disposição para relacionamento com o parceiro íntimo melhorado':'00225','Interação social prejudicada':'00052','Processo perinatológico ineficaz':'00221','Risco de processo perinatológico ineficaz':'00222','Disposição para processo perinatológico melhorado':'00256','Função sexual prejudicada':'00059','Risco de binômio mãe-feto prejudicado':'00113','Síndrome pós-trauma':'00141','Risco de síndrome pós-trauma':'00142','Risco de transição imigratória conturbada':'00235','Enfrentamento desadaptativo':'00069','Disposição para enfrentamento melhorado':'00158','Enfrentamento familiar desadaptativo':'00071','Disposição para enfrentamento familiar melhorado':'00160','Enfrentamento desadaptativo da comunidade':'00076','Disposição para enfrentamento melhorado da comunidade':'00172','Ansiedade excessiva':'00146','Ansiedade excessiva relacionada à morte':'00147','Medo excessivo':'00148','Luto desadaptativo':'00135','Risco de luto desadaptativo':'00136','Disposição para luto melhorado':'00172','Carga excessiva de prestação de cuidados':'00063','Risco de carga excessiva de prestação de cuidados':'00064','Resiliência prejudicada':'00209','Risco de resiliência prejudicada':'00210','Disposição para resiliência melhorada':'00211','Disposição para esperança melhorada':'00185','Autocompaixão inadequada':'00219','Risco de disreflexia autonômica':'00009','Regulação ineficaz das emoções':'00206','Regulação do humor prejudicada':'00207','Síndrome de abstinência de substâncias aguda':'00008','Risco de síndrome de abstinência de substâncias aguda':'00008','Sofrimento moral':'00175','Bem-estar espiritual prejudicado':'00068','Risco de bem-estar espiritual prejudicado':'00069','Disposição para bem-estar espiritual melhorado':'00159','Religiosidade prejudicada':'00100','Risco de religiosidade prejudicada':'00101','Disposição para religiosidade melhorada':'00171','Resposta imune prejudicada':'00279','Risco de infecção':'00004','Risco de infecção de ferida cirúrgica':'00266','Risco de lesão física':'00035','Risco de lesão pelo calor':'00037','Risco de lesão pelo frio':'00038','Risco de lesão na córnea':'00045','Risco de ressecamento ocular':'00246','Risco de lesão por posicionamento perioperatório':'00087','Lesão por pressão neonatal':'00290','Risco de lesão por pressão neonatal':'00291','Lesão por pressão na criança':'00292','Risco de lesão por pressão na criança':'00293','Lesão por pressão no adulto':'00046','Risco de lesão por pressão no adulto':'00047','Risco de lesão do trato urinário':'00288','Integridade tissular prejudicada':'00044','Risco de integridade tissular prejudicada':'00248','Integridade da pele prejudicada':'00046','Risco de integridade da pele prejudicada':'00047','Integridade do complexo mamilo-areolar prejudicada':'00260','Risco de integridade do complexo mamilo-areolar prejudicada':'00261','Integridade da mucosa oral prejudicada':'00045','Risco de integridade da mucosa oral prejudicada':'00246','Risco de quedas na criança':'00155','Risco de quedas no adulto':'00156','Risco de aspiração':'00039','Desobstrução ineficaz das vias aéreas':'00031','Risco de sufocamento acidental':'00040','Risco de sangramento excessivo':'00289','Risco de choque':'00205','Risco de trombose':'00287','Risco de função neurovascular periférica prejudicada':'00086','Risco de morte súbita do lactente':'00156','Risco de tentativa de fuga':'00333','Risco de violência direcionada a outros':'00138','Risco de mutilação genital feminina':'00325','Risco de comportamento autolesivo suicida':'00139','Comportamento autolesivo não suicida':'00137','Risco de comportamento autolesivo não suicida':'00140','Contaminação':'00181','Risco de contaminação':'00182','Risco de intoxicação acidental':'00037','Risco de doença ocupacional':'00183','Risco de lesão física ocupacional':'00184','Risco de reação alérgica':'00217','Risco de reação alérgica ao látex':'00218','Termorregulação ineficaz':'00008','Risco de termorregulação ineficaz':'00009','Hipertermia':'00007','Risco de hipertermia':'00006','Temperatura corporal neonatal diminuída':'00320','Risco de temperatura corporal neonatal diminuída':'00321','Temperatura corporal diminuída':'00006','Risco de temperatura corporal diminuída':'00005','Risco de temperatura corporal perioperatória diminuída':'00254','Conforto físico prejudicado':'00214','Disposição para conforto físico melhorado':'00183','Síndrome do conforto prejudicado no fim da vida':'00299','Dor aguda':'00132','Síndrome da dor crônica':'00254','Dor crônica':'00133','Dor no trabalho de parto':'00256','Disposição para conforto social melhorado':'00300','Conexão social inadequada':'00053','Rede de apoio social inadequada':'00054','Solidão excessiva':'00054','Risco de solidão excessiva':'00055','Conforto psicológico prejudicado':'00073','Disposição para conforto psicológico melhorado':'00174','Crescimento atrasado da criança':'00111','Risco de crescimento atrasado da criança':'00113','Desenvolvimento atrasado da criança':'00112','Risco de desenvolvimento atrasado da criança':'00114','Desenvolvimento motor atrasado do lactente':'00315','Risco de desenvolvimento motor atrasado do lactente':'00316','Organização prejudicada do neurodesenvolvimento do lactente':'00117','Risco de organização prejudicada do neurodesenvolvimento do lactente':'00118','Disposição para organização melhorada do neurodesenvolvimento do lactente':'00119','Resposta ineficaz de sucção-deglutição do lactente':'00143'};

const NIC_NOC_MAP={'Comportamentos sedentários excessivos':['6490 - Cuidados com exercício','0005 - Nível de atividade'],'Autogestão ineficaz da saúde':['5602 - Educação: saúde','1606 - Participação: decisões de saúde'],'Ingestão nutricional inadequada':['5246 - Assistência alimentar','1004 - Estado nutricional'],'Eliminação urinária prejudicada':['0580 - Cuidados com eliminação','0503 - Eliminação urinária'],'Troca de gases prejudicada':['3140 - Manejo das vias aéreas','0402 - Resposta respiratória'],'Mobilidade física prejudicada':['0200 - Exercício: movimento corporal','0208 - Mobilidade'],'Padrão de sono ineficaz':['1400 - Gerenciamento ambiental','0004 - Sono'],'Comunicação verbal prejudicada':['4922 - Aumento da comunicação','0901 - Comunicação expressiva'],'Dor aguda':['2210 - Administração de analgésicos','1605 - Controle da dor'],'Ansiedade excessiva':['5820 - Redução de ansiedade','1211 - Nível de ansiedade'],'Conforto físico prejudicado':['1400 - Gerenciamento ambiental','2100 - Nível de conforto'],'Processos familiares prejudicados':['7100 - Orientação para família','1800 - Conhecimento: processo familiar'],'Imagem corporal conturbada':['5440 - Terapia de aceitação','1200 - Imagem corporal'],'Confusão aguda':['4720 - Estimulação cognitiva','0900 - Cognição']};

const DATA_2024 = [{"dominio": "Domínio 1. Promoção da saúde", "classes": [{"classe": "Classe 1. Percepção da saúde", "diagnosticos": ["Comportamentos sedentários excessivos", "Risco de comportamentos sedentários excessivos", "Engajamento diminuído em atividades de recreação", "Risco de engajamento diminuído em atividades de recreação", "Campo de energia desequilibrado"]}, {"classe": "Classe 2. Gestão da saúde", "diagnosticos": ["Autogestão ineficaz da saúde", "Risco de autogestão ineficaz da saúde", "Disposição para autogestão da saúde melhorada", "Gestão ineficaz da saúde familiar", "Risco de gestão ineficaz da saúde familiar", "Gestão ineficaz da saúde da comunidade", "Risco de gestão ineficaz da saúde da comunidade", "Autogestão ineficaz da boca seca", "Risco de autogestão ineficaz da boca seca", "Autogestão ineficaz da dor", "Autogestão ineficaz da fadiga", "Risco de autogestão ineficaz do padrão de glicemia", "Autogestão ineficaz da náusea", "Autogestão ineficaz do linfedema", "Risco de autogestão ineficaz do linfedema", "Disposição para autogestão do peso melhorada", "Autogestão ineficaz do sobrepeso", "Risco de autogestão ineficaz do sobrepeso", "Autogestão ineficaz do baixo peso", "Risco de autogestão ineficaz do baixo peso", "Autogestão ineficaz do ressecamento ocular", "Comportamentos ineficazes de manutenção da saúde", "Risco de comportamentos ineficazes de manutenção da saúde", "Comportamentos ineficazes de manutenção do lar", "Risco de comportamentos ineficazes de manutenção do lar", "Disposição para comportamentos melhorados de manutenção do lar", "Disposição para engajamento em exercícios melhorado", "Letramento em saúde inadequado", "Risco de letramento em saúde inadequado", "Disposição para letramento em saúde melhorado", "Disposição para envelhecimento saudável melhorado", "Síndrome da fragilidade do idoso", "Risco de síndrome da fragilidade do idoso"]}]}, {"dominio": "Domínio 2. Nutrição", "classes": [{"classe": "Classe 1. Ingestão", "diagnosticos": ["Ingestão nutricional inadequada", "Risco de ingestão nutricional inadequada", "Disposição para ingestão nutricional melhorada", "Ingestão nutricional proteico-calórica inadequada", "Risco de ingestão nutricional proteico-calórica inadequada", "Amamentação ineficaz", "Risco de amamentação ineficaz", "Amamentação exclusiva conturbada", "Risco de amamentação exclusiva conturbada", "Disposição para amamentação melhorada", "Produção inadequada de leite humano", "Risco de produção inadequada de leite humano", "Dinâmica de alimentação ineficaz do lactente", "Dinâmica alimentar ineficaz da criança", "Dinâmica alimentar ineficaz do adolescente", "Deglutição prejudicada"]}, {"classe": "Classe 2. Digestão", "diagnosticos": []}, {"classe": "Classe 3. Absorção", "diagnosticos": []}, {"classe": "Classe 4. Metabolismo", "diagnosticos": ["Hiperbilirrubinemia neonatal", "Risco de hiperbilirrubinemia neonatal"]}, {"classe": "Classe 5. Hidratação", "diagnosticos": ["Risco de equilíbrio hidreletrolítico prejudicado", "Risco de equilíbrio do volume de líquidos prejudicado", "Volume de líquidos excessivo", "Risco de volume de líquidos excessivo", "Volume de líquidos inadequado", "Risco de volume de líquidos inadequado"]}]}, {"dominio": "Domínio 3. Eliminação e troca", "classes": [{"classe": "Classe 1. Função urinária", "diagnosticos": ["Eliminação urinária prejudicada", "Risco de retenção urinária", "Incontinência urinária associada à incapacidade", "Incontinência urinária de esforço", "Incontinência urinária de urgência", "Risco de incontinência urinária de urgência", "Incontinência urinária mista"]}, {"classe": "Classe 2. Função gastrintestinal", "diagnosticos": ["Motilidade gastrintestinal prejudicada", "Risco de motilidade gastrintestinal prejudicada", "Eliminação intestinal prejudicada", "Risco de eliminação intestinal prejudicada", "Constipação funcional crônica", "Risco de constipação funcional crônica", "Continência fecal prejudicada", "Risco de continência fecal prejudicada"]}, {"classe": "Classe 3. Função tegumentar", "diagnosticos": []}, {"classe": "Classe 4. Função respiratória", "diagnosticos": ["Troca de gases prejudicada"]}]}, {"dominio": "Domínio 4. Atividade/repouso", "classes": [{"classe": "Classe 1. Sono/repouso", "diagnosticos": ["Padrão de sono ineficaz", "Risco de padrão de sono ineficaz", "Disposição para padrão de sono melhorado", "Comportamentos ineficazes de higiene do sono", "Risco de comportamentos ineficazes de higiene do sono"]}, {"classe": "Classe 2. Atividade/exercício", "diagnosticos": ["Mobilidade física prejudicada", "Risco de mobilidade física prejudicada", "Mobilidade prejudicada com cadeira de rodas", "Mobilidade no leito prejudicada", "Habilidade de deambulação prejudicada", "Habilidade de ficar em pé prejudicada", "Habilidade de sentar-se prejudicada", "Habilidade de transferência prejudicada"]}, {"classe": "Classe 3. Equilíbrio de energia", "diagnosticos": ["Tolerância à atividade diminuída", "Risco de tolerância à atividade diminuída", "Carga excessiva de fadiga", "Recuperação cirúrgica prejudicada", "Risco de recuperação cirúrgica prejudicada"]}, {"classe": "Classe 4. Respostas cardiovasculares/pulmonares", "diagnosticos": ["Risco de função cardiovascular prejudicada", "Risco de débito cardíaco diminuído", "Risco de pressão arterial desequilibrada", "Risco de perfusão tissular cerebral ineficaz", "Perfusão tissular periférica ineficaz", "Risco de perfusão tissular periférica ineficaz", "Padrão respiratório ineficaz", "Ventilação espontânea prejudicada", "Resposta prejudicada ao desmame ventilatório da criança", "Resposta prejudicada ao desmame ventilatório do adulto"]}, {"classe": "Classe 5. Autocuidado", "diagnosticos": ["Síndrome da habilidade de autocuidado diminuída", "Risco de síndrome da habilidade de autocuidado diminuída", "Disposição para habilidades de autocuidado melhoradas", "Habilidade de banhar-se diminuída", "Habilidade de cuidados pessoais diminuída", "Habilidade de utilizar o vaso sanitário diminuída", "Habilidade de vestir-se diminuída", "Habilidade de alimentar-se diminuída", "Comportamentos ineficazes de higiene oral", "Risco de comportamentos ineficazes de higiene oral"]}]}, {"dominio": "Domínio 5. Percepção/cognição", "classes": [{"classe": "Classe 1. Atenção", "diagnosticos": []}, {"classe": "Classe 2. Orientação", "diagnosticos": []}, {"classe": "Classe 3. Sensação/percepção", "diagnosticos": []}, {"classe": "Classe 4. Cognição", "diagnosticos": ["Confusão aguda", "Risco de confusão aguda", "Confusão crônica", "Controle de impulsos ineficaz", "Processos de pensamento conturbados", "Conhecimento de saúde inadequado", "Disposição para conhecimento de saúde melhorado", "Memória prejudicada", "Tomada de decisão prejudicada", "Disposição para tomada de decisão melhorada", "Tomada de decisão emancipada prejudicada", "Risco de tomada de decisão emancipada prejudicada", "Disposição para tomada de decisão emancipada melhorada"]}, {"classe": "Classe 5. Comunicação", "diagnosticos": ["Comunicação verbal prejudicada", "Risco de comunicação verbal prejudicada", "Disposição para comunicação verbal melhorada"]}]}, {"dominio": "Domínio 6. Autopercepção", "classes": [{"classe": "Classe 1. Autoconceito", "diagnosticos": ["Disposição para autoconceito melhorado", "Identidade pessoal conturbada", "Síndrome da identidade familiar conturbada", "Risco de síndrome da identidade familiar conturbada", "Risco de dignidade humana prejudicada", "Disposição para identidade social como pessoa transgênero melhorada"]}, {"classe": "Classe 2. Autoestima", "diagnosticos": ["Autoestima inadequada crônica", "Risco de autoestima inadequada crônica", "Autoestima inadequada situacional", "Risco de autoestima inadequada situacional", "Autoeficácia em saúde inadequada"]}, {"classe": "Classe 3. Imagem corporal", "diagnosticos": ["Imagem corporal conturbada"]}]}, {"dominio": "Domínio 7. Papéis e relacionamentos", "classes": [{"classe": "Classe 1. Papéis do cuidador", "diagnosticos": ["Comportamentos parentais prejudicados", "Risco de comportamentos parentais prejudicados", "Disposição para comportamentos parentais melhorados", "Conflito excessivo no papel parental"]}, {"classe": "Classe 2. Relações familiares", "diagnosticos": ["Padrões de interação familiar conturbados", "Risco de padrões de interação familiar conturbados", "Processos familiares prejudicados", "Disposição para processos familiares melhorados", "Risco de comportamentos de apego conturbados"]}, {"classe": "Classe 3. Desempenho de papéis", "diagnosticos": ["Desempenho de papel ineficaz", "Relacionamento ineficaz com o parceiro íntimo", "Risco de relacionamento ineficaz com o parceiro íntimo", "Disposição para relacionamento com o parceiro íntimo melhorado", "Interação social prejudicada", "Processo perinatológico ineficaz", "Risco de processo perinatológico ineficaz", "Disposição para processo perinatológico melhorado"]}]}, {"dominio": "Domínio 8. Sexualidade", "classes": [{"classe": "Classe 1. Identidade sexual", "diagnosticos": []}, {"classe": "Classe 2. Função sexual", "diagnosticos": ["Função sexual prejudicada"]}, {"classe": "Classe 3. Reprodução", "diagnosticos": ["Risco de binômio mãe-feto prejudicado"]}]}, {"dominio": "Domínio 9. Enfrentamento/tolerância ao estresse", "classes": [{"classe": "Classe 1. Respostas pós-trauma", "diagnosticos": ["Síndrome pós-trauma", "Risco de síndrome pós-trauma", "Risco de transição imigratória conturbada"]}, {"classe": "Classe 2. Respostas de enfrentamento", "diagnosticos": ["Enfrentamento desadaptativo", "Disposição para enfrentamento melhorado", "Enfrentamento familiar desadaptativo", "Disposição para enfrentamento familiar melhorado", "Enfrentamento desadaptativo da comunidade", "Disposição para enfrentamento melhorado da comunidade", "Ansiedade excessiva", "Ansiedade excessiva relacionada à morte", "Medo excessivo", "Luto desadaptativo", "Risco de luto desadaptativo", "Disposição para luto melhorado", "Carga excessiva de prestação de cuidados", "Risco de carga excessiva de prestação de cuidados", "Resiliência prejudicada", "Risco de resiliência prejudicada", "Disposição para resiliência melhorada", "Disposição para esperança melhorada", "Autocompaixão inadequada"]}, {"classe": "Classe 3. Respostas neurocomportamentais", "diagnosticos": ["Risco de disreflexia autonômica", "Regulação ineficaz das emoções", "Regulação do humor prejudicada", "Síndrome de abstinência de substâncias aguda", "Risco de síndrome de abstinência de substâncias aguda"]}]}, {"dominio": "Domínio 10. Princípios da vida", "classes": [{"classe": "Classe 1. Valores", "diagnosticos": []}, {"classe": "Classe 2. Crenças", "diagnosticos": []}, {"classe": "Classe 3. Coerência entre valores/crenças/atos", "diagnosticos": ["Sofrimento moral", "Bem-estar espiritual prejudicado", "Risco de bem-estar espiritual prejudicado", "Disposição para bem-estar espiritual melhorado", "Religiosidade prejudicada", "Risco de religiosidade prejudicada", "Disposição para religiosidade melhorada"]}]}, {"dominio": "Domínio 11. Segurança/proteção", "classes": [{"classe": "Classe 1. Infecção", "diagnosticos": ["Resposta imune prejudicada", "Risco de infecção", "Risco de infecção de ferida cirúrgica"]}, {"classe": "Classe 2. Lesão física", "diagnosticos": ["Risco de lesão física", "Risco de lesão pelo calor", "Risco de lesão pelo frio", "Risco de lesão na córnea", "Risco de ressecamento ocular", "Risco de lesão por posicionamento perioperatório", "Lesão por pressão neonatal", "Risco de lesão por pressão neonatal", "Lesão por pressão na criança", "Risco de lesão por pressão na criança", "Lesão por pressão no adulto", "Risco de lesão por pressão no adulto", "Risco de lesão do trato urinário", "Integridade tissular prejudicada", "Risco de integridade tissular prejudicada", "Integridade da pele prejudicada", "Risco de integridade da pele prejudicada", "Integridade do complexo mamilo-areolar prejudicada", "Risco de integridade do complexo mamilo-areolar prejudicada", "Integridade da mucosa oral prejudicada", "Risco de integridade da mucosa oral prejudicada", "Risco de quedas na criança", "Risco de quedas no adulto", "Risco de aspiração", "Desobstrução ineficaz das vias aéreas", "Risco de sufocamento acidental", "Risco de sangramento excessivo", "Risco de choque", "Risco de trombose", "Risco de função neurovascular periférica prejudicada", "Risco de morte súbita do lactente", "Risco de tentativa de fuga"]}, {"classe": "Classe 3. Violência", "diagnosticos": ["Risco de violência direcionada a outros", "Risco de mutilação genital feminina", "Risco de comportamento autolesivo suicida", "Comportamento autolesivo não suicida", "Risco de comportamento autolesivo não suicida"]}, {"classe": "Classe 4. Riscos ambientais", "diagnosticos": ["Contaminação", "Risco de contaminação", "Risco de intoxicação acidental", "Risco de doença ocupacional", "Risco de lesão física ocupacional"]}, {"classe": "Classe 5. Processos defensivos", "diagnosticos": ["Risco de reação alérgica", "Risco de reação alérgica ao látex"]}, {"classe": "Classe 6. Termorregulação", "diagnosticos": ["Termorregulação ineficaz", "Risco de termorregulação ineficaz", "Hipertermia", "Risco de hipertermia", "Temperatura corporal neonatal diminuída", "Risco de temperatura corporal neonatal diminuída", "Temperatura corporal diminuída", "Risco de temperatura corporal diminuída", "Risco de temperatura corporal perioperatória diminuída"]}]}, {"dominio": "Domínio 12. Conforto", "classes": [{"classe": "Classe 1. Conforto físico", "diagnosticos": ["Conforto físico prejudicado", "Disposição para conforto físico melhorado", "Síndrome do conforto prejudicado no fim da vida", "Dor aguda", "Síndrome da dor crônica", "Dor crônica", "Dor no trabalho de parto"]}, {"classe": "Classe 2. Conforto ambiental", "diagnosticos": []}, {"classe": "Classe 3. Conforto social", "diagnosticos": ["Disposição para conforto social melhorado", "Conexão social inadequada", "Rede de apoio social inadequada", "Solidão excessiva", "Risco de solidão excessiva"]}, {"classe": "Classe 4. Conforto psicológico", "diagnosticos": ["Conforto psicológico prejudicado", "Disposição para conforto psicológico melhorado"]}]}, {"dominio": "Domínio 13. Crescimento/desenvolvimento", "classes": [{"classe": "Classe 1. Crescimento", "diagnosticos": ["Crescimento atrasado da criança", "Risco de crescimento atrasado da criança"]}, {"classe": "Classe 2. Desenvolvimento", "diagnosticos": ["Desenvolvimento atrasado da criança", "Risco de desenvolvimento atrasado da criança", "Desenvolvimento motor atrasado do lactente", "Risco de desenvolvimento motor atrasado do lactente", "Organização prejudicada do neurodesenvolvimento do lactente", "Risco de organização prejudicada do neurodesenvolvimento do lactente", "Disposição para organização melhorada do neurodesenvolvimento do lactente", "Resposta ineficaz de sucção-deglutição do lactente"]}]}];


// === data-avaliacao.js ===
// ===== dados/construção — avaliacao.html =====

buildAccordionView('avaliacao', 'Avaliação e Exame Físico', '1ª etapa do Processo de Enfermagem: colheita de dados, avaliação primária (ABCDE) e exame físico.', [
{
  icon: ICON_ALERT, bg:'#fbe4e8', fg:'#E80018',
  title:'Avaliação Primária — ABCDE',
  sub:'Abordagem sistemática ao doente crítico ou instável',
  body:`
  <div class="abcde-step"><div class="abcde-letter">A</div><div class="abcde-body"><b>Airway — Via aérea</b><p>Verificar permeabilidade da via aérea. Procurar obstrução (corpo estranho, secreções, edema, queda da língua). Considerar posicionamento, aspiração ou via aérea adjuvante se necessário.</p></div></div>
  <div class="abcde-step"><div class="abcde-letter">B</div><div class="abcde-body"><b>Breathing — Respiração</b><p>Avaliar frequência, ritmo e esforço respiratório, simetria torácica, ausculta pulmonar e SpO₂. Administrar oxigénio suplementar conforme necessidade.</p></div></div>
  <div class="abcde-step"><div class="abcde-letter">C</div><div class="abcde-body"><b>Circulation — Circulação</b><p>Avaliar pulso, frequência cardíaca, tensão arterial, perfusão periférica, tempo de preenchimento capilar e sinais de hemorragia. Garantir acesso venoso se indicado.</p></div></div>
  <div class="abcde-step"><div class="abcde-letter">D</div><div class="abcde-body"><b>Disability — Estado neurológico</b><p>Avaliar nível de consciência (AVPU ou Glasgow), pupilas (tamanho, simetria, reactividade) e glicemia capilar.</p></div></div>
  <div class="abcde-step"><div class="abcde-letter">E</div><div class="abcde-body"><b>Exposure — Exposição</b><p>Expor o doente para inspecção completa (lesões, hemorragias, exantemas), respeitando a privacidade e prevenindo a hipotermia.</p></div></div>
  <div class="alert-box">Reavaliar a sequência ABCDE sempre que houver alteração do estado do doente — é uma abordagem cíclica, não apenas linear.</div>`
},
{
  icon: ICON_PROC, bg:'#E6EAF1', fg:'var(--azul)',
  title:'Colheita de Dados / Anamnese',
  sub:'Entrevista e história de saúde',
  body:`
  <h4>Componentes da história de saúde</h4>
  <ul>
    <li><b>Identificação:</b> nome, idade, sexo, profissão, estado civil</li>
    <li><b>Queixa principal:</b> motivo da procura de cuidados, nas palavras do doente</li>
    <li><b>História da doença actual (HDA):</b> início, duração, localização, intensidade, factores de alívio/agravamento</li>
    <li><b>Antecedentes pessoais:</b> doenças prévias, cirurgias, internamentos, gravidez/parto</li>
    <li><b>Antecedentes familiares:</b> doenças hereditárias/crónicas na família</li>
    <li><b>Hábitos:</b> alimentação, sono, actividade física, tabaco, álcool, outras substâncias</li>
    <li><b>Alergias:</b> medicamentosas, alimentares, ambientais — e tipo de reacção</li>
    <li><b>Medicação habitual:</b> fármacos, doses e adesão terapêutica</li>
  </ul>
  <h4>Boas práticas de entrevista</h4>
  <ul><li>Utilizar escuta activa e perguntas abertas</li><li>Garantir privacidade e ambiente sem interrupções</li><li>Validar a informação obtida junto de familiares/registos quando possível</li></ul>`
},
{
  icon: ICON_PROC, bg:'#EEF1F6', fg:'#000000',
  title:'Exame Físico Geral',
  sub:'Técnicas de exame: inspecção, palpação, percussão, ausculta',
  body:`
  <table class="ref-table">
    <tr><th>Técnica</th><th>Descrição</th></tr>
    <tr><td>Inspecção</td><td>Observação visual sistemática de aspecto geral, pele, simetria, marcha, postura</td></tr>
    <tr><td>Palpação</td><td>Uso do tacto para avaliar temperatura, textura, massas, sensibilidade, pulsos</td></tr>
    <tr><td>Percussão</td><td>Toque sobre a superfície corporal para avaliar som (maciço, timpânico, claro pulmonar)</td></tr>
    <tr><td>Ausculta</td><td>Uso do estetoscópio para avaliar sons cardíacos, pulmonares e intestinais</td></tr>
  </table>
  <div class="info-box">Ordem geral: inspecção → palpação → percussão → ausculta. Excepção: no abdómen, a ausculta é feita antes da palpação/percussão para não alterar os ruídos intestinais.</div>`
},
{
  icon: ICON_PROC, bg:'#EEF1F6', fg:'#000000',
  title:'Exame Físico por Sistemas',
  sub:'Guia rápido de avaliação',
  body:`
  <h4>Respiratório</h4><p>Frequência e padrão respiratório, simetria torácica, ausculta pulmonar (murmúrio vesicular, ruídos adventícios), SpO₂.</p>
  <h4>Cardiovascular</h4><p>Frequência e ritmo cardíaco, tensão arterial, pulsos periféricos, tempo de preenchimento capilar, edemas.</p>
  <h4>Neurológico</h4><p>Nível de consciência, orientação, pupilas, força e sensibilidade dos membros, linguagem.</p>
  <h4>Abdominal / Gastrointestinal</h4><p>Inspecção, ausculta de ruídos hidroaéreos, palpação de dor/massas, hábitos intestinais.</p>
  <h4>Tegumentar</h4><p>Cor, turgor, integridade da pele, presença de lesões, feridas ou sinais de pressão.</p>
  <h4>Musculoesquelético</h4><p>Amplitude de movimento, força muscular, deformidades, dor articular.</p>
  <h4>Génito-urinário</h4><p>Padrão miccional, características da urina, dor à micção, higiene íntima.</p>`
},
{
  icon: ICON_SCALE, bg:'#E6EAF1', fg:'var(--azul-escuro)',
  title:'Sinais Vitais — Valores de Referência (Adulto)',
  sub:'Incluindo a dor como 5º sinal vital',
  body:`
  <img class="zoomable-img" src="img/bf98e0744d.webp" alt="Locais de palpação de pulsos periféricos" style="width:100%;max-width:220px;margin:4px auto 10px;" onclick="openLightbox('img-pulsos.jpg','Locais de palpação de pulsos periféricos','pulsos.jpg')">
  <div class="img-caption">Locais de palpação de pulsos periféricos</div>
  <table class="ref-table">
    <tr><th>Parâmetro</th><th>Valor de referência</th></tr>
    <tr><td>Frequência cardíaca</td><td>60–100 bpm</td></tr>
    <tr><td>Frequência respiratória</td><td>12–20 rpm</td></tr>
    <tr><td>Tensão arterial</td><td>90/60 – 120/80 mmHg</td></tr>
    <tr><td>Temperatura corporal (axilar)</td><td>36,0–37,2 °C</td></tr>
    <tr><td>SpO₂</td><td>95–100%</td></tr>
    <tr><td>Dor (EVA)</td><td>0/10 (idealmente)</td></tr>
  </table>
  <div class="info-box">A dor é considerada o "5º sinal vital" e deve ser avaliada e registada com a mesma regularidade que os restantes parâmetros.</div>`
},
{
  icon: ICON_SCALE, bg:'#EEF1F6', fg:'#000000',
  title:'Dados Subjectivos vs. Objectivos',
  sub:'Base do raciocínio diagnóstico',
  body:`
  <table class="ref-table">
    <tr><th>Tipo</th><th>Definição</th><th>Exemplo</th></tr>
    <tr><td>Subjectivos</td><td>Referidos pelo próprio doente; não mensuráveis directamente</td><td>"Sinto muitas dores no peito"</td></tr>
    <tr><td>Objectivos</td><td>Observados/medidos pelo profissional</td><td>TA 150/95 mmHg, FC 110 bpm, diaforese visível</td></tr>
  </table>
  <p>A combinação de dados subjectivos e objectivos sustenta a formulação dos diagnósticos de enfermagem (características definidoras) e a definição do plano de cuidados.</p>`
}
]);

// ================= MEDICAMENTOS =================


// === data-biblioteca.js ===
// ===== dados/construção — biblioteca.html =====
// Conteúdo de referência extraído de JASSAA Premium v3.0 (Diagnósticos de Enfermagem,
// NOC/NIC por domínio, tabela comparativa e resumo de ferramentas de cálculo).

buildAccordionView('biblioteca', 'Biblioteca Especializada', 'Documentos de referência: Manual Guia (Gastrite Ulcerativa), Lista Nacional de Medicamentos Essenciais (Moçambique, 2017) e Processo de Enfermagem do Adulto.', [
{
  icon: ICON_PROC, bg:'#fbe4e8', fg:'#E80018',
  title:'📄 Manual Guia — Gastrite Ulcerativa',
  sub:'Sacaíta MONTGOMERY · Enfermeiro Generalista · Karlyon Enterprise, S.A. — 2026',
  body:`
  <div class="info-box"><b>Tipo:</b> Manual técnico de apoio ao doente — Saúde Digestiva</div>
  <h4>Sobre o manual</h4>
  <p>Manual técnico e prático sobre gastrite ulcerativa, em linguagem acessível, cobrindo fisiopatologia, tratamento farmacológico, suporte nutricional e prevenção de recidiva.</p>
  <h4>Índice de capítulos</h4>
  <ul>
    <li>1. Introdução — O que é a gastrite ulcerativa</li>
    <li>2. Anatomia e funcionamento do estômago</li>
    <li>3. Fisiopatologia — como a gastrite evolui para úlcera</li>
    <li>4. Causas mais comuns (H. pylori, AINEs, álcool, tabaco)</li>
    <li>5. Sintomas e sinais de alerta</li>
    <li>6. Diagnóstico (endoscopia, teste respiratório, fezes, sangue)</li>
    <li>7. Sinais de alarme e primeiros cuidados em hemorragia digestiva</li>
    <li>8. Fase 1 — Tratamento farmacológico (IBP + antibióticos)</li>
    <li>9. Fase 2 — Sumo de aloe vera, papaia e banana + moringa</li>
    <li>10. Fase 3 — Plano alimentar diário</li>
    <li>11. Fase 4 — Actividade física na recuperação</li>
    <li>12. Prevenção de recidiva</li>
    <li>13. Perguntas frequentes</li>
  </ul>
  <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;">
    <button onclick="openGastriteViewer()" style="background:#0060E8;color:#fff;border:none;border-radius:10px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:7px;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16"><path d="M14 3v4a1 1 0 001 1h4"/><path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"/></svg>
      Visualizar PDF
    </button>
    <button onclick="downloadGastrite()" style="background:#EEF1F6;color:#000000;border:1px solid #000000;border-radius:10px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:7px;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Baixar PDF
    </button>
  </div>
  <div id="gastrite-pdf-area" style="display:none;margin-top:14px;border-radius:12px;overflow:hidden;border:1px solid var(--borda);">
    <iframe id="gastrite-iframe" style="width:100%;height:520px;border:none;" title="Manual Gastrite Ulcerativa"></iframe>
  </div>`
},
{
  icon: ICON_PROC, bg:'#E6EAF1', fg:'var(--azul)',
  title:'📄 Lista Nacional de Medicamentos Essenciais — Moçambique',
  sub:'Ministério da Saúde · Departamento Farmacêutico — 2017',
  body:`
  <div class="info-box"><b>Tipo:</b> Documento oficial — Formulário Nacional de Medicamentos</div>
  <p>1ª edição da Lista Nacional de Medicamentos Essenciais (LNME) de Moçambique, publicada pelo Ministério da Saúde — Departamento Farmacêutico (2017), com financiamento da USAID/SIAPS. Organiza os medicamentos essenciais por classe terapêutica (Capítulo II) e por nível de prescrição, incluindo a lista de medicamentos de especialidade (Capítulo III).</p>
  ${libraryPdfButtons('lnme')}
  ${libraryPdfViewerBlock('lnme','Lista Nacional de Medicamentos Essenciais 2017')}`
},
{
  icon: ICON_PROC, bg:'#E6EAF1', fg:'var(--azul)',
  title:'📋 Processo de Enfermagem do Adulto',
  sub:'NANDA-I · NIC · NOC (retificado e expandido)',
  body:`
  <div class="info-box"><b>Fonte:</b> Formulário Processo de Enfermagem do Adulto, revisto com base em NANDA-I 2024, NIC e NOC</div>
  <h4>Estrutura do processo</h4>
  <ul>
    <li><b>1. Histórico</b> — Identificação, dados gerais e contexto social</li>
    <li><b>2. Apresentação do problema</b> — Motivo de internamento, queixas e história da doença</li>
    <li><b>3. Antecedentes</b> — Pessoais, familiares e alergias</li>
    <li><b>4. Exame físico</b> — Sinais vitais, avaliação por sistemas e dispositivos</li>
    <li><b>5. Tratamento medicamentoso</b> — Classe, dose, via, objectivo e efeitos secundários</li>
    <li><b>6. Diagnósticos NANDA-I</b> — Com formulação PES, NHB, intervenções NIC, cuidados de enfermagem e resultados esperados NOC</li>
    <li><b>7. Resumo e árvore de problemas</b> — Síntese clínica, causas/efeitos e bibliografia</li>
  </ul>
  <h4>Melhorias aplicadas (retificação NIC/NOC)</h4>
  <ul>
    <li>Nome actualizado: <b>Processo de Enfermagem do Adulto</b></li>
    <li>Campos de <b>Cuidados de Enfermagem</b> (NIC) explícitos e separados</li>
    <li>Campos de <b>Resultados Esperados</b> (NOC) com indicadores mensuráveis</li>
    <li>Formulação PES estruturada (Problema · Etiologia · Sinais/Sintomas)</li>
    <li>Justificativa científica por diagnóstico</li>
    <li>Fotos e logos removidos — formulário limpo e funcional</li>
  </ul>
  <button onclick="showView('proc-form')" style="margin-top:12px;background:#0060E8;color:#fff;border:none;border-radius:10px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;width:100%;">
    Abrir Formulário de Processo de Enfermagem
  </button>`
}
]);
buildAccordionView('bib-diag', 'Diagnósticos de Enfermagem — Referência', 'Diagnósticos, NOC, NIC e tabela comparativa.', [
{
  icon: ICON_PROC, bg:'#E6EAF1', fg:'var(--azul)',
  title:'D001 · Padrão Respiratório Ineficaz',
  sub:'Diagnóstico real · NHB: Oxigenação',
  body:`
  <div class="info-box"><b>NHB:</b> Oxigenação</div>
  <h4>Relacionado com</h4>
  <p>Fraqueza muscular respiratória</p>
  <h4>Evidenciado por</h4>
  <ul><li>Frequência respiratória >24/min</li><li>Uso de músculos acessórios</li><li>Dispneia ao esforço</li></ul>
  <h4>NOC — Resultados esperados</h4>
  <ul><li>Manutenção de via aérea patente</li><li>Simetria do movimento torácico</li><li>Saturação O2 ≥95%</li></ul>
  <h4>NIC — Intervenções</h4>
  <ul><li>Posicionamento Fowler</li><li>Monitorização contínua de SO2</li><li>Oxigenoterapia conforme prescrição</li></ul>`
},
{
  icon: ICON_PROC, bg:'#EEF1F6', fg:'#000000',
  title:'D002 · Débito Cardíaco Diminuído',
  sub:'Diagnóstico real · NHB: Circulação',
  body:`
  <div class="info-box"><b>NHB:</b> Circulação</div>
  <h4>Relacionado com</h4>
  <p>Alteração da contractilidade miocárdica</p>
  <h4>Evidenciado por</h4>
  <ul><li>PA sistólica <90mmHg</li><li>FC >100bpm</li><li>Pele fria e pálida</li></ul>
  <h4>NOC — Resultados esperados</h4>
  <ul><li>Perfusão tisular adequada</li><li>Pele morna e rosada</li><li>Débito urinário >0.5ml/kg/h</li></ul>
  <h4>NIC — Intervenções</h4>
  <ul><li>Monitorização hemodinâmica</li><li>Acesso venoso periférico</li><li>Infusão de soros conforme prescrição</li></ul>`
},
{
  icon: ICON_PROC, bg:'#EEF1F6', fg:'#000000',
  title:'D003 · Nutrição Desequilibrada (Menos do que Necessário)',
  sub:'Diagnóstico real · NHB: Nutrição',
  body:`
  <div class="info-box"><b>NHB:</b> Nutrição</div>
  <h4>Relacionado com</h4>
  <p>Dificuldade de deglutição pós-AVC</p>
  <h4>Evidenciado por</h4>
  <ul><li>Ingestão proteica inadequada</li><li>Peso <95% do ideal</li><li>Albumina sérica <3.5g/dL</li></ul>
  <h4>NOC — Resultados esperados</h4>
  <ul><li>Peso estável</li><li>Ingestão nutricional adequada</li><li>Mucosa oral íntegra</li></ul>
  <h4>NIC — Intervenções</h4>
  <ul><li>Avaliação nutricional completa</li><li>Nutrição enteral por sonda NG</li><li>Suplementação calórica</li></ul>`
},
{
  icon: ICON_PROC, bg:'#E6EAF1', fg:'var(--azul-escuro)',
  title:'D004 · Constipação',
  sub:'Diagnóstico real · NHB: Eliminação',
  body:`
  <div class="info-box"><b>NHB:</b> Eliminação</div>
  <h4>Relacionado com</h4>
  <p>Imobilidade prolongada em UTI</p>
  <h4>Evidenciado por</h4>
  <ul><li>Ausência de evacuações há 48h</li><li>Abdómen distendido</li><li>Resíduos gástricos aumentados</li></ul>
  <h4>NOC — Resultados esperados</h4>
  <ul><li>Padrão evacuatório normal</li><li>Abdómen suave à palpação</li><li>Evacuações diárias</li></ul>
  <h4>NIC — Intervenções</h4>
  <ul><li>Massagem abdominal</li><li>Laxantes osmóticos</li><li>Hidratação adequada</li></ul>`
},
{
  icon: ICON_PROC, bg:'#EEF1F6', fg:'#000000',
  title:'D005 · Déficit de Volume Líquido',
  sub:'Diagnóstico real · NHB: Hidratação',
  body:`
  <div class="info-box"><b>NHB:</b> Hidratação</div>
  <h4>Relacionado com</h4>
  <p>Perdas aumentadas por diarreia e vómitos</p>
  <h4>Evidenciado por</h4>
  <ul><li>Turgor cutâneo diminuído</li><li>Mucosas secas</li><li>Débito urinário <400ml/24h</li></ul>
  <h4>NOC — Resultados esperados</h4>
  <ul><li>Hidratação adequada</li><li>Turgor cutâneo normal</li><li>Mucosas húmidas</li></ul>
  <h4>NIC — Intervenções</h4>
  <ul><li>Reposição hidroeletrolítica</li><li>Monitorização de sinais vitais</li><li>Controlo rigoroso de ingressos/saídas</li></ul>`
},
{
  icon: ICON_PROC, bg:'#fbe4e8', fg:'#E80018',
  title:'D006 · Hipertermia',
  sub:'Diagnóstico real · NHB: Temperatura',
  body:`
  <div class="info-box"><b>NHB:</b> Temperatura</div>
  <h4>Relacionado com</h4>
  <p>Processo infeccioso (pneumonia nosocomial)</p>
  <h4>Evidenciado por</h4>
  <ul><li>Temperatura >38.5°C</li><li>Sudoração profusa</li><li>Taquicardia e taquipneia</li></ul>
  <h4>NOC — Resultados esperados</h4>
  <ul><li>Temperatura normotérmica</li><li>Pele seca</li><li>Frequência respiratória normal</li></ul>
  <h4>NIC — Intervenções</h4>
  <ul><li>Antitermia com fármacos</li><li>Compressas frias</li><li>Controlo de temperatura 4/4h</li></ul>`
},
{
  icon: ICON_PROC, bg:'#E6EAF1', fg:'var(--azul)',
  title:'D007 · Insónia',
  sub:'Diagnóstico real · NHB: Sono/Repouso',
  body:`
  <div class="info-box"><b>NHB:</b> Sono/Repouso</div>
  <h4>Relacionado com</h4>
  <p>Stress ambiental da UTI (barulho, luz)</p>
  <h4>Evidenciado por</h4>
  <ul><li>Relato de insónia</li><li>Olheiras acentuadas</li><li>Sonolência diurna</li></ul>
  <h4>NOC — Resultados esperados</h4>
  <ul><li>Repouso adequado 6-8h/dia</li><li>Vigília alerta durante o dia</li><li>Expressão facial descansada</li></ul>
  <h4>NIC — Intervenções</h4>
  <ul><li>Ambiente silencioso e escuro</li><li>Horário de repouso estruturado</li><li>Higiene do sono estruturada</li></ul>`
},
{
  icon: ICON_PROC, bg:'#EEF1F6', fg:'#000000',
  title:'D008 · Mobilidade Física Limitada',
  sub:'Diagnóstico real · NHB: Movimento',
  body:`
  <div class="info-box"><b>NHB:</b> Movimento</div>
  <h4>Relacionado com</h4>
  <p>Paralisia flácida após AVC</p>
  <h4>Evidenciado por</h4>
  <ul><li>Amplitude movimento <25%</li><li>Força muscular grau 0-1</li><li>Rigidez articular</li></ul>
  <h4>NOC — Resultados esperados</h4>
  <ul><li>Amplitude movimento progressiva</li><li>Força muscular grau 4-5</li><li>Realiza AVD independentemente</li></ul>
  <h4>NIC — Intervenções</h4>
  <ul><li>Fisioterapia motora 2x/dia</li><li>Posicionamento cada 2h</li><li>Mobilização articular passiva</li></ul>`
},
{
  icon: ICON_PROC, bg:'#EEF1F6', fg:'#000000',
  title:'D009 · Risco de Queda',
  sub:'Diagnóstico real · NHB: Segurança',
  body:`
  <div class="info-box"><b>NHB:</b> Segurança</div>
  <h4>Relacionado com</h4>
  <p>Fraqueza, desequilíbrio neurológico</p>
  <h4>Evidenciado por</h4>
  <ul><li>Marcha instável</li><li>Orientação prejudicada</li><li>Ambiente com obstáculos</li></ul>
  <h4>NOC — Resultados esperados</h4>
  <ul><li>Comportamento de segurança</li><li>Ambiente livre de riscos</li><li>Mantém equilíbrio em pé</li></ul>
  <h4>NIC — Intervenções</h4>
  <ul><li>Cama baixa com grades</li><li>Acompanhamento em deambulações</li><li>Educação sobre riscos</li></ul>`
},
{
  icon: ICON_PROC, bg:'#E6EAF1', fg:'var(--azul-escuro)',
  title:'D010 · Déficit de Autohigiene',
  sub:'Diagnóstico real · NHB: Higiene',
  body:`
  <div class="info-box"><b>NHB:</b> Higiene</div>
  <h4>Relacionado com</h4>
  <p>Limitação de mobilidade por fratura</p>
  <h4>Evidenciado por</h4>
  <ul><li>Incapacidade de lavar cabelos</li><li>Pele ressecada</li><li>Cabelo despenteado</li></ul>
  <h4>NOC — Resultados esperados</h4>
  <ul><li>Higiene pessoal adequada</li><li>Pele limpa e cuidada</li><li>Aparência pessoal melhorada</li></ul>
  <h4>NIC — Intervenções</h4>
  <ul><li>Banho assistido diário</li><li>Higiene oral com escova de dentes</li><li>Cuidado com unhas</li></ul>`
},
{
  icon: ICON_PROC, bg:'#EEF1F6', fg:'#000000',
  title:'D011 · Disfunção Sexual',
  sub:'Diagnóstico real · NHB: Sexualidade',
  body:`
  <div class="info-box"><b>NHB:</b> Sexualidade</div>
  <h4>Relacionado com</h4>
  <p>Efeitos secundários de antidepressivos</p>
  <h4>Evidenciado por</h4>
  <ul><li>Diminuição do desejo sexual</li><li>Dificuldade de ereção</li><li>Insatisfação conjugal</li></ul>
  <h4>NOC — Resultados esperados</h4>
  <ul><li>Função sexual satisfatória</li><li>Conforto relatado</li><li>Relacionamento conjugal harmónico</li></ul>
  <h4>NIC — Intervenções</h4>
  <ul><li>Aconselhamento sexual</li><li>Educação sobre efeitos medicamentosos</li><li>Referência a sexólogo</li></ul>`
},
{
  icon: ICON_PROC, bg:'#fbe4e8', fg:'#E80018',
  title:'D012 · Déficit de Conhecimento sobre Autocuidado',
  sub:'Diagnóstico real · NHB: Aprendizagem',
  body:`
  <div class="info-box"><b>NHB:</b> Aprendizagem</div>
  <h4>Relacionado com</h4>
  <p>Falta de experiência prévia com insulina</p>
  <h4>Evidenciado por</h4>
  <ul><li>Verbalizações imprecisas</li><li>Execução incorreta da injecção</li><li>Dúvidas frequentes</li></ul>
  <h4>NOC — Resultados esperados</h4>
  <ul><li>Conhecimento sobre insulina aumentado</li><li>Administração correcta técnica</li><li>Confiança melhorada</li></ul>
  <h4>NIC — Intervenções</h4>
  <ul><li>Educação individual estruturada</li><li>Demonstração prática de injecção</li><li>Retorno de demonstração</li></ul>`
},
{
  icon: ICON_PROC, bg:'#E6EAF1', fg:'var(--azul)',
  title:'D013 · Ansiedade Moderada',
  sub:'Diagnóstico real · NHB: Psicosocial',
  body:`
  <div class="info-box"><b>NHB:</b> Psicosocial</div>
  <h4>Relacionado com</h4>
  <p>Ameaça à integridade biológica (cirurgia)</p>
  <h4>Evidenciado por</h4>
  <ul><li>Agitação psicomotora</li><li>Verbalização de preocupações</li><li>Insónia noturna</li></ul>
  <h4>NOC — Resultados esperados</h4>
  <ul><li>Controle emocional melhorado</li><li>Técnicas de relaxamento aplicadas</li><li>Expressão de preocupações reduzida</li></ul>
  <h4>NIC — Intervenções</h4>
  <ul><li>Escuta activa atenta</li><li>Técnicas de relaxamento ensinadas</li><li>Presença reconfortante</li></ul>`
},
{
  icon: ICON_PROC, bg:'#EEF1F6', fg:'#000000',
  title:'D014 · Capacidade Adaptativa Prejudicada',
  sub:'Diagnóstico real · NHB: Coping/Adaptação',
  body:`
  <div class="info-box"><b>NHB:</b> Coping/Adaptação</div>
  <h4>Relacionado com</h4>
  <p>Luto pela perda de autonomia</p>
  <h4>Evidenciado por</h4>
  <ul><li>Isolamento social</li><li>Diminuição de interesse nas actividades</li><li>Choro frequente</li></ul>
  <h4>NOC — Resultados esperados</h4>
  <ul><li>Uso de estratégias de coping</li><li>Participação social retomada</li><li>Expressão emocional apropriada</li></ul>
  <h4>NIC — Intervenções</h4>
  <ul><li>Encorajamento de verbalização</li><li>Envolvimento de psicólogo</li><li>Actividades recreativas adaptadas</li></ul>`
},
{
  icon: ICON_PROC, bg:'#EEF1F6', fg:'#000000',
  title:'D015 · Sofrimento Espiritual',
  sub:'Diagnóstico real · NHB: Espiritualidade',
  body:`
  <div class="info-box"><b>NHB:</b> Espiritualidade</div>
  <h4>Relacionado com</h4>
  <p>Conflito entre valores religiosos e plano terapêutico</p>
  <h4>Evidenciado por</h4>
  <ul><li>Questionamento do sentido da vida</li><li>Recusa de tratamentos</li><li>Expressão de raiva com Deus</li></ul>
  <h4>NOC — Resultados esperados</h4>
  <ul><li>Paz interior melhorada</li><li>Sentido de propósito retomado</li><li>Aceitação do plano terapêutico</li></ul>
  <h4>NIC — Intervenções</h4>
  <ul><li>Escuta activa a valores</li><li>Envolvimento de capelão</li><li>Respeito a preferências religiosas</li></ul>`
},
{
  icon: ICON_ALERT, bg:'#E6EAF1', fg:'var(--azul-escuro)',
  title:'DR01 · Risco de Úlcera de Pressão',
  sub:'Diagnóstico de risco · NHB: Pele/Integridade',
  body:`
  <div class="info-box"><b>NHB:</b> Pele/Integridade</div>
  <h4>Fatores de risco</h4>
  <ul><li>Imobilidade prolongada</li><li>Desnutrição</li><li>Incontinência fecal/urinária</li><li>Pele frágil (idade >75 anos)</li></ul>
  <h4>Prevenção</h4>
  <ul><li>Mudanças posicionais cada 2h</li><li>Colchão antiescaras</li><li>Avaliação diária com Escala Braden</li><li>Higiene e hidratação adequadas</li></ul>`
},
{
  icon: ICON_ALERT, bg:'#EEF1F6', fg:'#000000',
  title:'DR02 · Risco de Infecção do Sítio Cirúrgico',
  sub:'Diagnóstico de risco · NHB: Infecção',
  body:`
  <div class="info-box"><b>NHB:</b> Infecção</div>
  <h4>Fatores de risco</h4>
  <ul><li>Cirurgia contaminada</li><li>Paciente imunodeprimido</li><li>Obesidade</li><li>Diabetes descontrolada</li></ul>
  <h4>Prevenção</h4>
  <ul><li>Técnica asséptica rigorosa</li><li>Profilaxia antibiótica</li><li>Monitorização de sinais inflamatórios</li><li>Educação sobre cuidados com ferida</li></ul>`
},
{
  icon: ICON_ALERT, bg:'#fbe4e8', fg:'#E80018',
  title:'DR03 · Risco de Trombo-embolismo Venoso',
  sub:'Diagnóstico de risco · NHB: Circulação',
  body:`
  <div class="info-box"><b>NHB:</b> Circulação</div>
  <h4>Fatores de risco</h4>
  <ul><li>Imobilidade prolongada</li><li>Cirurgia de grande vulto</li><li>Obesidade</li><li>Idade >60 anos</li></ul>
  <h4>Prevenção</h4>
  <ul><li>Meias de compressão</li><li>Exercícios de perna</li><li>Anticoagulação profiláctica</li><li>Hidratação adequada</li></ul>`
},
{
  icon: ICON_ALERT, bg:'#E6EAF1', fg:'var(--azul)',
  title:'DR04 · Risco de Retenção Urinária',
  sub:'Diagnóstico de risco · NHB: Eliminação',
  body:`
  <div class="info-box"><b>NHB:</b> Eliminação</div>
  <h4>Fatores de risco</h4>
  <ul><li>Anestesia recente</li><li>Opioides</li><li>Imobilidade</li><li>Infecção urinária</li></ul>
  <h4>Prevenção</h4>
  <ul><li>Monitorização de diurese</li><li>Sonda vesical se necessário</li><li>Privacidade na micção</li><li>Medicação conforme prescrição</li></ul>`
},
{
  icon: ICON_ALERT, bg:'#EEF1F6', fg:'#000000',
  title:'DR05 · Risco de Aspiração',
  sub:'Diagnóstico de risco · NHB: Aspiração',
  body:`
  <div class="info-box"><b>NHB:</b> Aspiração</div>
  <h4>Fatores de risco</h4>
  <ul><li>Diminuição do nível consciência</li><li>Disfagia</li><li>Posição supina</li><li>Sonda NG</li></ul>
  <h4>Prevenção</h4>
  <ul><li>Posição semi-Fowler permanente</li><li>Teste de deglutição</li><li>Aspiração oral antes de alimentar</li><li>Monitorização contínua</li></ul>`
},
{
  icon: ICON_SCALE, bg:'#EEF1F6', fg:'#000000',
  title:'DP01 · Disposição para Saúde Melhorada',
  sub:'Promoção da saúde · NHB: Saúde',
  body:`
  <div class="info-box"><b>NHB:</b> Saúde</div>
  <h4>Comportamentos desejados</h4>
  <ul><li>Adopção de estilo vida saudável</li><li>Exercício físico regular</li><li>Alimentação equilibrada</li><li>Compliance medicamentosa</li></ul>
  <h4>Intervenções</h4>
  <ul><li>Educação sobre factores de risco</li><li>Plano de exercício estruturado</li><li>Aconselhamento nutricional</li><li>Acompanhamento regular</li></ul>`
},
{
  icon: ICON_SCALE, bg:'#E6EAF1', fg:'var(--azul-escuro)',
  title:'DP02 · Disposição para Cuidado Pessoal Melhorado',
  sub:'Promoção da saúde · NHB: Cuidado Pessoal',
  body:`
  <div class="info-box"><b>NHB:</b> Cuidado Pessoal</div>
  <h4>Comportamentos desejados</h4>
  <ul><li>Higiene pessoal autónoma</li><li>Aparência pessoal cuidada</li><li>Vestuário apropriado</li><li>Saúde oral optimizada</li></ul>
  <h4>Intervenções</h4>
  <ul><li>Educação sobre higiene</li><li>Ambientes facilitadores</li><li>Reforço positivo de comportamentos</li><li>Envolvimento da família</li></ul>`
},
{
  icon: ICON_SCALE, bg:'#EEF1F6', fg:'#000000',
  title:'DP03 · Disposição para Comunicação Melhorada',
  sub:'Promoção da saúde · NHB: Comunicação',
  body:`
  <div class="info-box"><b>NHB:</b> Comunicação</div>
  <h4>Comportamentos desejados</h4>
  <ul><li>Expressão clara e coerente</li><li>Escuta activa</li><li>Relacionamento harmonioso</li><li>Resolução de conflitos</li></ul>
  <h4>Intervenções</h4>
  <ul><li>Treino de comunicação assertiva</li><li>Facilitação de diálogos família-paciente</li><li>Grupos de apoio</li><li>Mediação de conflitos</li></ul>`
},
{
  icon: ICON_SCALE, bg:'#E6EAF1', fg:'var(--azul)',
  title:'NOC · Exemplos de Resultados por Domínio',
  sub:'Nursing Outcomes Classification — referência rápida',
  body:`
  <p>Descrições mensuráveis de estados, comportamentos ou percepções do cliente em relação aos diagnósticos de enfermagem e às intervenções.</p>
  <h4>Oxigenação</h4>
  <ul><li>Manutenção via aérea patente</li><li>Movimento torácico simétrico</li><li>Ausculta sem sons anormais</li><li>SatO2 ≥95% em ar ambiente</li><li>Sem uso músculos acessórios</li></ul>
  <h4>Circulação</h4>
  <ul><li>Pressão arterial dentro limites normais</li><li>Frequência cardíaca 60-100 bpm</li><li>Pulsos periféricos palpáveis bilaterais</li><li>Pele morna e com boa perfusão</li><li>Sem edema periférico</li></ul>
  <h4>Nutrição</h4>
  <ul><li>Peso corporal dentro 5% ideal</li><li>Ingestão proteica adequada</li><li>Albumina sérica 3.5-5.0 g/dL</li><li>Pré-albumina >20 mg/dL</li><li>Cicatrização de feridas apropriada</li></ul>
  <h4>Eliminação</h4>
  <ul><li>Padrão evacuatório normal</li><li>Consistência de fezes adequada</li><li>Micção sem incontinência</li><li>Débito urinário >0.5ml/kg/h</li><li>Urina clara e amarelada</li></ul>
`
},
{
  icon: ICON_PROC, bg:'#EEF1F6', fg:'#000000',
  title:'NIC · Exemplos de Intervenções por Domínio Fisiológico',
  sub:'Nursing Interventions Classification — referência rápida',
  body:`
  <p>Ações e cuidados específicos realizados pelos enfermeiros para tratar diagnósticos de enfermagem e promover saúde.</p>
  <h4>Suporte Respiratório</h4>
  <ul><li>Monitorização contínua SatO2</li><li>Posicionamento Fowler elevada</li><li>Oxigenoterapia conforme prescrição</li><li>Aspiração endotraqueal conforme necessidade</li><li>Educação sobre respiração profunda</li></ul>
  <h4>Suporte Cardiovascular</h4>
  <ul><li>Monitorização contínua ECG</li><li>Medição pressão arterial 4/4h</li><li>Reposição volêmica conforme prescrição</li><li>Infusão medicações vasoativas</li><li>Repouso em cama com elevação membros</li></ul>
  <h4>Suporte Nutricional</h4>
  <ul><li>Avaliação estado nutricional semanal</li><li>Administração nutrição enteral/parenteral</li><li>Monitorização ingestão alimentos</li><li>Orientação dieta personalizada</li><li>Apoio psicossocial durante refeições</li></ul>
  <h4>Controle de Infecção</h4>
  <ul><li>Técnica asséptica rigorosa</li><li>Higiene das mãos 5 momentos</li><li>Isolamento de gotículas/contacto se indicado</li><li>Vigilância sinais inflamação</li><li>Colheita culturas conforme protocolo</li></ul>
`
},
{
  icon: ICON_EXAM, bg:'#EEF1F6', fg:'#000000',
  title:'Tabela Comparativa NOC vs NIC',
  sub:'Diferenças essenciais entre as duas classificações',
  body:`
  <table class="ref-table">
    <tr><th>Aspecto</th><th>NOC</th><th>NIC</th></tr>
    <tr><td>O quê?</td><td>Resultados esperados para o cliente</td><td>Ações do enfermeiro</td></tr>
    <tr><td>Quando?</td><td>Avaliação inicial e seguimento</td><td>Implementação contínua</td></tr>
    <tr><td>Foco</td><td>Cliente (estado de saúde)</td><td>Enfermeiro (ação)</td></tr>
    <tr><td>Mensuração</td><td>Escala de Likert (1-5)</td><td>Realização / Não realização</td></tr>
  </table>`
}
]);
buildAccordionView('bib-calc', 'Ferramentas Clínicas de Cálculo', 'Resumo das calculadoras disponíveis.', [
{
  icon: ICON_SCALE, bg:'#fbe4e8', fg:'#E80018',
  title:'Ferramentas Clínicas de Cálculo · Referência',
  sub:'Resumo das calculadoras disponíveis em Ferramentas',
  body:`
  <p>As calculadoras interativas estão disponíveis em <b>Ferramentas → Calculadoras de Enfermagem</b>. Resumo das variáveis de entrada:</p>
  <table class="ref-table">
    <tr><th>Calculadora</th><th>Variáveis de entrada</th></tr>
    <tr><td>IMC Clínica</td><td>Peso (kg), Altura (m)</td></tr>
    <tr><td>Balanço Hídrico</td><td>Ingressos (mL), Saídas (mL)</td></tr>
    <tr><td>Dose por Peso</td><td>Peso (kg), Dose (mg/kg)</td></tr>
    <tr><td>Escala de Glasgow (GCS)</td><td>Abertura Ocular (1-4), Resposta Verbal (1-5), Resposta Motora (1-6)</td></tr>
  </table>`
}
]);

// Mover para as secções certas: diagnósticos/NOC/NIC -> Diagnósticos de Enfermagem; cálculo -> Cálculos de Enfermagem
(function(){
  function mover(tmpId, destViewId, titulo){
    var tmp=document.getElementById('view-'+tmpId), dest=document.getElementById('view-'+destViewId);
    if(!tmp||!dest) return;
    var wrap=document.createElement('div');
    wrap.id=destViewId+'-ref';
    var t=document.createElement('div');
    t.className='section-title'; t.style.marginTop='18px'; t.textContent=titulo;
    wrap.appendChild(t);
    tmp.querySelectorAll('.acc').forEach(function(a){ wrap.appendChild(a); });
    dest.appendChild(wrap);
    tmp.parentNode.removeChild(tmp);
  }
  mover('bib-diag','diagnosticos','Referência: Diagnósticos · NOC · NIC');
  mover('bib-calc','calculadora','Ferramentas Clínicas de Cálculo · Referência');
})();


// === data-casos-clinicos.js ===
// ===== dados/construção — casos-clinicos.html =====

buildAccordionView('casos-clinicos', 'Casos Clínicos', '20 casos clínicos detalhados para estudo do processo de enfermagem: dados clínicos, diagnósticos de enfermagem, resultados esperados (NOC) e intervenções (NIC). Material de estudo e apoio à prática — use sempre com julgamento clínico e protocolos institucionais.', [
{
  icon: ICON_SCALE, bg:'#EEF1F6', fg:'#000000',
  title:'C001 · Enfarte Agudo do Miocárdio (EAM) com Supradesnivelamento ST',
  sub:'UTI Cardiológica · 58 anos',
  body:`  <div class="card-row"><b>Idade/Género:</b> 58 anos, M</div>
  <div class="card-row"><b>Área:</b> UTI Cardiológica</div>
  <p style="font-size:13px;margin:8px 0;">Paciente com dor torácica opressiva irradiada para braço esquerdo há 2h, sudorese fria, náuseas. ECG com supra de ST em parede anterior. Troponina elevada.</p>
  <div class="info-box"><b>NHB afetadas:</b> Oxigenação, Circulação, Dor, Psicosocial · <b>Evolução estimada:</b> 3-5 dias internamento</div>
  <b style="display:block;margin-top:10px;color:var(--azul-escuro);font-size:12.5px;">Diagnósticos de Enfermagem</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Padrão Respiratório Ineficaz</li><li>Débito Cardíaco Diminuído</li><li>Dor Aguda</li><li>Ansiedade Moderada</li><li>Conhecimento Deficiente sobre Autocuidado</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Resultados Esperados (NOC)</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>SatO2 ≥95%</li><li>FC 60-100bpm</li><li>PA sistólica 90-140mmHg</li><li>Dor ≤3/10</li><li>Verbaliza compreensão de actividades permitidas</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Intervenções de Enfermagem (NIC)</b>
  <ul style="font-size:12.5px;margin:6px 0 0;"><li>Monitorização contínua ECG/SatO2</li><li>Posição semi-Fowler/Fowler</li><li>Oxigenoterapia conforme prescrição</li><li>Analgesia conforme protocolo agudo coronário</li><li>Educação sobre repouso e medicação</li></ul>`
},
{
  icon: ICON_PROC, bg:'#EEF1F6', fg:'var(--azul)',
  title:'C002 · Acidente Vascular Cerebral Isquémico - Hemiplegia à Direita',
  sub:'Internamento Neurologia · 72 anos',
  body:`  <div class="card-row"><b>Idade/Género:</b> 72 anos, F</div>
  <div class="card-row"><b>Área:</b> Internamento Neurologia</div>
  <p style="font-size:13px;margin:8px 0;">Paciente de 72 anos com antecedentes de HTA e fibrilhação auricular. Acordou com défice neurológico: paralisia flácida membro superior e inferior direitos, afasia de Broca, desvio da comissura labial à esquerda.</p>
  <div class="info-box"><b>NHB afetadas:</b> Movimento, Higiene, Comunicação, Pele/Integridade, Nutrição · <b>Evolução estimada:</b> 2-4 semanas internamento com reabilitação</div>
  <b style="display:block;margin-top:10px;color:var(--azul-escuro);font-size:12.5px;">Diagnósticos de Enfermagem</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Mobilidade Física Limitada</li><li>Déficit de Autohigiene</li><li>Comunicação Verbal Prejudicada</li><li>Risco de Úlcera de Pressão</li><li>Padrão Alimentar Prejudicado</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Resultados Esperados (NOC)</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Amplitude de movimento progressiva a grau 2-3</li><li>Sem sinais de hipotrofia</li><li>Sem úlceras de pressão</li><li>Alimentação por sonda NG com progressão conforme tolerado</li><li>Pele íntegra em zonas de pressão</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Intervenções de Enfermagem (NIC)</b>
  <ul style="font-size:12.5px;margin:6px 0 0;"><li>Fisioterapia motora 2x/dia</li><li>Posicionamento cada 2h com almofadas</li><li>Colchão antiescaras desde admissão</li><li>Avaliação de deglutição conforme protocolo</li><li>Terapia da fala 1x/dia</li><li>Sonda NG com nutrição entérica</li></ul>`
},
{
  icon: ICON_EXAM, bg:'#EEF1F6', fg:'#000000',
  title:'C003 · Asma Aguda Moderada - Exacerbação com Sibilância',
  sub:'Urgência/Medicina Interna · 34 anos',
  body:`  <div class="card-row"><b>Idade/Género:</b> 34 anos, F</div>
  <div class="card-row"><b>Área:</b> Urgência/Medicina Interna</div>
  <p style="font-size:13px;margin:8px 0;">Paciente com antecedentes de asma alérgica. Apresenta dispneia progressiva nas últimas 6h, sibilância difusa bilateral, redução do murmúrio vesicular nas bases, uso de músculos acessórios.</p>
  <div class="info-box"><b>NHB afetadas:</b> Oxigenação, Circulação, Psicosocial, Aprendizagem · <b>Evolução estimada:</b> 1-3 dias internamento com observação</div>
  <b style="display:block;margin-top:10px;color:var(--azul-escuro);font-size:12.5px;">Diagnósticos de Enfermagem</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Padrão Respiratório Ineficaz</li><li>Troca Gasosa Prejudicada</li><li>Ansiedade Moderada</li><li>Intolerância à Actividade</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Resultados Esperados (NOC)</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>SatO2 ≥95%</li><li>FR 16-20/min</li><li>Desaparecimento de sibilância</li><li>Sem uso de músculos acessórios</li><li>Verbaliza redução de ansiedade</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Intervenções de Enfermagem (NIC)</b>
  <ul style="font-size:12.5px;margin:6px 0 0;"><li>Posição Fowler elevada</li><li>Oxigenoterapia conforme resultado da SpO2</li><li>Inalações com broncodilatadores prescritos</li><li>Corticoides sistémicos conforme protocolo</li><li>Hidratação venosa</li><li>Educação sobre desencadeantes de asma</li></ul>`
},
{
  icon: ICON_ALERT, bg:'#fbe4e8', fg:'#E80018',
  title:'C004 · Insuficiência Renal Aguda KDIGO Estádio 3 - Pós-Cirurgia',
  sub:'UTI Cirúrgica · 68 anos',
  body:`  <div class="card-row"><b>Idade/Género:</b> 68 anos, M</div>
  <div class="card-row"><b>Área:</b> UTI Cirúrgica</div>
  <p style="font-size:13px;margin:8px 0;">Paciente pós cirurgia cardiotorácica dia 2. Creatinina sérica triplicou em 48h (1.2 para 3.6 mg/dL), oligúria (<400ml/24h), edema periférico progressivo, elevação de ureia.</p>
  <div class="info-box"><b>NHB afetadas:</b> Eliminação, Hidratação, Nutrição, Infecção · <b>Evolução estimada:</b> 5-7 dias com possibilidade de diálise</div>
  <b style="display:block;margin-top:10px;color:var(--azul-escuro);font-size:12.5px;">Diagnósticos de Enfermagem</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Volume Líquido Excessivo</li><li>Déficit Nutritivo</li><li>Risco de Infecção</li><li>Padrão de Eliminação Prejudicado</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Resultados Esperados (NOC)</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Débito urinário >0.5ml/kg/h</li><li>Peso corporal estável</li><li>Creatinina progressivamente inferior a 2.0</li><li>Sem sinais de infecção urinária</li><li>Equilíbrio electrolítico normalizado</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Intervenções de Enfermagem (NIC)</b>
  <ul style="font-size:12.5px;margin:6px 0 0;"><li>Restrição hídrica conforme débito urinário</li><li>Monitorização rigorosa de ingressos/saídas</li><li>Diálise conforme prescrição do nefrologista</li><li>Dieta renal restrita em potássio/fósforo</li><li>Sonda vesical com medição rigorosa</li><li>Vigilância de sinais de inflamação</li></ul>`
},
{
  icon: ICON_SCALE, bg:'#EEF1F6', fg:'#000000',
  title:'C005 · Diabetes Tipo 2 Descompensada - Cetoacidose',
  sub:'Urgência/Medicina Interna · 45 anos',
  body:`  <div class="card-row"><b>Idade/Género:</b> 45 anos, F</div>
  <div class="card-row"><b>Área:</b> Urgência/Medicina Interna</div>
  <p style="font-size:13px;margin:8px 0;">Paciente diabética conhecida, sem adesão medicamentosa. Apresenta polidipsia, poliúria, cansaço extremo, hálito cetónico, taquipneia (FR 28/min), estado confusional.</p>
  <div class="info-box"><b>NHB afetadas:</b> Nutrição, Hidratação, Circulação, Psicosocial, Aprendizagem · <b>Evolução estimada:</b> 3-5 dias internamento com educação contínua</div>
  <b style="display:block;margin-top:10px;color:var(--azul-escuro);font-size:12.5px;">Diagnósticos de Enfermagem</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Défice de Conhecimento sobre Diabetes</li><li>Nutrição Desequilibrada</li><li>Débito Cardíaco Diminuído</li><li>Processos de Pensamento Alterados</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Resultados Esperados (NOC)</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Glicemia 120-180 mg/dL</li><li>pH arterial >7.35</li><li>Bicarbonato >18 mEq/L</li><li>Sem hálito cetónico</li><li>Verbaliza compreensão sobre a diabetes</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Intervenções de Enfermagem (NIC)</b>
  <ul style="font-size:12.5px;margin:6px 0 0;"><li>Insulina IV conforme protocolo de cetoacidose</li><li>Expansão volémica com soros</li><li>Correção electrolítica progressiva</li><li>Monitorização contínua da glicemia capilar</li><li>Educação estruturada sobre diabetes</li><li>Referenciação a endocrinologia e nutrição</li></ul>`
},
{
  icon: ICON_PROC, bg:'#EEF1F6', fg:'var(--azul)',
  title:'C006 · Pneumonia Nosocomial Adquirida em UTI - VAP',
  sub:'UTI Geral · 76 anos',
  body:`  <div class="card-row"><b>Idade/Género:</b> 76 anos, M</div>
  <div class="card-row"><b>Área:</b> UTI Geral</div>
  <p style="font-size:13px;margin:8px 0;">Paciente intubado há 8 dias por insuficiência respiratória. Febre (39.2°C), tosse com exsudato purulento, leucocitose 15.000, infiltrado novo na radiografia torácica bilateral.</p>
  <div class="info-box"><b>NHB afetadas:</b> Oxigenação, Circulação, Temperatura, Infecção · <b>Evolução estimada:</b> 7-10 dias com possível desmame respiratório</div>
  <b style="display:block;margin-top:10px;color:var(--azul-escuro);font-size:12.5px;">Diagnósticos de Enfermagem</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Padrão Respiratório Ineficaz</li><li>Troca Gasosa Prejudicada</li><li>Hipertermia</li><li>Risco de Infecção Disseminada</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Resultados Esperados (NOC)</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Temperatura <37.5°C</li><li>Ventilação adequada com sincronismo</li><li>SatO2 ≥95%</li><li>Cultura de secreções negativa em 72h</li><li>Leucócitos <12.000</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Intervenções de Enfermagem (NIC)</b>
  <ul style="font-size:12.5px;margin:6px 0 0;"><li>Aspiração endotraqueal conforme necessidade</li><li>Elevação da cabeceira a 30°</li><li>Mudanças posicionais a cada 2h</li><li>Antibioterapia de largo espectro</li><li>Antitérmicos</li><li>Higiene oral com clorexidina</li></ul>`
},
{
  icon: ICON_EXAM, bg:'#EEF1F6', fg:'#000000',
  title:'C007 · Cirrose Hepática Descompensada - Encefalopatia Hepática',
  sub:'Internamento Gastroenterologia · 62 anos',
  body:`  <div class="card-row"><b>Idade/Género:</b> 62 anos, M</div>
  <div class="card-row"><b>Área:</b> Internamento Gastroenterologia</div>
  <p style="font-size:13px;margin:8px 0;">Paciente com cirrose por consumo de álcool. Apresenta confusão mental, asterixis, halitose com odor fecal, palma eritematosa, esplenomegalia palpável, ascite tensa.</p>
  <div class="info-box"><b>NHB afetadas:</b> Processos de Pensamento, Circulação, Hidratação, Nutrição, Psicosocial · <b>Evolução estimada:</b> 1-2 semanas internamento com observação</div>
  <b style="display:block;margin-top:10px;color:var(--azul-escuro);font-size:12.5px;">Diagnósticos de Enfermagem</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Processos de Pensamento Alterados</li><li>Risco de Hemorragia Digestiva</li><li>Volume Líquido Excessivo</li><li>Nutrição Desequilibrada</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Resultados Esperados (NOC)</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Orientação temporal e espacial recuperada</li><li>Sem asterixis</li><li>Sem hematemese/melenas</li><li>Ascite controlada</li><li>Albumina plasmática >3.0 g/dL</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Intervenções de Enfermagem (NIC)</b>
  <ul style="font-size:12.5px;margin:6px 0 0;"><li>Lactulose oral conforme protocolo</li><li>Vigilância de sinais de ingestão alcoólica</li><li>Endoscopia preventiva se varizes</li><li>Dieta com restrição proteica (80g) e sal</li><li>Diuréticos conforme prescrição</li><li>Educação sobre abstinência alcoólica</li></ul>`
},
{
  icon: ICON_ALERT, bg:'#fbe4e8', fg:'#E80018',
  title:'C008 · Fratura do Fémur - Idosa com Comorbilidades',
  sub:'Ortopedia/Cuidados Agudos · 84 anos',
  body:`  <div class="card-row"><b>Idade/Género:</b> 84 anos, F</div>
  <div class="card-row"><b>Área:</b> Ortopedia/Cuidados Agudos</div>
  <p style="font-size:13px;margin:8px 0;">Idosa após queda em casa. Fratura intracapsular do fémur esquerdo. Apresenta dor intensa, edema, equimose, deformidade em rotação externa, incapacidade de suportar peso.</p>
  <div class="info-box"><b>NHB afetadas:</b> Dor, Movimento, Pele/Integridade, Circulação, Higiene · <b>Evolução estimada:</b> 5-7 dias com posterior internamento em ortopedia</div>
  <b style="display:block;margin-top:10px;color:var(--azul-escuro);font-size:12.5px;">Diagnósticos de Enfermagem</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Dor Aguda</li><li>Mobilidade Física Limitada</li><li>Risco de Úlcera de Pressão</li><li>Risco de Trombose</li><li>Défice de Autohigiene</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Resultados Esperados (NOC)</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Dor ≤3/10</li><li>Membro imobilizado corretamente</li><li>Pulsos distais palpáveis</li><li>Pele íntegra</li><li>Realiza atividades de higiene com ajuda</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Intervenções de Enfermagem (NIC)</b>
  <ul style="font-size:12.5px;margin:6px 0 0;"><li>Analgesia conforme protocolo</li><li>Imobilização com tala/tração</li><li>Colchão antiescaras desde a admissão</li><li>Meias de compressão bilaterais</li><li>Exercícios de perna conforme tolerância</li><li>Preparação para cirurgia/internamento ortopédico</li></ul>`
},
{
  icon: ICON_SCALE, bg:'#EEF1F6', fg:'#000000',
  title:'C009 · Tromboembolismo Pulmonar - Sintomas de Início Agudo',
  sub:'Urgência/UTI Respiratória · 55 anos',
  body:`  <div class="card-row"><b>Idade/Género:</b> 55 anos, F</div>
  <div class="card-row"><b>Área:</b> Urgência/UTI Respiratória</div>
  <p style="font-size:13px;margin:8px 0;">Paciente imobilizada em cama há 2 semanas por pneumonia. Dispneia súbita, dor pleural, síncope, taquicardia (FC 115), taquipneia (FR 32), queda de SatO2.</p>
  <div class="info-box"><b>NHB afetadas:</b> Oxigenação, Circulação, Dor, Psicosocial · <b>Evolução estimada:</b> 5-7 dias internamento com anticoagulação</div>
  <b style="display:block;margin-top:10px;color:var(--azul-escuro);font-size:12.5px;">Diagnósticos de Enfermagem</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Padrão Respiratório Ineficaz</li><li>Troca Gasosa Prejudicada</li><li>Débito Cardíaco Diminuído</li><li>Medo/Ansiedade Aguda</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Resultados Esperados (NOC)</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>SatO2 ≥94%</li><li>FR 16-20/min</li><li>FC 60-100bpm</li><li>Ausência de síncopes recorrentes</li><li>Verbaliza redução do medo</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Intervenções de Enfermagem (NIC)</b>
  <ul style="font-size:12.5px;margin:6px 0 0;"><li>Oxigenoterapia em máscara não reinalante</li><li>Monitorização ECG contínua</li><li>Anticoagulação (heparina IV) conforme protocolo</li><li>Avaliação para trombólise/embolectomia</li><li>Repouso absoluto no leito</li><li>Suporte emocional com presença reconfortante</li></ul>`
},
{
  icon: ICON_PROC, bg:'#EEF1F6', fg:'var(--azul)',
  title:'C010 · Sépsis por Infecção do Trato Urinário - Idosa',
  sub:'Urgência/Internamento Medicina · 79 anos',
  body:`  <div class="card-row"><b>Idade/Género:</b> 79 anos, F</div>
  <div class="card-row"><b>Área:</b> Urgência/Internamento Medicina</div>
  <p style="font-size:13px;margin:8px 0;">Idosa com sonda vesical de demora. Desorientação aguda, hipertermia (39.8°C), taquicardia, taquipneia, urina turva com odor fétido, PA sistólica 95mmHg.</p>
  <div class="info-box"><b>NHB afetadas:</b> Infecção, Circulação, Temperatura, Eliminação, Processos de Pensamento · <b>Evolução estimada:</b> 7-10 dias internamento com vigilância intensiva</div>
  <b style="display:block;margin-top:10px;color:var(--azul-escuro);font-size:12.5px;">Diagnósticos de Enfermagem</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Infecção Sistémica (Sépsis)</li><li>Processos de Pensamento Alterados</li><li>Débito Cardíaco Diminuído</li><li>Hipertermia</li><li>Risco de Choque Séptico</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Resultados Esperados (NOC)</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Orientação recuperada</li><li>Temperatura <37.5°C</li><li>PA >100mmHg</li><li>Lactato <2mmol/L</li><li>Cultura de urina negativa em 48h</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Intervenções de Enfermagem (NIC)</b>
  <ul style="font-size:12.5px;margin:6px 0 0;"><li>Antibioterapia IV conforme hemocultura</li><li>Hidratação vigorosa com soros cristaloides</li><li>Vasopressores se hipotensão refratária</li><li>Remoção de sonda vesical/cateterismo intermitente</li><li>Medições 4/4h dos parâmetros de sépsis</li><li>Vigilância rigorosa dos sinais vitais</li></ul>`
},
{
  icon: ICON_EXAM, bg:'#EEF1F6', fg:'#000000',
  title:'C011 · Pancreatite Aguda Severa',
  sub:'UTI Digestiva · 52 anos',
  body:`  <div class="card-row"><b>Idade/Género:</b> 52 anos, M</div>
  <div class="card-row"><b>Área:</b> UTI Digestiva</div>
  <p style="font-size:13px;margin:8px 0;">Dor epigástrica radiante, lipase >3000, edema pancreático, derrame pleural bilateral.</p>
  <div class="info-box"><b>NHB afetadas:</b> Dor, Nutrição, Circulação · <b>Evolução estimada:</b> 7-14 dias</div>
  <b style="display:block;margin-top:10px;color:var(--azul-escuro);font-size:12.5px;">Diagnósticos de Enfermagem</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Dor Aguda Severa</li><li>Nutrição Desequilibrada</li><li>Volume Líquido Excessivo</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Resultados Esperados (NOC)</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Dor <4/10</li><li>Enzimas pancreáticas normalizadas</li><li>Peso estável</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Intervenções de Enfermagem (NIC)</b>
  <ul style="font-size:12.5px;margin:6px 0 0;"><li>Analgesia potente</li><li>Nutrição parentérica se jejum prolongado</li><li>Monitorização de amilase/lipase</li></ul>`
},
{
  icon: ICON_ALERT, bg:'#fbe4e8', fg:'#E80018',
  title:'C012 · Hemorragia Digestiva Alta Varicosa',
  sub:'Urgência Endoscopia · 58 anos',
  body:`  <div class="card-row"><b>Idade/Género:</b> 58 anos, M</div>
  <div class="card-row"><b>Área:</b> Urgência Endoscopia</div>
  <p style="font-size:13px;margin:8px 0;">Hematemese volumosa, melenas, tensão de choque, hipotensão 80/50.</p>
  <div class="info-box"><b>NHB afetadas:</b> Circulação, Eliminação · <b>Evolução estimada:</b> 3-5 dias</div>
  <b style="display:block;margin-top:10px;color:var(--azul-escuro);font-size:12.5px;">Diagnósticos de Enfermagem</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Débito Cardíaco Diminuído</li><li>Risco de Choque</li><li>Medo Agudo</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Resultados Esperados (NOC)</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>PA sistólica >90mmHg</li><li>Hemoglobina estável >7g/dL</li><li>Hemostase endoscópica</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Intervenções de Enfermagem (NIC)</b>
  <ul style="font-size:12.5px;margin:6px 0 0;"><li>Acesso venoso de grande calibre</li><li>Transfusão conforme prescrição</li><li>Endoscopia emergente com ligadura</li></ul>`
},
{
  icon: ICON_SCALE, bg:'#EEF1F6', fg:'#000000',
  title:'C013 · Queimadura de 2º Grau Extensa (20% SCQ)',
  sub:'UTI de Queimados · 44 anos',
  body:`  <div class="card-row"><b>Idade/Género:</b> 44 anos, F</div>
  <div class="card-row"><b>Área:</b> UTI de Queimados</div>
  <p style="font-size:13px;margin:8px 0;">Queimadura por líquido quente. Bolhas, eritema intenso, dor severa, edema progressivo.</p>
  <div class="info-box"><b>NHB afetadas:</b> Dor, Pele/Integridade, Circulação · <b>Evolução estimada:</b> 10-30 dias</div>
  <b style="display:block;margin-top:10px;color:var(--azul-escuro);font-size:12.5px;">Diagnósticos de Enfermagem</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Dor Aguda Severa</li><li>Risco de Infecção</li><li>Défice de Volume Líquido/Hipovolemia</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Resultados Esperados (NOC)</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Dor ≤4/10</li><li>Feridas cicatrizadas sem infecção</li><li>Cicatrização progressiva</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Intervenções de Enfermagem (NIC)</b>
  <ul style="font-size:12.5px;margin:6px 0 0;"><li>Limpeza e desbridamento</li><li>Antibióticos tópicos</li><li>Hidratação agressiva (fórmula de Parkland)</li></ul>`
},
{
  icon: ICON_PROC, bg:'#EEF1F6', fg:'var(--azul)',
  title:'C014 · Asma Severa Refratária - Status Asmaticus',
  sub:'UTI Respiratória · 28 anos',
  body:`  <div class="card-row"><b>Idade/Género:</b> 28 anos, M</div>
  <div class="card-row"><b>Área:</b> UTI Respiratória</div>
  <p style="font-size:13px;margin:8px 0;">Sem resposta a broncodilatadores após 1h. Cansaço, redução progressiva do murmúrio, silêncio auscultatório.</p>
  <div class="info-box"><b>NHB afetadas:</b> Oxigenação · <b>Evolução estimada:</b> 1-3 dias</div>
  <b style="display:block;margin-top:10px;color:var(--azul-escuro);font-size:12.5px;">Diagnósticos de Enfermagem</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Padrão Respiratório Ineficaz</li><li>Troca Gasosa Criticamente Prejudicada</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Resultados Esperados (NOC)</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>SatO2 >90%</li><li>Intubação evitada</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Intervenções de Enfermagem (NIC)</b>
  <ul style="font-size:12.5px;margin:6px 0 0;"><li>Intubação se necessário</li><li>Agonistas beta IV</li><li>Corticoides IV</li></ul>`
},
{
  icon: ICON_EXAM, bg:'#EEF1F6', fg:'#000000',
  title:'C015 · AVC Hemorrágico com Edema Cerebral',
  sub:'UTI Neurologia · 65 anos',
  body:`  <div class="card-row"><b>Idade/Género:</b> 65 anos, F</div>
  <div class="card-row"><b>Área:</b> UTI Neurologia</div>
  <p style="font-size:13px;margin:8px 0;">Cefaleia súbita, vómitos, défice neurológico progressivo, miose bilateral.</p>
  <div class="info-box"><b>NHB afetadas:</b> Processos de Pensamento, Movimento · <b>Evolução estimada:</b> 5-10 dias</div>
  <b style="display:block;margin-top:10px;color:var(--azul-escuro);font-size:12.5px;">Diagnósticos de Enfermagem</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Processos de Pensamento Alterados</li><li>Risco de Herniação Encefálica</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Resultados Esperados (NOC)</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Pressão intracraniana <20mmHg</li><li>Escala de Glasgow estável</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Intervenções de Enfermagem (NIC)</b>
  <ul style="font-size:12.5px;margin:6px 0 0;"><li>Elevação da cabeceira a 30°</li><li>Osmoterapia com manitol</li><li>Vigilância contínua da PIC</li></ul>`
},
{
  icon: ICON_ALERT, bg:'#fbe4e8', fg:'#E80018',
  title:'C016 · Insuficiência Cardíaca Aguda Descompensada',
  sub:'Internamento Cardiologia · 72 anos',
  body:`  <div class="card-row"><b>Idade/Género:</b> 72 anos, M</div>
  <div class="card-row"><b>Área:</b> Internamento Cardiologia</div>
  <p style="font-size:13px;margin:8px 0;">Dispneia ortopneica, edema pulmonar, galope cardíaco, PVJ elevada.</p>
  <div class="info-box"><b>NHB afetadas:</b> Circulação, Oxigenação · <b>Evolução estimada:</b> 3-5 dias</div>
  <b style="display:block;margin-top:10px;color:var(--azul-escuro);font-size:12.5px;">Diagnósticos de Enfermagem</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Débito Cardíaco Diminuído</li><li>Padrão Respiratório Ineficaz</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Resultados Esperados (NOC)</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>SatO2 >95%</li><li>BNP normalizado progressivamente</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Intervenções de Enfermagem (NIC)</b>
  <ul style="font-size:12.5px;margin:6px 0 0;"><li>CPAP se necessário</li><li>Diuréticos IV</li><li>IECA/Betabloqueadores</li></ul>`
},
{
  icon: ICON_SCALE, bg:'#EEF1F6', fg:'#000000',
  title:'C017 · Meningite Bacteriana - Neisseria meningitidis',
  sub:'UTI Infecciologia · 32 anos',
  body:`  <div class="card-row"><b>Idade/Género:</b> 32 anos, F</div>
  <div class="card-row"><b>Área:</b> UTI Infecciologia</div>
  <p style="font-size:13px;margin:8px 0;">Febre 40°C, rigidez de nuca, fotofobia, púrpura petequial, confusão.</p>
  <div class="info-box"><b>NHB afetadas:</b> Temperatura, Psicosocial, Infecção · <b>Evolução estimada:</b> 7-14 dias</div>
  <b style="display:block;margin-top:10px;color:var(--azul-escuro);font-size:12.5px;">Diagnósticos de Enfermagem</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Hipertermia</li><li>Processos de Pensamento Alterados</li><li>Risco de Sépsis</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Resultados Esperados (NOC)</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Temperatura <37.5°C</li><li>Consciência clara</li><li>Cultura negativa</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Intervenções de Enfermagem (NIC)</b>
  <ul style="font-size:12.5px;margin:6px 0 0;"><li>Antibioterapia emergente IV</li><li>Isolamento de gotículas</li><li>Antitérmicos</li></ul>`
},
{
  icon: ICON_PROC, bg:'#EEF1F6', fg:'var(--azul)',
  title:'C018 · Intoxicação Medicamentosa - Sobredosagem de Benzodiazepinas',
  sub:'Urgência Toxicologia · 48 anos',
  body:`  <div class="card-row"><b>Idade/Género:</b> 48 anos, F</div>
  <div class="card-row"><b>Área:</b> Urgência Toxicologia</div>
  <p style="font-size:13px;margin:8px 0;">Sedação progressiva, depressão respiratória FR 10/min, miose pupilar reduzida.</p>
  <div class="info-box"><b>NHB afetadas:</b> Oxigenação, Processos de Pensamento · <b>Evolução estimada:</b> 1-2 dias</div>
  <b style="display:block;margin-top:10px;color:var(--azul-escuro);font-size:12.5px;">Diagnósticos de Enfermagem</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Padrão Respiratório Ineficaz</li><li>Processos de Pensamento Alterados</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Resultados Esperados (NOC)</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>FR >12/min espontânea</li><li>Consciência lúcida</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Intervenções de Enfermagem (NIC)</b>
  <ul style="font-size:12.5px;margin:6px 0 0;"><li>Ventilação mecânica se necessário</li><li>Flumazenil conforme protocolo</li><li>Suporte cardiorrespiratório</li></ul>`
},
{
  icon: ICON_EXAM, bg:'#EEF1F6', fg:'#000000',
  title:'C019 · Carcinoma Pulmonar Avançado com Metástases Ósseas',
  sub:'Cuidados Paliativos/Oncologia · 68 anos',
  body:`  <div class="card-row"><b>Idade/Género:</b> 68 anos, M</div>
  <div class="card-row"><b>Área:</b> Cuidados Paliativos/Oncologia</div>
  <p style="font-size:13px;margin:8px 0;">Dispneia progressiva, tosse seca, hemoptises, dor óssea severa, astenia.</p>
  <div class="info-box"><b>NHB afetadas:</b> Dor, Oxigenação, Nutrição, Espiritualidade · <b>Evolução estimada:</b> Cronicidade com cuidados paliativos</div>
  <b style="display:block;margin-top:10px;color:var(--azul-escuro);font-size:12.5px;">Diagnósticos de Enfermagem</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Dor Aguda/Crónica</li><li>Padrão Respiratório Prejudicado</li><li>Nutrição Desequilibrada</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Resultados Esperados (NOC)</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Dor <4/10</li><li>Conforto melhorado</li><li>Dignidade mantida</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Intervenções de Enfermagem (NIC)</b>
  <ul style="font-size:12.5px;margin:6px 0 0;"><li>Analgesia conforme escada analgésica da OMS</li><li>Cuidados psicológicos/espirituais</li><li>Educação sobre a doença avançada</li></ul>`
},
{
  icon: ICON_ALERT, bg:'#fbe4e8', fg:'#E80018',
  title:'C020 · Transtorno Bipolar Tipo I - Episódio Maníaco Severo',
  sub:'Psiquiatria · 36 anos',
  body:`  <div class="card-row"><b>Idade/Género:</b> 36 anos, F</div>
  <div class="card-row"><b>Área:</b> Psiquiatria</div>
  <p style="font-size:13px;margin:8px 0;">Elevação anormal do humor, fuga de ideias, comportamento desinibido, agressividade, sem necessidade aparente de sono.</p>
  <div class="info-box"><b>NHB afetadas:</b> Processos de Pensamento, Psicosocial, Sono/Repouso · <b>Evolução estimada:</b> 2-4 semanas internamento</div>
  <b style="display:block;margin-top:10px;color:var(--azul-escuro);font-size:12.5px;">Diagnósticos de Enfermagem</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Processos de Pensamento Alterados</li><li>Comportamento Agressivo Potencial</li><li>Comunicação Alterada</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Resultados Esperados (NOC)</b>
  <ul style="font-size:12.5px;margin:6px 0 10px;"><li>Pensamento organizado</li><li>Comportamento controlado</li><li>Adesão medicamentosa</li></ul>
  <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Intervenções de Enfermagem (NIC)</b>
  <ul style="font-size:12.5px;margin:6px 0 0;"><li>Estabilizadores de humor (lítio)</li><li>Estrutura ambiental clara</li><li>Terapia psicossocial estruturada</li></ul>`
}
]);


// === data-casos-estudo.js ===
// ===== data-casos-estudo.js =====
// Base de dados única dos 20 casos clínicos robustos, usada em TODO o Modo Estudante
// (Casos Clínicos interactivos, Testes temáticos e Simulação). Cada caso reutiliza a
// riqueza clínica da secção "Casos Clínicos" do menu principal, mas em formato de
// estudo: apresentação → raciocínio prioritário revelável → diagnósticos/NOC/NIC →
// 5 perguntas próprias (as 3 primeiras alimentam também a Simulação passo-a-passo).

const CASOS_ESTUDO = [
{
  id:'C001', icon:'ICON_SCALE', bg:'#EEF1F6', fg:'#000000',
  titulo:'C001 · Enfarte Agudo do Miocárdio com Supra ST', area:'UTI Cardiológica', idade:'58 anos, M',
  apresentacao:'Homem de 58 anos admitido com dor torácica opressiva irradiada para o braço esquerdo há 2h, sudorese fria e náuseas. ECG com supradesnivelamento de ST em parede anterior; troponina elevada. FC 96bpm, PA 150/95mmHg, SpO₂ 94%. NHB afectadas: Oxigenação, Circulação, Dor, Psicosocial. Evolução estimada: 3–5 dias de internamento.',
  raciocinio:'Prioridade fisiológica (ABC): <b>Débito Cardíaco Diminuído</b> relacionado com alteração da contractilidade por isquemia miocárdica, evidenciado por dor torácica, supra de ST e troponina elevada — o risco de arritmia/instabilidade hemodinâmica precede a gestão da dor e da ansiedade.',
  diagnosticos:['Débito Cardíaco Diminuído','Padrão Respiratório Ineficaz','Dor Aguda','Ansiedade Moderada','Conhecimento Deficiente sobre Autocuidado'],
  noc:['SatO2 ≥95%','FC 60-100bpm','PA sistólica 90-140mmHg','Dor ≤3/10','Verbaliza compreensão de actividades permitidas'],
  nic:['Monitorização contínua ECG/SatO2','Posição semi-Fowler/Fowler','Oxigenoterapia conforme prescrição','Analgesia conforme protocolo agudo coronário','Educação sobre repouso e medicação'],
  perguntas:[
    { q:'Qual o diagnóstico de enfermagem prioritário neste doente?', opts:['Ansiedade Moderada','Débito Cardíaco Diminuído','Défice de Conhecimento','Padrão Respiratório Ineficaz'], correta:1 },
    { q:'Qual resultado (NOC) reflecte estabilização hemodinâmica adequada?', opts:['SatO2 ≥95% apenas','PA sistólica 90-140mmHg e FC 60-100bpm','Dor 0/10 imediata','Ausência total de ansiedade'], correta:1 },
    { q:'Qual a intervenção (NIC) prioritária nas primeiras horas?', opts:['Educação sobre dieta hipossódica','Monitorização contínua ECG/SpO2 e analgesia conforme protocolo','Fisioterapia respiratória intensiva','Restrição hídrica rigorosa'], correta:1 },
    { q:'Qual exame confirma necrose miocárdica neste doente?', opts:['Hemograma completo','Troponina sérica elevada','Glicemia capilar','Ureia e creatinina'], correta:1 },
    { q:'Qual a posição mais adequada para este doente?', opts:['Decúbito dorsal plano','Posição semi-Fowler/Fowler','Trendelenburg','Decúbito ventral'], correta:1 }
  ]
},
{
  id:'C002', icon:'ICON_PROC', bg:'#EEF1F6', fg:'var(--azul)',
  titulo:'C002 · AVC Isquémico — Hemiplegia à Direita', area:'Internamento Neurologia', idade:'72 anos, F',
  apresentacao:'Mulher de 72 anos, antecedentes de HTA e fibrilhação auricular, acordou com défice neurológico: paralisia flácida do membro superior e inferior direitos, afasia de Broca, desvio da comissura labial à esquerda. PA 178/102mmHg, FC irregular 110bpm, Glasgow 13. NHB afectadas: Movimento, Higiene, Comunicação, Pele/Integridade, Nutrição. Evolução estimada: 2–4 semanas com reabilitação.',
  raciocinio:'Antes de qualquer via oral, a prioridade é despistar <b>Risco de Aspiração</b> relacionado com disfagia por défice neurológico — a afasia e a paralisia orofacial tornam a deglutição insegura, e a aspiração pode ser fatal se não for antecipada.',
  diagnosticos:['Risco de Aspiração','Mobilidade Física Limitada','Défice de Autocuidado para Higiene','Comunicação Verbal Prejudicada','Risco de Úlcera de Pressão'],
  noc:['Deglutição segura sem sinais de aspiração','Amplitude de movimento progressiva','Pele íntegra em zonas de pressão','Comunicação eficaz por meios alternativos'],
  nic:['Avaliação da deglutição antes de qualquer via oral','Fisioterapia motora 2x/dia','Posicionamento a cada 2h com colchão antiescaras','Terapia da fala diária','Sonda NG se deglutição insegura'],
  perguntas:[
    { q:'Antes de iniciar dieta oral numa doente com afasia de Broca, que diagnóstico deve ser despistado primeiro?', opts:['Ansiedade Moderada','Risco de Aspiração','Conhecimento Deficiente','Dor Aguda'], correta:1 },
    { q:'Qual o resultado esperado mais relevante nas primeiras 24h?', opts:['Doente caminha sem apoio','Deglutição segura, sem sinais de aspiração','Fala fluente recuperada','Ausência de febre'], correta:1 },
    { q:'Que intervenção deve preceder qualquer alimentação por via oral?', opts:['Fisioterapia motora','Avaliação da deglutição','Terapia da fala','Colocação de colchão antiescaras'], correta:1 },
    { q:'Qual o principal factor de risco identificado nesta doente para o AVC isquémico?', opts:['Asma','Fibrilhação auricular e hipertensão','Diabetes tipo 1','Tabagismo apenas'], correta:1 },
    { q:'Qual a frequência recomendada de mudança de posicionamento para prevenir úlceras de pressão?', opts:['A cada 30 minutos','A cada 2 horas','A cada 12 horas','Apenas 1x/dia'], correta:1 }
  ]
},
{
  id:'C003', icon:'ICON_EXAM', bg:'#EEF1F6', fg:'#000000',
  titulo:'C003 · Asma Aguda Moderada', area:'Urgência/Medicina Interna', idade:'34 anos, F',
  apresentacao:'Mulher de 34 anos, asma alérgica conhecida, dispneia progressiva nas últimas 6h, sibilância difusa bilateral, murmúrio vesicular diminuído nas bases, uso de músculos acessórios. FR 26cpm, PFE 60% do previsto. NHB afectadas: Oxigenação, Circulação, Psicosocial, Aprendizagem. Evolução estimada: 1–3 dias de observação.',
  raciocinio:'<b>Padrão Respiratório Ineficaz</b> relacionado com broncoespasmo, evidenciado por sibilância, uso de músculos acessórios e taquipneia — a via aérea/ventilação precede a gestão da ansiedade associada.',
  diagnosticos:['Padrão Respiratório Ineficaz','Troca Gasosa Prejudicada','Ansiedade Moderada','Intolerância à Actividade'],
  noc:['SatO2 ≥95%','FR 16-20/min','Desaparecimento de sibilância','Sem uso de músculos acessórios','Verbaliza redução de ansiedade'],
  nic:['Posição Fowler elevada','Oxigenoterapia conforme SpO2','Inalações com broncodilatadores prescritos','Corticoides sistémicos conforme protocolo','Educação sobre desencadeantes de asma'],
  perguntas:[
    { q:'Doente com sibilância difusa, FR 26 e uso de músculos acessórios — qual o diagnóstico prioritário?', opts:['Ansiedade Moderada','Padrão Respiratório Ineficaz','Intolerância à Actividade','Conhecimento Deficiente'], correta:1 },
    { q:'Qual o valor de SpO2 definido como resultado esperado?', opts:['≥85%','≥90%','≥95%','100% obrigatório'], correta:2 },
    { q:'Qual a intervenção inicial mais indicada?', opts:['Deitar em decúbito dorsal','Posição de Fowler elevada e oxigenoterapia','Restrição hídrica','Repouso absoluto sem broncodilatador'], correta:1 },
    { q:'Que classe farmacológica é administrada por via inalatória como 1ª linha na crise?', opts:['Antibióticos','Broncodilatadores beta-agonistas de curta acção','Diuréticos','Anticoagulantes'], correta:1 },
    { q:'Que outra classe é frequentemente associada no tratamento da exacerbação?', opts:['Corticoides sistémicos','Insulina','Vasopressores','Anticoagulantes'], correta:0 }
  ]
},
{
  id:'C004', icon:'ICON_ALERT', bg:'#fbe4e8', fg:'#E80018',
  titulo:'C004 · Insuficiência Renal Aguda KDIGO 3', area:'UTI Cirúrgica', idade:'68 anos, M',
  apresentacao:'Homem de 68 anos, pós cirurgia cardiotorácica dia 2. Creatinina triplicou em 48h (1.2→3.6mg/dL), oligúria (<400ml/24h), edema periférico progressivo, ureia elevada. Na 132, K 5.8, ureia 98. NHB afectadas: Eliminação, Hidratação, Nutrição, Infecção. Evolução estimada: 5–7 dias, possível diálise.',
  raciocinio:'<b>Volume Líquido Excessivo</b> relacionado com diminuição da filtração glomerular, evidenciado por oligúria e edema progressivo — associado a risco imediato de hipercaliemia com potencial arrítmico.',
  diagnosticos:['Volume Líquido Excessivo','Risco de Desequilíbrio Electrolítico','Défice Nutritivo','Risco de Infecção','Padrão de Eliminação Prejudicado'],
  noc:['Débito urinário >0.5ml/kg/h','Peso corporal estável','Creatinina progressivamente <2.0','Equilíbrio electrolítico normalizado'],
  nic:['Restrição hídrica conforme débito urinário','Monitorização rigorosa de ingressos/saídas','Diálise conforme prescrição do nefrologista','Dieta renal restrita em potássio/fósforo','Vigilância cardíaca pela hipercaliemia'],
  perguntas:[
    { q:'Doente oligúrico, edema progressivo e creatinina a triplicar — qual o diagnóstico prioritário?', opts:['Défice Nutritivo','Volume Líquido Excessivo','Risco de Infecção','Padrão de Eliminação Prejudicado'], correta:1 },
    { q:'Qual o valor de débito urinário definido como meta?', opts:['<0.3ml/kg/h','>0.5ml/kg/h','Sem meta definida','>5ml/kg/h'], correta:1 },
    { q:'Perante a hipercaliemia associada, qual a intervenção prioritária?', opts:['Aumentar o potássio na dieta','Monitorização cardíaca e preparação para correcção da hipercaliemia','Suspender toda a monitorização','Mobilizar o doente sem mais cuidados'], correta:1 },
    { q:'Qual electrólito está classicamente elevado e representa risco de arritmia na IRA?', opts:['Sódio','Potássio','Cloro','Magnésio baixo'], correta:1 },
    { q:'Que tipo de dieta é geralmente indicada na insuficiência renal aguda?', opts:['Rica em potássio e fósforo','Restrita em potássio e fósforo','Hiperprotéica sem restrição','Rica em sódio'], correta:1 }
  ]
},
{
  id:'C005', icon:'ICON_SCALE', bg:'#EEF1F6', fg:'#000000',
  titulo:'C005 · Cetoacidose Diabética', area:'Urgência/Medicina Interna', idade:'45 anos, F',
  apresentacao:'Mulher de 45 anos, diabética conhecida, sem adesão medicamentosa. Polidipsia, poliúria, cansaço extremo, hálito cetónico, taquipneia (FR 28/min), confusão. Glicemia 480mg/dL, pH 7.18. NHB afectadas: Nutrição, Hidratação, Circulação, Psicosocial, Aprendizagem. Evolução estimada: 3–5 dias com educação contínua.',
  raciocinio:'<b>Processos de Pensamento Alterados</b> relacionado com desequilíbrio metabólico (acidose/hiperglicemia grave), evidenciado por confusão e respiração de Kussmaul — a correcção metabólica urgente antecede a educação terapêutica.',
  diagnosticos:['Processos de Pensamento Alterados','Défice de Conhecimento sobre Diabetes','Nutrição Desequilibrada','Risco de Desequilíbrio Electrolítico','Débito Cardíaco Diminuído'],
  noc:['Glicemia 120-180mg/dL','pH arterial >7.35','Bicarbonato >18mEq/L','Sem hálito cetónico','Verbaliza compreensão sobre a diabetes'],
  nic:['Insulina IV conforme protocolo de cetoacidose','Expansão volémica com soros','Correcção electrolítica progressiva (K+)','Monitorização contínua da glicemia capilar','Educação estruturada sobre diabetes'],
  perguntas:[
    { q:'Doente com hálito cetónico, taquipneia e confusão — que mecanismo respiratório está presente?', opts:['Respiração de Cheyne-Stokes','Respiração de Kussmaul, compensação da acidose metabólica','Respiração paradoxal','Apneia do sono'], correta:1 },
    { q:'Qual o valor de pH arterial definido como meta de estabilização?', opts:['<7.0','>7.35','Exactamente 7.0','Não é monitorizado'], correta:1 },
    { q:'Qual a intervenção inicial mais crítica na cetoacidose?', opts:['Insulina IV conforme protocolo e correcção hidroelectrolítica','Dieta hiperglicídica imediata','Restrição total de líquidos','Sedação'], correta:0 },
    { q:'Qual sinal clínico é característico da cetoacidose, além da hiperglicemia?', opts:['Hálito cetónico','Bradicardia','Hipotermia','Miose'], correta:0 },
    { q:'Durante a correcção, que electrólito exige vigilância apertada apesar de níveis iniciais normais/altos?', opts:['Sódio','Potássio, que pode cair rapidamente com a insulina','Cálcio','Cloro'], correta:1 }
  ]
},
{
  id:'C006', icon:'ICON_PROC', bg:'#EEF1F6', fg:'var(--azul)',
  titulo:'C006 · Pneumonia Associada à Ventilação (VAP)', area:'UTI Geral', idade:'76 anos, M',
  apresentacao:'Homem de 76 anos, intubado há 8 dias por insuficiência respiratória. Febre 39.2°C, tosse com exsudato purulento, leucocitose 15.000, infiltrado novo bilateral na radiografia, PaO2/FiO2 220. NHB afectadas: Oxigenação, Circulação, Temperatura, Infecção. Evolução estimada: 7–10 dias com possível desmame respiratório.',
  raciocinio:'<b>Troca Gasosa Prejudicada</b> relacionada com infecção pulmonar e infiltrado alveolar, evidenciada por febre, leucocitose e infiltrado bilateral novo — condiciona directamente a oxigenação e o desmame ventilatório.',
  diagnosticos:['Troca Gasosa Prejudicada','Padrão Respiratório Ineficaz','Hipertermia','Risco de Infecção Disseminada'],
  noc:['Temperatura <37.5°C','Ventilação adequada com sincronismo','SatO2 ≥95%','Cultura de secreções negativa em 72h','Leucócitos <12.000'],
  nic:['Aspiração endotraqueal conforme necessidade','Elevação da cabeceira a 30-45°','Mudanças posicionais a cada 2h','Antibioterapia de largo espectro','Higiene oral com clorexidina'],
  perguntas:[
    { q:'Doente intubado há 8 dias com febre, secreções purulentas e infiltrado novo — que diagnóstico é prioritário?', opts:['Hipertermia isolada','Troca Gasosa Prejudicada','Défice de Autocuidado','Ansiedade'], correta:1 },
    { q:'A partir de quantas horas de intubação se define a pneumonia como VAP?', opts:['24h','≥48h','12h','1 semana'], correta:1 },
    { q:'Qual a intervenção com maior evidência na prevenção de VAP?', opts:['Decúbito dorsal permanente','Elevação da cabeceira a 30-45° e higiene oral com clorexidina','Sedação profunda contínua','Aspiração apenas 1x/dia'], correta:1 },
    { q:'Que valor de PaO2/FiO2 é usado para classificar lesão pulmonar aguda associada?', opts:['<300','>500','Exactamente 100','Não é usado nesta situação'], correta:0 },
    { q:'Que prática de higiene reduz o risco de VAP em doentes intubados?', opts:['Higiene oral com clorexidina','Higiene oral apenas 1x/semana','Evitar qualquer higiene oral','Água simples 1x/dia apenas'], correta:0 }
  ]
},
{
  id:'C007', icon:'ICON_EXAM', bg:'#EEF1F6', fg:'#000000',
  titulo:'C007 · Cirrose Hepática — Encefalopatia Hepática', area:'Internamento Gastroenterologia', idade:'62 anos, M',
  apresentacao:'Homem de 62 anos, cirrose por consumo de álcool. Confusão mental, asterixis, halitose com odor fecal, palma eritematosa, esplenomegalia, ascite tensa. Amónia elevada, INR 1.8. NHB afectadas: Processos de Pensamento, Circulação, Hidratação, Nutrição, Psicosocial. Evolução estimada: 1–2 semanas.',
  raciocinio:'<b>Processos de Pensamento Alterados</b> relacionado com acumulação de amónia por falência hepática (encefalopatia), evidenciado por confusão e asterixis — prioritário face ao risco de agravamento neurológico e de hemorragia associada à coagulopatia.',
  diagnosticos:['Processos de Pensamento Alterados','Risco de Hemorragia Digestiva','Volume Líquido Excessivo','Nutrição Desequilibrada'],
  noc:['Orientação temporal e espacial recuperada','Sem asterixis','Sem hematemese/melenas','Ascite controlada','Albumina plasmática >3.0g/dL'],
  nic:['Lactulose oral conforme protocolo','Vigilância de sinais de ingestão alcoólica','Endoscopia preventiva se varizes','Dieta com restrição proteica moderada e pobre em sal','Educação sobre abstinência alcoólica'],
  perguntas:[
    { q:'Doente cirrótico com asterixis, confusão e halitose fétida — qual a causa fisiopatológica mais provável?', opts:['Hipoglicemia isolada','Acumulação de amónia por falência hepática','Infecção urinária','Overdose de sedativos'], correta:1 },
    { q:'Qual o resultado esperado com a administração de lactulose?', opts:['Obstipação induzida','Redução da absorção intestinal de amónia, com 2-3 dejecções/dia','Aumento da amónia sérica','Sedação'], correta:1 },
    { q:'Qual o cuidado nutricional mais adequado nesta fase?', opts:['Dieta rica em proteína animal','Dieta com restrição proteica moderada e pobre em sal','Jejum absoluto prolongado','Dieta hiperprotéica sem restrição'], correta:1 },
    { q:'Que medicamento reduz a absorção intestinal de amónia?', opts:['Lactulose','Furosemida','Insulina','Heparina'], correta:0 },
    { q:'Que complicação da cirrose está associada a risco de hemorragia digestiva alta grave?', opts:['Varizes esofágicas','Apendicite','Úlcera péptica simples','Diverticulite'], correta:0 }
  ]
},
{
  id:'C008', icon:'ICON_ALERT', bg:'#fbe4e8', fg:'#E80018',
  titulo:'C008 · Fratura do Fémur em Idosa', area:'Ortopedia/Cuidados Agudos', idade:'84 anos, F',
  apresentacao:'Idosa de 84 anos, após queda em casa. Fratura intracapsular do fémur esquerdo. Dor 8/10, edema, equimose, deformidade em rotação externa, incapacidade de suportar peso. PA 138/82mmHg. NHB afectadas: Dor, Movimento, Pele/Integridade, Circulação, Higiene. Evolução estimada: 5–7 dias até internamento ortopédico.',
  raciocinio:'<b>Dor Aguda</b> relacionada com trauma ósseo e espasmo muscular, evidenciada por relato de dor 8/10, deformidade e imobilidade do membro — o alívio da dor e a imobilização segura precedem qualquer outra intervenção.',
  diagnosticos:['Dor Aguda','Mobilidade Física Limitada','Risco de Úlcera de Pressão','Risco de Trombose','Défice de Autohigiene'],
  noc:['Dor ≤3/10','Membro imobilizado corretamente','Pulsos distais palpáveis','Pele íntegra','Realiza actividades de higiene com ajuda'],
  nic:['Analgesia conforme protocolo','Imobilização com tala/tração','Colchão antiescaras desde a admissão','Meias de compressão bilaterais','Exercícios de perna conforme tolerância'],
  perguntas:[
    { q:'Idosa com deformidade em rotação externa e dor 8/10 — qual a prioridade imediata de enfermagem?', opts:['Educação para alta','Alívio da dor e imobilização segura do membro','Mobilização precoce sem apoio','Jejum prolongado'], correta:1 },
    { q:'Qual o resultado NOC relacionado com a prevenção de complicações do imobilismo?', opts:['Pele íntegra e pulsos distais palpáveis','Ausência total de exames','Alta hospitalar em 24h','Marcha independente no 1º dia'], correta:0 },
    { q:'Que medida previne tromboembolismo nesta doente imobilizada?', opts:['Repouso absoluto sem meias de compressão','Meias de compressão e mobilização precoce conforme tolerância','Restrição hídrica','Trendelenburg permanente'], correta:1 },
    { q:'Qual complicação vascular é particularmente temida após fractura do fémur em idosos imobilizados?', opts:['Trombose venosa profunda','Hipertensão arterial','Hipoglicemia','Obstipação'], correta:0 },
    { q:'Qual o alinhamento correcto do membro fracturado antes da cirurgia?', opts:['Livre, sem qualquer suporte','Imobilizado e alinhado, com tala/tração conforme prescrição','Em rotação externa forçada','Elevado sem qualquer suporte'], correta:1 }
  ]
},
{
  id:'C009', icon:'ICON_SCALE', bg:'#EEF1F6', fg:'#000000',
  titulo:'C009 · Tromboembolismo Pulmonar Agudo', area:'Urgência/UTI Respiratória', idade:'55 anos, F',
  apresentacao:'Mulher de 55 anos, imobilizada há 2 semanas por pneumonia. Dispneia súbita, dor pleurítica, síncope, taquicardia (FC 115), taquipneia (FR 32), queda de SatO2. D-dímero elevado, ECG com taquicardia sinusal. NHB afectadas: Oxigenação, Circulação, Dor, Psicosocial. Evolução estimada: 5–7 dias com anticoagulação.',
  raciocinio:'<b>Troca Gasosa Prejudicada</b> relacionada com obstrução da perfusão pulmonar por êmbolo, evidenciada por dispneia súbita, hipoxemia e taquicardia — emergência com risco de colapso hemodinâmico.',
  diagnosticos:['Troca Gasosa Prejudicada','Padrão Respiratório Ineficaz','Débito Cardíaco Diminuído','Medo/Ansiedade Aguda'],
  noc:['SatO2 ≥94%','FR 16-20/min','FC 60-100bpm','Ausência de síncopes recorrentes','Verbaliza redução do medo'],
  nic:['Oxigenoterapia em máscara não reinalante','Monitorização ECG contínua','Anticoagulação (heparina IV) conforme protocolo','Avaliação para trombólise/embolectomia','Repouso absoluto no leito'],
  perguntas:[
    { q:'Doente imobilizada há 2 semanas com dispneia súbita, dor pleurítica e síncope — qual a hipótese prioritária?', opts:['Ansiedade isolada','Troca Gasosa Prejudicada por suspeita de TEP','Défice de conhecimento','Dor crónica'], correta:1 },
    { q:'Qual o valor de SpO2 definido como meta de estabilização?', opts:['≥94%','≥80%','Sem meta','100% sempre'], correta:0 },
    { q:'Qual a intervenção inicial mais urgente perante suspeita de TEP?', opts:['Deambulação imediata','Oxigenoterapia, repouso absoluto e preparação para anticoagulação','Alta para o domicílio','Dieta hiperlipídica'], correta:1 },
    { q:'Que exame laboratorial, de baixa especificidade mas alta sensibilidade, apoia a suspeita de TEP?', opts:['D-dímero','Amilase','Troponina isolada','Glicemia'], correta:0 },
    { q:'Que classe terapêutica é iniciada após forte suspeita/confirmação de TEP, salvo contraindicação?', opts:['Antibióticos','Anticoagulantes','Corticoides','Diuréticos'], correta:1 }
  ]
},
{
  id:'C010', icon:'ICON_PROC', bg:'#EEF1F6', fg:'var(--azul)',
  titulo:'C010 · Sépsis de Origem Urinária', area:'Urgência/Internamento Medicina', idade:'79 anos, F',
  apresentacao:'Idosa de 79 anos, com sonda vesical de demora. Desorientação aguda, hipertermia 39.8°C, taquicardia, taquipneia, urina turva e fétida, PA sistólica 95mmHg. Lactato 3.2, PAM 62mmHg. NHB afectadas: Infecção, Circulação, Temperatura, Eliminação, Processos de Pensamento. Evolução estimada: 7–10 dias com vigilância intensiva.',
  raciocinio:'<b>Risco de Choque Séptico</b> relacionado com resposta inflamatória sistémica de origem urinária, evidenciado por hipotensão, taquicardia e confusão aguda — reconhecimento precoce e tratamento na 1ª hora são determinantes do prognóstico.',
  diagnosticos:['Risco de Choque Séptico','Infecção Sistémica (Sépsis)','Processos de Pensamento Alterados','Débito Cardíaco Diminuído','Hipertermia'],
  noc:['Orientação recuperada','Temperatura <37.5°C','PA >100mmHg','Lactato <2mmol/L','Cultura de urina negativa em 48h'],
  nic:['Antibioterapia IV conforme hemocultura','Hidratação vigorosa com cristaloides','Vasopressores se hipotensão refractária','Remoção/troca de sonda vesical','Vigilância rigorosa 4/4h dos parâmetros de sépsis'],
  perguntas:[
    { q:'Idosa algaliada com confusão súbita, febre e hipotensão — qual a prioridade de enfermagem?', opts:['Higiene oral','Reconhecimento precoce de sépsis e início do pacote da 1ª hora','Educação nutricional','Avaliação de úlceras'], correta:1 },
    { q:'Qual o valor de lactato definido como meta de perfusão adequada?', opts:['<2mmol/L','>4mmol/L','Sem relevância','>10mmol/L'], correta:0 },
    { q:'Qual a intervenção prioritária nas primeiras horas de sépsis?', opts:['Restrição hídrica rigorosa','Hemoculturas, antibioterapia precoce e fluidoterapia','Suspensão da monitorização','Jejum absoluto'], correta:1 },
    { q:'Que dispositivo invasivo é frequentemente a porta de entrada da infecção neste caso?', opts:['Cateter venoso periférico','Sonda vesical de demora','Sonda nasogástrica','Dreno torácico'], correta:1 },
    { q:'Qual o tempo alvo para a 1ª dose de antibiótico após reconhecimento de sépsis?', opts:['Dentro de 1 hora','Dentro de 24 horas','Dentro de 6 horas, sem urgência','Não há tempo alvo definido'], correta:0 }
  ]
},
{
  id:'C011', icon:'ICON_EXAM', bg:'#EEF1F6', fg:'#000000',
  titulo:'C011 · Pancreatite Aguda Severa', area:'UTI Digestiva', idade:'52 anos, M',
  apresentacao:'Homem de 52 anos, dor epigástrica radiante em faixa, lipase >3000, edema pancreático, derrame pleural bilateral. NHB afectadas: Dor, Nutrição, Circulação. Evolução estimada: 7–14 dias.',
  raciocinio:'<b>Dor Aguda Severa</b> relacionada com auto-digestão pancreática e inflamação retroperitoneal, evidenciada por dor epigástrica irradiada e lipase muito elevada.',
  diagnosticos:['Dor Aguda Severa','Nutrição Desequilibrada','Volume Líquido Excessivo'],
  noc:['Dor <4/10','Enzimas pancreáticas normalizadas','Peso estável'],
  nic:['Analgesia potente','Nutrição parentérica/entérica se jejum prolongado','Monitorização de amilase/lipase'],
  perguntas:[
    { q:'Dor epigástrica em faixa, lipase >3000 — qual o diagnóstico prioritário?', opts:['Nutrição Desequilibrada','Dor Aguda Severa','Ansiedade Ligeira','Défice de Conhecimento'], correta:1 },
    { q:'Qual o resultado esperado quanto ao suporte nutricional?', opts:['Peso estável e enzimas pancreáticas em declínio','Alimentação hiperlipídica oral imediata','Perda de peso rápida planeada','Sem necessidade de monitorização'], correta:0 },
    { q:'Qual a conduta nutricional habitual na fase aguda severa?', opts:['Dieta rica em gordura via oral','Jejum inicial com nutrição parentérica/entérica conforme protocolo','Líquidos açucarados à vontade','Sem restrição alimentar'], correta:1 },
    { q:'Que hábito é um factor de risco major para pancreatite aguda?', opts:['Consumo excessivo de álcool e/ou litíase biliar','Exercício físico regular','Dieta pobre em gordura','Hidratação adequada'], correta:0 },
    { q:'Por que se evita geralmente a via oral na fase aguda inicial severa?', opts:['Para estimular mais secreção pancreática','Para reduzir a estimulação pancreática e permitir repouso do órgão','Não há razão clínica','Para provocar perda de peso'], correta:1 }
  ]
},
{
  id:'C012', icon:'ICON_ALERT', bg:'#fbe4e8', fg:'#E80018',
  titulo:'C012 · Hemorragia Digestiva Alta Varicosa', area:'Urgência Endoscopia', idade:'58 anos, M',
  apresentacao:'Homem de 58 anos, hematemese volumosa, melenas, tensão de choque, PA 80/50mmHg, Hb 7.2g/dL, FC 128bpm. NHB afectadas: Circulação, Eliminação. Evolução estimada: 3–5 dias.',
  raciocinio:'<b>Risco de Choque Hipovolémico</b> relacionado com perda hemática activa por ruptura de varizes esofágicas, evidenciado por hematemese, hipotensão e taquicardia.',
  diagnosticos:['Débito Cardíaco Diminuído','Risco de Choque','Medo Agudo'],
  noc:['PA sistólica >90mmHg','Hemoglobina estável >7g/dL','Hemostase endoscópica'],
  nic:['Acesso venoso de grande calibre','Transfusão conforme prescrição','Endoscopia emergente com ligadura'],
  perguntas:[
    { q:'Hematemese volumosa e PA 80/50mmHg — qual o diagnóstico prioritário?', opts:['Défice de Conhecimento','Risco de Choque Hipovolémico','Dor Crónica','Padrão de Sono Perturbado'], correta:1 },
    { q:'Qual o valor de hemoglobina definido como meta mínima de estabilização?', opts:['>7g/dL','>3g/dL','Sem relevância','>15g/dL'], correta:0 },
    { q:'Qual a intervenção inicial mais urgente?', opts:['Dieta rica em fibra imediata','Acesso venoso de grande calibre e preparação para transfusão','Deambulação','Jejum apenas'], correta:1 },
    { q:'Que procedimento endoscópico controla a hemorragia de varizes esofágicas?', opts:['Colonoscopia de rotina','Laqueação/escleroterapia endoscópica','Radiografia simples','Ecografia abdominal apenas'], correta:1 },
    { q:'Qual sinal vital reflecte melhor a perda hemodinâmica activa?', opts:['Temperatura corporal','Taquicardia e hipotensão','Frequência respiratória isolada','Glicemia capilar'], correta:1 }
  ]
},
{
  id:'C013', icon:'ICON_SCALE', bg:'#EEF1F6', fg:'#000000',
  titulo:'C013 · Queimadura de 2º Grau Extensa (20% SCQ)', area:'UTI de Queimados', idade:'44 anos, F',
  apresentacao:'Mulher de 44 anos, queimadura por líquido quente. Bolhas, eritema intenso, dor 9/10, edema progressivo, FC 118bpm. NHB afectadas: Dor, Pele/Integridade, Circulação. Evolução estimada: 10–30 dias.',
  raciocinio:'<b>Défice de Volume Líquido</b> relacionado com perda de plasma através da superfície queimada, evidenciado por edema progressivo e taquicardia — a fluidoterapia guiada é a prioridade nas primeiras 24h.',
  diagnosticos:['Défice de Volume Líquido/Hipovolémia','Dor Aguda Severa','Risco de Infecção'],
  noc:['Dor ≤4/10','Débito urinário 0.5-1ml/kg/h mantido','Feridas cicatrizadas sem infecção'],
  nic:['Fluidoterapia conforme fórmula de Parkland','Limpeza e desbridamento com analgesia prévia','Antibióticos tópicos'],
  perguntas:[
    { q:'Queimadura de 20% SCQ com edema progressivo — qual o diagnóstico prioritário nas 1ªs 24h?', opts:['Risco de Infecção isolado','Défice de Volume Líquido/Hipovolémia','Ansiedade','Défice de Conhecimento'], correta:1 },
    { q:'Qual o resultado esperado com a fluidoterapia guiada?', opts:['Débito urinário 0.5-1ml/kg/h mantido','Anúria aceitável','Sobrecarga hídrica planeada','Sem meta definida'], correta:0 },
    { q:'Qual a intervenção prioritária além da fluidoterapia?', opts:['Desbridamento sem analgesia','Analgesia eficaz e curativo estéril da ferida','Restrição hídrica','Jejum absoluto'], correta:1 },
    { q:'Que fórmula orienta o volume de fluidoterapia nas 1ªs 24h de uma queimadura extensa?', opts:['Fórmula de Parkland','Fórmula de Framingham','Regra de Ottawa','Escala de Braden'], correta:0 },
    { q:'Qual o principal risco a longo prazo numa queimadura extensa mal tratada?', opts:['Infecção e sépsis','Hipertensão crónica','Diabetes tipo 1','Hipotiroidismo'], correta:0 }
  ]
},
{
  id:'C014', icon:'ICON_PROC', bg:'#EEF1F6', fg:'var(--azul)',
  titulo:'C014 · Status Asmaticus (Asma Refractária)', area:'UTI Respiratória', idade:'28 anos, M',
  apresentacao:'Homem de 28 anos, sem resposta a broncodilatadores após 1h. Cansaço extremo, redução progressiva do murmúrio vesicular, silêncio auscultatório. NHB afectadas: Oxigenação. Evolução estimada: 1–3 dias.',
  raciocinio:'<b>Troca Gasosa Criticamente Prejudicada</b> relacionada com obstrução grave refractária, evidenciada por silêncio auscultatório e exaustão — sinal ominoso de insuficiência respiratória iminente.',
  diagnosticos:['Troca Gasosa Criticamente Prejudicada','Padrão Respiratório Ineficaz'],
  noc:['SatO2 >90%','Intubação evitada, se possível'],
  nic:['Preparação para intubação se necessário','Agonistas beta IV/nebulizados','Corticoides IV'],
  perguntas:[
    { q:'Doente sem resposta a broncodilatadores, com silêncio auscultatório — o que este sinal indica?', opts:['Melhoria clínica','Insuficiência respiratória iminente/pré-paragem','Ansiedade apenas','Infecção respiratória leve'], correta:1 },
    { q:'Qual o resultado imediato prioritário a monitorizar?', opts:['SpO2 >90% e evitar intubação, se possível','FC <60bpm','Ausência de tosse','Peso estável'], correta:0 },
    { q:'Perante exaustão respiratória iminente, que intervenção deve ser preparada?', opts:['Alta para o domicílio','Preparação para intubação e ventilação mecânica','Suspensão da oxigenoterapia','Deambulação assistida'], correta:1 },
    { q:'Que alteração gasométrica é preocupante numa crise refractária?', opts:['pH normalizado e PaCO2 baixo','PaCO2 em ascensão com pH em queda, sinal de fadiga respiratória','PaO2 muito elevado','Sem alterações gasométricas'], correta:1 },
    { q:'Qual a via preferencial para broncodilatadores numa crise refractária grave?', opts:['Via oral apenas','Via inalatória/nebulizada e, se necessário, IV','Via rectal','Via intramuscular'], correta:1 }
  ]
},
{
  id:'C015', icon:'ICON_EXAM', bg:'#EEF1F6', fg:'#000000',
  titulo:'C015 · AVC Hemorrágico com Edema Cerebral', area:'UTI Neurologia', idade:'65 anos, F',
  apresentacao:'Mulher de 65 anos, cefaleia súbita, vómitos em jacto, défice neurológico progressivo, Glasgow 9, anisocória. NHB afectadas: Processos de Pensamento, Movimento. Evolução estimada: 5–10 dias.',
  raciocinio:'<b>Risco de Herniação Encefálica</b> relacionado com hipertensão intracraniana, evidenciado por cefaleia súbita, vómitos e alteração pupilar — emergência neurológica com risco de morte iminente.',
  diagnosticos:['Risco de Herniação Encefálica','Processos de Pensamento Alterados'],
  noc:['Pressão intracraniana <20mmHg','Escala de Glasgow estável'],
  nic:['Elevação da cabeceira a 30°','Osmoterapia com manitol','Vigilância contínua da PIC'],
  perguntas:[
    { q:'Cefaleia súbita, vómitos em jacto e anisocória progressiva — qual o risco prioritário?', opts:['Risco de Infecção','Risco de Herniação Encefálica por hipertensão intracraniana','Défice de Autocuidado','Ansiedade Ligeira'], correta:1 },
    { q:'Qual o valor de PIC definido como meta terapêutica?', opts:['<20mmHg','>40mmHg','Sem relevância','>60mmHg'], correta:0 },
    { q:'Qual a posição da cabeceira recomendada para reduzir a PIC?', opts:['Decúbito dorsal plano','Elevação da cabeceira a 30°','Trendelenburg','Decúbito ventral'], correta:1 },
    { q:'Que sinal pupilar sugere herniação cerebral iminente?', opts:['Miose bilateral simétrica reactiva','Anisocória com pupila não reactiva','Midríase bilateral reactiva simétrica','Nistagmo horizontal isolado'], correta:1 },
    { q:'Que fármaco osmótico é usado para reduzir a pressão intracraniana?', opts:['Manitol','Insulina','Paracetamol','Amoxicilina'], correta:0 }
  ]
},
{
  id:'C016', icon:'ICON_ALERT', bg:'#fbe4e8', fg:'#E80018',
  titulo:'C016 · Insuficiência Cardíaca Aguda Descompensada', area:'Internamento Cardiologia', idade:'72 anos, M',
  apresentacao:'Homem de 72 anos, dispneia ortopneica, edema pulmonar, galope S3, PVJ elevada, crepitações bibasais, BNP muito elevado. NHB afectadas: Circulação, Oxigenação. Evolução estimada: 3–5 dias.',
  raciocinio:'<b>Débito Cardíaco Diminuído</b> relacionado com disfunção ventricular, evidenciado por dispneia ortopneica, edema pulmonar e PVJ elevada.',
  diagnosticos:['Débito Cardíaco Diminuído','Padrão Respiratório Ineficaz'],
  noc:['SatO2 >95%','BNP normalizado progressivamente'],
  nic:['CPAP se necessário','Diuréticos IV','IECA/Betabloqueadores'],
  perguntas:[
    { q:'Dispneia ortopneica, galope S3 e PVJ elevada — qual o diagnóstico prioritário?', opts:['Ansiedade Ligeira','Débito Cardíaco Diminuído','Défice de Conhecimento','Dor Aguda'], correta:1 },
    { q:'Qual o posicionamento inicial mais adequado neste doente com edema pulmonar?', opts:['Decúbito dorsal plano','Posição Fowler elevada 45-90°','Trendelenburg','Decúbito lateral esquerdo'], correta:1 },
    { q:'Qual a classe terapêutica administrada para reduzir a pré-carga?', opts:['Betabloqueador em bólus','Diurético de ansa IV','Vasoconstritor','Antibiótico'], correta:1 },
    { q:'Que exame laboratorial apoia o diagnóstico e a gravidade da IC descompensada?', opts:['BNP/NT-proBNP','Amilase','TSH isolado','PSA'], correta:0 },
    { q:'Que classes farmacológicas fazem parte do tratamento crónico de base da IC?', opts:['IECA/ARA e betabloqueadores','Apenas antibióticos','Apenas insulina','Apenas laxantes'], correta:0 }
  ]
},
{
  id:'C017', icon:'ICON_SCALE', bg:'#EEF1F6', fg:'#000000',
  titulo:'C017 · Meningite Bacteriana', area:'UTI Infecciologia', idade:'32 anos, F',
  apresentacao:'Mulher de 32 anos, febre 40°C, rigidez de nuca, sinal de Kernig positivo, fotofobia, púrpura petequial, confusão. NHB afectadas: Temperatura, Psicosocial, Infecção. Evolução estimada: 7–14 dias.',
  raciocinio:'<b>Risco de Sépsis</b> associado a hipertermia, relacionados com infecção do SNC, evidenciados por febre elevada, rigidez de nuca e púrpura petequial — sinal de gravidade a tratar sem atraso.',
  diagnosticos:['Risco de Sépsis','Hipertermia','Processos de Pensamento Alterados'],
  noc:['Temperatura <37.5°C','Consciência clara','Cultura negativa'],
  nic:['Antibioterapia emergente IV','Isolamento de gotículas','Antitérmicos'],
  perguntas:[
    { q:'Febre 40°C, rigidez de nuca e púrpura petequial — qual o diagnóstico prioritário?', opts:['Défice de Conhecimento','Risco de Sépsis/Hipertermia por infecção do SNC','Ansiedade Ligeira','Dor Crónica'], correta:1 },
    { q:'Qual a medida de isolamento indicada nas primeiras 24h de antibioterapia?', opts:['Isolamento de contacto apenas','Isolamento de gotículas','Nenhum isolamento necessário','Isolamento reverso'], correta:1 },
    { q:'Qual a intervenção mais urgente perante suspeita de meningite bacteriana?', opts:['Aguardar cultura antes de tratar','Antibioterapia emergente IV sem atraso','Alta com antipirético oral','Observação domiciliária'], correta:1 },
    { q:'Que exame confirma o diagnóstico definitivo de meningite bacteriana?', opts:['Radiografia de tórax','Punção lombar com análise do LCR','Ecografia abdominal','Prova de função hepática'], correta:1 },
    { q:'Que sinal cutâneo é um alerta de gravidade/sépsis meningocócica?', opts:['Púrpura petequial','Eritema solar','Vitiligo','Psoríase'], correta:0 }
  ]
},
{
  id:'C018', icon:'ICON_PROC', bg:'#EEF1F6', fg:'var(--azul)',
  titulo:'C018 · Intoxicação por Benzodiazepinas', area:'Urgência Toxicologia', idade:'48 anos, F',
  apresentacao:'Mulher de 48 anos, sedação progressiva, depressão respiratória FR 10/min, miose, Glasgow 10. NHB afectadas: Oxigenação, Processos de Pensamento. Evolução estimada: 1–2 dias.',
  raciocinio:'<b>Padrão Respiratório Ineficaz</b> relacionado com depressão do SNC por sobredosagem, evidenciado por FR 10/min e sedação progressiva — via aérea e ventilação em primeiro lugar.',
  diagnosticos:['Padrão Respiratório Ineficaz','Processos de Pensamento Alterados'],
  noc:['FR >12/min espontânea','Consciência lúcida'],
  nic:['Ventilação mecânica se necessário','Flumazenil conforme protocolo','Suporte cardiorrespiratório'],
  perguntas:[
    { q:'FR 10/min e sedação progressiva após sobredosagem — qual o diagnóstico prioritário?', opts:['Défice de Conhecimento','Padrão Respiratório Ineficaz por depressão do SNC','Ansiedade Aguda','Dor Crónica'], correta:1 },
    { q:'Qual o resultado esperado após a intervenção antidotal?', opts:['FR >12/min espontânea e consciência recuperada','FR <8/min mantida','Sedação profunda mantida','Sem alteração esperada'], correta:0 },
    { q:'Qual o antídoto específico usado, conforme protocolo, nesta intoxicação?', opts:['Naloxona','Flumazenil','N-acetilcisteína','Protamina'], correta:1 },
    { q:'Que parâmetro respiratório exige vigilância contínua nesta intoxicação?', opts:['Frequência respiratória e nível de consciência','Temperatura corporal apenas','Peso corporal','Acuidade visual'], correta:0 },
    { q:'Após reversão com antídoto, que cuidado é essencial pelo risco de re-sedação?', opts:['Alta imediata sem vigilância','Vigilância contínua, pois o efeito do antídoto pode ser mais curto','Suspensão de toda a monitorização','Sedação adicional imediata'], correta:1 }
  ]
},
{
  id:'C019', icon:'ICON_EXAM', bg:'#EEF1F6', fg:'#000000',
  titulo:'C019 · Carcinoma Pulmonar Avançado — Cuidados Paliativos', area:'Cuidados Paliativos/Oncologia', idade:'68 anos, M',
  apresentacao:'Homem de 68 anos, dispneia progressiva, tosse seca, hemoptises, dor óssea severa (EVA 8/10), astenia. NHB afectadas: Dor, Oxigenação, Nutrição, Espiritualidade. Evolução estimada: cronicidade em cuidados paliativos.',
  raciocinio:'<b>Dor Crónica</b> relacionada com invasão tumoral óssea, evidenciada por dor severa e limitação funcional — o foco central é o conforto e a dignidade, não a cura.',
  diagnosticos:['Dor Aguda/Crónica','Padrão Respiratório Prejudicado','Nutrição Desequilibrada'],
  noc:['Dor <4/10','Conforto melhorado','Dignidade mantida'],
  nic:['Analgesia conforme escada analgésica da OMS','Cuidados psicológicos/espirituais','Educação sobre a doença avançada'],
  perguntas:[
    { q:'Doente oncológico terminal com dor óssea 8/10 — qual a abordagem terapêutica de referência?', opts:['Analgesia apenas se dor >9/10','Escada analgésica da OMS com titulação individualizada','Suspensão de toda a analgesia','Apenas medidas não farmacológicas'], correta:1 },
    { q:'Qual o resultado central em cuidados paliativos, além do controlo da dor?', opts:['Cura da doença de base','Conforto e dignidade mantidos','Alta hospitalar imediata','Ausência de comunicação com a família'], correta:1 },
    { q:'Qual a intervenção de enfermagem central nesta fase?', opts:['Investigação diagnóstica agressiva','Cuidados de conforto, suporte psicológico/espiritual e gestão da dor','Restrição de visitas','Reabilitação motora intensiva'], correta:1 },
    { q:'Qual o princípio orientador da comunicação com o doente e família em cuidados paliativos?', opts:['Ocultar sempre o prognóstico','Comunicação honesta, empática e adaptada às necessidades','Evitar qualquer conversa sobre a doença','Delegar toda a comunicação a terceiros'], correta:1 },
    { q:'Além da dor, que outro sintoma é frequentemente alvo de controlo em doença oncológica pulmonar avançada?', opts:['Dispneia','Poliúria','Hipertensão maligna','Obstipação isolada'], correta:0 }
  ]
},
{
  id:'C020', icon:'ICON_ALERT', bg:'#fbe4e8', fg:'#E80018',
  titulo:'C020 · Transtorno Bipolar Tipo I — Episódio Maníaco Severo', area:'Psiquiatria', idade:'36 anos, F',
  apresentacao:'Mulher de 36 anos, elevação anormal do humor, fuga de ideias, comportamento desinibido, agressividade, insónia total há 4 dias, discurso acelerado. NHB afectadas: Processos de Pensamento, Psicosocial, Sono/Repouso. Evolução estimada: 2–4 semanas de internamento.',
  raciocinio:'<b>Risco de Comportamento Autolesivo/Heterolesivo</b> relacionado com impulsividade e julgamento comprometido, evidenciado por desinibição e agressividade — a segurança da doente e de terceiros é a prioridade absoluta.',
  diagnosticos:['Risco de Comportamento Autolesivo/Heterolesivo','Processos de Pensamento Alterados','Comunicação Alterada'],
  noc:['Pensamento organizado','Comportamento controlado','Adesão medicamentosa'],
  nic:['Estabilizadores de humor (lítio)','Estrutura ambiental clara com limites','Terapia psicossocial estruturada'],
  perguntas:[
    { q:'Doente em mania severa, desinibida e agressiva, sem dormir há dias — qual a prioridade de segurança?', opts:['Educação sobre a doença','Garantir segurança da doente e de terceiros, em ambiente estruturado','Estimulação sensorial intensa','Isolamento social sem supervisão'], correta:1 },
    { q:'Qual o resultado esperado com a estabilização farmacológica (ex. lítio)?', opts:['Pensamento mais organizado e comportamento controlado','Sedação permanente sem interacção','Agitação crescente','Sem alteração esperada'], correta:0 },
    { q:'Qual a intervenção ambiental recomendada nesta fase aguda?', opts:['Ambiente estimulante com múltiplos estímulos','Ambiente calmo, estruturado, com rotina e limites claros','Isolamento total sem contacto humano','Excesso de visitas e ruído'], correta:1 },
    { q:'Que classe de fármacos estabilizadores do humor é referida neste caso?', opts:['Estabilizadores de humor','Antibióticos','Antidiabéticos orais','Anticoagulantes'], correta:0 },
    { q:'Durante a fase aguda, que cuidado relativo ao sono e nutrição é prioritário?', opts:['Ignorar sono e alimentação','Assegurar alimentação/hidratação e favorecer o repouso, mesmo com resistência','Estimular ainda mais a hiperactividade','Jejum prolongado voluntário'], correta:1 }
  ]
}
];

// ----- Teste "Fundamentos" (revisão geral, complementa os 20 mini-testes) -----
const QUIZ_FUNDAMENTOS = [
  { q:'Qual é a 1ª etapa do Processo de Enfermagem?', opts:['Diagnóstico','Avaliação/Colheita de dados','Planeamento','Intervenção'], correta:1 },
  { q:'Na Escala de Coma de Glasgow, qual a pontuação mínima possível?', opts:['0','3','8','15'], correta:1 },
  { q:'Qual a via de administração com ângulo de inserção de aproximadamente 90°?', opts:['Subcutânea','Intradérmica','Intramuscular','Endovenosa periférica'], correta:2 },
  { q:'Na regra dos nove para queimaduras, qual a percentagem de cada membro superior num adulto?', opts:['9%','18%','1%','27%'], correta:0 },
  { q:'O que significa a sigla "NIC" na prática de enfermagem?', opts:['Classificação de Diagnósticos de Enfermagem','Classificação dos Resultados de Enfermagem','Classificação das Intervenções de Enfermagem','Índice Nacional Clínico'], correta:2 },
  { q:'Qual destes é um sinal de alarme no protocolo FAST para AVC?', opts:['Aumento do apetite','Assimetria facial','Febre alta','Tosse persistente'], correta:1 },
  { q:'A adrenalina IM é o tratamento de primeira linha em qual emergência?', opts:['Hipoglicemia','Choque anafilático','Convulsão febril','Obstipação'], correta:1 }
];

// ----- Flashcards (ampliadas com conceitos-chave dos 20 casos) -----
const FLASHCARDS = [
  { f:'Domínio', v:'Área ampla de comportamento/resposta humana na Taxonomia NANDA-I (ex.: Nutrição, Actividade/Repouso)' },
  { f:'NIC', v:'Classificação das Intervenções de Enfermagem — as acções realizadas pelo enfermeiro' },
  { f:'NOC', v:'Classificação dos Resultados de Enfermagem — os resultados esperados do doente' },
  { f:'Dor aguda', v:'Diagnóstico de enfermagem: experiência sensorial/emocional desagradável, associada a lesão real ou potencial, com duração inferior a 3 meses' },
  { f:'Características definidoras', v:'Sinais e sintomas observáveis que sustentam um diagnóstico de enfermagem real' },
  { f:'Escala de Braden', v:'Instrumento que avalia o risco de lesão por pressão em 6 subescalas (pontuação 6–23)' },
  { f:'Fórmula de Parkland', v:'Estima o volume de reposição hídrica em queimados: 4ml × peso(kg) × %SCQ, metade nas primeiras 8h' },
  { f:'Status Asmaticus', v:'Crise de asma grave refractária a broncodilatadores, com risco de paragem respiratória' },
  { f:'Encefalopatia Hepática', v:'Alteração do estado mental por acumulação de amónia na falência hepática' },
  { f:'Escala de Glasgow', v:'Avalia abertura ocular, resposta verbal e motora; pontuação total de 3 a 15' },
  { f:'VAP', v:'Pneumonia associada à ventilação, definida a partir de ≥48h de intubação' },
  { f:'Regra dos Nove', v:'Estima a percentagem de superfície corporal queimada em adultos' },
  { f:'Sépsis', v:'Resposta inflamatória sistémica disfuncional a uma infecção, com risco de choque' },
  { f:'Respiração de Kussmaul', v:'Respiração profunda e rápida, compensatória da acidose metabólica (ex. cetoacidose)' },
  { f:'Escada Analgésica da OMS', v:'Abordagem escalonada da dor: não-opioides → opioides fracos → opioides fortes' },
  { f:'Pressão Intracraniana (PIC)', v:'Valor normal <20mmHg; a sua elevação está associada a risco de herniação encefálica' },
  { f:'BNP', v:'Péptido natriurético cerebral, elevado na sobrecarga/stress ventricular da insuficiência cardíaca' },
  { f:'Débito urinário mínimo', v:'0.5ml/kg/h define uma perfusão renal considerada adequada' },
  { f:'Flumazenil', v:'Antídoto usado na intoxicação por benzodiazepinas' },
  { f:'Sinal de Kernig / rigidez de nuca', v:'Sinais de irritação meníngea, sugestivos de meningite' }
];


// === data-escalas.js ===
// ===== dados/construção — escalas.html =====

buildAccordionView('escalas', 'Escalas Clínicas', 'Escalas de avaliação de enfermagem mais usadas na prática clínica e protocolos de triagem.', [
{
  icon: ICON_SCALE, bg:'#EEF1F6', fg:'#000000',
  title:'Escala de Coma de Glasgow (ECG)',
  sub:'Avaliação do nível de consciência',
  body:`
  <img class="zoomable-img" src="img/bdd4d0d045.webp" alt="Tipos de coma e níveis de consciência" style="width:100%;max-width:260px;margin:4px auto 10px;" onclick="openLightbox('img-glasgow-coma.jpg','Tipos de coma e níveis de consciência','tipos-de-coma.jpg')">
  <div class="img-caption">Tipos de coma e níveis de consciência</div>
  <p>Avalia 3 componentes: abertura ocular (1–4), resposta verbal (1–5) e resposta motora (1–6). Pontuação total de 3 a 15.</p>
  <table class="ref-table">
    <tr><th>Pontuação</th><th>Classificação</th></tr>
    <tr><td>15–13</td><td>TCE ligeiro</td></tr>
    <tr><td>12–9</td><td>TCE moderado</td></tr>
    <tr><td>≤8</td><td>TCE grave — considerar via aérea avançada</td></tr>
  </table>
  <div class="info-box">Pode calcular a pontuação automaticamente em <b>Ferramentas → Cálculos de Enfermagem → Índices e Escalas</b>.</div>`
},
{
  icon: ICON_SCALE, bg:'#E6EAF1', fg:'var(--azul-escuro)',
  title:'Escala de Braden',
  sub:'Risco de lesão por pressão',
  body:`
  <p>Avalia 6 subescalas, cada uma pontuada de 1 a 4 (excepto fricção/cisalhamento, de 1 a 3): percepção sensorial, humidade, actividade, mobilidade, nutrição, fricção e cisalhamento.</p>
  <table class="ref-table">
    <tr><th>Pontuação total</th><th>Risco</th></tr>
    <tr><td>≤9</td><td><span class="badge badge-red">Risco muito elevado</span></td></tr>
    <tr><td>10–12</td><td><span class="badge badge-orange">Risco elevado</span></td></tr>
    <tr><td>13–14</td><td><span class="badge badge-gold">Risco moderado</span></td></tr>
    <tr><td>15–18</td><td><span class="badge badge-blue">Risco baixo</span></td></tr>
    <tr><td>19–23</td><td><span class="badge badge-green">Sem risco significativo</span></td></tr>
  </table>
  <h4>Intervenções gerais</h4>
  <ul>
    <li>Reposicionamento a cada 2 horas em doentes acamados</li>
    <li>Superfícies de redistribuição de pressão</li>
    <li>Manter pele limpa e seca; hidratação cutânea</li>
    <li>Optimizar aporte nutricional e proteico</li>
  </ul>`
},
{
  icon: ICON_SCALE, bg:'#EEF1F6', fg:'#000000',
  title:'Escala de Morse',
  sub:'Risco de queda',
  body:`
  <p>Soma de 6 itens: história de quedas (0/25), diagnóstico secundário (0/15), apoio para deambular (0/15/30), terapia endovenosa/heparina (0/20), marcha (0/10/20), estado mental (0/15).</p>
  <table class="ref-table">
    <tr><th>Pontuação</th><th>Risco</th></tr>
    <tr><td>0–24</td><td><span class="badge badge-green">Baixo risco</span></td></tr>
    <tr><td>25–44</td><td><span class="badge badge-gold">Risco moderado</span></td></tr>
    <tr><td>≥45</td><td><span class="badge badge-red">Alto risco</span></td></tr>
  </table>
  <h4>Medidas de prevenção</h4>
  <ul>
    <li>Identificação visual do risco (pulseira/sinalética)</li>
    <li>Cama em posição baixa, grades levantadas se indicado</li>
    <li>Campainha de chamada ao alcance</li>
    <li>Calçado antiderrapante e corredores livres de obstáculos</li>
  </ul>`
},
{
  icon: ICON_SCALE, bg:'#fbe4e8', fg:'#E80018',
  title:'Escala Visual Analógica da Dor (EVA)',
  sub:'Auto-avaliação da intensidade da dor',
  body:`
  <p>Linha de 0 a 10 em que o doente indica a intensidade da dor sentida.</p>
  <table class="ref-table">
    <tr><th>Valor</th><th>Intensidade</th></tr>
    <tr><td>0</td><td>Sem dor</td></tr>
    <tr><td>1–3</td><td><span class="badge badge-green">Dor ligeira</span></td></tr>
    <tr><td>4–6</td><td><span class="badge badge-gold">Dor moderada</span></td></tr>
    <tr><td>7–9</td><td><span class="badge badge-orange">Dor intensa</span></td></tr>
    <tr><td>10</td><td><span class="badge badge-red">Dor máxima imaginável</span></td></tr>
  </table>
  <div class="info-box">Em crianças pequenas ou doentes não comunicantes, preferir escalas observacionais (ex.: Escala de Faces de Wong-Baker, FLACC).</div>`
},
{
  icon: ICON_SCALE, bg:'#E6EAF1', fg:'var(--azul)',
  title:'Índice de Barthel',
  sub:'Independência funcional nas AVD',
  body:`
  <p>Avalia 10 actividades de vida diária (alimentação, banho, higiene pessoal, vestir, controlo intestinal e vesical, uso do sanitário, transferências, mobilidade, subir escadas). Pontuação de 0 a 100.</p>
  <table class="ref-table">
    <tr><th>Pontuação</th><th>Grau de dependência</th></tr>
    <tr><td>0–20</td><td>Dependência total</td></tr>
    <tr><td>21–60</td><td>Dependência grave</td></tr>
    <tr><td>61–90</td><td>Dependência moderada</td></tr>
    <tr><td>91–99</td><td>Dependência ligeira</td></tr>
    <tr><td>100</td><td>Independência total</td></tr>
  </table>`
},
{
  icon: ICON_SCALE, bg:'#EEF1F6', fg:'var(--azul)',
  title:'NEWS2 — National Early Warning Score',
  sub:'Deterioração clínica precoce',
  body:`
  <p>Pontua 7 parâmetros fisiológicos: frequência respiratória, saturação de O₂, uso de oxigénio suplementar, temperatura, pressão arterial sistólica, frequência cardíaca e nível de consciência (AVPU).</p>
  <table class="ref-table">
    <tr><th>Pontuação total</th><th>Risco / conduta</th></tr>
    <tr><td>0</td><td><span class="badge badge-green">Baixo</span> — vigilância de rotina</td></tr>
    <tr><td>1–4</td><td><span class="badge badge-blue">Baixo-moderado</span> — reavaliar</td></tr>
    <tr><td>5–6 (ou 3 num parâmetro)</td><td><span class="badge badge-gold">Moderado</span> — avaliação urgente</td></tr>
    <tr><td>≥7</td><td><span class="badge badge-red">Alto</span> — resposta de emergência</td></tr>
  </table>`
},
{
  icon: ICON_SCALE, bg:'#EEF1F6', fg:'#000000',
  title:'Índice de Apgar',
  sub:'Avaliação neonatal ao 1º e 5º minuto',
  body:`
  <p>Avalia 5 sinais, cada um pontuado de 0 a 2: frequência cardíaca, esforço respiratório, tónus muscular, irritabilidade reflexa e cor da pele.</p>
  <table class="ref-table">
    <tr><th>Pontuação</th><th>Estado do RN</th></tr>
    <tr><td>7–10</td><td><span class="badge badge-green">Boa adaptação</span></td></tr>
    <tr><td>4–6</td><td><span class="badge badge-gold">Dificuldade moderada</span> — estimulação/O₂</td></tr>
    <tr><td>0–3</td><td><span class="badge badge-red">Depressão grave</span> — reanimação neonatal imediata</td></tr>
  </table>`
},
{
  icon: ICON_ALERT, bg:'#fbe4e8', fg:'#E80018',
  title:'Protocolo de Triagem de Manchester',
  sub:'Prioridade clínica no serviço de urgência',
  body:`
  <p>Sistema de triagem por cores que define a prioridade de atendimento e o tempo-alvo até à observação médica, com base em fluxogramas de sintomas discriminadores.</p>
  <table class="ref-table">
    <tr><th>Cor</th><th>Prioridade</th><th>Tempo-alvo</th></tr>
    <tr><td><span class="badge badge-red">Vermelho</span></td><td>Emergente</td><td>Imediato</td></tr>
    <tr><td><span class="badge badge-orange">Laranja</span></td><td>Muito urgente</td><td>10 min</td></tr>
    <tr><td><span class="badge badge-gold">Amarelo</span></td><td>Urgente</td><td>60 min</td></tr>
    <tr><td><span class="badge badge-green">Verde</span></td><td>Pouco urgente</td><td>120 min</td></tr>
    <tr><td><span class="badge badge-blue">Azul</span></td><td>Não urgente</td><td>240 min</td></tr>
  </table>
  <div class="alert-box">A triagem não substitui a reavaliação contínua — qualquer alteração do estado do doente exige nova avaliação de prioridade.</div>`
}
]);

// ================= PROCEDIMENTOS DE ENFERMAGEM =================
// ================= CASOS CLÍNICOS (extraído de JASSAA Premium v3.0) =================


// === data-exames.js ===
// ===== dados/construção — exames.html =====

buildAccordionView('exames', 'Exames Laboratoriais', 'Valores de referência e apoio à interpretação de exames laboratoriais em adultos. Os intervalos podem variar consoante o laboratório e o método utilizado.', [
{
  icon: ICON_EXAM, bg:'#fbe4e8', fg:'#E80018',
  title:'Hemograma Completo',
  sub:'Série vermelha, branca e plaquetas',
  body:`
  <table class="ref-table">
    <tr><th>Parâmetro</th><th>Valor de referência (adulto)</th></tr>
    <tr><td>Hemoglobina</td><td>H: 13,5–17,5 g/dL · M: 12–15,5 g/dL</td></tr>
    <tr><td>Hematócrito</td><td>H: 41–53% · M: 36–46%</td></tr>
    <tr><td>Eritrócitos</td><td>4,5–5,9 milhões/µL (H) · 4,1–5,1 milhões/µL (M)</td></tr>
    <tr><td>Leucócitos</td><td>4.000–11.000 /µL</td></tr>
    <tr><td>Neutrófilos</td><td>40–75%</td></tr>
    <tr><td>Linfócitos</td><td>20–45%</td></tr>
    <tr><td>Plaquetas</td><td>150.000–450.000 /µL</td></tr>
  </table>
  <div class="info-box"><b>Leucocitose</b> sugere infecção/inflamação; <b>leucopenia</b> pode indicar imunossupressão. <b>Trombocitopenia</b> aumenta o risco hemorrágico.</div>`
},
{
  icon: ICON_EXAM, bg:'#EEF1F6', fg:'#000000',
  title:'Bioquímica Sérica',
  sub:'Glicose, função renal e electrólitos',
  body:`
  <table class="ref-table">
    <tr><th>Parâmetro</th><th>Valor de referência</th></tr>
    <tr><td>Glicemia em jejum</td><td>70–99 mg/dL</td></tr>
    <tr><td>Ureia</td><td>15–45 mg/dL</td></tr>
    <tr><td>Creatinina</td><td>H: 0,7–1,3 mg/dL · M: 0,6–1,1 mg/dL</td></tr>
    <tr><td>Sódio (Na⁺)</td><td>135–145 mEq/L</td></tr>
    <tr><td>Potássio (K⁺)</td><td>3,5–5,0 mEq/L</td></tr>
    <tr><td>Cloro (Cl⁻)</td><td>98–107 mEq/L</td></tr>
    <tr><td>Cálcio total</td><td>8,5–10,5 mg/dL</td></tr>
  </table>
  <div class="alert-box">Potássio &lt;3,0 ou &gt;6,0 mEq/L é considerado crítico — risco de arritmia grave. Notificar de imediato.</div>`
},
{
  icon: ICON_EXAM, bg:'#E6EAF1', fg:'var(--azul)',
  title:'Perfil Lipídico',
  sub:'Colesterol e triglicerídeos',
  body:`
  <table class="ref-table">
    <tr><th>Parâmetro</th><th>Valor desejável</th></tr>
    <tr><td>Colesterol total</td><td>&lt; 200 mg/dL</td></tr>
    <tr><td>LDL ("mau" colesterol)</td><td>&lt; 100 mg/dL</td></tr>
    <tr><td>HDL ("bom" colesterol)</td><td>&gt; 40 mg/dL (H) · &gt; 50 mg/dL (M)</td></tr>
    <tr><td>Triglicerídeos</td><td>&lt; 150 mg/dL</td></tr>
  </table>
  <p>Colheita geralmente realizada em jejum de 9–12 horas, conforme protocolo laboratorial.</p>`
},
{
  icon: ICON_EXAM, bg:'#E6EAF1', fg:'var(--azul-escuro)',
  title:'Estudo da Coagulação',
  sub:'TP, INR, TTPa e fibrinogénio',
  body:`
  <table class="ref-table">
    <tr><th>Parâmetro</th><th>Valor de referência</th></tr>
    <tr><td>Tempo de protrombina (TP)</td><td>11–13,5 segundos</td></tr>
    <tr><td>INR</td><td>0,8–1,2 (2–3 em anticoagulação terapêutica)</td></tr>
    <tr><td>TTPa</td><td>25–35 segundos</td></tr>
    <tr><td>Fibrinogénio</td><td>200–400 mg/dL</td></tr>
    <tr><td>D-dímero</td><td>&lt; 0,5 µg/mL (varia por método)</td></tr>
  </table>
  <div class="info-box">Doentes anticoagulados (varfarina) são monitorizados pelo INR; a heparina não fraccionada é monitorizada pelo TTPa.</div>`
},
{
  icon: ICON_EXAM, bg:'#EEF1F6', fg:'#000000',
  title:'Gasometria Arterial',
  sub:'Equilíbrio ácido-base e oxigenação',
  body:`
  <table class="ref-table">
    <tr><th>Parâmetro</th><th>Valor de referência</th></tr>
    <tr><td>pH</td><td>7,35–7,45</td></tr>
    <tr><td>PaCO₂</td><td>35–45 mmHg</td></tr>
    <tr><td>PaO₂</td><td>80–100 mmHg</td></tr>
    <tr><td>HCO₃⁻</td><td>22–26 mEq/L</td></tr>
    <tr><td>SatO₂</td><td>95–100%</td></tr>
    <tr><td>Excesso de bases (BE)</td><td>-2 a +2 mEq/L</td></tr>
  </table>
  <h4>Interpretação rápida</h4>
  <ul>
    <li>pH &lt; 7,35 = acidose · pH &gt; 7,45 = alcalose</li>
    <li>PaCO₂ alterado no mesmo sentido do pH = origem respiratória</li>
    <li>HCO₃⁻ alterado em sentido inverso ao pH = origem metabólica</li>
  </ul>`
},
{
  icon: ICON_EXAM, bg:'#EEF1F6', fg:'#000000',
  title:'Função Hepática',
  sub:'Transaminases, bilirrubinas e fosfatase alcalina',
  body:`
  <table class="ref-table">
    <tr><th>Parâmetro</th><th>Valor de referência</th></tr>
    <tr><td>AST / TGO</td><td>10–40 U/L</td></tr>
    <tr><td>ALT / TGP</td><td>7–56 U/L</td></tr>
    <tr><td>Bilirrubina total</td><td>0,3–1,2 mg/dL</td></tr>
    <tr><td>Bilirrubina directa</td><td>0–0,3 mg/dL</td></tr>
    <tr><td>Fosfatase alcalina</td><td>44–147 U/L</td></tr>
    <tr><td>Albumina</td><td>3,5–5,0 g/dL</td></tr>
  </table>`
},
{
  icon: ICON_EXAM, bg:'#EEF1F6', fg:'var(--azul)',
  title:'Exame de Urina Tipo II (EAS)',
  sub:'Características físicas, químicas e sedimento urinário',
  body:`
  <table class="ref-table">
    <tr><th>Parâmetro</th><th>Valor esperado</th></tr>
    <tr><td>Densidade</td><td>1,005–1,030</td></tr>
    <tr><td>pH</td><td>4,6–8,0</td></tr>
    <tr><td>Proteínas</td><td>Negativo/vestigial</td></tr>
    <tr><td>Glicose</td><td>Negativo</td></tr>
    <tr><td>Corpos cetónicos</td><td>Negativo</td></tr>
    <tr><td>Leucócitos no sedimento</td><td>0–5 por campo</td></tr>
    <tr><td>Eritrócitos no sedimento</td><td>0–2 por campo</td></tr>
  </table>
  <p>Colher de preferência a primeira urina da manhã, com técnica de jacto médio e recipiente estéril.</p>`
}
]);

// ================= URGÊNCIA E EMERGÊNCIA =================


// === data-glossario.js ===
// ===== dados/construção — glossario.html =====

buildAccordionView('glossario', 'Termos Médicos', 'Glossário de siglas, abreviaturas e termos usados na prática e no registo de enfermagem.', [
{
  icon: ICON_SCALE, bg:'#E6EAF1', fg:'var(--azul)',
  title:'Siglas e Abreviaturas de Sinais Vitais',
  sub:'Parâmetros e monitorização',
  body:`
  <table class="ref-table">
    <tr><th>Sigla</th><th>Significado</th></tr>
    <tr><td>TA / PA</td><td>Tensão arterial / Pressão arterial</td></tr>
    <tr><td>FC</td><td>Frequência cardíaca</td></tr>
    <tr><td>FR</td><td>Frequência respiratória</td></tr>
    <tr><td>T° / Tax</td><td>Temperatura (axilar)</td></tr>
    <tr><td>SpO₂</td><td>Saturação periférica de oxigénio</td></tr>
    <tr><td>Hgt / HGT</td><td>Hemoglicoteste (glicemia capilar)</td></tr>
    <tr><td>PVC</td><td>Pressão venosa central</td></tr>
    <tr><td>ECG</td><td>Electrocardiograma / Escala de Coma de Glasgow (conforme contexto)</td></tr>
  </table>`
},
{
  icon: ICON_SCALE, bg:'#EEF1F6', fg:'#000000',
  title:'Vias de Administração e Prescrição',
  sub:'Abreviaturas usadas em prescrições',
  body:`
  <table class="ref-table">
    <tr><th>Sigla</th><th>Significado</th></tr>
    <tr><td>VO</td><td>Via oral</td></tr>
    <tr><td>EV / IV</td><td>Endovenoso / Intravenoso</td></tr>
    <tr><td>IM</td><td>Intramuscular</td></tr>
    <tr><td>SC</td><td>Subcutâneo</td></tr>
    <tr><td>ID</td><td>Intradérmico</td></tr>
    <tr><td>SL</td><td>Sublingual</td></tr>
    <tr><td>Ret</td><td>Via rectal</td></tr>
    <tr><td>Top</td><td>Via tópica</td></tr>
    <tr><td>SOS</td><td>Se necessário (do latim "si opus sit")</td></tr>
    <tr><td>8/8h, 12/12h</td><td>De 8 em 8 horas, de 12 em 12 horas</td></tr>
    <tr><td>QD / BID / TID</td><td>Uma vez ao dia / duas vezes ao dia / três vezes ao dia</td></tr>
    <tr><td>gtt</td><td>Gota(s)</td></tr>
  </table>`
},
{
  icon: ICON_SCALE, bg:'#EEF1F6', fg:'#000000',
  title:'Termos Clínicos Frequentes',
  sub:'Sinais, sintomas e condições',
  body:`
  <table class="ref-table">
    <tr><th>Termo</th><th>Significado</th></tr>
    <tr><td>Dispneia</td><td>Dificuldade respiratória</td></tr>
    <tr><td>Taquicardia / Bradicardia</td><td>Frequência cardíaca elevada / diminuída</td></tr>
    <tr><td>Taquipneia / Bradipneia</td><td>Frequência respiratória elevada / diminuída</td></tr>
    <tr><td>Cianose</td><td>Coloração azulada da pele/mucosas por falta de oxigénio</td></tr>
    <tr><td>Edema</td><td>Acumulação de líquido nos tecidos</td></tr>
    <tr><td>Anasarca</td><td>Edema generalizado grave</td></tr>
    <tr><td>Diaforese</td><td>Sudorese excessiva</td></tr>
    <tr><td>Anúria / Oligúria / Poliúria</td><td>Ausência / diminuição / aumento da produção de urina</td></tr>
    <tr><td>Hematúria</td><td>Presença de sangue na urina</td></tr>
    <tr><td>Melena</td><td>Fezes escuras por sangue digerido</td></tr>
    <tr><td>Icterícia</td><td>Coloração amarelada da pele/mucosas</td></tr>
    <tr><td>Emese / Êmese</td><td>Vómito</td></tr>
    <tr><td>Astenia</td><td>Fraqueza/cansaço generalizado</td></tr>
    <tr><td>Anorexia</td><td>Perda de apetite</td></tr>
    <tr><td>Prostração</td><td>Estado de grande abatimento físico</td></tr>
  </table>`
},
{
  icon: ICON_SCALE, bg:'#E6EAF1', fg:'var(--azul-escuro)',
  title:'Prefixos e Sufixos Médicos',
  sub:'Bases para interpretar termos técnicos',
  body:`
  <table class="ref-table">
    <tr><th>Elemento</th><th>Significado</th><th>Exemplo</th></tr>
    <tr><td>-ite</td><td>Inflamação</td><td>Gastrite, meningite</td></tr>
    <tr><td>-oma</td><td>Tumor</td><td>Carcinoma, hematoma</td></tr>
    <tr><td>-ectomia</td><td>Remoção cirúrgica</td><td>Apendicectomia</td></tr>
    <tr><td>-otomia</td><td>Incisão cirúrgica</td><td>Traqueotomia</td></tr>
    <tr><td>-ostomia</td><td>Criação de abertura</td><td>Colostomia, traqueostomia</td></tr>
    <tr><td>-algia</td><td>Dor</td><td>Cefalalgia, mialgia</td></tr>
    <tr><td>-penia</td><td>Diminuição</td><td>Leucopenia, trombocitopenia</td></tr>
    <tr><td>-emia</td><td>Relativo ao sangue</td><td>Anemia, hiperglicemia</td></tr>
    <tr><td>Hiper- / Hipo-</td><td>Acima / abaixo do normal</td><td>Hipertensão, hipoglicemia</td></tr>
    <tr><td>Brady- / Taqui-</td><td>Lento / rápido</td><td>Bradicardia, taquipneia</td></tr>
    <tr><td>Dis-</td><td>Dificuldade/alteração</td><td>Dispneia, disúria</td></tr>
    <tr><td>A- / An-</td><td>Ausência</td><td>Apneia, anúria</td></tr>
  </table>`
},
{
  icon: ICON_SCALE, bg:'#EEF1F6', fg:'#000000',
  title:'Termos do Processo de Enfermagem',
  sub:'NANDA-I, NIC e NOC',
  body:`
  <table class="ref-table">
    <tr><th>Termo</th><th>Significado</th></tr>
    <tr><td>NANDA-I</td><td>Classificação internacional de diagnósticos de enfermagem</td></tr>
    <tr><td>Domínio</td><td>Área ampla de comportamento/resposta humana (ex.: Nutrição)</td></tr>
    <tr><td>Classe</td><td>Subdivisão do domínio que agrupa diagnósticos afins</td></tr>
    <tr><td>Diagnóstico de enfermagem</td><td>Julgamento clínico sobre a resposta humana a um problema de saúde real ou potencial</td></tr>
    <tr><td>NIC</td><td>Classificação das Intervenções de Enfermagem (Nursing Interventions Classification)</td></tr>
    <tr><td>NOC</td><td>Classificação dos Resultados de Enfermagem (Nursing Outcomes Classification)</td></tr>
    <tr><td>Factores relacionados</td><td>Causas/condições associadas a um diagnóstico real</td></tr>
    <tr><td>Características definidoras</td><td>Sinais e sintomas que evidenciam o diagnóstico</td></tr>
    <tr><td>Factores de risco</td><td>Condições que aumentam a vulnerabilidade a um diagnóstico de risco</td></tr>
  </table>`
}
]);

// ================= AVALIAÇÃO E EXAME FÍSICO =================


// === data-nic.js ===
// Dados NIC — usados apenas em intervencoes.html

const DATA_NIC = [{"dominio": "Domínio 1. Fisiológico: Básico", "classes": [{"classe": "Classe A. Controlo da Atividade e Exercício", "itens": ["Terapia de exercício: deambulação", "Terapia de exercício: mobilidade articular", "Terapia de exercício: controlo muscular", "Terapia de exercício: equilíbrio", "Posicionamento", "Transferência", "Assistência no autocuidado: mobilidade"]}, {"classe": "Classe B. Controlo da Eliminação", "itens": ["Treino de hábito intestinal", "Cuidados com a incontinência intestinal", "Cuidados com a incontinência urinária", "Cateterismo urinário", "Treino de hábito urinário", "Irrigação intestinal", "Bexigoma: esvaziamento manual"]}, {"classe": "Classe C. Controlo da Imobilidade", "itens": ["Prevenção de úlcera de pressão", "Cuidados com tração/imobilização", "Posicionamento: neurológico", "Terapia de exercício: controlo muscular"]}, {"classe": "Classe D. Suporte Nutricional", "itens": ["Controlo de eletrólitos", "Terapia nutricional", "Monitorização nutricional", "Alimentação", "Assistência para ganho de peso", "Assistência para perda de peso", "Controlo da hiperglicemia", "Controlo da hipoglicemia"]}, {"classe": "Classe E. Promoção do Conforto Físico", "itens": ["Controlo da dor", "Aplicação de calor/frio", "Massagem simples", "Controlo da náusea", "Ajuda à analgesia controlada pelo doente"]}, {"classe": "Classe F. Facilitação do Autocuidado", "itens": ["Assistência no autocuidado: banho/higiene", "Assistência no autocuidado: vestir-se", "Assistência no autocuidado: alimentação", "Assistência no autocuidado: uso do sanitário", "Ensino: atividades de autocuidado"]}]}, {"dominio": "Domínio 2. Fisiológico: Complexo", "classes": [{"classe": "Classe G. Controlo de Eletrólitos e Equilíbrio Ácido-Base", "itens": ["Controlo de eletrólitos", "Controlo hidroeletrolítico", "Monitorização hidroeletrolítica", "Controlo do equilíbrio ácido-base"]}, {"classe": "Classe H. Controlo de Fármacos", "itens": ["Administração de medicação", "Controlo de eletrólitos: hipercaliemia", "Preparação de medicação", "Ensino: medicamentos prescritos", "Controlo da quimioterapia", "Controlo da analgesia"]}, {"classe": "Classe I. Controlo Neurológico", "itens": ["Monitorização neurológica", "Controlo do edema cerebral", "Precauções contra convulsões", "Controlo da disreflexia autonómica", "Controlo da pressão intracraniana"]}, {"classe": "Classe J. Cuidados Perioperatórios", "itens": ["Cuidados pré-operatórios", "Cuidados pós-anestésicos", "Cuidados pós-operatórios", "Precauções cirúrgicas", "Posicionamento cirúrgico"]}, {"classe": "Classe K. Controlo Respiratório", "itens": ["Aspiração de vias aéreas", "Controlo das vias aéreas", "Monitorização respiratória", "Ventilação mecânica: invasiva", "Fisioterapia respiratória", "Controlo da tosse"]}, {"classe": "Classe L. Controlo da Pele/Ferida", "itens": ["Cuidados com a pele: tratamento tópico", "Cuidados com a incisão", "Cuidados com feridas", "Prevenção de úlcera de pressão", "Cuidados com drenos cirúrgicos"]}, {"classe": "Classe M. Termorregulação", "itens": ["Tratamento da hipertermia", "Tratamento da hipotermia", "Regulação da temperatura", "Regulação da temperatura: intraoperatória"]}, {"classe": "Classe N. Controlo da Perfusão Tissular", "itens": ["Cuidados circulatórios: insuficiência arterial", "Cuidados circulatórios: insuficiência venosa", "Precauções circulatórias", "Controlo do choque"]}]}, {"dominio": "Domínio 3. Comportamental", "classes": [{"classe": "Classe O. Terapia Comportamental", "itens": ["Modificação de comportamento", "Contrato com o doente", "Estabelecimento de limites", "Treino de controlo de impulsos"]}, {"classe": "Classe P. Terapia Cognitiva", "itens": ["Reestruturação cognitiva", "Estimulação cognitiva", "Orientação para a realidade", "Treino de memória"]}, {"classe": "Classe Q. Melhoria da Comunicação", "itens": ["Escuta ativa", "Melhoria da comunicação: défice auditivo", "Melhoria da comunicação: défice de fala", "Melhoria da comunicação: défice visual"]}, {"classe": "Classe R. Assistência para o Enfrentamento", "itens": ["Apoio emocional", "Aconselhamento", "Facilitação do luto", "Redução da ansiedade", "Apoio à tomada de decisão", "Apoio à família"]}, {"classe": "Classe S. Educação do Doente", "itens": ["Ensino: processo de doença", "Ensino: medicamentos prescritos", "Ensino: dieta prescrita", "Ensino: procedimento/tratamento", "Ensino: atividade/exercício prescrito"]}, {"classe": "Classe T. Promoção do Conforto Psicológico", "itens": ["Presença", "Toque terapêutico", "Musicoterapia", "Terapia de relaxamento"]}]}, {"dominio": "Domínio 4. Segurança", "classes": [{"classe": "Classe U. Controlo de Crise", "itens": ["Intervenção na crise", "Precauções contra suicídio", "Controlo da agitação psicomotora", "Contenção física"]}, {"classe": "Classe V. Controlo de Risco", "itens": ["Precauções contra quedas", "Controlo de infeção", "Controlo ambiental: segurança", "Identificação de risco", "Vigilância: segurança"]}]}, {"dominio": "Domínio 5. Família", "classes": [{"classe": "Classe W. Cuidados na Gravidez e no Parto", "itens": ["Cuidado pré-natal", "Assistência no parto", "Cuidados pós-parto", "Cuidados ao recém-nascido"]}, {"classe": "Classe X. Cuidados na Criação dos Filhos", "itens": ["Promoção do vínculo/apego", "Ensino: cuidados com o lactente", "Apoio à família", "Aconselhamento na criação dos filhos"]}, {"classe": "Classe Z. Cuidados na Vida Adulta", "itens": ["Cuidados no fim da vida", "Apoio ao cuidador familiar", "Facilitação de visitas"]}]}, {"dominio": "Domínio 6. Sistema de Saúde", "classes": [{"classe": "Classe Y. Mediação do Sistema de Saúde", "itens": ["Orientação no sistema de saúde", "Encaminhamento", "Gestão de caso"]}, {"classe": "Classe a. Gestão do Sistema de Saúde", "itens": ["Gestão de recursos financeiros", "Controlo de suprimentos", "Melhoria da qualidade"]}, {"classe": "Classe b. Gestão da Informação", "itens": ["Documentação", "Transferência de cuidados (passagem de turno)", "Consulta telefónica"]}]}, {"dominio": "Domínio 7. Comunidade", "classes": [{"classe": "Classe c. Promoção da Saúde da Comunidade", "itens": ["Desenvolvimento de programas", "Marketing social", "Educação em saúde comunitária"]}, {"classe": "Classe d. Controlo de Risco na Comunidade", "itens": ["Controlo de doenças transmissíveis", "Preparação para desastres na comunidade", "Controlo ambiental: comunidade"]}]}];


// === data-noc.js ===
// Dados NOC — usados apenas em resultados.html

const DATA_NOC = [{"dominio": "Domínio 1. Saúde Funcional", "classes": [{"classe": "Classe A. Manutenção da Energia", "itens": ["Resistência", "Nível de fadiga", "Energia psicomotora"]}, {"classe": "Classe B. Crescimento e Desenvolvimento", "itens": ["Crescimento", "Desenvolvimento infantil", "Desenvolvimento: adolescência"]}, {"classe": "Classe C. Mobilidade", "itens": ["Ambulação", "Mobilidade", "Equilíbrio", "Movimento coordenado"]}, {"classe": "Classe D. Autocuidado", "itens": ["Autocuidado: atividades da vida diária", "Autocuidado: banho", "Autocuidado: vestir-se", "Autocuidado: alimentar-se", "Autocuidado: higiene"]}]}, {"dominio": "Domínio 2. Saúde Fisiológica", "classes": [{"classe": "Classe E. Cardiopulmonar", "itens": ["Efetividade da bomba cardíaca", "Estado respiratório: ventilação", "Estado circulatório", "Perfusão tissular: cardíaca"]}, {"classe": "Classe F. Eliminação", "itens": ["Continência urinária", "Eliminação urinária", "Continência intestinal", "Eliminação intestinal"]}, {"classe": "Classe G. Líquidos e Eletrólitos", "itens": ["Equilíbrio hídrico", "Equilíbrio eletrolítico e ácido-base", "Hidratação"]}, {"classe": "Classe H. Resposta Imune", "itens": ["Estado imunológico", "Gravidade da infeção"]}, {"classe": "Classe I. Regulação Metabólica", "itens": ["Controlo glicémico", "Função hepática", "Gravidade da sobrecarga de líquidos"]}, {"classe": "Classe J. Neurocognitivo", "itens": ["Estado neurológico", "Cognição", "Memória", "Nível de consciência"]}, {"classe": "Classe K. Digestão e Nutrição", "itens": ["Estado nutricional", "Estado de deglutição", "Função gastrointestinal"]}, {"classe": "Classe L. Função Sensorial", "itens": ["Função sensorial: audição", "Função sensorial: visão", "Função sensorial: tato"]}, {"classe": "Classe M. Função Tissular", "itens": ["Integridade tissular: pele e mucosas", "Cicatrização de feridas: primeira intenção", "Cicatrização de feridas: segunda intenção"]}]}, {"dominio": "Domínio 3. Saúde Psicossocial", "classes": [{"classe": "Classe N. Bem-estar Psicológico", "itens": ["Nível de ansiedade", "Nível de depressão", "Esperança", "Autoestima"]}, {"classe": "Classe O. Adaptação Psicossocial", "itens": ["Resolução do luto", "Adaptação da criança à hospitalização", "Enfrentamento de problemas"]}, {"classe": "Classe P. Autocontrolo", "itens": ["Autocontrolo da agressão", "Autocontrolo do impulso", "Autocontrolo da ansiedade"]}, {"classe": "Classe Q. Interação Social", "itens": ["Envolvimento social", "Habilidades de interação social", "Clima social da família"]}]}, {"dominio": "Domínio 4. Conhecimento de Saúde e Comportamento", "classes": [{"classe": "Classe R. Adaptação Funcional", "itens": ["Adaptação à deficiência física", "Aceitação: estado de saúde"]}, {"classe": "Classe S. Comportamento de Saúde", "itens": ["Comportamento de adesão", "Comportamento de promoção da saúde", "Participação nas decisões de cuidados de saúde"]}, {"classe": "Classe T. Crenças de Saúde", "itens": ["Crença em saúde: perceção de controlo", "Crença em saúde: perceção de capacidade de realização"]}, {"classe": "Classe U. Conhecimento de Saúde", "itens": ["Conhecimento: processo de doença", "Conhecimento: medicação", "Conhecimento: dieta", "Conhecimento: regime de tratamento"]}, {"classe": "Classe V. Controlo de Risco e Segurança", "itens": ["Controlo de risco", "Comportamento de segurança pessoal", "Ambiente doméstico seguro"]}]}, {"dominio": "Domínio 5. Saúde Percecionada", "classes": [{"classe": "Classe W. Saúde e Qualidade de Vida", "itens": ["Qualidade de vida", "Estado de conforto", "Bem-estar pessoal"]}, {"classe": "Classe X. Satisfação com os Cuidados", "itens": ["Satisfação do doente/cliente: cuidado", "Satisfação do doente/cliente: ensino"]}]}, {"dominio": "Domínio 6. Saúde Familiar", "classes": [{"classe": "Classe Y. Desempenho do Cuidador Familiar", "itens": ["Desempenho do cuidador: cuidados diretos", "Bem-estar do cuidador", "Preparação do cuidador familiar para os cuidados no domicílio"]}, {"classe": "Classe Z. Estado dos Membros da Família", "itens": ["Estado de saúde física do cuidador familiar", "Adaptação psicossocial da família"]}, {"classe": "Classe a. Bem-estar Familiar", "itens": ["Funcionamento da família", "Normalização da família", "Clima social da família"]}, {"classe": "Classe b. Ser Pai/Mãe", "itens": ["Desempenho do papel de pai/mãe", "Vínculo pai/mãe-bebé"]}]}, {"dominio": "Domínio 7. Saúde Comunitária", "classes": [{"classe": "Classe c. Bem-estar Comunitário", "itens": ["Estado de saúde da comunidade", "Qualidade de vida da comunidade"]}, {"classe": "Classe d. Proteção à Saúde Comunitária", "itens": ["Controlo de risco comunitário: doença", "Controlo de risco comunitário: violência"]}]}];


// === data-procedimentos.js ===
// ===== dados/construção — procedimentos.html =====

buildAccordionView('procedimentos', 'Procedimentos de Enfermagem', 'Passo a passo dos principais procedimentos técnicos de enfermagem.', [
{
  icon: ICON_PROC, bg:'#E6EAF1', fg:'var(--azul)',
  title:'Administração de Medicamentos',
  sub:'Vias oral, intramuscular, subcutânea, intradérmica e endovenosa',
  body:`
  <svg class="proc-illus" viewBox="0 0 240 130" xmlns="http://www.w3.org/2000/svg"><rect width="240" height="130" rx="14" fill="#E6EAF1"/><ellipse cx="70" cy="95" rx="38" ry="14" fill="#c9daf5"/><rect x="52" y="35" width="36" height="62" rx="18" fill="#f6c9ce"/><rect x="150" y="50" width="70" height="14" rx="7" fill="var(--azul)"/><rect x="205" y="40" width="10" height="34" rx="3" fill="var(--azul-escuro)"/><circle cx="210" cy="38" r="4" fill="var(--azul-escuro)"/><line x1="88" y1="65" x2="150" y2="57" stroke="var(--azul)" stroke-width="3" stroke-linecap="round"/></svg>
  <h4>Os 5+5 certos</h4>
  <ul><li>Doente certo · Medicamento certo · Dose certa · Via certa · Hora certa</li><li>Registo certo · Razão certa · Resposta certa · Direito de recusar · Educação certa</li></ul>
  <img class="zoomable-img" src="img/f27a4af9ad.webp" alt="Os 13 certos da administração de medicamentos" style="width:100%;max-width:280px;margin:8px auto;" onclick="openLightbox('img-13-certos.jpg','Os 13 certos da administração de medicamentos','13-certos-medicamentos.jpg')">
  <div class="img-caption">Infográfico — os 13 certos da administração de medicamentos</div>
  <h4>Via intramuscular (IM)</h4>
  <ul>
    <li><b>Locais:</b> deltóide, vasto lateral da coxa, ventroglúteo, dorsoglúteo</li>
    <li><b>Agulha:</b> calibre 21–23G, 25–38 mm de comprimento (adulto); 25G/16 mm em crianças pequenas</li>
    <li>Agulha em ângulo de 90°; aspirar antes de injectar (exceto vacinas, salvo indicação contrária)</li>
    <li>Volume máximo recomendado: 2–3 mL no deltóide; até 5 mL no glúteo/vasto lateral (adulto)</li>
  </ul>
  <h4>Via subcutânea (SC)</h4>
  <ul><li>Locais: abdómen, face externa do braço, face anterior da coxa</li><li><b>Agulha:</b> calibre 25–27G, 10–16 mm (caneta de insulina: 4–8 mm)</li><li>Ângulo de 45°–90° consoante a prega cutânea; sem aspirar (ex.: insulina, heparina)</li></ul>
  <h4>Via intradérmica (ID)</h4>
  <ul><li><b>Agulha:</b> calibre 26–27G, 10 mm, bisel curto</li><li>Ângulo de 10°–15°; formação de pápula (0,1–0,5 mL); usada em testes de sensibilidade e BCG</li></ul>
  <h4>Via endovenosa (EV)</h4>
  <ul><li><b>Cateter:</b> escolher o calibre mais pequeno adequado à terapêutica (ver tabela de calibres em Cateterização Venosa Periférica)</li><li>Confirmar refluxo de sangue e permeabilidade do cateter antes de administrar</li><li>Respeitar velocidade de administração e compatibilidade de diluentes</li></ul>`
},
{
  icon: ICON_PROC, bg:'#EEF1F6', fg:'#000000',
  title:'Algaliação / Sondagem Vesical',
  sub:'Cateterismo vesical de demora ou intermitente',
  body:`
  <svg class="proc-illus" viewBox="0 0 240 130" xmlns="http://www.w3.org/2000/svg"><rect width="240" height="130" rx="14" fill="#EEF1F6"/><rect x="40" y="30" width="70" height="60" rx="10" fill="#fff" stroke="#000000" stroke-width="2"/><circle cx="75" cy="55" r="14" fill="#d9d9d9"/><path d="M75 69 v14" stroke="#000000" stroke-width="3" stroke-linecap="round"/><path d="M75 83 q40 6 60 22" stroke="#000000" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="180" cy="108" rx="26" ry="14" fill="#d9d9d9" stroke="#000000" stroke-width="2"/></svg>
  <h4>Indicações</h4>
  <ul><li>Retenção urinária, monitorização rigorosa de diurese, pré/pós-operatório, doentes acamados com incontinência complicada</li></ul>
  <img class="zoomable-img" src="img/7523381ad5.webp" alt="Sondas vesicais — tipos e calibres" style="width:100%;max-width:260px;margin:8px auto;" onclick="openLightbox('img-sondas-vesicais.jpg','Sondas vesicais — tipos e calibres','sondas-vesicais.jpg')">
  <div class="img-caption">Sondas vesicais — tipos e calibres</div>
  <h4>Calibres da sonda (Foley)</h4>
  <ul>
    <li><b>Mulher (adulto):</b> 12–14 Fr</li>
    <li><b>Homem (adulto):</b> 14–18 Fr (16 Fr o mais frequente)</li>
    <li><b>Criança:</b> 6–10 Fr, consoante idade/peso</li>
    <li><b>Balão:</b> insuflar com 10 mL de água destilada (adulto); 3–5 mL em pediatria — nunca usar soro fisiológico (cristaliza)</li>
  </ul>
  <h4>Material</h4>
  <ul><li>Sonda vesical estéril (calibre adequado ao doente), kit de algaliação, luvas estéreis e de procedimento, anti-séptico (clorohexidina ou povidona-iodada), lubrificante hidrossolúvel/gel anestésico (lidocaína gel 2%), seringa de 10 mL com água destilada, saco colector de urina com válvula anti-refluxo, campo estéril fenestrado, compressas estéreis</li></ul>
  <ol class="step-list">
    <li>Explicar o procedimento e garantir privacidade</li>
    <li>Posicionar o doente e realizar higiene perineal</li>
    <li>Técnica assética: colocar campo estéril e luvas estéreis</li>
    <li>Lubrificar a sonda e introduzir suavemente até refluxo de urina</li>
    <li>Insuflar o balão com o volume indicado no cateter (geralmente 10 mL)</li>
    <li>Tracionar suavemente até resistência e conectar ao saco colector</li>
    <li>Fixar a sonda e registar procedimento, características da urina e volume drenado</li>
  </ol>
  <div class="alert-box">Nunca insuflar o balão sem confirmar refluxo de urina — risco de lesão uretral.</div>`
},
{
  icon: ICON_PROC, bg:'#EEF1F6', fg:'#000000',
  title:'Sondagem Nasogástrica (SNG)',
  sub:'Colocação e verificação de posicionamento',
  body:`
  <svg class="proc-illus" viewBox="0 0 240 130" xmlns="http://www.w3.org/2000/svg"><rect width="240" height="130" rx="14" fill="#EEF1F6"/><circle cx="90" cy="60" r="38" fill="#f6c9ce"/><path d="M60 55 q10 -8 20 0" stroke="#000000" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M120 62 q40 -10 70 30" stroke="#000000" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="182" y="82" width="30" height="18" rx="4" fill="#000000"/></svg>
  <h4>Indicações</h4>
  <ul><li>Alimentação entérica, descompressão gástrica, administração de medicamentos, lavagem gástrica</li></ul>
  <h4>Calibre da sonda (Levine)</h4>
  <ul><li><b>Adulto:</b> 14–18 Fr (16 Fr o mais comum)</li><li><b>Criança:</b> 8–10 Fr</li><li><b>Lactente:</b> 5–8 Fr</li></ul>
  <h4>Material</h4>
  <ul><li>Sonda nasogástrica de calibre adequado, lubrificante hidrossolúvel, seringa de 20–50 mL (cone), estetoscópio, adesivo hipoalergénico de fixação, luvas de procedimento, saco colector/sistema de drenagem se aplicável, copo com água (se doente colaborante e sem contraindicação)</li></ul>
  <ol class="step-list">
    <li>Medir a distância nariz–lóbulo da orelha–apêndice xifóide</li>
    <li>Lubrificar a sonda e introduzir pela narina, pedindo ao doente para deglutir</li>
    <li>Progredir até à marca medida, sem forçar</li>
    <li>Confirmar posicionamento: aspirar conteúdo gástrico e/ou auscultar insuflação de ar no epigastro</li>
    <li>Fixar a sonda ao nariz e verificar radiografia se for para alimentação (padrão institucional)</li>
    <li>Registar procedimento e tolerância do doente</li>
  </ol>
  <div class="alert-box">Suspender e reavaliar de imediato se surgir tosse, cianose ou dificuldade respiratória durante a introdução — sinal de posicionamento na via aérea.</div>`
},
{
  icon: ICON_PROC, bg:'#E6EAF1', fg:'var(--azul-escuro)',
  title:'Cateterização Venosa Periférica',
  sub:'Punção venosa para acesso endovenoso',
  body:`
  <svg class="proc-illus" viewBox="0 0 240 130" xmlns="http://www.w3.org/2000/svg"><rect width="240" height="130" rx="14" fill="#E6EAF1"/><rect x="30" y="55" width="110" height="26" rx="13" fill="#f6c9ce"/><line x1="55" y1="68" x2="120" y2="68" stroke="var(--azul-escuro)" stroke-width="2" stroke-dasharray="3 3"/><path d="M140 68 h30" stroke="var(--azul-escuro)" stroke-width="4" stroke-linecap="round"/><rect x="170" y="60" width="16" height="16" rx="3" fill="var(--azul-escuro)"/><path d="M186 68 h20" stroke="var(--azul-escuro)" stroke-width="4"/><circle cx="212" cy="40" r="14" fill="#fff" stroke="var(--azul-escuro)" stroke-width="2"/><line x1="212" y1="54" x2="212" y2="68" stroke="var(--azul-escuro)" stroke-width="3"/></svg>
  <h4>Locais preferenciais</h4>
  <ul><li>Veias do antebraço e dorso da mão; evitar membros com fístula arteriovenosa, linfedema ou paresia</li></ul>
  <h4>Calibres do cateter (código de cores ISO)</h4>
  <table class="ref-table">
    <tr><th>Calibre</th><th>Cor (padrão)</th><th>Fluxo aprox.</th><th>Uso típico</th></tr>
    <tr><td>14G</td><td>Laranja</td><td>~270 mL/min</td><td>Trauma major, cirurgia com grande perda hemática</td></tr>
    <tr><td>16G</td><td>Cinzento</td><td>~180 mL/min</td><td>Transfusões rápidas, cirurgia major</td></tr>
    <tr><td>18G</td><td>Verde</td><td>~90 mL/min</td><td>Transfusão de sangue, fluidos rápidos</td></tr>
    <tr><td>20G</td><td>Rosa</td><td>~60 mL/min</td><td>Uso geral em adultos</td></tr>
    <tr><td>22G</td><td>Azul</td><td>~35 mL/min</td><td>Adultos com veias frágeis, pediatria</td></tr>
    <tr><td>24G</td><td>Amarelo</td><td>~20 mL/min</td><td>Pediatria, neonatologia, idosos com veias muito finas</td></tr>
  </table>
  <ol class="step-list">
    <li>Seleccionar o cateter de menor calibre adequado à terapêutica</li>
    <li>Aplicar garrote 10–15 cm acima do local de punção</li>
    <li>Desinfectar a pele com anti-séptico, respeitando o tempo de acção</li>
    <li>Puncionar com bisel para cima, ângulo de 15°–30°</li>
    <li>Confirmar refluxo de sangue e progredir o cateter; retirar o mandril</li>
    <li>Remover o garrote, conectar sistema e fixar com penso transparente</li>
    <li>Registar data, calibre, local e nome do executante</li>
  </ol>
  <h4>Complicações a vigiar</h4>
  <ul><li>Flebite, infiltração, extravasamento, infecção local</li></ul>`
},
{
  icon: ICON_PROC, bg:'#EEF1F6', fg:'#000000',
  title:'Curativo de Feridas',
  sub:'Técnica assética de tratamento de feridas',
  body:`
  <svg class="proc-illus" viewBox="0 0 240 130" xmlns="http://www.w3.org/2000/svg"><rect width="240" height="130" rx="14" fill="#EEF1F6"/><rect x="60" y="35" width="120" height="60" rx="10" fill="#f6c9ce"/><rect x="90" y="50" width="60" height="30" rx="6" fill="#fff" stroke="#000000" stroke-width="2"/><line x1="98" y1="65" x2="142" y2="65" stroke="#E80018" stroke-width="3" stroke-linecap="round"/><line x1="105" y1="56" x2="105" y2="74" stroke="#000000" stroke-width="2"/><line x1="135" y1="56" x2="135" y2="74" stroke="#000000" stroke-width="2"/></svg>
  <h4>Material</h4>
  <ul><li>Luvas de procedimento e luvas estéreis, campo/kit de penso estéril, pinças (Kocher/dissecção), tesoura, compressas estéreis, soro fisiológico 0,9% morno, anti-séptico se indicado, penso adequado ao tipo de ferida (gaze simples, hidrocolóide, alginato de cálcio, espuma de poliuretano, filme transparente), adesivo hipoalergénico ou ligadura, saco para resíduos</li></ul>
  <ol class="step-list">
    <li>Higienizar as mãos e reunir material estéril</li>
    <li>Remover o penso anterior com luvas de procedimento</li>
    <li>Avaliar a ferida: tamanho, exsudado, tecido de granulação/necrose, sinais de infecção</li>
    <li>Calçar luvas estéreis; limpar do centro para a periferia com soro fisiológico</li>
    <li>Aplicar o produto/curativo indicado conforme o tipo de ferida</li>
    <li>Fixar o penso, datar e registar características da ferida</li>
  </ol>
  <div class="info-box">Feridas limpas: limpar do centro para fora. Feridas contaminadas/infectadas: limpar de fora para dentro, isolando a zona menos contaminada.</div>`
},
{
  icon: ICON_PROC, bg:'#EEF1F6', fg:'var(--azul)',
  title:'Aspiração de Secreções',
  sub:'Vias aéreas superiores e tubo endotraqueal',
  body:`
  <svg class="proc-illus" viewBox="0 0 240 130" xmlns="http://www.w3.org/2000/svg"><rect width="240" height="130" rx="14" fill="#EEF1F6"/><circle cx="80" cy="60" r="36" fill="#f6c9ce"/><path d="M110 55 q40 -14 70 10" stroke="var(--azul)" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="182" y="55" width="34" height="20" rx="5" fill="var(--azul)"/><circle cx="216" cy="65" r="6" fill="var(--azul)"/></svg>
  <h4>Calibre da sonda de aspiração</h4>
  <ul><li><b>Adulto:</b> 12–16 Fr (via aérea artificial: não exceder metade do diâmetro interno do tubo)</li><li><b>Criança:</b> 8–10 Fr</li><li><b>Lactente/RN:</b> 6–8 Fr</li></ul>
  <ul>
    <li>Pré-oxigenar o doente antes do procedimento quando indicado</li>
    <li>Escolher sonda de calibre adequado (não ocluir mais de metade do lúmen da via aérea artificial)</li>
    <li>Aplicar aspiração apenas na retirada da sonda, em movimento rotativo</li>
    <li>Limitar cada aspiração a <b>10–15 segundos</b> para evitar hipoxemia</li>
    <li>Monitorizar SpO₂, frequência cardíaca e sinais de desconforto durante o procedimento</li>
    <li>Pressão de aspiração recomendada: 80–120 mmHg (adulto)</li>
  </ul>`
},
{
  icon: ICON_PROC, bg:'#fbe4e8', fg:'#E80018',
  title:'Oxigenoterapia',
  sub:'Dispositivos e concentração de oxigénio',
  body:`
  <svg class="proc-illus" viewBox="0 0 240 130" xmlns="http://www.w3.org/2000/svg"><rect width="240" height="130" rx="14" fill="#fbe4e8"/><circle cx="90" cy="60" r="36" fill="#f6c9ce"/><path d="M60 70 q30 24 60 0" stroke="#E80018" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="165" y="30" width="24" height="60" rx="6" fill="#fff" stroke="#E80018" stroke-width="2"/><rect x="171" y="20" width="12" height="14" rx="2" fill="#E80018"/><line x1="171" y1="45" x2="183" y2="45" stroke="#E80018" stroke-width="2"/><line x1="171" y1="60" x2="183" y2="60" stroke="#E80018" stroke-width="2"/></svg>
  <table class="ref-table">
    <tr><th>Dispositivo</th><th>Fluxo</th><th>FiO₂ aproximada</th></tr>
    <tr><td>Cânula nasal</td><td>1–6 L/min</td><td>24–44%</td></tr>
    <tr><td>Máscara facial simples</td><td>5–10 L/min</td><td>40–60%</td></tr>
    <tr><td>Máscara com reservatório (não reinalação)</td><td>10–15 L/min</td><td>60–90%</td></tr>
    <tr><td>Ventimask (Venturi)</td><td>variável</td><td>24–50% (regulável)</td></tr>
  </table>
  <div class="info-box">Vigiar sinais de hipoxemia/hipercápnia, humidificar o oxigénio em fluxos elevados e adequar o dispositivo à condição clínica do doente.</div>`
},
{
  icon: ICON_PROC, bg:'#E6EAF1', fg:'var(--azul)',
  title:'Colheita de Sangue Venoso',
  sub:'Punção venosa para exames laboratoriais',
  body:`
  <svg class="proc-illus" viewBox="0 0 240 130" xmlns="http://www.w3.org/2000/svg"><rect width="240" height="130" rx="14" fill="#E6EAF1"/><rect x="30" y="55" width="110" height="26" rx="13" fill="#f6c9ce"/><line x1="120" y1="68" x2="150" y2="68" stroke="var(--azul)" stroke-width="4" stroke-linecap="round"/><rect x="150" y="45" width="26" height="46" rx="6" fill="#fff" stroke="var(--azul)" stroke-width="2"/><rect x="154" y="60" width="18" height="28" rx="3" fill="#E80018"/><rect x="190" y="50" width="26" height="46" rx="6" fill="#fff" stroke="var(--azul)" stroke-width="2"/><rect x="194" y="66" width="18" height="26" rx="3" fill="var(--azul-escuro)"/></svg>
  <h4>Material</h4>
  <ul><li>Sistema de vácuo (holder) com agulha 21–23G (ou butterfly 23–25G em veias finas/pediatria), garrote, anti-séptico, tubos de colheita conforme exame pedido, algodão/compressa, adesivo, luvas de procedimento, contentor de cortantes</li></ul>
  <ol class="step-list">
    <li>Confirmar identidade do doente e requisição de exames</li>
    <li>Aplicar garrote, seleccionar veia e desinfectar a pele</li>
    <li>Puncionar com bisel para cima, ângulo de 15°–30°</li>
    <li>Colher os tubos pela ordem correcta, invertendo suavemente os que contêm aditivo</li>
    <li>Remover o garrote antes de retirar a agulha; comprimir o local</li>
    <li>Identificar os tubos junto ao doente e enviar ao laboratório</li>
  </ol>
  <h4>Ordem recomendada dos tubos</h4>
  <p>Hemocultura → Citrato (coagulação, tampa azul) → Sem aditivo/gel separador (tampa amarela/vermelha) → Heparina (tampa verde) → EDTA (hemograma, tampa roxa) → Fluoreto (glicemia, tampa cinzenta)</p>`
}
]);

// ================= EXAMES LABORATORIAIS =================


// === data-urgencia.js ===
// ===== dados/construção — urgencia.html =====

buildAccordionView('urgencia', 'Urgência e Emergência', 'Protocolos e condutas de enfermagem para situações críticas. Siga sempre o protocolo institucional vigente.<br><img class="zoomable-img" src="img/68851d1b0d.webp" alt="Primeiros socorros" style="width:100%;max-width:220px;margin:10px auto 2px;display:block;" onclick="openLightbox(\'img-primeiros-socorros.jpg\',\'Primeiros socorros\',\'primeiros-socorros.jpg\')"><div class="img-caption">Guia rápido de primeiros socorros</div>', [
{
  icon: ICON_ALERT, bg:'#fbe4e8', fg:'#E80018',
  title:'Suporte Básico de Vida (SBV) — Adulto',
  sub:'Paragem cardiorrespiratória',
  body:`
  <ol class="step-list">
    <li>Verificar segurança do local e responsividade da vítima</li>
    <li>Pedir ajuda / activar equipa de emergência e solicitar desfibrilhador</li>
    <li>Verificar respiração e pulso (máx. 10 segundos)</li>
    <li>Iniciar compressões torácicas: 30 compressões : 2 ventilações</li>
    <li>Profundidade 5–6 cm, frequência 100–120/min, permitir retorno total do tórax</li>
    <li>Conectar o DAE assim que disponível e seguir instruções do aparelho</li>
    <li>Manter ciclos até chegada de suporte avançado ou recuperação de sinais vitais</li>
  </ol>
  <div class="alert-box">Minimizar interrupções das compressões torácicas — cada pausa reduz a perfusão coronária e cerebral.</div>`
},
{
  icon: ICON_ALERT, bg:'#EEF1F6', fg:'#000000',
  title:'Obstrução da Via Aérea por Corpo Estranho (OVACE)',
  sub:'Manobra de Heimlich',
  body:`
  <h4>Adulto consciente</h4>
  <ul><li>Encorajar a tosse se obstrução parcial e tosse eficaz</li><li>Se obstrução total: 5 pancadas interescapulares alternadas com 5 compressões abdominais (manobra de Heimlich)</li></ul>
  <h4>Grávida ou obesidade acentuada</h4>
  <ul><li>Substituir compressões abdominais por compressões torácicas</li></ul>
  <h4>Lactente (&lt;1 ano)</h4>
  <ul><li>5 pancadas interescapulares seguidas de 5 compressões torácicas (não realizar compressão abdominal)</li></ul>
  <div class="alert-box">Se a vítima ficar inconsciente, iniciar SBV e verificar a cavidade oral antes de cada ventilação.</div>`
},
{
  icon: ICON_ALERT, bg:'#E6EAF1', fg:'var(--azul-escuro)',
  title:'Choque Anafilático',
  sub:'Reacção alérgica grave e generalizada',
  body:`
  <h4>Sinais de alarme</h4>
  <ul><li>Estridor, edema da via aérea, broncospasmo, hipotensão, urticária generalizada, angioedema</li></ul>
  <h4>Conduta imediata</h4>
  <ol class="step-list">
    <li>Remover o agente causal, se identificável</li>
    <li>Adrenalina IM 0,3–0,5 mg (1:1000) na face lateral da coxa — repetir a cada 5–15 min se necessário</li>
    <li>Posicionar em decúbito dorsal com pernas elevadas (ou sentado se dificuldade respiratória predominante)</li>
    <li>Oxigénio de alto fluxo e monitorização contínua</li>
    <li>Acesso venoso e fluidoterapia se hipotensão</li>
    <li>Preparar corticóide e anti-histamínico como terapêutica adjuvante</li>
  </ol>`
},
{
  icon: ICON_ALERT, bg:'#E6EAF1', fg:'var(--azul)',
  title:'Acidente Vascular Cerebral (AVC)',
  sub:'Reconhecimento e conduta inicial',
  body:`
  <h4>Escala FAST</h4>
  <ul>
    <li><b>F</b>ace — assimetria facial / desvio da comissura labial</li>
    <li><b>A</b>rm — perda de força num dos braços</li>
    <li><b>S</b>peech — dificuldade na fala/linguagem</li>
    <li><b>T</b>ime — registar hora exacta do início dos sintomas</li>
  </ul>
  <h4>Conduta de enfermagem</h4>
  <ul>
    <li>Avaliar via aérea, respiração e circulação; glicemia capilar (excluir hipoglicemia)</li>
    <li>Não administrar alimentos/líquidos até avaliação da deglutição</li>
    <li>Monitorizar sinais vitais e nível de consciência (Glasgow)</li>
    <li>Encaminhar com urgência para TAC/RM — janela terapêutica de trombólise é tempo-dependente</li>
  </ul>`
},
{
  icon: ICON_ALERT, bg:'#fbe4e8', fg:'#E80018',
  title:'Síndrome Coronária Aguda (SCA / EAM)',
  sub:'Dor torácica de origem cardíaca',
  body:`
  <h4>Sinais e sintomas</h4>
  <ul><li>Dor/aperto retroesternal, por vezes irradiando para braço esquerdo, mandíbula ou dorso; dispneia, sudorese, náuseas</li></ul>
  <h4>Conduta inicial (MONA-B)</h4>
  <ul>
    <li><b>M</b>orfina (se dor persistente, conforme prescrição)</li>
    <li><b>O</b>xigénio se SpO₂ &lt; 94%</li>
    <li><b>N</b>itratos sublinguais (se não houver hipotensão ou uso recente de inibidores da PDE5)</li>
    <li><b>A</b>spirina mastigável, conforme protocolo</li>
    <li><b>B</b>etabloqueante conforme avaliação médica</li>
  </ul>
  <ul><li>ECG de 12 derivações nos primeiros 10 minutos; acesso venoso; monitorização cardíaca contínua</li></ul>`
},
{
  icon: ICON_ALERT, bg:'#EEF1F6', fg:'#000000',
  title:'Hipoglicemia e Hiperglicemia',
  sub:'Alterações agudas da glicemia',
  body:`
  <h4>Hipoglicemia (&lt; 70 mg/dL)</h4>
  <ul>
    <li>Doente consciente: 15 g de hidratos de carbono de absorção rápida por via oral; reavaliar em 15 min</li>
    <li>Doente inconsciente: glicose EV (conforme protocolo) ou glucagon IM se sem acesso venoso</li>
  </ul>
  <h4>Hiperglicemia grave / cetoacidose diabética</h4>
  <ul>
    <li>Sinais: poliúria, polidipsia, hálito cetónico, respiração de Kussmaul, desidratação</li>
    <li>Conduta: fluidoterapia EV, insulinoterapia conforme protocolo, monitorização de glicemia, electrólitos (K⁺) e diurese horária</li>
  </ul>`
},
{
  icon: ICON_ALERT, bg:'#EEF1F6', fg:'#000000',
  title:'Convulsões',
  sub:'Conduta de enfermagem durante e após a crise',
  body:`
  <h4>Durante a crise</h4>
  <ul>
    <li>Proteger a cabeça e afastar objectos que possam causar lesão</li>
    <li>Não conter os movimentos nem introduzir objectos na boca</li>
    <li>Registar a hora de início, duração e características da crise</li>
  </ul>
  <h4>Após a crise</h4>
  <ul>
    <li>Posição lateral de segurança para proteger a via aérea</li>
    <li>Verificar glicemia capilar e sinais vitais</li>
    <li>Oxigénio se necessário; manter vigilância até recuperação completa do estado de consciência</li>
  </ul>
  <div class="alert-box">Estado de mal epiléptico: crise &gt; 5 minutos ou crises repetidas sem recuperação da consciência — emergência médica.</div>`
},
{
  icon: ICON_ALERT, bg:'#EEF1F6', fg:'var(--azul)',
  title:'Queimaduras',
  sub:'Classificação e regra dos nove',
  body:`
  <table class="ref-table">
    <tr><th>Grau</th><th>Características</th></tr>
    <tr><td>1º grau</td><td>Epiderme; eritema, dor, sem flictenas</td></tr>
    <tr><td>2º grau</td><td>Derme; flictenas, dor intensa, base rósea/húmida</td></tr>
    <tr><td>3º grau</td><td>Espessura total; pele esbranquiçada/carbonizada, pouca dor (destruição de terminações nervosas)</td></tr>
  </table>
  <h4>Regra dos nove (adulto)</h4>
  <p>Cabeça e pescoço 9% · Cada membro superior 9% · Tronco anterior 18% · Tronco posterior 18% · Cada membro inferior 18% · Períneo 1%</p>
  <h4>Conduta inicial</h4>
  <ul><li>Interromper o processo de queimadura (água corrente fria, nunca gelo)</li><li>Remover roupas e adornos não aderentes; cobrir com penso limpo</li><li>Analgesia, fluidoterapia e monitorização em queimaduras extensas</li></ul>`
},
{
  icon: ICON_ALERT, bg:'#E6EAF1', fg:'var(--azul-escuro)',
  title:'Choque (Hipovolémico e Séptico)',
  sub:'Reconhecimento e primeira abordagem',
  body:`
  <h4>Sinais gerais de choque</h4>
  <ul><li>Hipotensão, taquicardia, pele fria e pálida (hipovolémico) ou quente (fase inicial do séptico), tempo de preenchimento capilar prolongado, alteração do estado de consciência, oligúria</li></ul>
  <h4>Conduta de enfermagem</h4>
  <ol class="step-list">
    <li>Garantir via aérea e oxigénio suplementar</li>
    <li>Dois acessos venosos de grande calibre</li>
    <li>Fluidoterapia EV conforme prescrição e protocolo</li>
    <li>Monitorização contínua de sinais vitais e diurese horária</li>
    <li>Identificar e tratar a causa (hemorragia, foco infeccioso, etc.)</li>
  </ol>`
}
]);


// ================= GLOSSÁRIO DE TERMOS MÉDICOS =================


// === data-manual-pdf.js ===
// ===== data-manual-pdf.js =====
// Manual do Sistema "Enfermeiro Competente" — embutido como base64
// Gerado a partir do conteudo e codigo-fonte da aplicacao.
(function(){
  window.MANUAL_PDF_B64 = "pdf/Enfermeiro_Competente_Manual.pdf";
})();


// === data-gastrite-pdf.js ===
// Manual Gastrite — PDF embutido como base64
(function(){
  window.GASTRITE_PDF_B64 = "pdf/Manual_Gastrite_Ulcerativa_Karlyon_2026.pdf";
  
  window.openGastriteViewer = function(){
    const area = document.getElementById('gastrite-pdf-area');
    if(!area) return;
    if(area.style.display === 'block'){
      area.style.display = 'none';
      return;
    }
    const iframe = document.getElementById('gastrite-iframe');
    if(!iframe.src || iframe.src === 'about:blank'){
      iframe.src = window.GASTRITE_PDF_B64;
    }
    area.style.display = 'block';
    area.scrollIntoView({behavior:'smooth', block:'start'});
  };
  
  window.downloadGastrite = function(){
    const a = document.createElement('a');
    a.href = window.GASTRITE_PDF_B64;
    a.download = 'Manual_Gastrite_Ulcerativa_Karlyon_2026.pdf';
    document.body.appendChild(a); a.click(); a.remove();
  };
  
  function b64toBlob(b64Data, contentType){
    const sliceSize = 512;
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    for(let offset = 0; offset < byteCharacters.length; offset += sliceSize){
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for(let i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays, {type: contentType});
  }
})();


// === data-lnme-pdf.js ===
// ===== data-lnme-pdf.js =====
// Lista Nacional de Medicamentos Essenciais — Moçambique, 2017
// Ministério da Saúde / Departamento Farmacêutico. Documento oficial,
// incorporado na Biblioteca e na página Medicamentos com o visualizador
// interno (pdf-viewer.js) e opção de download.
window.LNME_PDF_B64 = "pdf/Lista_Nacional_Medicamentos_Essenciais_Mocambique_2017.pdf";
if (typeof registerLibraryPdf === 'function') {
  registerLibraryPdf('lnme', window.LNME_PDF_B64, 'Lista_Nacional_Medicamentos_Essenciais_Mocambique_2017.pdf');
} else {
  window.addEventListener('load', function(){
    if (typeof registerLibraryPdf === 'function') {
      registerLibraryPdf('lnme', window.LNME_PDF_B64, 'Lista_Nacional_Medicamentos_Essenciais_Mocambique_2017.pdf');
    }
  });
}


// === diagnosticos.js ===
// ===== diagnosticos.js — lista NANDA-I, ficha de diagnóstico (diagnosticos.html) =====

const EDITION_LABELS = {
  '2024': 'NANDA 2024-2026',
  '2021': 'NANDA 2021-2023'
};
function totalDiagCount(data){
  let t=0;
  data.forEach(d=>d.classes.forEach(c=>t+=c.diagnosticos.length));
  return t;
}
function totalClassCount(data){
  let t=0;
  data.forEach(d=>t+=d.classes.length);
  return t;
}
function createBrowser(suffix){
  const mainEl = document.getElementById('main' + suffix);
  const statsEl = document.getElementById('stats' + suffix);
  const searchInput = document.getElementById('searchInput' + suffix);
  const clearBtn = document.getElementById('clearBtn' + suffix);
  const footerEl = document.getElementById('editionFooter' + suffix);
  const tabsEl = document.getElementById('editionTabs' + suffix);

  let activeEdition = '2024';

  function getData(){
    return activeEdition === '2021' ? DATA_2021 : DATA_2024;
  }

  function setEdition(edition){
    if(edition === activeEdition) return;
    activeEdition = edition;
    if(tabsEl){
      tabsEl.querySelectorAll('.edition-tab').forEach(btn=>{
        btn.classList.toggle('active', btn.dataset.edition === edition);
      });
    }
    searchInput.value = '';
    clearBtn.classList.remove('show');
    render('');
  }

  function render(term){
    const t = (term||'').trim();
    const nt = normalize(t);
    const data = getData();
    mainEl.innerHTML = '';
    let totalMatches = 0;
    let anyOpenDomain = !!nt;

    data.forEach((dom, di) => {
      const domainMatchesTitle = normalize(dom.dominio).includes(nt);
      let domainHasMatch = false;
      const domainDiv = document.createElement('div');
      domainDiv.className = 'domain' + (anyOpenDomain ? '' : '');

      let classesHtml = '';
      let domainDiagCount = 0;
      let domainVisibleCount = 0;

      dom.classes.forEach((cls, ci) => {
        domainDiagCount += cls.diagnosticos.length;
        const classMatchesTitle = normalize(cls.classe).includes(nt);
        const matchedDiags = cls.diagnosticos.filter(dg => !nt || normalize(dg).includes(nt) || classMatchesTitle || domainMatchesTitle);

        if(nt && matchedDiags.length===0) return;

        domainVisibleCount += matchedDiags.length;
        domainHasMatch = domainHasMatch || matchedDiags.length>0;

        let itemsHtml = '';
        if(matchedDiags.length===0){
          itemsHtml = '<li class="empty-classe">Esta classe não contém diagnósticos atualmente</li>';
        } else {
          matchedDiags.forEach(dg=>{
            const kind = classify(dg);
            const code = (activeEdition === '2021' && CODES_2021[dg]) ? CODES_2021[dg]
                       : (activeEdition === '2024' && CODES_2024[dg]) ? CODES_2024[dg] : '';
            const codeHtml = code ? '<span class="diag-code">' + code + '</span>' : '';
            itemsHtml += '<li class="diag-item ' + kind + '" data-dom="' + escapeAttr(dom.dominio) + '" data-cls="' + escapeAttr(cls.classe) + '" data-diag="' + escapeAttr(dg) + '">' + codeHtml + highlight(dg, t) + '</li>';
          });
        }

        classesHtml += '<div class="classe' + (nt ? ' open':'') + '">' +
          '<div class="classe-head" onclick="this.parentElement.classList.toggle(\'open\')">' +
            '<span class="ctitle">' + highlight(cls.classe, t) + '</span>' +
            '<span style="display:flex;align-items:center;gap:8px;">' +
              '<span class="ccount">' + matchedDiags.length + '</span>' +
              '<span class="cchev">▾</span>' +
            '</span>' +
          '</div>' +
          '<div class="classe-body"><ul class="diag-list">' + itemsHtml + '</ul></div>' +
        '</div>';
      });

      if(nt && !domainHasMatch && !domainMatchesTitle) return;

      totalMatches += domainVisibleCount;

      domainDiv.className = 'domain' + (nt ? ' open' : '');
      domainDiv.innerHTML =
        '<div class="domain-head" onclick="this.parentElement.classList.toggle(\'open\')">' +
          '<span class="title">' + highlight(dom.dominio, t) + '</span>' +
          '<span style="display:flex;align-items:center;gap:8px;">' +
            '<span class="count">' + domainDiagCount + ' diag.</span>' +
            '<span class="chev">▾</span>' +
          '</span>' +
        '</div>' +
        '<div class="domain-body">' + classesHtml + '</div>';

      mainEl.appendChild(domainDiv);
    });

    if(nt && mainEl.children.length===0){
      mainEl.innerHTML = '<div class="no-results"><div>🔍</div>Nenhum diagnóstico encontrado para<br><b>"' + t + '"</b></div>';
      statsEl.textContent = '';
    } else if(nt){
      statsEl.innerHTML = '<b>' + totalMatches + '</b> diagnóstico(s) encontrado(s)';
    } else {
      statsEl.innerHTML = '<b>' + data.length + '</b> Domínios · <b>' + totalClassCount(data) + '</b> Classes · <b>' + totalDiagCount(data) + '</b> Diagnósticos de Enfermagem';
    }

    if(footerEl){
      footerEl.innerHTML = 'Conteúdo extraído da Taxonomia II ' + EDITION_LABELS[activeEdition] +
        ' (Domínios, Classes e Diagnósticos) · <b>' + data.length + ' Domínios · ' +
        totalClassCount(data) + ' Classes · ' + totalDiagCount(data) + ' Diagnósticos</b>';
    }
  }

  searchInput.addEventListener('input', (e)=>{
    const v = e.target.value;
    clearBtn.classList.toggle('show', v.length>0);
    render(v);
  });
  clearBtn.addEventListener('click', ()=>{
    searchInput.value='';
    clearBtn.classList.remove('show');
    render('');
    searchInput.focus();
  });

  render('');

  return { setEdition };
}

// Instância única para "Diagnósticos de Enfermagem" (ids sem sufixo).
const browsers = {
  '': createBrowser('')
};

// ===== Catálogo genérico (sem edições) para NIC (Intervenções) e NOC (Resultados) =====
// Reutiliza a mesma estrutura visual (domínio > classe > itens), sem o cartão de
// diagnóstico nem a classificação real/risco/disposição, que só se aplicam à NANDA-I.

const NICNOC_DIAGNOSTICO = {
  "Dor aguda": { nic:["Avaliar a dor com escala validada (numérica/visual/comportamental) a cada turno e após intervenção","Administrar analgesia conforme prescrição e reavaliar eficácia 30–60 min depois","Aplicar medidas não farmacológicas (posicionamento, calor/frio, relaxamento, distração)","Monitorizar sinais vitais e sinais não-verbais de dor","Registar localização, intensidade, tipo e factores de alívio/agravamento"],
    noc:["Nível de dor reduzido para o valor aceite pelo doente (ex.: ≤3/10)","Doente verbaliza alívio após a intervenção","Sinais vitais dentro dos parâmetros habituais","Doente demonstra e aplica técnicas de controlo da dor"] },
  "Dor crônica": { nic:["Avaliação sistemática e regular da dor com escala validada","Elaborar em conjunto um plano multimodal de controlo da dor (farmacológico e não farmacológico)","Ensinar técnicas de relaxamento, distração e conservação de energia","Encaminhar para consulta de dor crónica/fisioterapia se necessário","Monitorizar impacto na funcionalidade, sono e humor"],
    noc:["Nível de dor controlado dentro de limites toleráveis para o doente","Doente mantém actividades de vida diária apesar da dor crónica","Doente utiliza estratégias de auto-gestão da dor","Melhoria do sono e do humor relatados"] },
  "Síndrome da dor crônica": { nic:["Avaliação multidimensional (dor, sono, humor, funcionalidade)","Plano de tratamento multimodal com equipa multidisciplinar","Ensino de estratégias de coping e conservação de energia","Monitorizar sinais de depressão/ansiedade associados"],
    noc:["Redução do impacto funcional e emocional da dor crónica","Doente participa em actividades sociais/laborais compatíveis","Melhoria do padrão de sono"] },
  "Dor no trabalho de parto": { nic:["Avaliar intensidade e características da dor a cada contração","Incentivar técnicas de respiração e posicionamento activo","Administrar analgesia (ex.: epidural) conforme prescrição e desejo da parturiente","Proporcionar apoio contínuo e informação sobre a evolução do trabalho de parto"],
    noc:["Parturiente refere controlo satisfatório da dor","Sinais vitais maternos e fetais estáveis","Parturiente participa activamente nas decisões sobre analgesia"] },
  "Náusea": { nic:["Avaliar frequência, intensidade e factores desencadeantes da náusea","Administrar antieméticos conforme prescrição","Promover ambiente calmo, arejado, sem odores fortes","Oferecer refeições pequenas e frequentes, evitar alimentos gordurosos"],
    noc:["Redução/ausência de episódios de náusea e vómito","Doente mantém ingestão nutricional adequada","Doente identifica e evita factores desencadeantes"] },
  "Ansiedade excessiva": { nic:["Avaliar nível de ansiedade e factores desencadeantes","Utilizar escuta activa e comunicação calma e clara","Ensinar técnicas de respiração e relaxamento","Reduzir estímulos ambientais excessivos","Envolver a família/rede de apoio quando apropriado"],
    noc:["Doente verbaliza redução do nível de ansiedade","Doente utiliza estratégias eficazes de autocontrolo da ansiedade","Sinais vitais e comportamento compatíveis com nível reduzido de ansiedade"] },
  "Medo excessivo": { nic:["Identificar o objecto/causa do medo e validar a experiência do doente","Fornecer informação clara e honesta sobre procedimentos e prognóstico","Permanecer junto do doente em momentos de maior medo","Ensinar técnicas de relaxamento e distração"],
    noc:["Doente verbaliza diminuição do medo","Doente demonstra comportamentos de enfrentamento adequados"] },
  "Enfrentamento desadaptativo": { nic:["Avaliar estratégias de coping habituais e recursos disponíveis","Ajudar o doente a identificar pontos fortes e recursos de apoio","Ensinar estratégias adaptativas de resolução de problemas","Encaminhar para apoio psicológico/social se necessário"],
    noc:["Doente identifica e utiliza estratégias de enfrentamento eficazes","Doente verbaliza sensação de controlo sobre a situação"] },
  "Luto desadaptativo": { nic:["Facilitar a expressão de sentimentos relacionados com a perda","Validar o processo de luto sem julgamento","Identificar sinais de luto complicado e encaminhar se necessário","Envolver rede de apoio familiar/espiritual"],
    noc:["Doente expressa sentimentos relacionados com a perda","Doente demonstra progressão saudável no processo de luto"] },
  "Risco de infecção": { nic:["Lavagem das mãos e técnica assética em todos os procedimentos invasivos","Monitorizar sinais e sintomas de infecção (febre, rubor, exsudado, dor)","Cuidados com pele, mucosas e dispositivos invasivos (cateteres, drenos)","Educar o doente/família sobre sinais de alerta e higiene"],
    noc:["Ausência de sinais e sintomas de infecção","Doente/família demonstra medidas de prevenção de infecção","Parâmetros analíticos/inflamatórios dentro da normalidade"] },
  "Risco de infecção de ferida cirúrgica": { nic:["Vigiar sinais inflamatórios/infecciosos na ferida operatória a cada turno","Técnica assética na realização de pensos","Educar sobre cuidados com a ferida no domicílio","Monitorizar temperatura corporal e parâmetros inflamatórios"],
    noc:["Ferida cirúrgica cicatriza sem sinais de infecção","Doente/família demonstra cuidados adequados com a ferida"] },
  "Integridade da pele prejudicada": { nic:["Avaliar a pele e a lesão a cada turno (localização, dimensão, exsudado)","Realizar penso conforme protocolo e prescrição","Aliviar a pressão com mudança de decúbito regular e superfícies de alívio","Optimizar hidratação e estado nutricional"],
    noc:["Progressão da cicatrização da lesão","Ausência de sinais de infecção na lesão","Pele circundante íntegra e hidratada"] },
  "Risco de integridade da pele prejudicada": { nic:["Avaliação sistemática do risco (ex.: escala de Braden)","Mudança de decúbito programada e uso de superfícies de alívio de pressão","Manter a pele limpa, seca e hidratada","Optimizar estado nutricional e hídrico"],
    noc:["Pele mantém-se íntegra, sem sinais de lesão","Doente/cuidador reconhece factores de risco e medidas preventivas"] },
  "Lesão por pressão no adulto": { nic:["Classificar e monitorizar a evolução da lesão por pressão","Aliviar totalmente a pressão na zona afectada","Realizar tratamento tópico conforme prescrição/protocolo","Optimizar estado nutricional e hídrico"],
    noc:["Progressão visível da cicatrização por estadio","Ausência de novas lesões por pressão","Ausência de sinais de infecção na lesão"] },
  "Risco de lesão por pressão no adulto": { nic:["Avaliação do risco com escala validada (ex.: Braden) na admissão e regularmente","Plano de mudança de decúbito e uso de superfícies de alívio de pressão","Inspecção diária da pele, sobretudo em proeminências ósseas","Optimizar nutrição, hidratação e mobilidade"],
    noc:["Pele sem sinais de lesão por pressão durante o internamento","Doente/cuidador demonstra medidas de prevenção"] },
  "Mobilidade física prejudicada": { nic:["Avaliar o grau de mobilidade e capacidade funcional","Assistir/incentivar a mobilização progressiva (levante, marcha)","Realizar/ensinar exercícios de amplitude articular","Prevenir complicações de imobilidade (trombose, úlceras, atelectasia)"],
    noc:["Doente melhora o grau de mobilidade e amplitude de movimento","Ausência de complicações associadas à imobilidade","Doente participa activamente no plano de mobilização"] },
  "Risco de mobilidade física prejudicada": { nic:["Avaliar factores de risco para redução da mobilidade","Promover mobilização precoce e regular","Ensinar exercícios preventivos de manutenção articular/muscular"],
    noc:["Doente mantém o nível de mobilidade prévio","Ausência de complicações de imobilidade"] },
  "Risco de quedas no adulto": { nic:["Avaliar risco de queda com escala validada (ex.: Morse)","Manter ambiente seguro (iluminação, calçado adequado, campainha ao alcance)","Vigilância acrescida e auxílio na deambulação quando indicado","Educar doente/família sobre prevenção de quedas"],
    noc:["Ausência de quedas durante o internamento/cuidados","Doente/família identifica factores de risco e medidas preventivas"] },
  "Risco de criança cair": { nic:["Avaliar risco de queda específico da criança (idade, desenvolvimento, mobilidade)","Manter grades da cama/berço elevadas e ambiente seguro","Supervisão constante e educação dos pais/cuidadores"],
    noc:["Ausência de quedas durante o internamento","Pais/cuidadores demonstram medidas de segurança adequadas"] },
  "Padrão respiratório ineficaz": { nic:["Monitorizar frequência, ritmo e esforço respiratório","Posicionar em semi-Fowler/Fowler para optimizar a ventilação","Administrar oxigenoterapia conforme prescrição","Ensinar técnicas de respiração diafragmática/tosse eficaz"],
    noc:["Padrão respiratório dentro dos parâmetros normais","Saturação de oxigénio adequada sem sinais de dificuldade respiratória"] },
  "Troca de gases prejudicada": { nic:["Monitorizar saturação de oxigénio e gasometria conforme prescrição","Posicionar para optimizar ventilação/perfusão (ex.: semi-Fowler)","Administrar oxigenoterapia conforme prescrição","Incentivar tosse eficaz e mobilização de secreções"],
    noc:["Saturação de oxigénio e gasometria dentro dos parâmetros esperados","Ausência de sinais de hipoxia/hipercapnia"] },
  "Desobstrução ineficaz das vias aéreas": { nic:["Avaliar permeabilidade das vias aéreas e características das secreções","Aspirar secreções conforme necessário e protocolo","Posicionar para facilitar drenagem de secreções","Incentivar hidratação e técnicas de tosse eficaz/fisioterapia respiratória"],
    noc:["Vias aéreas permeáveis, sem ruídos adventícios","Doente mobiliza secreções eficazmente"] },
  "Ventilação espontânea prejudicada": { nic:["Monitorizar sinais de fadiga respiratória e gasometria","Preparar e assistir suporte ventilatório conforme prescrição","Posicionar para optimizar a mecânica ventilatória","Reduzir factores que aumentem o consumo de oxigénio"],
    noc:["Ventilação espontânea eficaz mantida ou suporte ventilatório adequado","Ausência de sinais de fadiga respiratória"] },
  "Risco de aspiração": { nic:["Avaliar reflexo de deglutição e nível de consciência antes da alimentação","Posicionar em Fowler/semi-Fowler durante e após alimentação","Adaptar consistência de alimentos/líquidos conforme avaliação","Manter aspirador disponível e vigilância durante refeições"],
    noc:["Ausência de episódios de aspiração","Doente/cuidador demonstra técnicas seguras de alimentação"] },
  "Constipação funcional crônica": { nic:["Avaliar padrão intestinal habitual e factores contribuintes","Incentivar ingestão de fibras, líquidos e mobilização","Administrar laxantes conforme prescrição se necessário","Estabelecer rotina de eliminação intestinal"],
    noc:["Padrão de eliminação intestinal regular e sem esforço","Doente identifica medidas para prevenir a constipação"] },
  "Motilidade gastrintestinal prejudicada": { nic:["Monitorizar ruídos intestinais e distensão abdominal","Incentivar mobilização precoce","Ajustar dieta conforme tolerância e prescrição","Monitorizar sinais de complicação (íleo, obstrução)"],
    noc:["Ruídos intestinais e trânsito restabelecidos","Ausência de distensão abdominal ou desconforto"] },
  "Eliminação intestinal prejudicada": { nic:["Avaliar características e frequência das dejecções","Promover dieta rica em fibras e hidratação adequada","Estabelecer rotina/horário de eliminação intestinal","Monitorizar sinais de complicação"],
    noc:["Padrão de eliminação intestinal adequado às características do doente","Ausência de desconforto associado à eliminação"] },
  "Eliminação urinária prejudicada": { nic:["Avaliar padrão miccional (frequência, volume, características)","Incentivar ingestão hídrica adequada","Estabelecer rotina de esvaziamento vesical se indicado","Monitorizar sinais de infecção urinária ou retenção"],
    noc:["Padrão de eliminação urinária dentro do esperado","Ausência de sinais de infecção ou retenção urinária"] },
  "Risco de retenção urinária": { nic:["Monitorizar diurese e sinais de distensão vesical","Incentivar micção regular e posição adequada para urinar","Considerar bladder scan/algaliação conforme protocolo se sinais de retenção"],
    noc:["Esvaziamento vesical eficaz, sem sinais de retenção","Doente reconhece sinais de alerta de retenção urinária"] },
  "Incontinência urinária de esforço": { nic:["Avaliar padrão e gravidade da incontinência","Ensinar exercícios do pavimento pélvico (Kegel)","Orientar sobre gestão de líquidos e hábitos miccionais","Utilizar dispositivos de protecção conforme necessidade"],
    noc:["Redução dos episódios de perda urinária","Doente demonstra técnica correcta de exercícios pélvicos"] },
  "Incontinência urinária de urgência": { nic:["Avaliar padrão miccional e factores desencadeantes","Estabelecer treino vesical com horários programados","Reduzir ingestão de irritantes vesicais (cafeína, álcool)","Ensinar exercícios do pavimento pélvico"],
    noc:["Redução da frequência/urgência miccional","Doente demonstra estratégias eficazes de controlo"] },
  "Volume de líquidos excessivo": { nic:["Monitorizar balanço hídrico rigoroso e peso diário","Restringir líquidos e sódio conforme prescrição","Monitorizar sinais de sobrecarga (edema, dispneia, PVC)","Administrar diuréticos conforme prescrição"],
    noc:["Balanço hídrico equilibrado","Ausência de sinais de sobrecarga de volume (edema, dispneia)"] },
  "Volume de líquidos inadequado": { nic:["Monitorizar balanço hídrico e sinais vitais","Incentivar/administrar reposição hídrica conforme prescrição","Monitorizar sinais de desidratação (mucosas, turgor cutâneo)","Registar débito urinário"],
    noc:["Estado de hidratação adequado (mucosas húmidas, débito urinário normal)","Sinais vitais estáveis"] },
  "Risco de equilíbrio hidreletrolítico prejudicado": { nic:["Monitorizar electrólitos séricos e sinais clínicos de desequilíbrio","Monitorizar balanço hídrico rigoroso","Administrar reposição electrolítica conforme prescrição"],
    noc:["Valores electrolíticos dentro dos parâmetros normais","Ausência de sinais clínicos de desequilíbrio"] },
  "Ingestão nutricional inadequada": { nic:["Avaliar estado nutricional e padrão alimentar","Monitorizar peso e ingestão alimentar diária","Encaminhar para nutricionista se necessário","Oferecer refeições fraccionadas e apetecíveis"],
    noc:["Ingestão nutricional adequada às necessidades","Manutenção/recuperação do peso adequado"] },
  "Risco de ingestão nutricional inadequada": { nic:["Monitorizar ingestão alimentar e peso regularmente","Identificar factores de risco nutricional precocemente","Educar sobre alimentação equilibrada"],
    noc:["Doente mantém ingestão nutricional adequada","Peso estável dentro do valor esperado"] },
  "Deglutição prejudicada": { nic:["Avaliar capacidade de deglutição antes de iniciar alimentação oral","Adaptar consistência de alimentos/líquidos conforme avaliação","Posicionar em Fowler durante e após as refeições","Vigiar sinais de aspiração durante a alimentação"],
    noc:["Deglutição segura, sem sinais de aspiração","Doente mantém ingestão nutricional adequada por via oral"] },
  "Amamentação ineficaz": { nic:["Avaliar técnica de amamentação (pega, posicionamento)","Ensinar e corrigir técnica de amamentação","Monitorizar peso e hidratação do recém-nascido","Apoiar emocionalmente a mãe e envolver o parceiro/família"],
    noc:["Mãe demonstra técnica eficaz de amamentação","Recém-nascido ganha peso adequadamente"] },
  "Padrão de sono ineficaz": { nic:["Avaliar padrão habitual de sono e factores perturbadores","Promover ambiente propício ao sono (luz, ruído, temperatura)","Estabelecer rotina/horário regular de sono","Reduzir estimulantes antes de dormir"],
    noc:["Doente refere sono reparador e em quantidade adequada","Doente identifica e reduz factores que perturbam o sono"] },
  "Confusão aguda": { nic:["Avaliar estado cognitivo regularmente (ex.: escala CAM)","Reorientar o doente frequentemente (tempo, espaço, pessoa)","Manter ambiente calmo, seguro e com estímulos adequados","Identificar e tratar causas subjacentes (infecção, fármacos, hipoxia)"],
    noc:["Doente recupera nível de orientação/cognição habitual","Ausência de complicações associadas à confusão (quedas, agitação)"] },
  "Confusão crônica": { nic:["Avaliar nível cognitivo e funcional regularmente","Manter rotina estável e ambiente seguro e previsível","Utilizar estratégias de orientação e comunicação simples","Envolver a família nos cuidados e na estimulação cognitiva"],
    noc:["Doente mantém o nível funcional/cognitivo possível","Ambiente seguro sem incidentes associados à confusão"] },
  "Memória prejudicada": { nic:["Avaliar o grau de comprometimento da memória","Utilizar auxiliares de memória (calendários, listas, rotinas)","Estimular cognitivamente de forma adequada ao doente","Educar a família sobre estratégias de apoio"],
    noc:["Doente utiliza estratégias compensatórias eficazes","Doente/família demonstra adaptação às limitações de memória"] },
  "Processos de pensamento conturbados": { nic:["Avaliar conteúdo e organização do pensamento","Manter comunicação clara, simples e calma","Reduzir estímulos ambientais excessivos","Reorientar e reforçar a realidade de forma respeitosa"],
    noc:["Doente apresenta pensamento mais organizado e coerente","Ausência de comportamentos de risco associados"] },
  "Comunicação verbal prejudicada": { nic:["Avaliar capacidade de comunicação verbal e não-verbal","Utilizar métodos alternativos de comunicação (imagens, gestos, dispositivos)","Ser paciente, permitir tempo suficiente para resposta","Envolver terapeuta da fala se indicado"],
    noc:["Doente comunica necessidades de forma eficaz (verbal ou alternativa)","Redução da frustração associada à dificuldade de comunicação"] },
  "Interação social prejudicada": { nic:["Avaliar padrão de interação social e factores limitantes","Incentivar participação em actividades sociais graduais","Ensinar habilidades sociais/comunicacionais se necessário","Envolver a família/rede de apoio"],
    noc:["Doente participa em interações sociais de forma mais eficaz","Doente verbaliza maior satisfação nas relações sociais"] },
  "Autoestima inadequada situacional": { nic:["Identificar a situação/evento associado à baixa autoestima","Facilitar expressão de sentimentos sem julgamento","Reforçar pontos fortes e conquistas realistas","Envolver rede de apoio"],
    noc:["Doente verbaliza percepção mais positiva de si próprio","Doente identifica pontos fortes pessoais"] },
  "Autoestima inadequada crônica": { nic:["Avaliar padrão de autoestima ao longo do tempo","Facilitar expressão de sentimentos e crenças sobre si próprio","Encaminhar para apoio psicológico especializado","Reforçar conquistas e recursos pessoais"],
    noc:["Doente demonstra melhoria gradual da autoestima","Doente participa em intervenções de apoio psicológico"] },
  "Imagem corporal conturbada": { nic:["Avaliar percepção do doente sobre a alteração corporal","Facilitar expressão de sentimentos sobre a mudança na imagem corporal","Incentivar contacto com grupos de apoio quando aplicável","Envolver a família no processo de adaptação"],
    noc:["Doente verbaliza aceitação progressiva da alteração corporal","Doente participa em actividades sociais apesar da alteração"] },
  "Identidade pessoal conturbada": { nic:["Avaliar a percepção do doente sobre a sua identidade","Facilitar expressão de sentimentos num ambiente seguro","Encaminhar para apoio psicológico especializado se necessário"],
    noc:["Doente verbaliza maior clareza/segurança quanto à sua identidade","Doente demonstra estratégias de enfrentamento adequadas"] },
  "Solidão excessiva": { nic:["Avaliar padrão social e sentimentos de isolamento","Incentivar contacto com família/amigos e recursos comunitários","Facilitar participação em actividades de grupo","Encaminhar para apoio social/psicológico se indicado"],
    noc:["Doente refere redução do sentimento de solidão","Doente aumenta a participação em actividades sociais"] },
  "Risco de comportamento autolesivo suicida": { nic:["Avaliar risco suicida com instrumento validado e sinais de alerta","Garantir ambiente seguro, remover objectos de risco","Manter vigilância adequada ao nível de risco","Envolver equipa de saúde mental e activar protocolo institucional"],
    noc:["Ausência de comportamento autolesivo durante o período de cuidados","Doente aceita e participa no plano de segurança/tratamento"] },
  "Comportamento autolesivo não suicida": { nic:["Avaliar padrão, frequência e gatilhos do comportamento autolesivo","Garantir ambiente seguro e vigilância adequada","Ensinar estratégias alternativas de regulação emocional","Encaminhar para apoio psicológico/psiquiátrico"],
    noc:["Redução da frequência de comportamentos autolesivos","Doente utiliza estratégias alternativas de regulação emocional"] },
  "Risco de violência direcionada a outros": { nic:["Avaliar sinais de agitação/agressividade e factores desencadeantes","Manter ambiente seguro, reduzir estímulos provocadores","Utilizar comunicação calma e técnicas de desescalada","Garantir segurança da equipa e de terceiros conforme protocolo"],
    noc:["Ausência de episódios de violência/agressão","Doente utiliza estratégias adequadas de gestão da raiva/agitação"] },
  "Hipertermia": { nic:["Monitorizar temperatura corporal regularmente","Aplicar medidas de arrefecimento (roupa leve, compressas, hidratação)","Administrar antipiréticos conforme prescrição","Investigar e tratar a causa subjacente"],
    noc:["Temperatura corporal dentro dos valores normais","Ausência de complicações associadas à hipertermia"] },
  "Hipotermia": { nic:["Monitorizar temperatura corporal regularmente","Aplicar medidas de reaquecimento (cobertores, ambiente aquecido)","Monitorizar sinais vitais e nível de consciência","Investigar e tratar a causa subjacente"],
    noc:["Temperatura corporal dentro dos valores normais","Ausência de complicações associadas à hipotermia"] },
  "Termorregulação ineficaz": { nic:["Monitorizar temperatura corporal e sinais de instabilidade térmica","Ajustar ambiente térmico conforme necessário","Educar doente/família sobre sinais de alerta"],
    noc:["Temperatura corporal estável dentro dos valores normais","Doente/família reconhece sinais de alteração térmica"] },
  "Risco de choque": { nic:["Monitorizar sinais vitais e sinais precoces de choque (perfusão, consciência, diurese)","Garantir acesso venoso permeável","Administrar fluidoterapia/medicação conforme prescrição","Manter vigilância contínua e activar protocolo de emergência se necessário"],
    noc:["Sinais vitais e perfusão dentro dos parâmetros normais","Ausência de progressão para estado de choque"] },
  "Risco de sangramento excessivo": { nic:["Monitorizar sinais de hemorragia (local, drenagem, sinais vitais)","Monitorizar parâmetros de coagulação conforme prescrição","Evitar procedimentos invasivos desnecessários","Educar sobre sinais de alerta de hemorragia"],
    noc:["Ausência de sinais de hemorragia activa","Parâmetros hemodinâmicos e de coagulação estáveis"] },
  "Risco de trombose": { nic:["Avaliar factores de risco tromboembólico","Incentivar mobilização precoce e exercícios activos/passivos","Administrar profilaxia (mecânica/farmacológica) conforme prescrição","Monitorizar sinais de TVP/TEP"],
    noc:["Ausência de sinais de trombose venosa/embolismo","Doente demonstra medidas preventivas (mobilização, meias de compressão)"] },
  "Perfusão tissular periférica ineficaz": { nic:["Avaliar perfusão periférica (cor, temperatura, pulsos, tempo de preenchimento capilar)","Posicionar membros para optimizar perfusão","Evitar factores que comprometam a circulação (roupa apertada, pressão prolongada)","Monitorizar sinais de agravamento"],
    noc:["Perfusão periférica adequada (pulsos presentes, pele corada e quente)","Ausência de sinais de isquemia"] },
  "Risco de débito cardíaco diminuído": { nic:["Monitorizar sinais vitais, ritmo cardíaco e sinais de baixo débito","Monitorizar balanço hídrico e peso diário","Administrar medicação cardiovascular conforme prescrição","Educar sobre sinais de alerta de descompensação"],
    noc:["Débito cardíaco adequado (sinais vitais e perfusão estáveis)","Ausência de sinais de descompensação cardíaca"] },
  "Tolerância à atividade diminuída": { nic:["Avaliar resposta a actividade (sinais vitais, fadiga, dispneia)","Planear actividades com períodos de descanso intercalados","Promover aumento gradual da actividade conforme tolerância","Ensinar técnicas de conservação de energia"],
    noc:["Doente tolera actividades progressivamente maiores sem sintomas significativos","Sinais vitais estáveis durante e após actividade"] },
  "Carga excessiva de fadiga": { nic:["Avaliar padrão e causas da fadiga","Ensinar técnicas de gestão de energia e priorização de actividades","Promover equilíbrio entre actividade e repouso","Optimizar sono e nutrição"],
    noc:["Doente refere redução do nível de fadiga","Doente utiliza estratégias eficazes de gestão de energia"] },
  "Recuperação cirúrgica prejudicada": { nic:["Monitorizar sinais vitais e sinais de complicação pós-operatória","Vigiar ferida cirúrgica e dor","Incentivar mobilização precoce conforme indicação","Educar sobre cuidados pós-operatórios no domicílio"],
    noc:["Recuperação cirúrgica progride conforme esperado","Ausência de complicações pós-operatórias"] },
  "Conhecimento de saúde inadequado": { nic:["Avaliar nível de conhecimento actual e necessidades de aprendizagem","Fornecer educação estruturada, adaptada ao nível de literacia","Utilizar material de apoio (escrito/visual)","Confirmar compreensão através de teach-back"],
    noc:["Doente/família demonstra conhecimento adequado sobre a condição/tratamento","Doente/família aplica correctamente as orientações recebidas"] },
  "Tomada de decisão prejudicada": { nic:["Fornecer informação clara e completa sobre as opções disponíveis","Facilitar a expressão de valores e preferências do doente","Apoiar o processo de decisão sem impor opinião","Envolver família/equipa multidisciplinar conforme apropriado"],
    noc:["Doente participa activamente e com confiança na tomada de decisão","Doente verbaliza satisfação com a decisão tomada"] },
  "Sofrimento moral": { nic:["Facilitar espaço seguro para expressão do sofrimento moral","Envolver equipa multidisciplinar (ética, psicologia, espiritualidade)","Validar sentimentos sem julgamento"],
    noc:["Doente/profissional verbaliza redução do sofrimento moral","Recursos de apoio identificados e utilizados"] },
  "Bem-estar espiritual prejudicado": { nic:["Avaliar necessidades e recursos espirituais do doente","Facilitar acesso a apoio espiritual/religioso conforme desejo do doente","Respeitar crenças e práticas espirituais individuais"],
    noc:["Doente verbaliza maior bem-estar espiritual","Doente utiliza recursos espirituais de apoio disponíveis"] },
  "Autogestão ineficaz da saúde": { nic:["Avaliar barreiras à adesão ao regime terapêutico","Elaborar plano de autogestão adaptado à rotina do doente","Educar sobre a condição e regime terapêutico","Envolver família/cuidador no apoio à autogestão"],
    noc:["Doente demonstra comportamentos de autogestão eficazes","Doente adere ao regime terapêutico prescrito"] },
  "Comportamentos ineficazes de manutenção da saúde": { nic:["Avaliar hábitos de saúde e factores de risco","Educar sobre comportamentos promotores de saúde","Estabelecer metas realistas e progressivas com o doente","Reforçar positivamente mudanças de comportamento"],
    noc:["Doente adopta comportamentos de manutenção da saúde mais eficazes","Doente identifica e reduz factores de risco"] }
};

/* Regras por palavra-chave (aplicadas quando não há correspondência exacta acima) */
const NICNOC_PALAVRAS_CHAVE = [
  { chave:"queda", nic:["Avaliar risco de queda com escala validada","Manter ambiente seguro (iluminação, calçado, campainha ao alcance)","Vigilância acrescida e auxílio na deambulação"], noc:["Ausência de quedas durante os cuidados","Doente/família reconhece medidas preventivas"] },
  { chave:"infec", nic:["Técnica assética e lavagem das mãos em todos os cuidados","Monitorizar sinais e sintomas de infecção","Educar sobre medidas de prevenção e sinais de alerta"], noc:["Ausência de sinais/sintomas de infecção","Doente/família demonstra medidas de prevenção"] },
  { chave:"pele", nic:["Avaliar integridade cutânea regularmente","Aliviar pressão com mudança de decúbito e superfícies adequadas","Manter pele limpa, seca e hidratada"], noc:["Pele íntegra ou em progressão de cicatrização","Ausência de novas lesões cutâneas"] },
  { chave:"press", nic:["Avaliação do risco com escala validada (ex.: Braden)","Plano de mudança de decúbito e alívio de pressão","Optimizar nutrição, hidratação e mobilidade"], noc:["Ausência de lesões por pressão","Doente/cuidador demonstra medidas preventivas"] },
  { chave:"mobilidade", nic:["Avaliar grau de mobilidade e capacidade funcional","Promover mobilização progressiva e exercícios de amplitude articular","Prevenir complicações de imobilidade"], noc:["Melhoria/manutenção do grau de mobilidade","Ausência de complicações de imobilidade"] },
  { chave:"respirat", nic:["Monitorizar frequência, ritmo e esforço respiratório","Posicionar em semi-Fowler/Fowler","Administrar oxigenoterapia conforme prescrição"], noc:["Padrão respiratório e saturação dentro dos parâmetros normais","Ausência de sinais de dificuldade respiratória"] },
  { chave:"vias aéreas", nic:["Avaliar permeabilidade das vias aéreas","Aspirar secreções conforme necessário","Incentivar tosse eficaz e hidratação"], noc:["Vias aéreas permeáveis, sem ruídos adventícios"] },
  { chave:"troca", nic:["Monitorizar saturação de oxigénio/gasometria","Posicionar para optimizar ventilação-perfusão","Administrar oxigenoterapia conforme prescrição"], noc:["Trocas gasosas adequadas (saturação e gasometria normais)"] },
  { chave:"nutri", nic:["Avaliar estado nutricional e padrão alimentar","Monitorizar peso e ingestão alimentar","Encaminhar para nutricionista se necessário"], noc:["Ingestão nutricional adequada às necessidades","Peso mantido/recuperado dentro do esperado"] },
  { chave:"deglut", nic:["Avaliar capacidade de deglutição antes da alimentação oral","Adaptar consistência de alimentos/líquidos","Vigiar sinais de aspiração durante a alimentação"], noc:["Deglutição segura, sem sinais de aspiração"] },
  { chave:"líquido", nic:["Monitorizar balanço hídrico rigoroso","Monitorizar sinais de desidratação/sobrecarga hídrica","Ajustar aporte hídrico conforme prescrição"], noc:["Balanço hídrico equilibrado","Ausência de sinais de desidratação/sobrecarga"] },
  { chave:"eletrol", nic:["Monitorizar electrólitos séricos e sinais clínicos de desequilíbrio","Administrar reposição conforme prescrição"], noc:["Valores electrolíticos dentro dos parâmetros normais"] },
  { chave:"urinári", nic:["Avaliar padrão miccional (frequência, volume, características)","Incentivar ingestão hídrica adequada","Monitorizar sinais de infecção/retenção urinária"], noc:["Padrão de eliminação urinária adequado"] },
  { chave:"intestinal", nic:["Avaliar padrão intestinal habitual","Incentivar fibras, líquidos e mobilização","Estabelecer rotina de eliminação intestinal"], noc:["Padrão de eliminação intestinal regular"] },
  { chave:"constipa", nic:["Incentivar ingestão de fibras, líquidos e mobilização","Administrar laxantes conforme prescrição se necessário","Estabelecer rotina de eliminação intestinal"], noc:["Eliminação intestinal regular e sem esforço"] },
  { chave:"sono", nic:["Avaliar padrão habitual de sono e factores perturbadores","Promover ambiente propício ao sono","Estabelecer rotina/horário regular de sono"], noc:["Doente refere sono reparador e adequado"] },
  { chave:"ansied", nic:["Avaliar nível de ansiedade e factores desencadeantes","Ensinar técnicas de respiração e relaxamento","Reduzir estímulos ambientais excessivos"], noc:["Redução verbalizada do nível de ansiedade"] },
  { chave:"medo", nic:["Identificar a causa do medo e validar a experiência do doente","Fornecer informação clara sobre procedimentos/prognóstico","Permanecer junto do doente em momentos críticos"], noc:["Doente verbaliza diminuição do medo"] },
  { chave:"confus", nic:["Avaliar estado cognitivo regularmente","Reorientar o doente frequentemente","Manter ambiente calmo e seguro"], noc:["Recuperação/manutenção do nível de orientação possível"] },
  { chave:"memória", nic:["Avaliar grau de comprometimento da memória","Utilizar auxiliares de memória (calendários, listas, rotinas)","Estimular cognitivamente de forma adequada"], noc:["Doente utiliza estratégias compensatórias eficazes"] },
  { chave:"comunica", nic:["Avaliar capacidade de comunicação verbal/não-verbal","Utilizar métodos alternativos de comunicação","Permitir tempo suficiente para resposta"], noc:["Doente comunica necessidades de forma eficaz"] },
  { chave:"social", nic:["Avaliar padrão de interação social","Incentivar participação gradual em actividades sociais","Envolver família/rede de apoio"], noc:["Melhoria da participação e satisfação nas interações sociais"] },
  { chave:"autoestima", nic:["Facilitar expressão de sentimentos sem julgamento","Reforçar pontos fortes e conquistas realistas","Envolver rede de apoio"], noc:["Percepção mais positiva de si próprio"] },
  { chave:"imagem corporal", nic:["Avaliar percepção sobre a alteração corporal","Facilitar expressão de sentimentos sobre a mudança","Envolver a família no processo de adaptação"], noc:["Aceitação progressiva da alteração corporal"] },
  { chave:"luto", nic:["Facilitar expressão de sentimentos relacionados com a perda","Validar o processo de luto sem julgamento","Envolver rede de apoio familiar/espiritual"], noc:["Progressão saudável no processo de luto"] },
  { chave:"suic", nic:["Avaliar risco suicida com instrumento validado","Garantir ambiente seguro e vigilância adequada","Activar protocolo institucional e equipa de saúde mental"], noc:["Ausência de comportamento autolesivo durante os cuidados"] },
  { chave:"violênc", nic:["Avaliar sinais de agitação/agressividade e gatilhos","Manter ambiente seguro e comunicação calma","Utilizar técnicas de desescalada"], noc:["Ausência de episódios de violência/agressão"] },
  { chave:"termorregula", nic:["Monitorizar temperatura corporal regularmente","Ajustar medidas de arrefecimento/aquecimento conforme necessário"], noc:["Temperatura corporal dentro dos valores normais"] },
  { chave:"hipertermia", nic:["Monitorizar temperatura corporal regularmente","Aplicar medidas de arrefecimento","Administrar antipiréticos conforme prescrição"], noc:["Temperatura corporal dentro dos valores normais"] },
  { chave:"hipotermia", nic:["Monitorizar temperatura corporal regularmente","Aplicar medidas de reaquecimento","Monitorizar sinais vitais e nível de consciência"], noc:["Temperatura corporal dentro dos valores normais"] },
  { chave:"choque", nic:["Monitorizar sinais vitais e sinais precoces de choque","Garantir acesso venoso permeável","Activar protocolo de emergência se necessário"], noc:["Sinais vitais e perfusão dentro dos parâmetros normais"] },
  { chave:"sangr", nic:["Monitorizar sinais de hemorragia e parâmetros de coagulação","Evitar procedimentos invasivos desnecessários","Educar sobre sinais de alerta"], noc:["Ausência de sinais de hemorragia activa"] },
  { chave:"trombose", nic:["Incentivar mobilização precoce e exercícios activos/passivos","Administrar profilaxia conforme prescrição","Monitorizar sinais de TVP/TEP"], noc:["Ausência de sinais de trombose venosa/embolismo"] },
  { chave:"perfusão", nic:["Avaliar perfusão (cor, temperatura, pulsos, preenchimento capilar)","Posicionar para optimizar perfusão","Monitorizar sinais de agravamento"], noc:["Perfusão adequada, sem sinais de isquemia"] },
  { chave:"cardíac", nic:["Monitorizar sinais vitais e ritmo cardíaco","Monitorizar balanço hídrico e peso diário","Administrar medicação cardiovascular conforme prescrição"], noc:["Sinais vitais e perfusão estáveis, sem sinais de descompensação"] },
  { chave:"atividade", nic:["Avaliar resposta a actividade (sinais vitais, fadiga)","Planear actividades com períodos de descanso intercalados","Promover aumento gradual da actividade"], noc:["Doente tolera actividade progressivamente maior"] },
  { chave:"fadiga", nic:["Avaliar padrão e causas da fadiga","Ensinar técnicas de gestão de energia","Promover equilíbrio actividade/repouso"], noc:["Redução do nível de fadiga referido"] },
  { chave:"cirúrgic", nic:["Monitorizar sinais vitais e sinais de complicação pós-operatória","Vigiar ferida cirúrgica e dor","Incentivar mobilização precoce conforme indicação"], noc:["Recuperação cirúrgica progride conforme esperado"] },
  { chave:"conhecimento", nic:["Avaliar nível de conhecimento e necessidades de aprendizagem","Fornecer educação estruturada e adaptada","Confirmar compreensão através de teach-back"], noc:["Doente/família demonstra conhecimento adequado"] },
  { chave:"decisão", nic:["Fornecer informação clara sobre as opções disponíveis","Facilitar a expressão de valores e preferências","Apoiar o processo de decisão sem impor opinião"], noc:["Participação activa e confiante na tomada de decisão"] },
  { chave:"espiritual", nic:["Avaliar necessidades e recursos espirituais","Facilitar acesso a apoio espiritual/religioso conforme desejo do doente"], noc:["Melhoria do bem-estar espiritual referido"] },
  { chave:"parental|papel|família|apego|cuidador", nic:["Avaliar dinâmica familiar e necessidades de apoio","Facilitar comunicação e envolvimento familiar nos cuidados","Encaminhar para apoio social se necessário"], noc:["Melhoria da dinâmica/funcionamento familiar"] },
  { chave:"sexual", nic:["Avaliar preocupações relacionadas com a sexualidade de forma sensível","Fornecer informação e educação adequada","Encaminhar para aconselhamento especializado se necessário"], noc:["Doente verbaliza maior conforto com a função sexual"] }
];

/* Sugestão genérica por domínio (garante conteúdo mesmo sem correspondência acima) */
function sugestaoGenericaPorDominio(dominio){
  const d = normalize(dominio || '');
  if(d.includes('promocao da saude')) return { nic:["Avaliar hábitos, crenças e comportamentos de saúde do doente/família","Identificar barreiras e motivadores para a mudança de comportamento","Educar sobre comportamentos promotores de saúde adequados ao contexto","Apoiar a definição de metas realistas e mensuráveis","Reforçar positivamente os progressos alcançados","Reavaliar periodicamente a adesão às mudanças propostas"], noc:["Doente identifica comportamentos de risco para a sua saúde","Comportamento de promoção da saúde melhorado e sustentado","Doente demonstra conhecimento sobre promoção da saúde","Doente participa activamente em actividades de autocuidado"] };
  if(d.includes('nutricao')) return { nic:["Avaliar estado nutricional, peso, IMC e padrão alimentar habitual","Monitorizar ingestão alimentar/hídrica e tolerância digestiva","Registar peso corporal em intervalos regulares","Adequar a dieta às necessidades e preferências do doente","Encaminhar para nutricionista quando indicado","Educar doente/família sobre alimentação equilibrada"], noc:["Estado nutricional adequado às necessidades metabólicas","Peso corporal dentro/a aproximar-se do valor esperado","Doente/família demonstra conhecimento sobre escolhas alimentares saudáveis","Ingestão nutricional e hídrica adequada às necessidades diárias"] };
  if(d.includes('eliminacao')) return { nic:["Monitorizar padrão, frequência e características da eliminação urinária/intestinal","Incentivar hidratação e mobilização adequadas ao quadro clínico","Registar balanço hídrico quando indicado","Identificar precocemente sinais de retenção, incontinência ou obstipação","Implementar medidas de conforto e privacidade durante a eliminação"], noc:["Padrão de eliminação urinária/intestinal dentro do esperado","Ausência de sinais de retenção, infecção ou obstipação","Doente verbaliza satisfação com o padrão de eliminação"] };
  if(d.includes('atividade') || d.includes('repouso')) return { nic:["Avaliar tolerância à actividade, sinais vitais em repouso e ao esforço","Promover mobilização progressiva conforme tolerância","Planear períodos de actividade intercalados com repouso","Optimizar o ambiente e a rotina para um sono/repouso adequado","Prevenir complicações associadas à imobilidade"], noc:["Doente tolera actividade progressivamente maior sem sinais de descompensação","Padrão de sono/repouso reparador referido pelo doente","Ausência de complicações associadas à imobilidade (trombose, úlceras)"] };
  if(d.includes('percepcao') || d.includes('cognicao')) return { nic:["Avaliar estado cognitivo, orientação e capacidade perceptiva","Reorientar o doente regularmente no tempo, espaço e pessoa","Estimular cognitivamente de forma adequada ao défice identificado","Manter ambiente seguro, calmo e com estímulos adaptados","Envolver a família na estimulação e vigilância"], noc:["Função cognitiva/perceptiva mantida ou melhorada face à linha de base","Doente demonstra orientação adequada ao contexto clínico","Ausência de incidentes relacionados com défice cognitivo/perceptivo"] };
  if(d.includes('autopercepcao')) return { nic:["Facilitar expressão de sentimentos sobre si próprio, sem julgamento","Reforçar pontos fortes, conquistas e recursos pessoais realistas","Explorar o impacto da situação de saúde na autoimagem/autoestima","Encaminhar para apoio psicológico se necessário"], noc:["Doente verbaliza percepção mais positiva de si próprio","Melhoria da autoestima/autoconceito referida pelo doente","Doente demonstra adaptação progressiva à alteração vivida"] };
  if(d.includes('relacao de funcao') || d.includes('papeis')) return { nic:["Avaliar desempenho de papéis, dinâmica familiar e rede de apoio","Facilitar comunicação aberta entre doente e família/cuidadores","Identificar sobrecarga do cuidador e necessidades de apoio","Encaminhar para apoio social/comunitário se necessário"], noc:["Melhoria do desempenho de papéis e das relações interpessoais","Família demonstra estratégias eficazes de adaptação","Doente/família identifica e utiliza recursos de apoio disponíveis"] };
  if(d.includes('sexualidade')) return { nic:["Avaliar, de forma sensível e privada, preocupações relacionadas com a sexualidade","Fornecer educação e aconselhamento adequados à situação clínica","Criar ambiente de confiança para esclarecimento de dúvidas","Encaminhar para aconselhamento especializado se necessário"], noc:["Doente verbaliza maior conforto com questões de sexualidade/função reprodutiva","Melhoria do conforto e satisfação relacionados com a sexualidade"] };
  if(d.includes('enfrentamento') || d.includes('estresse')) return { nic:["Avaliar estratégias de enfrentamento habituais e factores de stress actuais","Ensinar estratégias adaptativas de coping (respiração, relaxamento, resolução de problemas)","Facilitar a expressão de emoções num ambiente seguro","Envolver a rede de apoio familiar/social","Encaminhar para apoio psicológico especializado se necessário"], noc:["Doente utiliza estratégias de enfrentamento eficazes perante a situação","Redução do nível de stress/ansiedade referido","Doente verbaliza sensação de maior controlo sobre a situação"] };
  if(d.includes('principios de vida')) return { nic:["Avaliar valores, crenças e necessidades espirituais do doente","Facilitar acesso a apoio espiritual/religioso conforme desejo do doente","Respeitar decisões baseadas em valores pessoais/culturais","Envolver capelania ou líder religioso quando solicitado"], noc:["Melhoria do bem-estar espiritual referido pelo doente","Doente demonstra coerência entre valores, crenças e decisões tomadas"] };
  if(d.includes('seguranca') || d.includes('protecao')) return { nic:["Avaliar factores de risco individuais e implementar medidas preventivas específicas","Manter ambiente seguro (iluminação, calçado, campainha ao alcance)","Aplicar escalas de rastreio validadas (quedas, lesão por pressão, infecção)","Vigilância acrescida em doentes de maior risco","Educar doente/família sobre prevenção de incidentes"], noc:["Ausência de incidentes de segurança durante a prestação de cuidados","Doente/família reconhece e aplica medidas de prevenção de risco","Ambiente de cuidados mantido seguro ao longo do internamento"] };
  if(d.includes('conforto')) return { nic:["Avaliar nível de conforto físico, ambiental, social e psicológico","Implementar medidas farmacológicas e não farmacológicas de conforto","Optimizar o ambiente (ruído, luminosidade, temperatura, privacidade)","Reavaliar regularmente a eficácia das medidas implementadas"], noc:["Nível de conforto melhorado, referido pelo doente","Doente expressa satisfação com o ambiente e cuidados prestados","Redução de sinais/sintomas de desconforto observados"] };
  if(d.includes('crescimento') || d.includes('desenvolvimento')) return { nic:["Monitorizar marcos de crescimento/desenvolvimento com instrumentos padronizados","Orientar pais/cuidadores sobre estimulação adequada à idade","Avaliar factores de risco nutricionais, ambientais e familiares","Encaminhar para avaliação especializada se necessário"], noc:["Crescimento/desenvolvimento adequados à idade da criança","Pais/cuidadores demonstram conhecimento sobre estimulação adequada","Ausência/redução de factores de risco identificados"] };
  return { nic:["Avaliar a situação clínica específica do doente de forma sistemática","Planear e implementar intervenções individualizadas ao diagnóstico identificado","Monitorizar sinais e sintomas relevantes ao problema em causa","Envolver o doente/família no plano de cuidados","Reavaliar regularmente a eficácia das intervenções implementadas"], noc:["Melhoria do estado relacionado com o diagnóstico identificado","Doente/família demonstra compreensão do plano de cuidados","Indicadores clínicos relevantes dentro dos parâmetros esperados"] };
}

/* Função principal: devolve sempre {nic:[...], noc:[...]} não vazio */
function getSugestaoNicNoc(diag, dominio, classe){
  // 1) Mapa directo diagnóstico → NIC/NOC (NIC_NOC_MAP), fonte prioritária
  if(NIC_NOC_MAP[diag] && NIC_NOC_MAP[diag].length){
    const par = NIC_NOC_MAP[diag];
    return { nic: par[0] ? [par[0]] : [], noc: par[1] ? [par[1]] : [] };
  }
  if(NICNOC_DIAGNOSTICO[diag]) return NICNOC_DIAGNOSTICO[diag];
  const nd = normalize(diag);
  let nic = [], noc = [];
  NICNOC_PALAVRAS_CHAVE.forEach(regra=>{
    const partes = regra.chave.split('|');
    if(partes.some(p=>nd.includes(normalize(p)))){
      regra.nic.forEach(i=>{ if(!nic.includes(i)) nic.push(i); });
      regra.noc.forEach(i=>{ if(!noc.includes(i)) noc.push(i); });
    }
  });
  if(nic.length || noc.length) return { nic: nic.slice(0,6), noc: noc.slice(0,5) };
  return sugestaoGenericaPorDominio(dominio);
}

// ===== Ficha de detalhe do diagnóstico =====

const cardOverlay = document.getElementById('cardOverlay');
let currentCardKey = null;
let currentTipo = 'real'; // 'real' | 'risco' | 'promocao'

/* CSS extra para botões de tipo */
(function(){
  const s = document.createElement('style');
  s.textContent = `.tipo-btn{flex:1;min-width:80px;border:1.5px solid var(--borda);border-radius:10px;padding:8px 6px;font-size:12px;font-weight:700;background:#fff;color:var(--texto-suave);cursor:pointer;transition:background .12s,color .12s,border-color .12s;}
.tipo-btn.active[data-tipo="real"]{background:#e3eefa;color:var(--azul);border-color:var(--azul);}
.tipo-btn.active[data-tipo="risco"]{background:#fbe4e8;color:#000000;border-color:#000000;}
.tipo-btn.active[data-tipo="promocao"]{background:#EEF1F6;color:#000000;border-color:#000000;}`;
  document.head.appendChild(s);
})();
function diagStorageKey(diag){ return 'diagFicha::' + diag; }
function textToLines(text){ return (text||'').split('\n').map(l=>l.trim()).filter(Boolean); }
function linesToText(arr){ return Array.isArray(arr) ? arr.join('\n') : ''; }

/* ---- Pré-visualização do enunciado (atualiza ao vivo) ---- */
function atualizarEnunciado(){
  const tipo = currentTipo;
  const box = document.getElementById('enunciadoBox');
  box.innerHTML = '';

  if(tipo === 'real'){
    const nome = (document.getElementById('cardDiagReal').value.trim()) || '—';
    const rel  = textToLines(document.getElementById('cardRelacionado').value);
    const ev   = textToLines(document.getElementById('cardEvidenciado').value);
    box.innerHTML = `
      <div class="enunciado-tipo real"><span class="badge">DIAGNÓSTICO REAL</span></div>
      <div class="enunciado-linha" style="font-weight:700;font-size:13.5px;">${nome}</div>
      <div class="enunciado-sep"></div>
      <div class="enunciado-linha"><span class="rotulo">RELACIONADO A:</span><br>
        ${rel.length ? rel.map(l=>`<span class="valor">• ${l}</span>`).join('<br>') : '<span class="valor vazio">—</span>'}
      </div>
      <div class="enunciado-sep"></div>
      <div class="enunciado-linha"><span class="rotulo">CONFORME EVIDENCIADO POR:</span><br>
        ${ev.length ? ev.map(l=>`<span class="valor">• ${l}</span>`).join('<br>') : '<span class="valor vazio">—</span>'}
      </div>`;
  } else if(tipo === 'risco'){
    const nome = (document.getElementById('cardDiagRisco').value.trim()) || '—';
    const fr   = textToLines(document.getElementById('cardFatoresRisco').value);
    box.innerHTML = `
      <div class="enunciado-tipo risco"><span class="badge">DIAGNÓSTICO DE RISCO</span></div>
      <div class="enunciado-linha" style="font-weight:700;font-size:13.5px;">Risco de ${nome}</div>
      <div class="enunciado-sep"></div>
      <div class="enunciado-linha"><span class="rotulo">RELACIONADO A:</span><br>
        ${fr.length ? fr.map(l=>`<span class="valor">• ${l}</span>`).join('<br>') : '<span class="valor vazio">—</span>'}
      </div>`;
  } else {
    const nome = (document.getElementById('cardDiagPromocao').value.trim()) || '—';
    const ev   = textToLines(document.getElementById('cardEvidenciadoProm').value);
    box.innerHTML = `
      <div class="enunciado-tipo promocao"><span class="badge">DIAGNÓSTICO DE PROMOÇÃO DA SAÚDE</span></div>
      <div class="enunciado-linha" style="font-weight:700;font-size:13.5px;">${nome}</div>
      <div class="enunciado-sep"></div>
      <div class="enunciado-linha"><span class="rotulo">CONFORME EVIDENCIADO POR:</span><br>
        ${ev.length ? ev.map(l=>`<span class="valor">• ${l}</span>`).join('<br>') : '<span class="valor vazio">—</span>'}
      </div>`;
  }
}

/* Ouvintes para atualização ao vivo */
['cardDiagReal','cardRelacionado','cardEvidenciado',
 'cardDiagRisco','cardFatoresRisco',
 'cardDiagPromocao','cardEvidenciadoProm'].forEach(id=>{
  const el = document.getElementById(id);
  if(el) el.addEventListener('input', atualizarEnunciado);
});

/* ---- Mudar tipo de diagnóstico ---- */
function setTipoDiag(tipo, btn){
  currentTipo = tipo;
  document.querySelectorAll('.tipo-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('secReal').style.display    = tipo==='real'     ? '' : 'none';
  document.getElementById('secRisco').style.display   = tipo==='risco'    ? '' : 'none';
  document.getElementById('secPromocao').style.display= tipo==='promocao' ? '' : 'none';
  atualizarEnunciado();
}

/* ---- Abrir ficha ---- */
let currentCardDom = '';
let currentCardCls = '';
function openDiagCard(dom, cls, diag){
  currentCardKey = diagStorageKey(diag);
  currentCardDom = dom;
  currentCardCls = cls;

  // Identificação
  document.getElementById('cardDominio').textContent = dom;
  document.getElementById('cardClasse').textContent  = cls;
  document.getElementById('cardNome').textContent    = diag;
  document.getElementById('cardCodigoLabel').textContent = (CODES_2024[diag] || '') + (CODES_2024[diag] ? ' · NANDA-I 2024–2026' : ' (sem código atribuído na base actual)');

  // Carregar dados guardados
  let saved = {};
  try{
    const raw = localStorage.getItem(currentCardKey);
    if(raw) saved = JSON.parse(raw);
  }catch(e){ saved = {}; }

  // Preencher campos
  const tipo = saved.tipo || 'real';
  currentTipo = tipo;
  document.querySelectorAll('.tipo-btn').forEach(b=>{
    b.classList.toggle('active', b.dataset.tipo === tipo);
  });
  document.getElementById('secReal').style.display    = tipo==='real'     ? '' : 'none';
  document.getElementById('secRisco').style.display   = tipo==='risco'    ? '' : 'none';
  document.getElementById('secPromocao').style.display= tipo==='promocao' ? '' : 'none';

  // Nome sugerido com base no título da taxonomia
  const nomeBase = diag.replace(/^Risco (de|para|do|da)\s+/i,'').replace(/^Prontidão para\s+/i,'').replace(/^Disposição para\s+/i,'');
  const isRisco   = /^risco (de|para|do|da)\s/i.test(diag);
  const isProm    = /^prontidão para|^disposição para/i.test(diag);
  const tipoAuto  = saved.tipo ? saved.tipo : (isRisco ? 'risco' : isProm ? 'promocao' : 'real');

  document.getElementById('cardDefinicao').value      = saved.definicao   || '';
  document.getElementById('cardDiagReal').value       = saved.diagReal    || (!isRisco && !isProm ? diag : '');
  document.getElementById('cardRelacionado').value    = linesToText(saved.relacionado);
  document.getElementById('cardEvidenciado').value    = linesToText(saved.evidenciado);
  document.getElementById('cardDiagRisco').value      = saved.diagRisco   || (isRisco ? nomeBase : '');
  document.getElementById('cardFatoresRisco').value   = linesToText(saved.fatoresRisco);
  document.getElementById('cardDiagPromocao').value   = saved.diagProm    || (isProm ? diag : '');
  document.getElementById('cardEvidenciadoProm').value= linesToText(saved.evidenciadoProm);
  if(saved.nic && saved.nic.length){
    document.getElementById('cardNIC').value = linesToText(saved.nic);
  } else {
    const sug = getSugestaoNicNoc(diag, dom, cls);
    document.getElementById('cardNIC').value = sug.nic.map(l=>'• '+l).join('\n');
  }
  if(saved.noc && saved.noc.length){
    document.getElementById('cardNOC').value = linesToText(saved.noc);
  } else {
    const sug = getSugestaoNicNoc(diag, dom, cls);
    document.getElementById('cardNOC').value = sug.noc.map(l=>'• '+l).join('\n');
  }
  document.getElementById('cardSavedMsg').textContent = '';

  // Aplicar tipo automático se novo
  if(!saved.tipo){
    currentTipo = tipoAuto;
    document.querySelectorAll('.tipo-btn').forEach(b=>{
      b.classList.toggle('active', b.dataset.tipo === tipoAuto);
    });
    document.getElementById('secReal').style.display    = tipoAuto==='real'     ? '' : 'none';
    document.getElementById('secRisco').style.display   = tipoAuto==='risco'    ? '' : 'none';
    document.getElementById('secPromocao').style.display= tipoAuto==='promocao' ? '' : 'none';
  }

  atualizarEnunciado();
  cardOverlay.classList.add('open');
}

/* ---- Fechar ---- */
function closeDiagCard(){
  cardOverlay.classList.remove('open');
  currentCardKey = null;
}

/* ---- Guardar ---- */
function saveDiagCard(){
  if(!currentCardKey) return;
  const data = {
    tipo:            currentTipo,
    definicao:       document.getElementById('cardDefinicao').value.trim(),
    diagReal:        document.getElementById('cardDiagReal').value.trim(),
    relacionado:     textToLines(document.getElementById('cardRelacionado').value),
    evidenciado:     textToLines(document.getElementById('cardEvidenciado').value),
    diagRisco:       document.getElementById('cardDiagRisco').value.trim(),
    fatoresRisco:    textToLines(document.getElementById('cardFatoresRisco').value),
    diagProm:        document.getElementById('cardDiagPromocao').value.trim(),
    evidenciadoProm: textToLines(document.getElementById('cardEvidenciadoProm').value),
    nic:             textToLines(document.getElementById('cardNIC').value),
    noc:             textToLines(document.getElementById('cardNOC').value)
  };
  try{
    localStorage.setItem(currentCardKey, JSON.stringify(data));
    const msg = document.getElementById('cardSavedMsg');
    msg.textContent = 'Guardado ✓';
    setTimeout(()=>{ if(msg.textContent==='Guardado ✓') msg.textContent=''; }, 2000);
  }catch(e){
    document.getElementById('cardSavedMsg').textContent = 'Não foi possível guardar neste dispositivo.';
  }
}

/* ---- Limpar sessão do diagnóstico actual ---- */
function limparSessaoDiag(){
  if(!currentCardKey) return;
  if(!confirm('Limpar todos os dados desta sessão de diagnóstico?')) return;
  try{ localStorage.removeItem(currentCardKey); }catch(e){}

  // Resetar campos
  ['cardDefinicao','cardDiagReal','cardRelacionado','cardEvidenciado',
   'cardDiagRisco','cardFatoresRisco',
   'cardDiagPromocao','cardEvidenciadoProm'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
  const diagAtual = currentCardKey.replace('diagFicha::','');
  const sug = getSugestaoNicNoc(diagAtual, currentCardDom, currentCardCls);
  document.getElementById('cardNIC').value = sug.nic.map(l=>'• '+l).join('\n');
  document.getElementById('cardNOC').value = sug.noc.map(l=>'• '+l).join('\n');
  document.getElementById('cardSavedMsg').textContent = 'Sessão limpa ✓';
  setTimeout(()=>{ document.getElementById('cardSavedMsg').textContent=''; }, 2000);
  atualizarEnunciado();
}

// Delegação de clique: qualquer item de diagnóstico (nas duas secções) abre a ficha

document.addEventListener('click', (e)=>{
  const li = e.target.closest('.diag-item');
  if(!li) return;
  openDiagCard(li.dataset.dom, li.dataset.cls, li.dataset.diag);
});

// Suporte a pesquisa vinda da Início (?q=termo)
(function(){
  const params = new URLSearchParams(location.search);
  const q = params.get('q');
  if(q){
    const target = document.getElementById('searchInput');
    if(target){
      target.value = q;
      target.dispatchEvent(new Event('input'));
    }
  }
})();


// === medicamentos.js ===
// ===== medicamentos.html =====
// Conteúdo extraído da Lista Nacional de Medicamentos Essenciais de Moçambique 2017

(function(){
  const div = document.createElement('div');
  div.className = 'view';
  div.id = 'view-medicamentos';
  div.innerHTML = `
    <div style="padding:10px 12px 0;">
      <button class="back-btn" style="background:rgba(11,31,102,.08);color:var(--azul-escuro);" onclick="showView('ferramentas')">‹ Ferramentas</button>
    </div>
    <div class="section-title" style="margin-top:14px;">Medicamentos Essenciais</div>
    <div style="margin:0 12px 4px;font-size:12px;color:var(--texto-suave);">Base de dados de medicamentos essenciais com classes terapêuticas, apresentações, dosagens e níveis de prescrição, extraído da Lista Nacional de Medicamentos Essenciais de Moçambique 2017 (LNME).</div>
    <div class="alert-box" style="margin:10px 12px;"><b>⚠️ Informação crítica:</b> Esta ficha é material de estudo e apoio à prática — <b>não substitui</b> o Formulário Nacional de Medicamentos, o protocolo institucional vigente nem o âmbito legal de prática de enfermagem do seu país/serviço. Confirme sempre doses, vias e âmbito de actuação antes de administrar.</div>
    <div class="ec-actions" id="medActions">
      <button onclick="ecOpenPdf('lnme')">📖 Ver lista completa</button>
      <button class="alt" onclick="ecPdfPrint('lnme')">🖨 Imprimir</button>
      <button class="alt" onclick="ecPdfDownload('lnme')">⬇ Baixar PDF</button>
      <button class="alt" onclick="ecAccAll('view-medicamentos',this)">▾ Abrir todas as classes</button>
    </div>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin:4px 12px 12px;">
      <div style="text-align:center;"><img class="zoomable-img" src="img/4c09dfcc0a.webp" alt="Cálculo de gotejamento" style="width:150px;height:180px;object-fit:cover;" onclick="openLightbox('img-gotejamento.jpg','Cálculo de gotejamento','calculo-gotejamento.jpg')"><div class="img-caption">Cálculo de gotejamento</div></div>
      <div style="text-align:center;"><img class="zoomable-img" src="img/de28f2d422.webp" alt="Guia rápido de cálculo de medicamentos" style="width:150px;height:180px;object-fit:cover;" onclick="openLightbox('img-guia-calculo.jpg','Guia rápido de cálculo de medicamentos','guia-calculo-medicamentos.jpg')"><div class="img-caption">Guia rápido de cálculo</div></div>
    </div>
    <div class="search-mini"><input type="text" placeholder="Pesquisar medicamento ou classe..." oninput="filterAcc('medicamentos', this.value)"></div>

    <!-- ANALGÉSICOS E ANTIPIRÉTICOS -->
    <div class="acc" id="medicamentos-acc-0">
      <div class="acc-head" onclick="this.parentElement.classList.toggle('open')">
        <div class="a-icon" style="background:#fbe4e8;color:#E80018;">${ICON_PROC}</div>
        <div class="a-txt"><div class="a-title">Analgésicos e Antipiréticos</div><div class="a-sub">Alívio da dor e redução da febre</div></div>
        <div class="a-chev">▾</div>
      </div>
      <div class="acc-body"><div class="acc-in">
        <div class="med-card"><h5>Paracetamol</h5><div class="med-classe">Analgésico / Antipirético</div>
          <div class="med-row"><b>Indicações:</b> dor ligeira a moderada, febre</div>
          <div class="med-row"><b>Apresentações:</b> Solução oral 120 mg/5 ml; Comprimido 250 mg dispersível; Comprimido 500 mg; Injectável 1 g/100 ml; Supositório 125 mg, 250 mg, 500 mg</div>
          <div class="med-row"><b>Via/Dose habitual (adulto):</b> VO 500–1000 mg de 6/6 a 8/8h (máx. 4 g/dia); IV 1 g/100 ml conforme protocolo</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 0-2 (conforme apresentação)</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> monitorizar temperatura/dor antes e após administração; atenção à dose máxima diária; risco hepatotóxico em sobredosagem; evitar em insuficiência hepática grave</div></div>
        
        <div class="med-card"><h5>Ibuprofeno</h5><div class="med-classe">Anti-inflamatório não esteróide (AINE)</div>
          <div class="med-row"><b>Indicações:</b> dor ligeira a moderada, febre, processos inflamatórios</div>
          <div class="med-row"><b>Apresentações:</b> Comprimido 200 mg, 400 mg; Suspensão oral 200 mg/5 ml</div>
          <div class="med-row"><b>Via/Dose habitual (adulto):</b> VO 200–400 mg de 6/6 a 8/8h com alimentos</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 1</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> administrar com alimentos; evitar em úlcera péptica activa, insuficiência renal grave e no 3º trimestre da gravidez; risco de hemorragia gastrointestinal</div></div>
        
        <div class="med-card"><h5>Ácido Acetilsalicílico</h5><div class="med-classe">Anti-inflamatório / Antiagregante</div>
          <div class="med-row"><b>Indicações:</b> dor ligeira a moderada, febre, profilaxia de eventos trombóticos</div>
          <div class="med-row"><b>Apresentações:</b> Comprimido 100 mg, 500 mg; Supositório 50 mg, 150 mg</div>
          <div class="med-row"><b>Via/Dose habitual (adulto):</b> VO 500 mg de 6/6 a 8/8h; doses baixas 100 mg/dia para profilaxia cardiovascular</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 3</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> evitar em úlcera péptica, hemorragias activas e alergia ao AAS; risco de síndrome de Reye em crianças</div></div>
        
        <div class="med-card"><h5>Diclofenac</h5><div class="med-classe">Anti-inflamatório não esteróide (AINE)</div>
          <div class="med-row"><b>Indicações:</b> dor moderada a severa, inflamação, cólicas</div>
          <div class="med-row"><b>Apresentações:</b> Injectável 75 mg/3 ml</div>
          <div class="med-row"><b>Via/Dose habitual (adulto):</b> IM/IV 75 mg em dose única ou dividida (máx. 150 mg/dia)</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 3</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> injectar lentamente; monitorizar sinais de hemorragia GI; evitar em insuficiência renal/hepática grave; não usar mais de 2-3 dias em injecção</div></div>
      </div></div>
    </div>

    <!-- ANTI-INFECCIOSOS -->
    <div class="acc" id="medicamentos-acc-1">
      <div class="acc-head" onclick="this.parentElement.classList.toggle('open')">
        <div class="a-icon" style="background:#e8f4f8;color:var(--azul);">${ICON_PROC}</div>
        <div class="a-txt"><div class="a-title">Anti-infecciosos</div><div class="a-sub">Antibióticos, antivirais, antifúngicos e antiparasitários</div></div>
        <div class="a-chev">▾</div>
      </div>
      <div class="acc-body"><div class="acc-in">
        
        <!-- CLASSE: ANTIBIÓTICOS BETALACTÂMICOS -->
        <div style="margin:8px 0 4px; font-weight:600; color:var(--azul-escuro); border-bottom:1px solid var(--borda); padding-bottom:6px;">Β-Lactâmicos (Penicilinas e Cefalosporinas)</div>
        
        <div class="med-card"><h5>Amoxicilina</h5><div class="med-classe">Antibiótico Β-Lactâmico (Penicilina)</div>
          <div class="med-row"><b>Indicações:</b> infecções bacterianas sensíveis: otites, sinusites, infecções respiratórias, urinárias, pele e tecidos moles</div>
          <div class="med-row"><b>Apresentações:</b> Cápsula 250 mg, 500 mg; Pó para suspensão 125 mg/5 ml, 250 mg/5 ml</div>
          <div class="med-row"><b>Via/Dose habitual (adulto):</b> VO 250–500 mg de 8/8h (3 x dia); dose máx. 3 g/dia</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 1</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> avaliar alergia a penicilinas; reacções cruzadas com cefalosporinas (10%); tomar com ou sem alimentos; monitor para diarreia (efeito adverso frequente)</div></div>
        
        <div class="med-card"><h5>Amoxicilina + Ácido Clavulânico</h5><div class="med-classe">Antibiótico combinado (Β-Lactâmico + Inibidor de β-Lactamase)</div>
          <div class="med-row"><b>Indicações:</b> infecções por bactérias produtoras de β-lactamase (otites, sinusites, infecções respiratórias complicadas)</div>
          <div class="med-row"><b>Apresentações:</b> Comprimido 500/125 mg; Pó para suspensão 250/62,5 mg/5 ml</div>
          <div class="med-row"><b>Via/Dose habitual (adulto):</b> VO 500/125 mg de 8/8h ou 875/125 mg de 12/12h</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 1</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> mesmas precauções que amoxicilina; risco aumentado de hepatotoxicidade; tomar com alimentos para melhor tolerância GI</div></div>
        
        <div class="med-card"><h5>Benzilpenicilina Procaína</h5><div class="med-classe">Antibiótico Β-Lactâmico (Penicilina Intramuscular)</div>
          <div class="med-row"><b>Indicações:</b> infecções sistémicas graves, sífilis, meningite bacteriana, erisipela</div>
          <div class="med-row"><b>Apresentações:</b> Pó para Injectável 1.200.000 UI; 2.400.000 UI</div>
          <div class="med-row"><b>Via/Dose habitual (adulto):</b> IM 1.200.000–2.400.000 UI/dia, dividido em 1-2 injecções</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 2</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> sempre IM (nunca IV directo); teste de sensibilidade recomendado; monitor para reacções de Jarisch-Herxheimer em sífilis; armazenar correctamente</div></div>
        
        <div class="med-card"><h5>Ceftriaxona</h5><div class="med-classe">Antibiótico Β-Lactâmico (Cefalosporina 3ª geração)</div>
          <div class="med-row"><b>Indicações:</b> infecções graves: meningite bacteriana, septicemia, pneumonia nosocomial, gonorreia</div>
          <div class="med-row"><b>Apresentações:</b> Pó para Injectável 500 mg, 1 g, 2 g</div>
          <div class="med-row"><b>Via/Dose habitual (adulto):</b> IM/IV 1–2 g de 12/12h (até 4 g/dia em casos graves como meningite)</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 2</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> verificar alergia a cefalosporinas e penicilinas (10% reacção cruzada); reconstituir correctamente; administrar IV lentamente (3-5 min); monitor para colite pseudomembranosa</div></div>

        <div class="med-card"><h5>Cefixima</h5><div class="med-classe">Antibiótico Β-Lactâmico (Cefalosporina 3ª geração, oral)</div>
          <div class="med-row"><b>Indicações:</b> infecções respiratórias, urinárias, gonorreia não complicada</div>
          <div class="med-row"><b>Apresentações:</b> Cápsula 200 mg, 400 mg; Pó para suspensão 100 mg/5 ml</div>
          <div class="med-row"><b>Via/Dose habitual (adulto):</b> VO 200–400 mg de 12/12h</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 2</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> pode tomar com ou sem alimentos; risco de diarreia; monitor em insuficiência renal</div></div>

        <!-- CLASSE: MACROLÍDEOS -->
        <div style="margin:12px 0 4px; font-weight:600; color:var(--azul-escuro); border-bottom:1px solid var(--borda); padding-bottom:6px;">Macrolídeos</div>

        <div class="med-card"><h5>Azitromicina</h5><div class="med-classe">Antibiótico Macrolídeo</div>
          <div class="med-row"><b>Indicações:</b> infecções respiratórias (bronquite, pneumonia), STI (ITS), doenças causadas por Mycobacterium avium em VIH/SIDA</div>
          <div class="med-row"><b>Apresentações:</b> Comprimido 250 mg, 500 mg; Pó para suspensão 200 mg/5 ml</div>
          <div class="med-row"><b>Via/Dose habitual (adulto):</b> VO 500 mg no dia 1, depois 250 mg/dia durante 4 dias (ou 500 mg/dia 3 dias para bronquite aguda)</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 1</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> tomar 2 horas antes ou 2 horas após alimentos; risco de prolongamento de QT; evitar em miopia; gastrointestinal como efeito adverso frequente</div></div>

        <div class="med-card"><h5>Eritromicina</h5><div class="med-classe">Antibiótico Macrolídeo</div>
          <div class="med-row"><b>Indicações:</b> infecções respiratórias, STI/ITS (em alergia a penicilinas), acne</div>
          <div class="med-row"><b>Apresentações:</b> Comprimido revestido 250 mg, 500 mg; Oftalmológico pomada 0,5%</div>
          <div class="med-row"><b>Via/Dose habitual (adulto):</b> VO 250–500 mg de 6/6h (4 x dia) ou 500 mg–1 g de 12/12h (libertação prolongada)</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 1</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> tomar com água; alimentos reduzem absorção (comprimidos revestidos podem tomar com alimentos); gastrointestinal como efeito adverso muito frequente; aromatase GI comum</div></div>

        <!-- CLASSE: FLUOROQUINOLONAS -->
        <div style="margin:12px 0 4px; font-weight:600; color:var(--azul-escuro); border-bottom:1px solid var(--borda); padding-bottom:6px;">Fluoroquinolonas</div>

        <div class="med-card"><h5>Ciprofloxacina</h5><div class="med-classe">Antibiótico Fluoroquinolona</div>
          <div class="med-row"><b>Indicações:</b> infecções urinárias, respiratórias (Gram-negativos), gastroenterite, STI/ITS (gonorreia)</div>
          <div class="med-row"><b>Apresentações:</b> Comprimido 250 mg, 500 mg, 750 mg; Solução IV 2 mg/ml</div>
          <div class="med-row"><b>Via/Dose habitual (adulto):</b> VO 250–750 mg de 12/12h; IV 400 mg de 12/12h</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 2</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> tomar com água (2 horas distante de antiácidos); fotossensibilidade; tendinite (especialmente em >60 anos); risco de prolongamento QT; evitar em crianças/adolescentes se possível</div></div>

        <!-- CLASSE: SULFONAMIDAS -->
        <div style="margin:12px 0 4px; font-weight:600; color:var(--azul-escuro); border-bottom:1px solid var(--borda); padding-bottom:6px;">Sulfonamidas</div>

        <div class="med-card"><h5>Trimetoprim-Sulfametoxazol (TMP-SMX)</h5><div class="med-classe">Antibiótico Sulfonamida combinada</div>
          <div class="med-row"><b>Indicações:</b> infecções urinárias, PCP profilaxia/tratamento em VIH/SIDA, infecções respiratórias, diarreias bacterianas</div>
          <div class="med-row"><b>Apresentações:</b> Comprimido 400/80 mg (pediátrico), 800/160 mg; Suspensão oral 40/8 mg/ml</div>
          <div class="med-row"><b>Via/Dose habitual (adulto):</b> VO 800/160 mg de 12/12h; profilaxia PCP: 800/160 mg/dia ou 3x/semana</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 1-2</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> tomar com água; erupção cutânea frequente (não é alergia); monitor para citopenias; evitar em deficiência de G6PD; risco de hiperkalemia</div></div>

        <!-- CLASSE: ANTIVIRAIS -->
        <div style="margin:12px 0 4px; font-weight:600; color:var(--azul-escuro); border-bottom:1px solid var(--borda); padding-bottom:6px;">Antivirais</div>

        <div class="med-card"><h5>Zidovudina (AZT)</h5><div class="med-classe">Antiviral - Inibidor de transcriptase reversa (ITRN)</div>
          <div class="med-row"><b>Indicações:</b> VIH/SIDA, profilaxia pós-exposição, prevenção transmissão vertical (gestação)</div>
          <div class="med-row"><b>Apresentações:</b> Cápsula 100 mg, 250 mg; Xarope 50 mg/5 ml; Injectável 10 mg/ml</div>
          <div class="med-row"><b>Via/Dose habitual (adulto):</b> VO 300 mg/dia dividido (200 mg manhã + 100 mg à noite, ou 3x100 mg); IV conforme protocolo VIH</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 3</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> tomar com alimentos; monitor CBC (anemia, neutropenia); neuropatia; lipodistrofia com uso prolongado; não tomar com d4T (potencial toxicidade)</div></div>

        <div class="med-card"><h5>Lamivudina (3TC)</h5><div class="med-classe">Antiviral - Inibidor de transcriptase reversa (ITRN)</div>
          <div class="med-row"><b>Indicações:</b> VIH/SIDA, hepatite B crónica</div>
          <div class="med-row"><b>Apresentações:</b> Comprimido 150 mg; Xarope 10 mg/ml</div>
          <div class="med-row"><b>Via/Dose habitual (adulto):</b> VO 150 mg de 12/12h ou 300 mg/dia</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 3</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> ajustar em insuficiência renal; pancreatite em crianças; neuropatia periférica; monitor função renal</div></div>

      </div></div>
    </div>

    <!-- CARDIOVASCULARES -->
    <div class="acc" id="medicamentos-acc-2">
      <div class="acc-head" onclick="this.parentElement.classList.toggle('open')">
        <div class="a-icon" style="background:#ffe8e8;color:#E80018;">${ICON_PROC}</div>
        <div class="a-txt"><div class="a-title">Medicamentos Cardiovasculares</div><div class="a-sub">Anti-hipertensivos, inotrópicos, antiarrítmicos</div></div>
        <div class="a-chev">▾</div>
      </div>
      <div class="acc-body"><div class="acc-in">
        
        <div class="med-card"><h5>Lisinopril</h5><div class="med-classe">Antihipertensivo - Inibidor ACE</div>
          <div class="med-row"><b>Indicações:</b> hipertensão, insuficiência cardíaca, pós-enfarte do miocárdio</div>
          <div class="med-row"><b>Apresentações:</b> Comprimido 5 mg, 10 mg, 20 mg</div>
          <div class="med-row"><b>Via/Dose habitual (adulto):</b> VO 10 mg/dia (intervalo 5-40 mg/dia)</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 3</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> monitorizar tensão arterial; hipercaliemia; tosse seca frequente; risco de angioedema (raro); evitar em gravidez</div></div>

        <div class="med-card"><h5>Enalapril</h5><div class="med-classe">Antihipertensivo - Inibidor ACE</div>
          <div class="med-row"><b>Indicações:</b> hipertensão, insuficiência cardíaca sistólica</div>
          <div class="med-row"><b>Apresentações:</b> Comprimido 2,5 mg, 5 mg, 10 mg</div>
          <div class="med-row"><b>Via/Dose habitual (adulto):</b> VO 5 mg/dia (intervalo 2,5-20 mg/dia), dividido em 1-2 doses</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 3</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> tomar sem alimentos; monitor tensão, rins (creatinina, potássio); tosse seca; risco de angioedema; evitar em gravidez</div></div>

        <div class="med-card"><h5>Nifedipina</h5><div class="med-classe">Antihipertensivo - Bloqueador de canal de cálcio</div>
          <div class="med-row"><b>Indicações:</b> hipertensão, angina pectoris</div>
          <div class="med-row"><b>Apresentações:</b> Comprimido libertação imediata 10 mg, 20 mg; Comprimido libertação prolongada 30 mg, 60 mg</div>
          <div class="med-row"><b>Via/Dose habitual (adulto):</b> Libertação imediata: 10-20 mg de 8/8h; Libertação prolongada: 30-60 mg/dia</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 3</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> monitorizr tensão; não partir comprimidos LP; edema periférico; taquicardia reflexa; evitar em IAM agudo; cuidado com sumo de toranja</div></div>

        <div class="med-card"><h5>Atenolol</h5><div class="med-classe">Antihipertensivo / Antianginoso - Bloqueador beta</div>
          <div class="med-row"><b>Indicações:</b> hipertensão, angina pectoris, arritmias, pós-enfarte do miocárdio</div>
          <div class="med-row"><b>Apresentações:</b> Comprimido 25 mg, 50 mg, 100 mg</div>
          <div class="med-row"><b>Via/Dose habitual (adulto):</b> VO 25–100 mg/dia em dose única</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 3</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> não interromper bruscamente (risco de rebound); monitorizr FC e PA; fadiga, impotência; evitar em asma/DPOC grave; cuidado em diabetes</div></div>

        <div class="med-card"><h5>Furosemida</h5><div class="med-classe">Diurético - Ansa</div>
          <div class="med-row"><b>Indicações:</b> edema, hipertensão, insuficiência cardíaca, edema pulmonar agudo</div>
          <div class="med-row"><b>Apresentações:</b> Comprimido 40 mg; Injectável 10 mg/ml (ampola 4 ml)</div>
          <div class="med-row"><b>Via/Dose habitual (adulto):</b> VO 40 mg/dia (intervalo 20-600 mg/dia); IM/IV 20-40 mg, até 600 mg/dia em casos graves</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 2-3</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> monitor eletrólitos (K+, Na+, Cl-); desidratação; hipotensão; hiperuricemia; ototoxicidade (altas doses IV); dar manhã para evitar noctúria</div></div>

        <div class="med-card"><h5>Digoxina</h5><div class="med-classe">Inotrópico / Antiarríumico</div>
          <div class="med-row"><b>Indicações:</b> insuficiência cardíaca, fibrilhação auricular, flutter auricular</div>
          <div class="med-row"><b>Apresentações:</b> Comprimido 250 mcg; Solução oral 50 mcg/ml; Injectável 500 mcg/2 ml</div>
          <div class="med-row"><b>Via/Dose habitual (adulto):</b> VO dose digitalização: 500 mcg-1 mg, depois 250 mcg de 6/6h até atingir efeito; manutenção 250 mcg/dia</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 3</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> monitorizar FC (bradicardia <60 bpm é sinal de toxicidade); monitor K+ (hipocaliemia aumenta risco de toxicidade); estreita margem terapêutica; ECG; náusea, arritmias são sinais de toxicidade</div></div>

      </div></div>
    </div>

    <!-- DESINFECTANTES E ANTISÉPTICOS -->
    <div class="acc" id="medicamentos-acc-3">
      <div class="acc-head" onclick="this.parentElement.classList.toggle('open')">
        <div class="a-icon" style="background:#E6EAF1;color:var(--azul-escuro);">${ICON_PROC}</div>
        <div class="a-txt"><div class="a-title">Desinfectantes e Antisépticos</div><div class="a-sub">Limpeza, desinfecção e cuidados de feridas</div></div>
        <div class="a-chev">▾</div>
      </div>
      <div class="acc-body"><div class="acc-in">
        
        <div class="med-card"><h5>Álcool Etílico 70%</h5><div class="med-classe">Desinfectante / Antisséptico</div>
          <div class="med-row"><b>Indicações:</b> desinfecção de pele antes de injecções/punções, limpeza de equipamento</div>
          <div class="med-row"><b>Apresentações:</b> Solução 70% v/v</div>
          <div class="med-row"><b>Via/Aplicação:</b> Tópico - aplicar com algodão/gaze sobre área a desinfectar</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 1</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> deixar secar antes de punção/injecção; evitar em pele lesada; inflamável - armazenar adequadamente; odor característico</div></div>

        <div class="med-card"><h5>Clorexidina 0,5%</h5><div class="med-classe">Desinfectante / Antisséptico</div>
          <div class="med-row"><b>Indicações:</b> desinfecção da pele, feridas, cavidade oral</div>
          <div class="med-row"><b>Apresentações:</b> Solução 0,5%; Colchete para higiene oral</div>
          <div class="med-row"><b>Via/Aplicação:</b> Tópico - aplicar com algodão; enxaguatório oral</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 1</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> melhor acção que álcool em peles sujas/gordurosas; evitar contacto com olhos (irritação); descoloração de dentes com uso prolongado de enxaguante; alergia rara mas possível</div></div>

        <div class="med-card"><h5>Água Destilada/Soro Fisiológico 0,9%</h5><div class="med-classe">Solução de Limpeza / Irrigação</div>
          <div class="med-row"><b>Indicações:</b> limpeza de feridas, irrigação, preparação de medicações</div>
          <div class="med-row"><b>Apresentações:</b> Frasco 500 ml, 1L; Ampola 5 ml, 10 ml</div>
          <div class="med-row"><b>Via/Aplicação:</b> Tópico - verter sobre ferida/usar em irrigação</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 0-1</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> estéril para feridas abertas; à temperatura ambiente ou morna (não quente); manter recipiente tapado após abertura; válido até 24h após abertura se não esterilizado</div></div>

      </div></div>
    </div>

    <!-- VITAMINAS E MINERAIS -->
    <div class="acc" id="medicamentos-acc-4">
      <div class="acc-head" onclick="this.parentElement.classList.toggle('open')">
        <div class="a-icon" style="background:#EEF1F6;color:#000000;">${ICON_PROC}</div>
        <div class="a-txt"><div class="a-title">Vitaminas e Minerais</div><div class="a-sub">Suplementação nutricional e deficiências</div></div>
        <div class="a-chev">▾</div>
      </div>
      <div class="acc-body"><div class="acc-in">
        
        <div class="med-card"><h5>Vitamina A</h5><div class="med-classe">Vitamina lipossolúvel</div>
          <div class="med-row"><b>Indicações:</b> deficiência de vitamina A, sarampo, infecções recorrentes, oftalmia</div>
          <div class="med-row"><b>Apresentações:</b> Cápsula 200.000 UI; Solução oral 200.000 UI/ml</div>
          <div class="med-row"><b>Via/Dose habitual (adulto):</b> VO 200.000 UI em 2 doses, com 24h intervalo; crianças 100.000-200.000 UI segundo idade</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 1-2</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> evitar megadoses em gravidez (teratogénico); com alimentos para melhor absorção; toxicidade crónica em doses elevadas; fundamental em crianças com sarampo</div></div>

        <div class="med-card"><h5>Ácido Fólico</h5><div class="med-classe">Vitamina B9</div>
          <div class="med-row"><b>Indicações:</b> profilaxia/tratamento de deficiência de ácido fólico, anemia megaloblástica, uso de AZT/TMP-SMX</div>
          <div class="med-row"><b>Apresentações:</b> Comprimido 1 mg, 5 mg</div>
          <div class="med-row"><b>Via/Dose habitual (adulto):</b> VO 1–5 mg/dia (profilaxia em VIH geralmente 1 mg/dia)</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 1-2</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> deve ser dado antes ou simultaneamente com medicações que antagonizam folato (TMP-SMX, AZT); protege contra toxicidade; sempre com B12 se deficiência combinada</div></div>

        <div class="med-card"><h5>Sulfato de Ferro</h5><div class="med-classe">Mineral - Suplemento de Ferro</div>
          <div class="med-row"><b>Indicações:</b> deficiência de ferro, anemia ferropénica, gestação/lactação</div>
          <div class="med-row"><b>Apresentações:</b> Comprimido 300 mg (60 mg Fe); Xarope 14 mg Fe/ml; Injectável 50 mg Fe/ml</div>
          <div class="med-row"><b>Via/Dose habitual (adulto):</b> VO 300 mg/dia com vitamina C (aumenta absorção); IM/IV conforme protocolo</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 1</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> tomar com sumo de laranja (não chá/café que reduzem absorção); fezes escuras (esperado); constipação/diarreia frequentes; feridas das gengivas com comprimidos de libertação prolongada</div></div>

        <div class="med-card"><h5>Cloreto de Potássio (KCl)</h5><div class="med-classe">Mineral - Electrólito</div>
          <div class="med-row"><b>Indicações:</b> hipocaliemia, uso de diuréticos de ansa, queimaduras, diarreia crónica</div>
          <div class="med-row"><b>Apresentações:</b> Solução oral 20% (40 mEq/20 ml); Comprimido 750 mg (10 mEq) - libertação prolongada</div>
          <div class="med-row"><b>Via/Dose habitual (adulto):</b> VO 20-40 mEq/dia dividido em 2-4 doses conforme nível sérico</div>
          <div class="med-row"><b>Nível de Prescrição:</b> 2</div>
          <div class="med-row"><b>Cuidados de enfermagem:</b> monitor nível K+ sérico; dissolva solução em água (irritante ao esófago); queimação no esófago se tomado seco; risco de hiperkalemia em insuficiência renal; ECG se K+ muito elevado</div></div>

      </div></div>
    </div>

    <!-- LINK PARA PDF COMPLETO -->
    <div style="margin:12px;padding:12px;background:#EEF1F6;border-radius:8px;border-left:4px solid var(--azul-escuro);">
      <div style="font-weight:600;margin-bottom:8px;color:var(--azul-escuro);">📄 Documento Completo</div>
      <div style="font-size:12px;color:var(--texto);margin-bottom:10px;">Consulte o PDF completo da Lista Nacional de Medicamentos Essenciais de Moçambique 2017 com todas as 31 categorias terapêuticas.</div>
      <div class="ec-actions" style="margin:0;">
        <button onclick="ecOpenPdf('lnme')">🔍 Ver lista completa (PDF)</button>
        <button class="alt" onclick="ecPdfPrint('lnme')">🖨 Imprimir</button>
        <button class="alt" onclick="ecPdfDownload('lnme')">⬇ Baixar PDF</button>
      </div>
    </div>

    <div style="margin:16px 8px 60px;">
      <footer style="font-size:11px;color:var(--texto-suave);text-align:center;line-height:1.6;border-top:1px solid var(--borda);padding-top:12px;">
        <b>Conteúdo de apoio ao estudo e prática de enfermagem.</b><br>
        <b>⚠️ Responsabilidade profissional:</b> Confirme sempre no Formulário Nacional de Medicamentos, no protocolo institucional actualizado e em referências clínicas reconhecidas antes de qualquer administração. O âmbito de prática varia conforme qualificação, contexto e legislação do seu país/instituição.
      </footer>
    </div>
  `;
  document.getElementById('app').insertBefore(div, document.querySelector('.bottom-fixed'));
})();

// ================= MODO ESTUDANTE =================


// === calculator.js ===
// ===== calculator.js — Calculadoras de Enfermagem (calculadora.html) =====

function openCalc(id){
  document.querySelectorAll('.calc-panel').forEach(p=>p.classList.remove('open'));
  const panel = document.getElementById('panel-' + id);
  if(panel){
    panel.classList.add('open');
    setTimeout(()=>panel.scrollIntoView({behavior:'smooth', block:'start'}), 60);
  }
}

function closeCalc(id){
  const panel = document.getElementById('panel-' + id);
  if(panel) panel.classList.remove('open');
}

function clearCalc(id){
  const panel = document.getElementById('panel-' + id);
  if(!panel) return;
  panel.querySelectorAll('input').forEach(i=>i.value='');
  panel.querySelectorAll('.calc-result').forEach(r=>r.classList.remove('show'));
}

function showResult(prefix, value, label, warn){
  const box = document.getElementById('res-' + prefix);
  const val = document.getElementById('res-' + prefix + '-val');
  const lab = document.getElementById('res-' + prefix + '-label');
  if(!box || !val) return;
  val.textContent = value;
  if(lab && label) lab.textContent = label;
  box.classList.toggle('warn', !!warn);
  box.classList.add('show');
}

function numOr(id){
  const el = document.getElementById(id);
  const v = el ? parseFloat(el.value.replace(',','.')) : NaN;
  return isNaN(v) ? null : v;
}

// Cálculos de Medicamentos: Dose a administrar (mL) = Prescrição x Diluição / Frasco

function _bad(v,min,max){ return v===null || isNaN(v) || v<=min || (max!==undefined && v>max); }
function calcMedicamento(){
  const presc = numOr('med-presc'), dil = numOr('med-dil'), frasco = numOr('med-frasco');
  if(_bad(presc,0) || _bad(dil,0) || _bad(frasco,0)){
    showResult('cMed','Preencha todos os campos com valores maiores que zero','Dados inválidos', true); return;
  }
  const dose = (presc * dil) / frasco;
  const aviso = dose > dil ? ' ⚠ A dose excede o volume do frasco — confirme os dados.' : '';
  showResult('cMed', dose.toFixed(2) + ' mL', 'Volume a administrar.' + aviso, dose > dil);
}

// Cálculos de Infusão

function calcInfusao(){
  const vol = numOr('inf-vol'), horas = numOr('inf-tempo');
  const constante = numOr('inf-const') || 3;
  if(_bad(vol,0) || _bad(horas,0)){
    showResult('cInf','Preencha volume e tempo com valores maiores que zero','Dados inválidos', true); return;
  }
  const gtt = vol / (horas * constante);
  showResult('cInf', Math.round(gtt) + ' gtt/min', 'Gotas por minuto  (Fórmula: Volume ÷ (Tempo × ' + constante + '))');
}

// Dose por Peso

function calcDosePeso(){
  const peso = numOr('peso-kg'), dose = numOr('peso-dose'), conc = numOr('peso-conc');
  const un = document.getElementById('peso-un').value;
  if(_bad(peso,0,400) || _bad(dose,0)){
    showResult('cPeso','Peso (0–400 kg) e dose devem ser maiores que zero','Dados inválidos', true); return;
  }
  const total = peso * dose;
  let txt = total.toFixed(2) + ' ' + (un==='ml' ? 'mL' : un) + (un==='ml' ? '' : ' totais');
  let label = 'Dose total prescrita';
  if(conc && conc>0 && un!=='ml'){
    const totalMg = un==='mcg' ? total/1000 : total;
    const ml = totalMg / conc;
    label = 'Dose total: ' + total.toFixed(2) + ' ' + un + ' · equivalente a ' + ml.toFixed(2) + ' mL';
  }
  showResult('cPeso', txt, label);
}

// Diluição

function calcDiluicao(){
  const qtd = numOr('dil-qtd'), vol = numOr('dil-vol');
  if(_bad(qtd,0) || _bad(vol,0)){
    showResult('cDil','Preencha quantidade e volume com valores maiores que zero','Dados inválidos', true); return;
  }
  const conc = qtd / vol;
  showResult('cDil', conc.toFixed(2) + ' mg/mL', 'Concentração final da solução');
}

// IMC

function calcIMC(){
  const peso = numOr('imc-peso');
  let alt = numOr('imc-alt');
  if(_bad(peso,0,400) || _bad(alt,0)){
    showResult('imc','Preencha peso (kg) e altura','Dados inválidos', true); return;
  }
  if(alt > 3) alt = alt / 100;            // aceita altura em cm (ex.: 170)
  if(alt < 0.4 || alt > 2.5){
    showResult('imc','Altura fora do intervalo esperado','Introduza em metros (1.70) ou centímetros (170)', true); return;
  }
  const imc = peso / (alt*alt);
  let classe='';
  if(imc<18.5) classe='Baixo peso';
  else if(imc<25) classe='Peso normal';
  else if(imc<30) classe='Pré-obesidade';
  else if(imc<35) classe='Obesidade grau I';
  else if(imc<40) classe='Obesidade grau II';
  else classe='Obesidade grau III';
  showResult('imc', imc.toFixed(1) + ' kg/m²', classe + ' (altura usada: ' + alt.toFixed(2) + ' m)', imc<18.5 || imc>=30);
}

// Superfície corporal (Mosteller)

function calcSC(){
  const peso = numOr('sc-peso');
  let alt = numOr('sc-alt');
  if(_bad(peso,0,400) || _bad(alt,0)){
    showResult('sc','Preencha peso (kg) e altura','Dados inválidos', true); return;
  }
  if(alt < 3) alt = alt * 100;            // aceita altura em metros (ex.: 1.70)
  if(alt < 40 || alt > 250){
    showResult('sc','Altura fora do intervalo esperado','Introduza em centímetros (170) ou metros (1.70)', true); return;
  }
  const sc = Math.sqrt((alt*peso)/3600);
  showResult('sc', sc.toFixed(2) + ' m²', 'Superfície corporal estimada (Mosteller) · altura usada: ' + alt.toFixed(0) + ' cm');
}

// Glasgow

function calcGlasgow(){
  const o = numOr('gcs-o'), v = numOr('gcs-v'), m = numOr('gcs-m');
  const total = o + v + m;
  let classe='';
  if(total>=13) classe='Traumatismo crânio-encefálico ligeiro';
  else if(total>=9) classe='Traumatismo crânio-encefálico moderado';
  else classe='Traumatismo crânio-encefálico grave — via aérea prioritária';
  showResult('gcs', total + ' / 15', classe, total<13);
}

// Conversões: peso kg <-> lb

function convPeso(origem){
  if(origem==='kg'){
    const kg = numOr('conv-kg');
    document.getElementById('conv-lb').value = kg===null ? '' : (kg*2.20462).toFixed(2);
  } else {
    const lb = numOr('conv-lb');
    document.getElementById('conv-kg').value = lb===null ? '' : (lb/2.20462).toFixed(2);
  }
}
// Conversões: temperatura

function convTemp(origem){
  if(origem==='c'){
    const c = numOr('conv-c');
    document.getElementById('conv-f').value = c===null ? '' : (c*9/5+32).toFixed(1);
  } else {
    const f = numOr('conv-f');
    document.getElementById('conv-c').value = f===null ? '' : ((f-32)*5/9).toFixed(1);
  }
}
// Conversões: massa

function convMassa(){
  const val = numOr('conv-massa-val');
  const de = document.getElementById('conv-massa-de').value;
  const para = document.getElementById('conv-massa-para').value;
  if(val===null){ showResult('massa','Introduza um valor','Dados insuficientes', true); return; }
  const toG = {g:1, mg:0.001, mcg:0.000001};
  const emG = val * toG[de];
  const resultado = emG / toG[para];
  showResult('massa', resultado.toLocaleString('pt-PT',{maximumFractionDigits:6}) + ' ' + (para==='mcg'?'mcg (µg)':para), de.toUpperCase() + ' → ' + para.toUpperCase());
}
// Conversões: gotas

function convGotas(){
  const vol = numOr('conv-gtt-vol'), fator = numOr('conv-gtt-fator');
  if(vol===null){ showResult('gtt','Introduza o volume','Dados insuficientes', true); return; }
  const gotas = vol * fator;
  showResult('gtt', gotas.toLocaleString('pt-PT') + ' gotas', 'Para todo o volume (' + fator + ' gtt/mL)');
}

// Equivalência / diluição de soluções (C1*V1 = C2*V2)

function calcEquivalencia(){
  const disp = numOr('eq-disp'), desej = numOr('eq-desej'), volFinal = numOr('eq-vol');
  if(_bad(disp,0) || _bad(desej,0) || _bad(volFinal,0)){
    showResult('cEquiv','Preencha todos os campos','Dados insuficientes', true); return;
  }
  if(desej > disp){
    showResult('cEquiv','Não é possível por diluição', 'A concentração disponível (' + disp + '%) é MENOR do que a prescrita (' + desej + '%). Diluir não aumenta a concentração — contacte o prescritor/farmácia.', true);
    return;
  }
  const volSolucao = (desej * volFinal) / disp;
  const volDiluente = volFinal - volSolucao;
  showResult('cEquiv', volSolucao.toFixed(1) + ' mL da solução a ' + disp + '%', 'Complete com ' + volDiluente.toFixed(1) + ' mL de diluente (ex.: água destilada/soro) até perfazer ' + volFinal + ' mL');
}

// ===== Balanço Hídrico =====

function calcBalancoHidrico(){
  const ing = numOr('bal-ingressos'), sai = numOr('bal-saidas');
  if(ing===null && sai===null){
    showResult('bal','Preencha ingressos e/ou saídas','Dados insuficientes', true); return;
  }
  if((ing!==null && ing<0) || (sai!==null && sai<0)){
    showResult('bal','Os valores não podem ser negativos','Dados inválidos', true); return;
  }
  const balanco = (ing||0) - (sai||0);
  let estado = balanco > 200 ? 'Balanço positivo (retenção hídrica)' : balanco < -200 ? 'Balanço negativo (défice hídrico)' : 'Balanço equilibrado';
  showResult('bal', (balanco>0?'+':'') + balanco.toFixed(0) + ' mL', estado, balanco < -200 || balanco > 200);
}



// ===== Construtor genérico de vistas em acordeão =====



// === catalog.js ===
// ===== catalog.js — motor de listagem NIC/NOC (intervencoes.html e resultados.html) =====

function totalItemCountCat(data){
  let t = 0;
  data.forEach(d => d.classes.forEach(c => t += c.itens.length));
  return t;
}
function totalClassCountCat(data){
  let t = 0;
  data.forEach(d => t += d.classes.length);
  return t;
}
function createCatalog(suffix, data, opts){
  const mainEl = document.getElementById('main' + suffix);
  const statsEl = document.getElementById('stats' + suffix);
  const searchInput = document.getElementById('searchInput' + suffix);
  const clearBtn = document.getElementById('clearBtn' + suffix);
  const footerEl = document.getElementById('footer' + suffix);
  const unit = opts.unit;         // ex.: 'intervenção(ões)'
  const unitCap = opts.unitCap;   // ex.: 'Intervenções'
  const sourceLabel = opts.sourceLabel; // ex.: 'NIC — Nursing Interventions Classification'

  function render(term){
    const t = (term || '').trim();
    const nt = normalize(t);
    mainEl.innerHTML = '';
    let totalMatches = 0;

    data.forEach(dom => {
      const domainMatchesTitle = normalize(dom.dominio).includes(nt);
      let domainHasMatch = false;
      let classesHtml = '';
      let domainItemCount = 0;

      dom.classes.forEach(cls => {
        domainItemCount += cls.itens.length;
        const classMatchesTitle = normalize(cls.classe).includes(nt);
        const matched = cls.itens.filter(it => !nt || normalize(it).includes(nt) || classMatchesTitle || domainMatchesTitle);
        if(nt && matched.length === 0) return;

        domainHasMatch = domainHasMatch || matched.length > 0;
        totalMatches += matched.length;

        let itemsHtml = '';
        if(matched.length === 0){
          itemsHtml = '<li class="empty-classe">Esta classe não contém ' + unit + ' atualmente</li>';
        } else {
          matched.forEach(it => {
            itemsHtml += '<li class="diag-item">' + highlight(it, t) + '</li>';
          });
        }

        classesHtml += '<div class="classe' + (nt ? ' open' : '') + '">' +
          '<div class="classe-head" onclick="this.parentElement.classList.toggle(\'open\')">' +
            '<span class="ctitle">' + highlight(cls.classe, t) + '</span>' +
            '<span style="display:flex;align-items:center;gap:8px;">' +
              '<span class="ccount">' + matched.length + '</span>' +
              '<span class="cchev">▾</span>' +
            '</span>' +
          '</div>' +
          '<div class="classe-body"><ul class="diag-list">' + itemsHtml + '</ul></div>' +
        '</div>';
      });

      if(nt && !domainHasMatch && !domainMatchesTitle) return;

      const domainDiv = document.createElement('div');
      domainDiv.className = 'domain' + (nt ? ' open' : '');
      domainDiv.innerHTML =
        '<div class="domain-head" onclick="this.parentElement.classList.toggle(\'open\')">' +
          '<span class="title">' + highlight(dom.dominio, t) + '</span>' +
          '<span style="display:flex;align-items:center;gap:8px;">' +
            '<span class="count">' + domainItemCount + '</span>' +
            '<span class="chev">▾</span>' +
          '</span>' +
        '</div>' +
        '<div class="domain-body">' + classesHtml + '</div>';

      mainEl.appendChild(domainDiv);
    });

    if(nt && mainEl.children.length === 0){
      mainEl.innerHTML = '<div class="no-results"><div>🔍</div>Nenhum(a) ' + unit + ' encontrado(a) para<br><b>"' + t + '"</b></div>';
      statsEl.textContent = '';
    } else if(nt){
      statsEl.innerHTML = '<b>' + totalMatches + '</b> ' + unit + ' encontrado(a)(s)';
    } else {
      statsEl.innerHTML = '<b>' + data.length + '</b> Domínios · <b>' + totalClassCountCat(data) + '</b> Classes · <b>' + totalItemCountCat(data) + '</b> ' + unitCap;
    }

    if(footerEl){
      footerEl.innerHTML = 'Catálogo de referência ' + sourceLabel + ' · <b>' + data.length + ' Domínios · ' +
        totalClassCountCat(data) + ' Classes · ' + totalItemCountCat(data) + ' ' + unitCap + '</b>';
    }
  }

  searchInput.addEventListener('input', (e) => {
    const v = e.target.value;
    clearBtn.classList.toggle('show', v.length > 0);
    render(v);
  });
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.classList.remove('show');
    render('');
    searchInput.focus();
  });

  render('');
}

function setEdition(edition, suffix){
  browsers[suffix === undefined ? '' : suffix].setEdition(edition);
}

/* =====================================================================
   SUGESTÕES NIC/NOC POR DIAGNÓSTICO
   Conteúdo de referência prática (não substitui o julgamento clínico
   nem as normas da instituição). Preenche automaticamente a ficha do
   diagnóstico para que NIC/NOC nunca apareçam em branco:
   1) correspondência exacta ao nome do diagnóstico (mais específico);
   2) por palavra-chave no nome do diagnóstico;
   3) por domínio da Taxonomia (garante que há sempre conteúdo).
   ===================================================================== */


// === aprendizagem.js ===
// ===== aprendizagem.html (Modo Estudante) =====
// Usa os dados de CASOS_ESTUDO, QUIZ_FUNDAMENTOS e FLASHCARDS definidos em data-casos-estudo.js

(function(){
  const div = document.createElement('div');
  div.className = 'view';
  div.id = 'view-aprendizagem';
  div.innerHTML = `
    <div style="padding:10px 12px 0;">
      <button class="back-btn" style="background:rgba(11,31,102,.08);color:var(--azul-escuro);" onclick="showView('home')">‹ Início</button>
    </div>
    <div class="section-title" style="margin-top:14px;">Aprender</div>
    <div style="margin:0 12px 4px;font-size:12px;color:var(--texto-suave);">20 casos clínicos completos, 22 testes (20 temáticos + Fundamentos + Completo), flashcards e simulação clínica passo-a-passo, para consolidar os conteúdos de enfermagem.</div>

    <div class="study-tabs">
      <button class="study-tab active" data-tab="casos" onclick="switchStudyTab('casos')">Casos Clínicos</button>
      <button class="study-tab" data-tab="testes" onclick="switchStudyTab('testes')">Testes</button>
      <button class="study-tab" data-tab="flash" onclick="switchStudyTab('flash')">Flashcards</button>
      <button class="study-tab" data-tab="sim" onclick="switchStudyTab('sim')">Simulação</button>
    </div>

    <!-- Casos Clínicos -->
    <div class="study-pane active" id="pane-casos">
      <div style="margin:0 4px 8px;font-size:11.5px;color:var(--texto-suave);">Leia a apresentação, pense no diagnóstico prioritário e depois toque em "Ver raciocínio e análise completa" para conferir.</div>
      <div class="search-mini">
        <input type="text" placeholder="Pesquisar casos clínicos..." oninput="filterCasosEstudo(this.value)">
      </div>
      <div id="casosEstudoList"></div>
    </div>

    <!-- Testes -->
    <div class="study-pane" id="pane-testes">
      <div style="margin:0 4px 8px;font-size:11.5px;color:var(--texto-suave);">Escolha um teste temático (ligado a um dos 20 casos), o teste de fundamentos, ou o teste completo com todas as perguntas.</div>
      <div class="study-tabs" id="testeSelector" style="margin:0 0 10px;"></div>
      <div id="testeTitulo" style="margin:0 4px 8px;font-size:13px;font-weight:800;color:var(--azul-escuro);"></div>
      <div id="quizContainer"></div>
      <div class="calc-actions" style="margin:0 4px 10px;">
        <button class="calc-btn" onclick="corrigirQuiz()">Corrigir teste</button>
        <button class="calc-btn ghost" onclick="reiniciarQuiz()">Repetir</button>
      </div>
      <div class="quiz-score" id="quizScore"></div>
    </div>

    <!-- Flashcards -->
    <div class="study-pane" id="pane-flash">
      <div style="margin:0 4px 10px;font-size:11.5px;color:var(--texto-suave);">Toque no cartão para ver a resposta.</div>
      <div class="flash-grid" id="flashGrid"></div>
    </div>

    <!-- Simulação -->
    <div class="study-pane" id="pane-sim">
      <div id="simIntro">
        <div class="acc open">
          <div class="acc-head" style="cursor:default;"><div class="a-icon" style="background:#E6EAF1;color:var(--azul-escuro);">${ICON_PROC}</div><div class="a-txt"><div class="a-title">Simulação clínica</div><div class="a-sub">Escolha um caso para simular o processo de enfermagem completo</div></div></div>
          <div class="acc-body" style="max-height:2000px;"><div class="acc-in">
            <p>Percorra a <b>Avaliação → Diagnóstico → Resultados (NOC) → Intervenções (NIC)</b> de um caso clínico real, com feedback imediato em cada etapa.</p>
            <div class="search-mini" style="margin:10px 0;">
              <select id="simCasoSelect" style="width:100%;padding:11px 12px;border-radius:10px;border:1px solid var(--borda);font-size:13px;background:#fff;color:var(--texto);"></select>
            </div>
            <div class="calc-actions">
              <button class="calc-btn" onclick="simIniciar()">Iniciar simulação</button>
            </div>
          </div></div>
        </div>
      </div>
      <div id="simRunner"></div>
    </div>
  `;
  document.getElementById('app').insertBefore(div, document.querySelector('.bottom-fixed'));
})();

function switchStudyTab(tab){
  document.querySelectorAll('.study-tab').forEach(t=>{ if(t.parentElement.id!=='testeSelector') t.classList.toggle('active', t.dataset.tab===tab); });
  document.querySelectorAll('.study-pane').forEach(p=>p.classList.toggle('active', p.id==='pane-'+tab));
}

const ICONS_MAP = { ICON_SCALE, ICON_PROC, ICON_EXAM, ICON_ALERT };

// ===================== CASOS CLÍNICOS (20, interactivos) =====================
function renderCasosEstudo(){
  const el = document.getElementById('casosEstudoList');
  if(!el) return;
  el.innerHTML = CASOS_ESTUDO.map((c, i) => `
    <div class="acc" id="casoEstudo-${i}">
      <div class="acc-head" onclick="this.parentElement.classList.toggle('open')">
        <div class="a-icon" style="background:${c.bg};color:${c.fg};">${ICONS_MAP[c.icon]}</div>
        <div class="a-txt"><div class="a-title">${c.titulo}</div><div class="a-sub">${c.area} · ${c.idade}</div></div>
        <div class="a-chev">▾</div>
      </div>
      <div class="acc-body"><div class="acc-in">
        <p>${c.apresentacao}</p>
        <button class="case-toggle" onclick="this.nextElementSibling.classList.toggle('show')">Ver raciocínio e análise completa</button>
        <div class="case-answer">
          <p>${c.raciocinio}</p>
          <b style="display:block;margin-top:8px;color:var(--azul-escuro);font-size:12.5px;">Diagnósticos de Enfermagem</b>
          <ul style="font-size:12.5px;margin:6px 0 10px;">${c.diagnosticos.map(d=>`<li>${d}</li>`).join('')}</ul>
          <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Resultados Esperados (NOC)</b>
          <ul style="font-size:12.5px;margin:6px 0 10px;">${c.noc.map(n=>`<li>${n}</li>`).join('')}</ul>
          <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Intervenções de Enfermagem (NIC)</b>
          <ul style="font-size:12.5px;margin:6px 0 0;">${c.nic.map(k=>`<li>${k}</li>`).join('')}</ul>
        </div>
      </div></div>
    </div>`).join('');
}
function filterCasosEstudo(term){
  term = (term||'').trim().toLowerCase();
  document.querySelectorAll('#casosEstudoList .acc').forEach(acc=>{
    const text = _norm(acc.textContent);
    acc.style.display = (!term || text.includes(_norm(term))) ? '' : 'none';
  });
}

// ===================== TESTES (21: Fundamentos + 20 temáticos + Completo) =====================
const TESTES_MENU = [
  { id:'fund', label:'Fundamentos', perguntas: QUIZ_FUNDAMENTOS },
  ...CASOS_ESTUDO.map(c => ({ id:c.id, label:c.id, tituloLongo: c.titulo, perguntas: c.perguntas })),
  { id:'completo', label:'Completo', perguntas: QUIZ_FUNDAMENTOS.concat(...CASOS_ESTUDO.map(c=>c.perguntas)) }
];
let TESTE_ACTIVO = 'fund';
let QUIZ_PERGUNTAS = TESTES_MENU[0].perguntas;

function renderTesteSelector(){
  const el = document.getElementById('testeSelector');
  if(!el) return;
  el.innerHTML = TESTES_MENU.map(t => `<button class="study-tab${t.id===TESTE_ACTIVO?' active':''}" onclick="escolherTeste('${t.id}')">${t.label}</button>`).join('');
}
function escolherTeste(id){
  TESTE_ACTIVO = id;
  const t = TESTES_MENU.find(x=>x.id===id);
  QUIZ_PERGUNTAS = t.perguntas;
  document.getElementById('testeTitulo').textContent = (t.tituloLongo ? t.tituloLongo : (id==='fund' ? 'Teste de Fundamentos (' + t.perguntas.length + ' perguntas)' : 'Teste Completo — todas as perguntas (' + t.perguntas.length + ' perguntas)'));
  renderTesteSelector();
  renderQuiz();
}
function renderQuiz(){
  const el = document.getElementById('quizContainer');
  if(!el) return;
  el.innerHTML = QUIZ_PERGUNTAS.map((item, i) => `
    <div class="quiz-q" id="quizQ-${i}">
      <div class="qn">${i+1}. ${item.q}</div>
      ${item.opts.map((op, j) => `
        <label class="quiz-opt" id="quizOpt-${i}-${j}">
          <input type="radio" name="quiz-${i}" value="${j}"> ${op}
        </label>`).join('')}
    </div>`).join('');
  document.getElementById('quizScore').classList.remove('show');
}
function corrigirQuiz(){
  let acertos = 0;
  QUIZ_PERGUNTAS.forEach((item, i) => {
    const sel = document.querySelector('input[name="quiz-' + i + '"]:checked');
    const val = sel ? parseInt(sel.value) : -1;
    item.opts.forEach((op, j) => {
      const optEl = document.getElementById('quizOpt-' + i + '-' + j);
      optEl.classList.remove('correct','wrong');
      if(j === item.correta) optEl.classList.add('correct');
      else if(j === val) optEl.classList.add('wrong');
    });
    if(val === item.correta) acertos++;
  });
  const score = document.getElementById('quizScore');
  score.textContent = 'Resultado: ' + acertos + ' / ' + QUIZ_PERGUNTAS.length + ' correctas';
  score.classList.add('show');
}
function reiniciarQuiz(){ renderQuiz(); }

// ===================== FLASHCARDS =====================
function renderFlash(){
  const grid = document.getElementById('flashGrid');
  if(!grid) return;
  grid.innerHTML = FLASHCARDS.map((c,i) => `
    <div class="flash-card" onclick="this.classList.toggle('flip')">
      <div class="flash-inner">
        <div class="flash-face flash-front">${c.f}</div>
        <div class="flash-face flash-back">${c.v}</div>
      </div>
    </div>`).join('');
}

// ===================== SIMULAÇÃO CLÍNICA PASSO-A-PASSO =====================
const SIM = { casoIdx:0, step:0, acertos:0, respondida:false, escolhida:-1 };

function renderSimSelect(){
  const sel = document.getElementById('simCasoSelect');
  if(!sel) return;
  sel.innerHTML = CASOS_ESTUDO.map((c,i)=>`<option value="${i}">${c.titulo}</option>`).join('');
}
function simIniciar(){
  SIM.casoIdx = parseInt(document.getElementById('simCasoSelect').value);
  SIM.step = 0;
  SIM.acertos = 0;
  document.getElementById('simIntro').style.display = 'none';
  simRenderStep();
}
const SIM_ROTULOS = ['Diagnóstico de Enfermagem','Resultado Esperado (NOC)','Intervenção de Enfermagem (NIC)'];
function simRenderStep(){
  const caso = CASOS_ESTUDO[SIM.casoIdx];
  const runner = document.getElementById('simRunner');
  SIM.respondida = false;
  SIM.escolhida = -1;

  if(SIM.step >= 3){
    runner.innerHTML = `
      <div class="acc open">
        <div class="acc-head" style="cursor:default;"><div class="a-icon" style="background:${caso.bg};color:${caso.fg};">${ICONS_MAP[caso.icon]}</div><div class="a-txt"><div class="a-title">${caso.titulo}</div><div class="a-sub">Simulação concluída</div></div></div>
        <div class="acc-body" style="max-height:3000px;"><div class="acc-in">
          <div class="quiz-score show" style="margin:0 0 12px;">Resultado da simulação: ${SIM.acertos} / 3 etapas correctas</div>
          <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Diagnósticos de Enfermagem (caso completo)</b>
          <ul style="font-size:12.5px;margin:6px 0 10px;">${caso.diagnosticos.map(d=>`<li>${d}</li>`).join('')}</ul>
          <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Resultados Esperados (NOC)</b>
          <ul style="font-size:12.5px;margin:6px 0 10px;">${caso.noc.map(n=>`<li>${n}</li>`).join('')}</ul>
          <b style="display:block;color:var(--azul-escuro);font-size:12.5px;">Intervenções de Enfermagem (NIC)</b>
          <ul style="font-size:12.5px;margin:6px 0 0;">${caso.nic.map(k=>`<li>${k}</li>`).join('')}</ul>
          <div class="calc-actions" style="margin-top:14px;">
            <button class="calc-btn" onclick="simVoltarSelecao()">Simular outro caso</button>
            <button class="calc-btn ghost" onclick="simIniciar()">Repetir este caso</button>
          </div>
        </div></div>
      </div>`;
    return;
  }

  const pergunta = caso.perguntas[SIM.step];
  runner.innerHTML = `
    <div class="acc open">
      <div class="acc-head" style="cursor:default;"><div class="a-icon" style="background:${caso.bg};color:${caso.fg};">${ICONS_MAP[caso.icon]}</div><div class="a-txt"><div class="a-title">${caso.titulo}</div><div class="a-sub">Etapa ${SIM.step+1}/3 · ${SIM_ROTULOS[SIM.step]}</div></div></div>
      <div class="acc-body" style="max-height:3000px;"><div class="acc-in">
        <div class="info-box"><b>Avaliação (dados do doente):</b><br>${caso.apresentacao}</div>
        <div class="quiz-q" style="margin-top:10px;">
          <div class="qn">${pergunta.q}</div>
          ${pergunta.opts.map((op,j)=>`<label class="quiz-opt" id="simOpt-${j}" onclick="simResponder(${j})"><input type="radio" name="sim-op" value="${j}"> ${op}</label>`).join('')}
        </div>
        <div id="simFeedback"></div>
        <div class="calc-actions" style="margin-top:10px;">
          <button class="calc-btn" id="simSeguinteBtn" onclick="simSeguinte()" disabled>Seguinte</button>
        </div>
      </div></div>
    </div>`;
}
function simResponder(j){
  if(SIM.respondida) return;
  SIM.respondida = true;
  SIM.escolhida = j;
  const caso = CASOS_ESTUDO[SIM.casoIdx];
  const pergunta = caso.perguntas[SIM.step];
  pergunta.opts.forEach((op,k)=>{
    const el = document.getElementById('simOpt-'+k);
    if(k===pergunta.correta) el.classList.add('correct');
    else if(k===j) el.classList.add('wrong');
  });
  const acertou = (j === pergunta.correta);
  if(acertou) SIM.acertos++;
  const fb = document.getElementById('simFeedback');
  fb.innerHTML = `<div class="case-answer show" style="margin-top:10px;">${acertou ? '<b>Correcto.</b> ' : '<b>Não é a melhor opção.</b> '}${SIM.step===0 ? caso.raciocinio : 'Reveja o caso completo no final da simulação para consolidar NOC e NIC.'}</div>`;
  document.getElementById('simSeguinteBtn').disabled = false;
}
function simSeguinte(){
  SIM.step++;
  simRenderStep();
}
function simVoltarSelecao(){
  document.getElementById('simRunner').innerHTML = '';
  document.getElementById('simIntro').style.display = '';
}

renderCasosEstudo();
renderTesteSelector();
document.getElementById('testeTitulo').textContent = 'Teste de Fundamentos (' + QUIZ_PERGUNTAS.length + ' perguntas)';
renderQuiz();
renderFlash();
renderSimSelect();


// === init-biblioteca.js ===
// (placeholder antigo da Biblioteca removido: a Biblioteca é construída acima)


// === init-especialidades.js ===
buildPlaceholderView('especialidades', 'Especialidades', 'Conteúdos organizados por especialidade em enfermagem (Pediatria, Obstetrícia, Saúde Mental, entre outras). Secção em desenvolvimento.', null, null);


// === init-intervencoes.js ===
createCatalog('3', DATA_NIC, {
  unit: 'intervenção(ões)',
  unitCap: 'Intervenções',
  sourceLabel: 'NIC — Nursing Interventions Classification'
});


// === init-resultados.js ===
createCatalog('4', DATA_NOC, {
  unit: 'resultado(s)',
  unitCap: 'Resultados',
  sourceLabel: 'NOC — Nursing Outcomes Classification'
});
