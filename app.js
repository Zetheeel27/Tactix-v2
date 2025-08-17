// ===== THEME =====
const themeSwitch = document.getElementById('themeSwitch');
themeSwitch?.addEventListener('click', () => {
  document.body.classList.toggle('light');
});

// Optional light theme vars (inline for brevity)
const style = document.createElement('style');
style.textContent = `
  body.light {
    --bg: #f7f8ff;
    --panel: rgba(0,0,0,0.04);
    --panel-strong: rgba(0,0,0,0.08);
    --text: #0b0d16;
    --muted: #3a3f5b;
    --accent: #0071ff;
    --accent2: #7c2cff;
    background: radial-gradient(1200px 600px at 20% 0%, rgba(0,113,255,0.08), transparent),
                radial-gradient(800px 400px at 100% 40%, rgba(124,44,255,0.08), transparent),
                var(--bg);
  }
`;
document.head.appendChild(style);

// ===== 3D BACKGROUND (Three.js) =====
let threeEnabled = true;
const threeState = document.getElementById('threeState');
const canvas = document.getElementById('bg3d');

let scene, camera, renderer, globe, points, ring;
function init3D() {
  if (!window.THREE) return;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 28);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Wireframe globe
  const geo = new THREE.SphereGeometry(12, 32, 24);
  const mat = new THREE.MeshBasicMaterial({ color: 0x41f7ff, wireframe: true, transparent: true, opacity: 0.15 });
  globe = new THREE.Mesh(geo, mat);
  scene.add(globe);

  // Radar ring
  const ringGeo = new THREE.RingGeometry(11.6, 12.4, 64);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x41f7ff, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
  ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);

  // Particles
  const pGeo = new THREE.BufferGeometry();
  const COUNT = 800;
  const pos = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const r = 40 * Math.random();
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pos[i*3+0] = r * Math.sin(phi) * Math.cos(theta);
    pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i*3+2] = r * Math.cos(phi);
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pMat = new THREE.PointsMaterial({ size: 0.05, color: 0xb14bff, transparent: true, opacity: 0.8 });
  points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  animate();
}

function animate() {
  if (!renderer) return;
  requestAnimationFrame(animate);
  if (threeEnabled) {
    globe.rotation.y += 0.0009;
    points.rotation.y -= 0.0006;
    ring.rotation.z += 0.002;
  }
  renderer.render(scene, camera);
}

function onResize() {
  if (!renderer || !camera) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);

init3D();

document.getElementById('toggle3d')?.addEventListener('click', () => {
  threeEnabled = !threeEnabled;
  threeState.textContent = threeEnabled ? 'ON' : 'OFF';
});

document.getElementById('pulseRadar')?.addEventListener('click', () => {
  if (!ring) return;
  let t = 0;
  const id = setInterval(() => {
    t += 1;
    const s = 1 + Math.sin(t/6) * 0.15;
    ring.scale.set(s, s, 1);
    ring.material.opacity = 0.15 + 0.1 * Math.abs(Math.sin(t/10));
    if (t > 120) clearInterval(id);
  }, 16);
});

// ===== MAP QUICK OPEN =====
document.getElementById('btnMap')?.addEventListener('click', () => {
  if (!navigator.geolocation) {
    alert('La géolocalisation n’est pas disponible sur cet appareil.');
    return;
  }
  navigator.geolocation.getCurrentPosition((pos) => {
    const { latitude, longitude } = pos.coords;
    const url = `https://maps.google.com/?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  }, (err) => {
    alert('Impossible de récupérer la position : ' + err.message);
  }, { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 });
});

// ===== CHRONO =====
const chronoEl = document.getElementById('chrono');
let startTime = 0, elapsed = 0, timerId = null;

function updateChrono() {
  const t = Date.now() - startTime + elapsed;
  const min = Math.floor(t / 60000);
  const sec = Math.floor((t % 60000) / 1000);
  const dec = Math.floor((t % 1000) / 100);
  chronoEl.textContent = `${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}.${dec}`;
}

document.getElementById('chronoStart')?.addEventListener('click', () => {
  if (timerId) return;
  startTime = Date.now();
  timerId = setInterval(updateChrono, 50);
});

document.getElementById('chronoStop')?.addEventListener('click', () => {
  if (!timerId) return;
  clearInterval(timerId);
  elapsed += Date.now() - startTime;
  timerId = null;
  // Lap
  const li = document.createElement('li');
  li.textContent = chronoEl.textContent;
  document.getElementById('laps').appendChild(li);
});

document.getElementById('chronoReset')?.addEventListener('click', () => {
  if (timerId) clearInterval(timerId);
  timerId = null;
  startTime = 0; elapsed = 0;
  chronoEl.textContent = '00:00.0';
  document.getElementById('laps').innerHTML = '';
});

// ===== CONVERTER =====
document.getElementById('convert')?.addEventListener('click', () => {
  const val = parseFloat(document.getElementById('convVal').value || '0');
  const type = document.getElementById('convType').value;
  let out = 0, unit = '';
  switch (type) {
    case 'km-nm': out = val * 0.539957; unit = 'nm'; break;
    case 'nm-km': out = val / 0.539957; unit = 'km'; break;
    case 'm-ft': out = val * 3.28084; unit = 'ft'; break;
    case 'ft-m': out = val / 3.28084; unit = 'm'; break;
  }
  document.getElementById('convResult').textContent = Number.isFinite(out) ? `${out.toFixed(3)} ${unit}` : '—';
});

// ===== NATO PHONETIC =====
const NATO = {
  A:'Alpha', B:'Bravo', C:'Charlie', D:'Delta', E:'Echo', F:'Foxtrot', G:'Golf', H:'Hotel',
  I:'India', J:'Juliett', K:'Kilo', L:'Lima', M:'Mike', N:'November', O:'Oscar', P:'Papa',
  Q:'Quebec', R:'Romeo', S:'Sierra', T:'Tango', U:'Uniform', V:'Victor', W:'Whiskey', X:'X-ray',
  Y:'Yankee', Z:'Zulu', '0':'Zero', '1':'One', '2':'Two', '3':'Three', '4':'Four',
  '5':'Five', '6':'Six', '7':'Seven', '8':'Eight', '9':'Nine', '-':'Dash'
};
document.getElementById('natoBtn')?.addEventListener('click', () => {
  const s = (document.getElementById('natoIn').value || '').toUpperCase();
  const words = [];
  for (const ch of s) words.push(NATO[ch] || ch);
  document.getElementById('natoOut').textContent = words.join(' · ');
});

// ===== MORSE ENCODER =====
const MORSE = {
  A:'.-', B:'-...', C:'-.-.', D:'-..', E:'.', F:'..-.', G:'--.', H:'....',
  I:'..', J:'.---', K:'-.-', L:'.-..', M:'--', N:'-.', O:'---', P:'.--.',
  Q:'--.-', R:'.-.', S:'...', T:'-', U:'..-', V:'...-', W:'.--', X:'-..-',
  Y:'-.--', Z:'--..', '0':'-----', '1':'.----', '2':'..---', '3':'...--', '4':'....-',
  '5':'.....', '6':'-....', '7':'--...', '8':'---..', '9':'----.', ' ':'/'
};
document.getElementById('morseBtn')?.addEventListener('click', () => {
  const s = (document.getElementById('morseIn').value || '').toUpperCase();
  const out = Array.from(s).map(ch => MORSE[ch] ?? ch).join(' ');
  document.getElementById('morseOut').textContent = out;
});

// ===== CHECKLIST SAVE =====
const listKey = 'tactix_checklist_v1';
const listEl = document.getElementById('checklist');
function loadChecklist() {
  try {
    const saved = JSON.parse(localStorage.getItem(listKey) || '[]');
    [...listEl.querySelectorAll('input[type="checkbox"]')].forEach((cb, i) => cb.checked = !!saved[i]);
  } catch {}
}
function saveChecklist() {
  const arr = [...listEl.querySelectorAll('input[type="checkbox"]')].map(cb => cb.checked);
  localStorage.setItem(listKey, JSON.stringify(arr));
}
loadChecklist();
document.getElementById('saveList')?.addEventListener('click', saveChecklist);
