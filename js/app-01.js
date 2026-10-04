function showToast(msg){
  var t=document.getElementById('appToast');
  if(!t){t=document.createElement('div');t.id='appToast';t.setAttribute('role','status');t.setAttribute('aria-live','polite');document.body.appendChild(t);}
  t.textContent=msg;t.classList.add('show');
  clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove('show');},4200);
}
