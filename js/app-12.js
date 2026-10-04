/* Contorno de cada imagem com a cor dominante das suas bordas (fica invisível/integrado na imagem) */
(function(){
  function edgeColor(img){
    try{
      var w=24,h=24,c=document.createElement('canvas');c.width=w;c.height=h;
      var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(img,0,0,w,h);
      var d=x.getImageData(0,0,w,h).data,r=0,g=0,b=0,n=0;
      for(var j=0;j<h;j++)for(var i=0;i<w;i++){
        if(i>1&&i<w-2&&j>1&&j<h-2)continue;
        var k=(j*w+i)*4;r+=d[k];g+=d[k+1];b+=d[k+2];n++;
      }
      r=Math.round(r/n);g=Math.round(g/n);b=Math.round(b/n);
      if(r>240&&g>240&&b>240){r=g=b=255;}
      return 'rgb('+r+','+g+','+b+')';
    }catch(e){return null;}
  }
  function paint(img){
    if(img.dataset.edge) return;
    var col=edgeColor(img); if(!col) return;
    img.dataset.edge=col;
    var gi=img.closest('.gallery-item');
    if(gi){ img.style.borderColor=col; return; }
    var card=img.closest('.proc-img-card,.process-image-card');
    if(card){ card.style.background=col; card.style.borderColor=col; }
  }
  function run(){
    document.querySelectorAll('.gallery-item img,.proc-img-card img,.process-image-card img').forEach(function(img){
      if(img.complete&&img.naturalWidth) paint(img); else img.addEventListener('load',function(){paint(img);},{once:true});
    });
  }
  window.addEventListener('load',function(){run();setTimeout(run,600);setTimeout(run,1800);});
  var t;new MutationObserver(function(){clearTimeout(t);t=setTimeout(run,200);}).observe(document.body,{childList:true,subtree:true});
})();
