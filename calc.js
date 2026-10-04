// ===== calculator.js — Calculadoras de Enfermagem (calculadora.html) =====

function openCalc(id){
  document.querySelectorAll('.calc-panel').forEach(p=>p.classList.remove('open'));
  const panel = document.getElementById('panel-' + id);
  if(panel){
    panel.classList.add('open');
    setTimeout(()=>panel.scrollIntoView({behavior:'smooth', block:'start'}), 60);
  }
}

function closeCalc(id){
  const panel = document.getElementById('panel-' + id);
  if(panel) panel.classList.remove('open');
}

function clearCalc(id){
  const panel = document.getElementById('panel-' + id);
  if(!panel) return;
  panel.querySelectorAll('input').forEach(i=>i.value='');
  panel.querySelectorAll('.calc-result').forEach(r=>r.classList.remove('show'));
}

function showResult(prefix, value, label, warn){
  const box = document.getElementById('res-' + prefix);
  const val = document.getElementById('res-' + prefix + '-val');
  const lab = document.getElementById('res-' + prefix + '-label');
  if(!box || !val) return;
  val.textContent = value;
  if(lab && label) lab.textContent = label;
  box.classList.toggle('warn', !!warn);
  box.classList.add('show');
}

function numOr(id){
  const el = document.getElementById(id);
  const v = el ? parseFloat(el.value.replace(',','.')) : NaN;
  return isNaN(v) ? null : v;
}

// Cálculos de Medicamentos: Dose a administrar (mL) = Prescrição x Diluição / Frasco

function _bad(v,min,max){ return v===null || isNaN(v) || v<=min || (max!==undefined && v>max); }
function calcMedicamento(){
  const presc = numOr('med-presc'), dil = numOr('med-dil'), frasco = numOr('med-frasco');
  if(_bad(presc,0) || _bad(dil,0) || _bad(frasco,0)){
    showResult('cMed','Preencha todos os campos com valores maiores que zero','Dados inválidos', true); return;
  }
  const dose = (presc * dil) / frasco;
  const aviso = dose > dil ? ' ⚠ A dose excede o volume do frasco — confirme os dados.' : '';
  showResult('cMed', dose.toFixed(2) + ' mL', 'Volume a administrar.' + aviso, dose > dil);
}

// Cálculos de Infusão

function calcInfusao(){
  const vol = numOr('inf-vol'), horas = numOr('inf-tempo');
  const constante = numOr('inf-const') || 3;
  if(_bad(vol,0) || _bad(horas,0)){
    showResult('cInf','Preencha volume e tempo com valores maiores que zero','Dados inválidos', true); return;
  }
  const gtt = vol / (horas * constante);
  showResult('cInf', Math.round(gtt) + ' gtt/min', 'Gotas por minuto  (Fórmula: Volume ÷ (Tempo × ' + constante + '))');
}

// Dose por Peso

function calcDosePeso(){
  const peso = numOr('peso-kg'), dose = numOr('peso-dose'), conc = numOr('peso-conc');
  const un = document.getElementById('peso-un').value;
  if(_bad(peso,0,400) || _bad(dose,0)){
    showResult('cPeso','Peso (0–400 kg) e dose devem ser maiores que zero','Dados inválidos', true); return;
  }
  const total = peso * dose;
  let txt = total.toFixed(2) + ' ' + (un==='ml' ? 'mL' : un) + (un==='ml' ? '' : ' totais');
  let label = 'Dose total prescrita';
  if(conc && conc>0 && un!=='ml'){
    const totalMg = un==='mcg' ? total/1000 : total;
    const ml = totalMg / conc;
    label = 'Dose total: ' + total.toFixed(2) + ' ' + un + ' · equivalente a ' + ml.toFixed(2) + ' mL';
  }
  showResult('cPeso', txt, label);
}

// Diluição

function calcDiluicao(){
  const qtd = numOr('dil-qtd'), vol = numOr('dil-vol');
  if(_bad(qtd,0) || _bad(vol,0)){
    showResult('cDil','Preencha quantidade e volume com valores maiores que zero','Dados inválidos', true); return;
  }
  const conc = qtd / vol;
  showResult('cDil', conc.toFixed(2) + ' mg/mL', 'Concentração final da solução');
}

// IMC

function calcIMC(){
  const peso = numOr('imc-peso');
  let alt = numOr('imc-alt');
  if(_bad(peso,0,400) || _bad(alt,0)){
    showResult('imc','Preencha peso (kg) e altura','Dados inválidos', true); return;
  }
  if(alt > 3) alt = alt / 100;            // aceita altura em cm (ex.: 170)
  if(alt < 0.4 || alt > 2.5){
    showResult('imc','Altura fora do intervalo esperado','Introduza em metros (1.70) ou centímetros (170)', true); return;
  }
  const imc = peso / (alt*alt);
  let classe='';
  if(imc<18.5) classe='Baixo peso';
  else if(imc<25) classe='Peso normal';
  else if(imc<30) classe='Pré-obesidade';
  else if(imc<35) classe='Obesidade grau I';
  else if(imc<40) classe='Obesidade grau II';
  else classe='Obesidade grau III';
  showResult('imc', imc.toFixed(1) + ' kg/m²', classe + ' (altura usada: ' + alt.toFixed(2) + ' m)', imc<18.5 || imc>=30);
}

// Superfície corporal (Mosteller)

function calcSC(){
  const peso = numOr('sc-peso');
  let alt = numOr('sc-alt');
  if(_bad(peso,0,400) || _bad(alt,0)){
    showResult('sc','Preencha peso (kg) e altura','Dados inválidos', true); return;
  }
  if(alt < 3) alt = alt * 100;            // aceita altura em metros (ex.: 1.70)
  if(alt < 40 || alt > 250){
    showResult('sc','Altura fora do intervalo esperado','Introduza em centímetros (170) ou metros (1.70)', true); return;
  }
  const sc = Math.sqrt((alt*peso)/3600);
  showResult('sc', sc.toFixed(2) + ' m²', 'Superfície corporal estimada (Mosteller) · altura usada: ' + alt.toFixed(0) + ' cm');
}

// Glasgow

function calcGlasgow(){
  const o = numOr('gcs-o'), v = numOr('gcs-v'), m = numOr('gcs-m');
  const total = o + v + m;
  let classe='';
  if(total>=13) classe='Traumatismo crânio-encefálico ligeiro';
  else if(total>=9) classe='Traumatismo crânio-encefálico moderado';
  else classe='Traumatismo crânio-encefálico grave — via aérea prioritária';
  showResult('gcs', total + ' / 15', classe, total<13);
}

// Conversões: peso kg <-> lb

function convPeso(origem){
  if(origem==='kg'){
    const kg = numOr('conv-kg');
    document.getElementById('conv-lb').value = kg===null ? '' : (kg*2.20462).toFixed(2);
  } else {
    const lb = numOr('conv-lb');
    document.getElementById('conv-kg').value = lb===null ? '' : (lb/2.20462).toFixed(2);
  }
}
// Conversões: temperatura

function convTemp(origem){
  if(origem==='c'){
    const c = numOr('conv-c');
    document.getElementById('conv-f').value = c===null ? '' : (c*9/5+32).toFixed(1);
  } else {
    const f = numOr('conv-f');
    document.getElementById('conv-c').value = f===null ? '' : ((f-32)*5/9).toFixed(1);
  }
}
// Conversões: massa

function convMassa(){
  const val = numOr('conv-massa-val');
  const de = document.getElementById('conv-massa-de').value;
  const para = document.getElementById('conv-massa-para').value;
  if(val===null){ showResult('massa','Introduza um valor','Dados insuficientes', true); return; }
  const toG = {g:1, mg:0.001, mcg:0.000001};
  const emG = val * toG[de];
  const resultado = emG / toG[para];
  showResult('massa', resultado.toLocaleString('pt-PT',{maximumFractionDigits:6}) + ' ' + (para==='mcg'?'mcg (µg)':para), de.toUpperCase() + ' → ' + para.toUpperCase());
}
// Conversões: gotas

function convGotas(){
  const vol = numOr('conv-gtt-vol'), fator = numOr('conv-gtt-fator');
  if(vol===null){ showResult('gtt','Introduza o volume','Dados insuficientes', true); return; }
  const gotas = vol * fator;
  showResult('gtt', gotas.toLocaleString('pt-PT') + ' gotas', 'Para todo o volume (' + fator + ' gtt/mL)');
}

// Equivalência / diluição de soluções (C1*V1 = C2*V2)

function calcEquivalencia(){
  const disp = numOr('eq-disp'), desej = numOr('eq-desej'), volFinal = numOr('eq-vol');
  if(_bad(disp,0) || _bad(desej,0) || _bad(volFinal,0)){
    showResult('cEquiv','Preencha todos os campos','Dados insuficientes', true); return;
  }
  if(desej > disp){
    showResult('cEquiv','Não é possível por diluição', 'A concentração disponível (' + disp + '%) é MENOR do que a prescrita (' + desej + '%). Diluir não aumenta a concentração — contacte o prescritor/farmácia.', true);
    return;
  }
  const volSolucao = (desej * volFinal) / disp;
  const volDiluente = volFinal - volSolucao;
  showResult('cEquiv', volSolucao.toFixed(1) + ' mL da solução a ' + disp + '%', 'Complete com ' + volDiluente.toFixed(1) + ' mL de diluente (ex.: água destilada/soro) até perfazer ' + volFinal + ' mL');
}

// ===== Balanço Hídrico =====

function calcBalancoHidrico(){
  const ing = numOr('bal-ingressos'), sai = numOr('bal-saidas');
  if(ing===null && sai===null){
    showResult('bal','Preencha ingressos e/ou saídas','Dados insuficientes', true); return;
  }
  if((ing!==null && ing<0) || (sai!==null && sai<0)){
    showResult('bal','Os valores não podem ser negativos','Dados inválidos', true); return;
  }
  const balanco = (ing||0) - (sai||0);
  let estado = balanco > 200 ? 'Balanço positivo (retenção hídrica)' : balanco < -200 ? 'Balanço negativo (défice hídrico)' : 'Balanço equilibrado';
  showResult('bal', (balanco>0?'+':'') + balanco.toFixed(0) + ' mL', estado, balanco < -200 || balanco > 200);
}



// ===== Construtor genérico de vistas em acordeão =====


