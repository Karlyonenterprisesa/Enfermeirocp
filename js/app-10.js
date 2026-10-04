/* Home: mostra os mesmos 5 cards de imagem do Processo de Enfermagem (sem duplicar as imagens no ficheiro). */
(function(){
  var src=document.querySelector('#view-processo .proc-img-list'), dst=document.getElementById('homeProcImgs');
  if(!src||!dst) return;
  Array.prototype.forEach.call(src.children,function(c){ dst.appendChild(c.cloneNode(true)); });
})();
