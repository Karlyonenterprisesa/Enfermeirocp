showView('processo');

function toggleProcSection(id){
  const el = document.getElementById('sec-' + id);
  if(el) el.classList.toggle('open');
}

let diagCount = 3;
function addDiagBlock(){
  const nhbOptions = `<option value="">Seleccionar NHB...</option>
    <option>Oxigenação</option><option>Circulação</option><option>Nutrição e Hidratação</option>
    <option>Eliminação</option><option>Sono e Repouso</option><option>Actividade e Exercício</option>
    <option>Regulação Térmica</option><option>Integridade Cutânea e Mucosas</option>
    <option>Segurança</option><option>Comunicação</option><option>Afecto e Psicossocial</option>
    <option>Auto-imagem</option><option>Espiritualidade</option><option>Educação/Aprendizagem</option>`;
  const block = document.createElement('div');
  block.className = 'diag-block';
  block.style.cssText = 'border:1px solid var(--borda);border-radius:12px;padding:14px;margin-bottom:14px;background:#F7F8FB;';
  block.innerHTML = `
    <div style="font-size:12px;font-weight:800;color:var(--vermelho);margin-bottom:10px;text-transform:uppercase;">Diagnóstico de Enfermagem ${diagCount}</div>
    <div class="proc-field"><label>NHB</label><select class="nhb-select">${nhbOptions}</select></div>
    <div class="proc-field"><label><span class="ce-tag diag">NANDA-I</span> Diagnóstico de Enfermagem</label><input type="text" placeholder="Formulação PES: diagnóstico relacionado com... evidenciado por..."></div>
    <div class="proc-field"><label>Objectivo / Resultado esperado</label><textarea placeholder="Objectivo mensurável e com prazo definido..."></textarea></div>
    <div class="proc-field"><label><span class="ce-tag nic">NIC</span> Intervenções de Enfermagem / Cuidados de Enfermagem</label><textarea style="min-height:100px;" placeholder="Liste as intervenções numeradas..."></textarea></div>
    <div class="proc-field"><label><span class="ce-tag noc">NOC</span> Resultados Esperados e Indicadores</label><textarea style="min-height:80px;" placeholder="Indicadores mensuráveis e prazo de avaliação..."></textarea></div>
    <div class="proc-field"><label>Tempo / Justificativa</label><textarea placeholder="Prazo de reavaliação e justificativa científica..."></textarea></div>`;
  document.getElementById('diag-container').appendChild(block);
  diagCount++;
}

function addMedRow(){
  const tr = document.createElement('tr');
  tr.innerHTML = `<td><textarea></textarea></td><td><textarea></textarea></td><td><textarea></textarea></td><td><textarea></textarea></td><td><textarea></textarea></td><td><textarea></textarea></td>`;
  document.getElementById('med-tbody').appendChild(tr);
}
