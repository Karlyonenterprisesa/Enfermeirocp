  (function(){
    var splash = document.getElementById('founderSplash');
    var timer = null;
    function openSplash(){
      if(!splash) return;
      splash.classList.add('open');
      timer = setTimeout(closeFounderSplash, 45000);
      splash.addEventListener('touchstart',function(){ if(timer){clearTimeout(timer);timer=null;} },{once:true,passive:true});
      splash.addEventListener('click',function(){ if(timer){clearTimeout(timer);timer=null;} },{once:true});
    }
    window.closeFounderSplash = function(){
      if(!splash) return;
      splash.classList.remove('open');
      if(timer) clearTimeout(timer);
    };
    setTimeout(openSplash, 300);
  })();
