/* Cada secção da app tem o seu próprio título (separador do navegador / histórico) */
(function(){
  var T={ferramentas:'Ferramentas',processo:'Processo de Enfermagem','proc-form':'Processo de Enfermagem do Adulto',especialidades:'Especialidades',biblioteca:'Biblioteca','casos-clinicos':'Casos Clínicos',diagnosticos:'Diagnósticos de Enfermagem',intervencoes:'Intervenções de Enfermagem (NIC)',resultados:'Resultados de Enfermagem (NOC)',calculadora:'Calculadoras de Enfermagem',sobre:'Sobre',ajuda:'Ajuda',contactos:'Contacto',privacidade:'Privacidade',termos:'Termos de Uso','aviso-medico':'Aviso Médico',cookies:'Cookies',rss:'RSS'};
  var base=document.title, orig=window.showView;
  if(typeof orig!=='function')return;
  window.showView=function(n){
    var r=orig.apply(this,arguments);
    try{document.title=T[n]?T[n]+' | Enfermeiro Competente':base;}catch(e){}
    return r;
  };
})();
