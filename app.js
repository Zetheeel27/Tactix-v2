
// Effet texte "taper"
const title = document.getElementById('login-title');
const text = "Accès TACTIX sécurisé";
let idx = 0;
function typeText() {
  if(idx < text.length) { title.innerHTML += text[idx]; idx++; setTimeout(typeText,100); }
}
typeText();

// Gestion mot de passe
function checkPassword() {
  const pw = document.getElementById('password').value;
  if(pw === 'TACTIX-Admin-Z' || localStorage.getItem('bypassPassword') === 'true') {
    document.getElementById('login-screen').style.display='none';
    document.getElementById('dashboard').style.display='block';
  } else { alert('Mot de passe incorrect'); }
}
function disablePassword() { localStorage.setItem('bypassPassword','true'); alert('Mot de passe désactivé'); }
function enablePassword() { localStorage.removeItem('bypassPassword'); alert('Mot de passe réactivé'); }
