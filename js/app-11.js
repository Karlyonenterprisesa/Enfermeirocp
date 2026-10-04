/* Faixa horizontal dos cards do Processo: desliza sozinha devagar (vai e volta),
   pára ao tocar/arrastar e retoma uns segundos depois. */
(function(){
  if(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.proc-img-list:not(.quick-strip)').forEach(function(el){
    var pos=0, dir=1, paused=false, timer=null;
    function pause(){ paused=true; clearTimeout(timer); }
    function resume(){ clearTimeout(timer); timer=setTimeout(function(){ pos=el.scrollLeft; paused=false; },2500); }
    ['touchstart','pointerdown','wheel','mouseenter'].forEach(function(e){ el.addEventListener(e,pause,{passive:true}); });
    ['touchend','touchcancel','pointerup','mouseleave'].forEach(function(e){ el.addEventListener(e,resume,{passive:true}); });
    el.addEventListener('click',function(){ pause(); resume(); });
    function step(){
      if(!paused && el.offsetParent!==null){
        var max=el.scrollWidth-el.clientWidth;
        if(max>0){
          pos+=0.4*dir;
          if(pos>=max){pos=max;dir=-1;} else if(pos<=0){pos=0;dir=1;}
          el.scrollLeft=pos;
        }
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
})();
