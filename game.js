import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js';

const mount = document.querySelector('#game');
const intro = document.querySelector('#intro');
const startButton = document.querySelector('#start');
const toast = document.querySelector('#toast');
const relicCount = document.querySelector('#relic-count');
const staminaValue = document.querySelector('#stamina-value');
const staminaBar = document.querySelector('#stamina-bar');
const headingLabel = document.querySelector('#heading');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9eb9bd);
scene.fog = new THREE.FogExp2(0x9eb9bd, 0.0028);

const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.1, 1100);
camera.rotation.order = 'YXZ';
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
mount.appendChild(renderer.domElement);

const hemi = new THREE.HemisphereLight(0xc8e3e6, 0x293a2a, 1.65);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe2b4, 3.2);
sun.position.set(-110, 170, -60);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -115; sun.shadow.camera.right = 115;
sun.shadow.camera.top = 115; sun.shadow.camera.bottom = -115;
sun.shadow.bias = -0.00025;
scene.add(sun);
scene.add(sun.target);

const world = new THREE.Group();
scene.add(world);
const materials = {
  grass: new THREE.MeshStandardMaterial({ color: 0x566c48, roughness: 1 }),
  darkGrass: new THREE.MeshStandardMaterial({ color: 0x344b36, roughness: 1 }),
  bark: new THREE.MeshStandardMaterial({ color: 0x4d3525, roughness: 1 }),
  leaves: new THREE.MeshStandardMaterial({ color: 0x244b38, roughness: 1 }),
  leavesLight: new THREE.MeshStandardMaterial({ color: 0x3c6344, roughness: 1 }),
  rock: new THREE.MeshStandardMaterial({ color: 0x737d78, roughness: 0.95 }),
  snow: new THREE.MeshStandardMaterial({ color: 0xc5d0ca, roughness: 0.92 }),
  water: new THREE.MeshStandardMaterial({ color: 0x2c8390, roughness: 0.23, metalness: 0.12, transparent: true, opacity: 0.83 }),
  crystal: new THREE.MeshStandardMaterial({ color: 0xb9f27c, emissive: 0x5b9828, emissiveIntensity: 2.1, roughness: 0.22, metalness: 0.2 })
};

function terrainHeight(x, z) {
  return Math.sin(x * 0.027) * 1.9 + Math.cos(z * 0.021) * 1.5
    + Math.sin((x + z) * 0.052) * 0.72 + Math.cos(Math.hypot(x, z) * 0.032) * 0.5;
}
function seededRandom(seed) {
  let t = seed >>> 0;
  return () => { t += 0x6D2B79F5; let v = t; v = Math.imul(v ^ v >>> 15, v | 1); v ^= v + Math.imul(v ^ v >>> 7, v | 61); return ((v ^ v >>> 14) >>> 0) / 4294967296; };
}
const rand = seededRandom(4072026);

// Sculpted, vertex-displaced valley floor.
const groundGeo = new THREE.PlaneGeometry(700, 700, 170, 170);
groundGeo.rotateX(-Math.PI / 2);
const positions = groundGeo.attributes.position;
for (let i = 0; i < positions.count; i++) {
  const x = positions.getX(i), z = positions.getZ(i);
  positions.setY(i, terrainHeight(x, z) - 0.5);
}
groundGeo.computeVertexNormals();
const ground = new THREE.Mesh(groundGeo, materials.grass);
ground.receiveShadow = true;
world.add(ground);

// Distant mountain walls built from faceted silhouettes.
for (let i = 0; i < 38; i++) {
  const angle = i / 38 * Math.PI * 2;
  const radius = 235 + rand() * 65;
  const height = 65 + rand() * 95;
  const geo = new THREE.ConeGeometry(22 + rand() * 28, height, 5 + Math.floor(rand() * 3), 2);
  geo.rotateY(rand() * 1.5);
  const mountain = new THREE.Mesh(geo, i % 4 === 0 ? materials.snow : materials.rock);
  mountain.position.set(Math.cos(angle) * radius, height * 0.33 - 2, Math.sin(angle) * radius);
  mountain.rotation.z = (rand() - 0.5) * 0.17;
  mountain.rotation.x = (rand() - 0.5) * 0.13;
  mountain.castShadow = true;
  world.add(mountain);
  if (i % 3 === 0) {
    const snowCap = new THREE.Mesh(new THREE.ConeGeometry(11 + rand() * 13, height * 0.28, 5), materials.snow);
    snowCap.position.set(mountain.position.x, mountain.position.y + height * 0.36, mountain.position.z);
    snowCap.rotation.copy(mountain.rotation);
    world.add(snowCap);
  }
}

// Winding river through the valley.
const riverPoints = [];
for (let i = 0; i <= 28; i++) {
  const z = -180 + i * 13;
  const x = Math.sin(i * 0.28) * 16 + Math.sin(i * 0.1) * 10;
  riverPoints.push(new THREE.Vector3(x, terrainHeight(x, z) - 0.1, z));
}
const riverCurve = new THREE.CatmullRomCurve3(riverPoints);
const river = new THREE.Mesh(new THREE.TubeGeometry(riverCurve, 240, 3.6, 8, false), materials.water);
river.receiveShadow = true;
world.add(river);

// Instanced vegetation keeps the large scene lightweight.
const trunkGeo = new THREE.CylinderGeometry(0.22, 0.36, 4.2, 6);
const crownGeo = new THREE.ConeGeometry(2.25, 5.2, 7);
const crownGeoSmall = new THREE.ConeGeometry(1.65, 4.2, 7);
const treeCount = 1550;
const trunks = new THREE.InstancedMesh(trunkGeo, materials.bark, treeCount);
const crownsA = new THREE.InstancedMesh(crownGeo, materials.leaves, treeCount);
const crownsB = new THREE.InstancedMesh(crownGeoSmall, materials.leavesLight, treeCount);
trunks.castShadow = true; crownsA.castShadow = true; crownsB.castShadow = true;
trunks.receiveShadow = true;
const dummy = new THREE.Object3D();
let made = 0;
for (let i = 0; i < treeCount * 2 && made < treeCount; i++) {
  const x = (rand() - 0.5) * 400;
  const z = (rand() - 0.5) * 400;
  if (Math.hypot(x, z + 12) < 15) continue;
  const nearRiver = Math.abs(x - (Math.sin((z + 180) / 13 * 0.28) * 16)) < 7;
  if (nearRiver && rand() < 0.8) continue;
  const scale = 0.62 + rand() * 0.95;
  const y = terrainHeight(x, z) - 0.5;
  dummy.position.set(x, y + 2.1 * scale, z); dummy.rotation.set(0, rand() * Math.PI * 2, 0); dummy.scale.setScalar(scale); dummy.updateMatrix(); trunks.setMatrixAt(made, dummy.matrix);
  dummy.position.set(x, y + 5.0 * scale, z); dummy.rotation.set(0, rand() * Math.PI * 2, 0); dummy.scale.setScalar(scale); dummy.updateMatrix(); crownsA.setMatrixAt(made, dummy.matrix);
  dummy.position.set(x, y + 7.0 * scale, z); dummy.rotation.set(0, rand() * Math.PI * 2, 0); dummy.scale.setScalar(scale); dummy.updateMatrix(); crownsB.setMatrixAt(made, dummy.matrix);
  made++;
}
trunks.count = made; crownsA.count = made; crownsB.count = made;
world.add(trunks, crownsA, crownsB);

// Scatter faceted boulders.
const rockGeo = new THREE.DodecahedronGeometry(1, 0);
const rocks = new THREE.InstancedMesh(rockGeo, materials.rock, 230);
for (let i = 0; i < 230; i++) {
  const x = (rand() - 0.5) * 340, z = (rand() - 0.5) * 340;
  const s = 0.5 + rand() * 2.2;
  dummy.position.set(x, terrainHeight(x, z) + s * 0.1, z);
  dummy.rotation.set(rand(), rand() * 6, rand());
  dummy.scale.set(s * 1.2, s * 0.65, s);
  dummy.updateMatrix(); rocks.setMatrixAt(i, dummy.matrix);
}
rocks.castShadow = true; rocks.receiveShadow = true; world.add(rocks);

// A few field structures make the valley feel explored.
function makeCabin(x, z) {
  const y = terrainHeight(x, z) - 0.2;
  const wood = new THREE.MeshStandardMaterial({ color: 0x5c4936, roughness: 0.95 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x293735, roughness: 0.9 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 4), wood);
  body.position.set(x, y + 1.5, z); body.castShadow = true; body.receiveShadow = true; world.add(body);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.9, 2.3, 4), roofMat);
  roof.rotation.y = Math.PI / 4; roof.position.set(x, y + 4, z); roof.castShadow = true; world.add(roof);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.8, 0.12), new THREE.MeshStandardMaterial({color:0x241d17}));
  door.position.set(x, y + 0.9, z + 2.06); world.add(door);
}
makeCabin(-34, -25); makeCabin(49, 65); makeCabin(-70, 80);

// Glowing collectibles are placed around the playable valley.
const relics = [];
const relicGeo = new THREE.OctahedronGeometry(0.9, 0);
for (const [x, z] of [[-28, 20], [39, 47], [72, -65]]) {
  const group = new THREE.Group();
  group.position.set(x, terrainHeight(x, z) + 2.4, z);
  const crystal = new THREE.Mesh(relicGeo, materials.crystal);
  crystal.scale.set(0.72, 1.45, 0.72); crystal.castShadow = true; group.add(crystal);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.035, 8, 48), new THREE.MeshBasicMaterial({color:0xb9f27c, transparent:true, opacity:0.8}));
  ring.rotation.x = Math.PI / 2; group.add(ring);
  const light = new THREE.PointLight(0x9be85a, 2.5, 13); light.position.y = 0.3; group.add(light);
  world.add(group); relics.push({group, crystal, collected:false});
}

// Player state.
const player = { x: 0, z: -12, y: terrainHeight(0, -12) + 1.7, vy: 0, yaw: 0, pitch: 0, stamina: 100 };
const keys = new Set();
let locked = false, collected = 0, lastTime = performance.now(), toastTimer = 0;
const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const move = new THREE.Vector3();
const clock = new THREE.Clock();

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = 2.5;
}
function updateCamera() {
  camera.position.set(player.x, player.y, player.z);
  camera.rotation.order = 'YXZ';
  camera.rotation.y = player.yaw;
  camera.rotation.x = player.pitch;
  headingLabel.textContent = String(Math.round(((THREE.MathUtils.radToDeg(player.yaw) % 360) + 360) % 360)).padStart(3, '0') + '°';
}
function tryCollect() {
  let found = false;
  for (const relic of relics) {
    if (!relic.collected && relic.group.position.distanceTo(camera.position) < 4.1) {
      relic.collected = true;
      relic.group.visible = false;
      collected++;
      relicCount.textContent = 'FRAGMENTS   ' + String(collected).padStart(2, '0') + ' / 03';
      showToast(collected === 3 ? 'ALL FRAGMENTS RECOVERED — EXPEDITION COMPLETE' : 'SIGNAL FRAGMENT RECOVERED');
      found = true;
    }
  }
  if (!found) showToast('NO SIGNAL FRAGMENT IN RANGE');
}
function lockPointer() {
  renderer.domElement.requestPointerLock?.();
}
startButton.addEventListener('click', lockPointer);
document.addEventListener('pointerlockchange', () => {
  locked = document.pointerLockElement === renderer.domElement;
  intro.classList.toggle('hidden', locked);
});
renderer.domElement.addEventListener('click', () => { if (!locked) lockPointer(); });
document.addEventListener('mousemove', e => {
  if (!locked) return;
  player.yaw -= e.movementX * 0.0021;
  player.pitch -= e.movementY * 0.0018;
  player.pitch = THREE.MathUtils.clamp(player.pitch, -1.48, 1.48);
});
document.addEventListener('keydown', e => {
  keys.add(e.code);
  if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  if (e.code === 'KeyE' && !e.repeat && locked) tryCollect();
});
document.addEventListener('keyup', e => keys.delete(e.code));
window.addEventListener('blur', () => keys.clear());

function update(dt) {
  if (locked) {
    forward.set(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
    right.set(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
    move.set(0, 0, 0);
    if (keys.has('KeyW') || keys.has('ArrowUp')) move.add(forward);
    if (keys.has('KeyS') || keys.has('ArrowDown')) move.sub(forward);
    if (keys.has('KeyD') || keys.has('ArrowRight')) move.add(right);
    if (keys.has('KeyA') || keys.has('ArrowLeft')) move.sub(right);
    if (move.lengthSq() > 0) move.normalize();

    const sprinting = (keys.has('ShiftLeft') || keys.has('ShiftRight')) && move.lengthSq() > 0 && player.stamina > 0;
    const speed = sprinting ? 12.5 : 7.1;
    if (sprinting) player.stamina = Math.max(0, player.stamina - 28 * dt);
    else player.stamina = Math.min(100, player.stamina + 18 * dt);
    player.x += move.x * speed * dt;
    player.z += move.z * speed * dt;
    player.x = THREE.MathUtils.clamp(player.x, -330, 330);
    player.z = THREE.MathUtils.clamp(player.z, -330, 330);

    const groundY = terrainHeight(player.x, player.z) - 0.5 + 1.7;
    if (keys.has('Space') && player.y <= groundY + 0.08 && player.vy <= 0) player.vy = 8.3;
    player.vy -= 22 * dt;
    player.y += player.vy * dt;
    if (player.y < groundY) { player.y = groundY; player.vy = 0; }

    staminaValue.innerHTML = Math.round(player.stamina) + ' <span style="font-size:12px;color:#9eaca7">%</span>';
    staminaBar.style.width = player.stamina + '%';
    sun.position.set(player.x - 110, 170, player.z - 60);
    sun.target.position.set(player.x, 0, player.z);
  }

  const elapsed = performance.now() * 0.0001;
  for (const relic of relics) {
    if (!relic.collected) {
      relic.group.rotation.y += dt * 0.65;
      relic.crystal.position.y = Math.sin(elapsed * 2.4 + relic.group.position.x) * 0.22;
    }
  }
  if (toastTimer > 0) { toastTimer -= dt; if (toastTimer <= 0) toast.classList.remove('show'); }
  updateCamera();
}

function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  update(dt);
  renderer.render(scene, camera);
}
updateCamera();
requestAnimationFrame(animate);

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
});
