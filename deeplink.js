/* O Enfermeiro CP — ligações profundas para a app.
   As páginas públicas abrem a app já na secção certa:
   /?v=escalas&i=1  ·  /?v=calculadora&calc=cMed  ·  /?v=diagnosticos&d=Dor%20aguda  ·  /?v=medicamentos */
(function () {
  var p = new URLSearchParams(location.search), v = p.get('v');
  if (!v) return;
  function go() {
    try {
      if (typeof showView === 'function') showView(v);
      var calc = p.get('calc');
      if (calc && typeof openCalc === 'function') openCalc(calc);
      var i = p.get('i');
      if (i !== null) { var el = document.getElementById(v + '-acc-' + i); if (el) { el.classList.add('open'); setTimeout(function () { el.scrollIntoView({ block: 'start' }); }, 80); } }
      var d = p.get('d');
      if (d && typeof DATA_2024 !== 'undefined' && typeof openDiagCard === 'function') {
        for (var a = 0; a < DATA_2024.length; a++) for (var b = 0; b < DATA_2024[a].classes.length; b++) {
          if (DATA_2024[a].classes[b].diagnosticos.indexOf(d) > -1) { openDiagCard(DATA_2024[a].dominio, DATA_2024[a].classes[b].classe, d); return; }
        }
      }
    } catch (e) {}
  }
  if (document.readyState === 'complete') setTimeout(go, 60); else window.addEventListener('load', function () { setTimeout(go, 60); });
})();
