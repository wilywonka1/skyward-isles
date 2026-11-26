// missions.js — one job: define the three missions, their rings and goals.
export const MISSIONS = {
  rings: { title: 'RING RUNNER', text: 'Fly through all 6 golden rings over the bay', start: [-120, -190], heading: 0 },
  cargo: { title: 'CARGO RUN', text: 'Take off North Field — land at South Strip before fuel runs low', start: [-120, -190], heading: 0 },
  landing: { title: 'PRECISION LANDING', text: 'Approach South Strip and touch down gently in the yellow zone', start: [150, -40], heading: 0 },
};
export function ringPositions() {
  return [
    [-60, 62, -40], [30, 78, 70], [110, 66, 150],
    [150, 58, 235], [40, 84, 300], [-80, 72, 210],
  ];
}
export function buildRings(THREE, scene) {
  const rings = [];
  const mat = new THREE.MeshBasicMaterial({ color: 0xffc21f, side: THREE.DoubleSide });
  ringPositions().forEach(([x, y, z], i) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(13, 1.5, 10, 28), mat.clone());
    ring.position.set(x, y, z); ring.userData.index = i; scene.add(ring); rings.push(ring);
  });
  return rings;
}
export function checkRingPass(state, rings, passed) {
  let gained = 0;
  rings.forEach((ring) => {
    if (passed.has(ring.userData.index)) return;
    if (state.position.distanceTo(ring.position) < 14) {
      passed.add(ring.userData.index); ring.material.color.set(0x57e389); gained += 250;
    }
  });
  return gained;
}
export function scoreForLanding(verticalSpeed, inZone) {
  if (!inZone) return 100;
  if (Math.abs(verticalSpeed) < 260) return 1000;
  if (Math.abs(verticalSpeed) < 520) return 600;
  return 250;
}
export function bestKey(missionId) { return 'skyward-best-' + missionId; }
export function saveBest(missionId, score) {
  try {
    const prev = Number(localStorage.getItem(bestKey(missionId)) || 0);
    if (score > prev) localStorage.setItem(bestKey(missionId), String(Math.round(score)));
  } catch (e) { /* storage may be unavailable */ }
}
