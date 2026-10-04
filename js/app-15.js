/* ===== Divisores com estrelas (inseridos automaticamente) ===== */
(function(){
  var SP='<svg class="sp" viewBox="0 0 24 24"><path d="M12 2l1.8 8.2L22 12l-8.2 1.8L12 22l-1.8-8.2L2 12l8.2-1.8z"/></svg>';
  var SM='<svg class="sm" viewBox="0 0 24 24"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.8-6.3 3.8 1.7-7L2 9.2l7.1-.6z"/></svg>';
  var ST='<svg class="st" viewBox="0 0 24 24"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.8-6.3 3.8 1.7-7L2 9.2l7.1-.6z"/></svg>';
  function mk(){ var d=document.createElement('div'); d.className='star-divider'; d.setAttribute('aria-hidden','true'); d.innerHTML='<i></i>'+SM+SP+ST+SP+SM+'<i></i>'; return d; }
  function before(el){ var p=el.previousElementSibling; if(p && p.classList.contains('star-divider')) return; el.parentNode.insertBefore(mk(), el); }
  document.querySelectorAll('.view').forEach(function(v){
    var titles=v.querySelectorAll('.section-title');
    titles.forEach(function(t,i){ if(i>0) before(t); });
    var sm=v.querySelector('.search-mini'); if(sm) before(sm);
  });
  var bf=document.querySelector('.brand-footer'); if(bf) before(bf);
})();

/* ===== PWA: registar service worker (só em http/https) ===== */
if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){
  window.addEventListener('load',function(){ navigator.serviceWorker.register('/sw.js').catch(function(){}); });
}

/* ===== Formulário do Processo: guardar, restaurar, imprimir, limpar ===== */
(function(){
  var KEY='ec_proc_form_v1', timer=null;
  function fields(){ return Array.prototype.slice.call(document.querySelectorAll('#view-proc-form .proc-form input, #view-proc-form .proc-form textarea, #view-proc-form .proc-form select')); }
  function msg(t){ var m=document.getElementById('procSaveMsg'); if(!m) return; m.textContent=t; clearTimeout(m._h); m._h=setTimeout(function(){ m.textContent=''; },2200); }
  window.procSave=function(manual){
    try{
      var data={ diag:document.querySelectorAll('#diag-container .diag-block').length, meds:document.querySelectorAll('#med-tbody tr').length,
        v:fields().map(function(f){ return (f.type==='checkbox'||f.type==='radio') ? (f.checked?'1':'0') : f.value; }) };
      localStorage.setItem(KEY,JSON.stringify(data));
      if(manual) msg('Guardado ✓');
    }catch(e){ msg('Não foi possível guardar neste dispositivo.'); }
  };
  function restore(){
    try{
      var raw=localStorage.getItem(KEY); if(!raw) return;
      var d=JSON.parse(raw);
      while(document.querySelectorAll('#diag-container .diag-block').length<d.diag) addDiagBlock();
      while(document.querySelectorAll('#med-tbody tr').length<d.meds) addMedRow();
      fields().forEach(function(f,i){
        if(i>=d.v.length) return;
        if(f.type==='checkbox'||f.type==='radio') f.checked=(d.v[i]==='1'); else f.value=d.v[i];
      });
    }catch(e){}
  }
  window.procPrint=function(){
    document.querySelectorAll('#view-proc-form .proc-section').forEach(function(x){ x.classList.add('open'); });
    var tas=Array.prototype.slice.call(document.querySelectorAll('#view-proc-form textarea')), old=tas.map(function(t){ return t.style.height; });
    tas.forEach(function(t){ t.style.height='auto'; t.style.height=(t.scrollHeight+4)+'px'; });
    document.body.classList.add('print-proc');
    var done=function(){ document.body.classList.remove('print-proc'); tas.forEach(function(t,i){ t.style.height=old[i]; }); window.removeEventListener('afterprint',done); };
    window.addEventListener('afterprint',done);
    window.print();
  };
  window.procClear=function(){
    if(!confirm('Limpar todos os campos do Processo de Enfermagem neste dispositivo?')) return;
    try{ localStorage.removeItem(KEY); }catch(e){}
    fields().forEach(function(f){ if(f.type==='checkbox'||f.type==='radio') f.checked=false; else if(f.tagName==='SELECT') f.selectedIndex=0; else f.value=''; });
    msg('Formulário limpo');
  };
  restore();
  var form=document.getElementById('view-proc-form');
  if(form){
    var sched=function(){ clearTimeout(timer); timer=setTimeout(function(){ window.procSave(false); },700); };
    form.addEventListener('input',sched); form.addEventListener('change',sched);
  }
})();
