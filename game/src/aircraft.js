// aircraft.js — one job: build the original Skyward prop plane from primitives.
export function buildAircraft(THREE) {
  const plane = new THREE.Group();
  const bodyMat = new THREE.MeshLambertMaterial({ color: 0xf4f6f8 });
  const accentMat = new THREE.MeshLambertMaterial({ color: 0xd63c2f });
  const darkMat = new THREE.MeshLambertMaterial({ color: 0x22384f });
  const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 0.75, 10.5, 12), bodyMat);
  fuselage.rotation.x = Math.PI / 2; plane.add(fuselage);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(1.15, 2.4, 12), accentMat);
  nose.rotation.x = Math.PI / 2; nose.position.z = 6.4; plane.add(nose);
  const cockpitGlass = new THREE.Mesh(new THREE.SphereGeometry(1.25, 12, 8), new THREE.MeshLambertMaterial({ color: 0x7fd4ff }));
  cockpitGlass.scale.set(0.9, 0.62, 1.5); cockpitGlass.position.set(0, 1.05, 1.2); plane.add(cockpitGlass);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(15.5, 0.32, 2.6), accentMat);
  wing.position.set(0, 0.25, 1.1); plane.add(wing);
  const tailWing = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.25, 1.5), accentMat);
  tailWing.position.set(0, 0.45, -5.1); plane.add(tailWing);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.28, 3.1, 1.7), accentMat);
  fin.position.set(0, 1.7, -5.1); plane.add(fin);
  const prop = new THREE.Group();
  const bladeA = new THREE.Mesh(new THREE.BoxGeometry(0.35, 6.6, 0.18), darkMat); prop.add(bladeA);
  const bladeB = bladeA.clone(); bladeB.rotation.z = Math.PI / 2; prop.add(bladeB);
  prop.position.z = 7.8; plane.add(prop);
  plane.userData.prop = prop;
  const gearMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
  [[-1.7, 1.6], [1.7, 1.6], [0, -4.2]].forEach(([x, z]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.4, 10), gearMat);
    wheel.rotation.z = Math.PI / 2; wheel.position.set(x, -1.55, z); plane.add(wheel);
  });
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.36, 0.5, 6.5), accentMat);
  stripe.position.set(0, -0.25, -0.6); plane.add(stripe);
  return plane;
}
export function buildCockpit(THREE) {
  const cockpit = new THREE.Group();
  const dashMat = new THREE.MeshLambertMaterial({ color: 0x18242f });
  const dash = new THREE.Mesh(new THREE.BoxGeometry(5.6, 1.35, 0.5), dashMat);
  dash.position.set(0, -1.95, 4.6); cockpit.add(dash);
  const glare = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.3, 1.2), dashMat);
  glare.position.set(0, -1.2, 4.3); cockpit.add(glare);
  const frameMat = new THREE.MeshLambertMaterial({ color: 0x2c3e4f });
  [-3.1, 3.1].forEach((x) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.6, 0.24), frameMat);
    post.position.set(x, 0.7, 4.2); post.rotation.z = x < 0 ? 0.2 : -0.2; cockpit.add(post);
  });
  const yoke = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.08, 8, 18), frameMat);
  yoke.position.set(0, -1.7, 3.6); cockpit.add(yoke);
  return cockpit;
}
