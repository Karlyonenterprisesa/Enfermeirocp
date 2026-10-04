/* Teclado/leitores de ecrã: elementos clicáveis que não são <button>/<a> passam a ser focáveis e activam com Enter/Espaço */
(function(){
  var SEL='.home-card,.tool-card,.acc-head,.domain-head,.classe-head,.diag-item,.gallery-item img,.case-toggle,.drawer-links li';
  function enhance(){
    document.querySelectorAll(SEL).forEach(function(el){
      if(el.dataset.kb) return; el.dataset.kb='1';
      if(el.matches('button,a,input,select,textarea')) return;
      el.setAttribute('role','button'); if(!el.hasAttribute('tabindex')) el.tabIndex=0;
      if(el.classList.contains('acc-head')){ var acc=el.parentElement; el.setAttribute('aria-expanded',acc.classList.contains('open')?'true':'false'); el.addEventListener('click',function(){el.setAttribute('aria-expanded',acc.classList.contains('open')?'true':'false');}); }
    });
  }
  document.addEventListener('keydown',function(e){
    if((e.key==='Enter'||e.key===' ')&&e.target&&e.target.getAttribute&&e.target.getAttribute('role')==='button'&&!/^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)){e.preventDefault();e.target.click();}
  });
  var t;function sched(){clearTimeout(t);t=setTimeout(enhance,250);}
  window.addEventListener('load',function(){enhance();setTimeout(enhance,800);});
  new MutationObserver(sched).observe(document.body,{childList:true,subtree:true});
})();
