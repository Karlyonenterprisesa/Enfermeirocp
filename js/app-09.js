/* Espaço reservado ao topo = altura real do cabeçalho fixo. */
(function(){
  var bar=document.querySelector('.top-fixed'); if(!bar) return;
  function fitTop(){ document.documentElement.style.setProperty('--top-h',(bar.offsetHeight+8)+'px'); }
  window.addEventListener('resize',fitTop); window.addEventListener('load',fitTop); fitTop();
})();
