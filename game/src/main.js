// main.js — one job: wire the flight game together and run the frame loop.
import { createFlightState, stepFlightModel } from './flight-model.js';
import { buildTerrain, islandHeight, isOnRunway } from './terrain.js';
import { buildAircraft, buildCockpit } from './aircraft.js';
import { MISSIONS, buildRings, checkRingPass, scoreForLanding, saveBest } from './missions.js';
import { createHud, updateHud, showCenterMessage } from './hud.js';
import { createInput } from './input.js';
import { createEngineAudio } from './audio.js';

const THREE = window.THREE;
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87bfe8);
scene.fog = new THREE.Fog(0xa8d0ee, 420, 1500);
const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 4000);
const sun = new THREE.DirectionalLight(0xffffff, 1.15); sun.position.set(180, 320, 120); scene.add(sun);
scene.add(new THREE.AmbientLight(0xcfe8ff, 0.75));
buildTerrain(THREE, scene);
addCloudsAndSeaMarkers();
const aircraft = buildAircraft(THREE); scene.add(aircraft);
const cockpit = buildCockpit(THREE);
const rings = buildRings(THREE, scene);
const hud = createHud();
const input = createInput();
const audio = createEngineAudio();
const state = createFlightState();
state.position = new THREE.Vector3(-120, 4.5, -255);
let missionId = 'rings', mission = MISSIONS.rings, score = 0, elapsed = 0;
let passedRings = new Set(), viewName = 'CHASE', paused = false, started = false, outcome = '';
let cameraShake = 0;

function addCloudsAndSeaMarkers() {
  const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.88 });
  for (let i = 0; i < 22; i++) {
    const cloud = new THREE.Mesh(new THREE.SphereGeometry(16 + (i % 5) * 5, 8, 6), cloudMat);
    cloud.scale.y = 0.35; cloud.position.set(Math.cos(i * 1.7) * (180 + i * 17), 150 + (i % 4) * 28, Math.sin(i * 1.7) * (180 + i * 15));
    scene.add(cloud);
  }
  const buoyMat = new THREE.MeshLambertMaterial({ color: 0xff7043 });
  for (let i = 0; i < 10; i++) {
    const buoy = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 5, 8), buoyMat);
    buoy.position.set(-260 + i * 52, 0, 330 + Math.sin(i) * 28); scene.add(buoy);
  }
}
function resetForMission(id) {
  missionId = id; mission = MISSIONS[id];
  state.position.set(mission.start[0], 4.5, missionId === 'landing' ? -60 : mission.start[1] - 65);
  if (missionId === 'landing') { state.position.set(150, 68, -130); state.velocity = 78; state.throttle = 0.45; state.onGround = false; }
  else { state.velocity = 0; state.throttle = 0; state.onGround = true; }
  state.heading = 0; state.pitch = 0; state.roll = 0; state.fuel = 100; state.damage = 0;
  state.crashed = false; state.landed = false; score = 0; elapsed = 0; passedRings = new Set(); outcome = '';
  rings.forEach((r) => { r.material.color.set(0xffc21f); r.visible = missionId === 'rings'; });
  document.getElementById('menu').style.display = 'none';
  started = true; audio.startAudio(); showCenterMessage(hud, '');
}
function handleGroundContact() {
  const ground = islandHeight(state.position.x, state.position.z) + 2.2;
  if (state.position.y <= ground + 0.4) {
    const hard = state.verticalSpeed < -620 || !isOnRunway(state.position.x, state.position.z) && state.verticalSpeed < -260;
    state.position.y = ground + 0.4;
    if (!state.onGround && state.velocity > 8) {
      if (hard) { state.damage += 42; state.crashed = state.damage >= 80; outcome = state.crashed ? 'CRASHED — hull failed' : 'HARD IMPACT — hull damaged'; cameraShake = 1; }
      else if (isOnRunway(state.position.x, state.position.z)) {
        const inZone = Math.abs(state.position.z - (state.position.x < 0 ? -190 : 190)) < 24;
        const gained = scoreForLanding(state.verticalSpeed, inZone);
        score += gained; outcome = 'LANDED +' + gained + (inZone ? ' — in the touchdown zone!' : ' — outside the zone');
        if (missionId === 'cargo' && state.position.x > 0) { score += 700; outcome = 'CARGO DELIVERED! ' + outcome; }
        state.landed = true; saveBest(missionId, score);
      }
    }
    state.onGround = true;
    if (state.velocity < 4 && state.landed) showCenterMessage(hud, outcome + ' — pick a mission to fly again');
  }
}
function updateCamera(dt) {
  const heading = state.heading, pitch = state.pitch;
  aircraft.position.copy(state.position);
  aircraft.rotation.set(pitch, heading, state.roll, 'YXZ');
  aircraft.userData.prop.rotation.z += (2 + state.throttle * 55) * dt;
  if (viewName === 'COCKPIT') {
    camera.position.copy(state.position).add(new THREE.Vector3(0, 1.6, 0.5));
    camera.rotation.set(-pitch * 0.85, heading + Math.PI, -state.roll * 0.55, 'YXZ');
    cockpit.position.copy(camera.position);
    cockpit.rotation.set(0, heading, 0, 'YXZ');
    if (!cockpit.parent) scene.add(cockpit);
    aircraft.visible = false;
  } else {
    if (cockpit.parent) scene.remove(cockpit);
    aircraft.visible = true;
    const back = new THREE.Vector3(Math.sin(heading) * -19, 6.5, Math.cos(heading) * -19);
    const target = state.position.clone().add(back);
    camera.position.lerp(target, 1 - Math.pow(0.0001, dt));
    if (cameraShake > 0) { camera.position.x += (Math.random() - 0.5) * cameraShake * 2; cameraShake -= dt * 2; }
    camera.lookAt(state.position.x, state.position.y + 2, state.position.z);
  }
}
function resizeRenderer() {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
}
addEventListener('resize', resizeRenderer); resizeRenderer();
document.querySelectorAll('.missionBtn').forEach((btn) => btn.addEventListener('click', () => resetForMission(btn.dataset.mission)));

const params = new URLSearchParams(location.search);
function applyShotPose() {
  const shot = params.get('shot'); if (!shot) return;
  document.getElementById('menu').style.display = 'none'; started = true;
  rings.forEach((r) => { r.visible = (shot === 'cover' || shot === 'chase' || shot === 'rings'); });
  state.throttle = 0.72; state.velocity = 92; state.fuel = 76;
  if (shot === 'cover' || shot === 'chase') {
    state.position.set(-42, 58, 18); state.heading = -0.35; state.pitch = 0.08; state.roll = -0.28; state.onGround = false; viewName = 'CHASE';
  } else if (shot === 'cockpit') {
    state.position.set(150, 30, 108); state.heading = 0; state.pitch = -0.06; state.velocity = 84; state.onGround = false; viewName = 'COCKPIT';
    mission = { title: 'PRECISION LANDING', text: 'South Strip ahead — touchdown zone in yellow, keep VS gentle' };
  } else if (shot === 'rings') {
    state.position.set(12, 76, 18); state.heading = 0.33; state.pitch = 0.04; state.roll = -0.22; state.onGround = false;
    passedRings = new Set([0]); rings[0].material.color.set(0x57e389); score = 250;
  } else if (shot === 'landing') {
    state.position.set(138, 20, 128); state.heading = -0.12; state.pitch = -0.03; state.velocity = 68; state.onGround = false;
    mission = { title: 'CARGO RUN', text: 'South Strip rollout — cargo aboard, brake to stop in the zone' };
  }
  state.verticalSpeed = -3;
  updateCamera(0.5); updateHud(hud, state, mission, score, passedRings.size, rings.length, viewName);
  renderer.render(scene, camera);
}
applyShotPose();

let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.033, (now - last) / 1000); last = now;
  if (params.get('shot')) { updateCamera(dt); renderer.render(scene, camera); return; }
  if (!started || paused) { renderer.render(scene, camera); return; }
  const frameInput = input.readFrame();
  if (frameInput.toggleCamera) viewName = viewName === 'CHASE' ? 'COCKPIT' : 'CHASE';
  if (frameInput.pause) { paused = !paused; showCenterMessage(hud, paused ? 'PAUSED' : ''); }
  const beforeRings = passedRings.size;
  stepFlightModel(state, frameInput, dt, islandHeight(state.position.x, state.position.z));
  elapsed += dt;
  const gained = checkRingPass(state, rings, passedRings);
  if (gained) { score += gained; audio.beepForRing(); showCenterMessage(hud, 'RING! +' + gained); setTimeout(() => showCenterMessage(hud, ''), 900); }
  if (passedRings.size > beforeRings && passedRings.size === rings.length) { score += 800; saveBest('rings', score); showCenterMessage(hud, 'ALL RINGS — SORTIE COMPLETE! Score ' + Math.round(score)); }
  handleGroundContact();
  if (state.crashed) showCenterMessage(hud, 'CRASHED — hull failed. Pick a mission to try again');
  if (state.position.y > 900) state.position.y = 900;
  updateCamera(dt);
  updateHud(hud, state, mission, score, passedRings.size, rings.length, viewName);
  audio.updateAudio(state.throttle, state.velocity);
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);
window.__skyward = { state, resetForMission, rings };
