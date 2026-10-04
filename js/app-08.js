(function(){
  var splash = document.getElementById('founderSplash');
  var timer = null;
  function openSplash(){
    if(!splash) return;
    splash.classList.add('open');
    timer = setTimeout(closeFounderSplash, 15000);
  }
  window.closeFounderSplash = function(){
    if(!splash) return;
    splash.classList.remove('open');
    if(timer) clearTimeout(timer);
  };
  setTimeout(openSplash, 300);
})();
