// Gestion du login
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const toggleBtn = document.getElementById('toggle-pass');
const reactivateBtn = document.getElementById('reactivate-pass');

function checkPass() {
  const passEnabled = localStorage.getItem('passEnabled') !== 'false';
  if(!passEnabled || passwordInput.value === 'TACTIX-Admin-Z'){
    loginScreen.style.display='none';
    dashboard.style.display='block';
    initGlobe();
    initMap();
  } else alert('Mot de passe incorrect');
}

loginBtn.addEventListener('click', checkPass);
toggleBtn.addEventListener('click', ()=>localStorage.setItem('passEnabled','false'));
reactivateBtn.addEventListener('click', ()=>localStorage.setItem('passEnabled','true'));

// Globe Three.js
function initGlobe(){
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight,0.1,1000);
  const renderer = new THREE.WebGLRenderer({canvas:document.getElementById('globe'), alpha:true});
  renderer.setSize(window.innerWidth, window.innerHeight/2);
  const geometry = new THREE.SphereGeometry(2,32,32);
  const material = new THREE.MeshBasicMaterial({color:0x00ffff, wireframe:true});
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);
  camera.position.z=5;
  function animate(){
    requestAnimationFrame(animate);
    sphere.rotation.y +=0.005;
    renderer.render(scene,camera);
  }
  animate();
}

// Carte Leaflet
function initMap(){
  const map = L.map('map').setView([0,0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(pos=>{
      const lat=pos.coords.latitude;
      const lon=pos.coords.longitude;
      map.setView([lat,lon],13);
      L.marker([lat,lon]).addTo(map).bindPopup("Votre position").openPopup();
    });
  }
}
