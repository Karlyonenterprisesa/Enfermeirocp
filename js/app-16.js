/* Justifica automaticamente blocos de texto corrido (>= 60 caracteres) que não sejam títulos, botões ou texto centrado */
(function(){
  var SKIP='button,a.btn,h1,h2,h3,h4,.section-title,.brand-footer,.nav-item,.bottom-nav,select,input,textarea,label,th,.drawer,.cr-val,.cr-label,.calc-result';
  function run(){
    var els=document.querySelectorAll('.view div,.view p,.view li,.view span,.view td,.founder-splash-card div,.founder-splash-card p,.info-modal div,.info-modal p');
    for(var i=0;i<els.length;i++){
      var el=els[i],t='';
      for(var n=el.firstChild;n;n=n.nextSibling){if(n.nodeType===3)t+=n.nodeValue;}
      if(t.replace(/\s+/g,' ').trim().length<60)continue;
      if(el.closest&&el.closest(SKIP))continue;
      var ta=getComputedStyle(el).textAlign;
      if(ta==='center'||ta==='right'||ta==='end')continue;
      el.classList.add('ec-just');
    }
  }
  var timer;
  function later(){clearTimeout(timer);timer=setTimeout(function(){run()},120);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  window.addEventListener('load',run);
  new MutationObserver(later).observe(document.documentElement,{childList:true,subtree:true});
})();
