// terrain.js — one job: build the original Skyward Isles terrain, ocean and airstrips.
export function islandHeight(x, z) {
  const d = Math.sqrt(x * x + z * z);
  const hills = Math.sin(x * 0.018) * Math.cos(z * 0.021) * 16 + Math.sin((x + z) * 0.008) * 10;
  const peak = Math.max(0, 46 - d * 0.16);
  let h = -4 + hills * Math.max(0, 1 - d / 620) + peak * Math.max(0, 1 - d / 420);
  if (isOnRunway(x, z)) h = 2;
  return h;
}
export function isOnRunway(x, z) {
  const north = Math.abs(x + 120) < 13 && z > -285 && z < -95;
  const south = Math.abs(x - 150) < 13 && z > 95 && z < 285;
  return north || south;
}
export function buildTerrain(THREE, scene) {
  const geo = new THREE.PlaneGeometry(1300, 1300, 92, 92);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position, colors = [];
  const cSand = new THREE.Color(0xd9c27a), cGrass = new THREE.Color(0x4da653), cRock = new THREE.Color(0x8a7f72), cForest = new THREE.Color(0x2e7d46);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), h = islandHeight(x, z);
    pos.setY(i, h);
    const c = h < 1 ? cSand : h < 15 ? cGrass : h < 30 ? cForest : cRock;
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const land = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }));
  scene.add(land);
  const ocean = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.MeshLambertMaterial({ color: 0x1d7fb8, transparent: true, opacity: 0.92 }));
  ocean.rotation.x = -Math.PI / 2; ocean.position.y = -2.5; scene.add(ocean);
  buildRunway(THREE, scene, -120, -190, 'NORTH FIELD');
  buildRunway(THREE, scene, 150, 190, 'SOUTH STRIP');
  buildTreesAndHouses(THREE, scene);
  return land;
}
export function buildRunway(THREE, scene, cx, cz, name) {
  const strip = new THREE.Mesh(new THREE.BoxGeometry(24, 1.2, 190), new THREE.MeshLambertMaterial({ color: 0x3c4147 }));
  strip.position.set(cx, 2.4, cz); scene.add(strip);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (let i = -4; i <= 4; i++) {
    const dash = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 11), mat);
    dash.position.set(cx, 3.1, cz + i * 20); scene.add(dash);
  }
  const zone = new THREE.Mesh(new THREE.BoxGeometry(20, 0.3, 42), new THREE.MeshBasicMaterial({ color: 0xffc857, transparent: true, opacity: 0.75 }));
  zone.position.set(cx, 3.15, cz); scene.add(zone);
  const label = makeTextSprite(THREE, name);
  label.position.set(cx, 24, cz - 105); scene.add(label);
}
export function makeTextSprite(THREE, text) {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96;
  const g = cv.getContext('2d'); g.fillStyle = 'rgba(8,28,48,0.85)'; g.fillRect(0, 0, 512, 96);
  g.font = 'bold 44px Arial'; g.fillStyle = '#ffe27a'; g.textAlign = 'center'; g.fillText(text, 256, 62);
  const tex = new THREE.CanvasTexture(cv);
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
  spr.scale.set(72, 13.5, 1); return spr;
}
export function buildTreesAndHouses(THREE, scene) {
  const trunk = new THREE.MeshLambertMaterial({ color: 0x7a5230 });
  const leaf = new THREE.MeshLambertMaterial({ color: 0x2f8f4e });
  for (let i = 0; i < 130; i++) {
    const a = i * 2.399, r = 70 + (i * 37) % 330, x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (isOnRunway(x, z)) continue;
    const h = islandHeight(x, z); if (h < 2) continue;
    const tree = new THREE.Group();
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 5, 6), trunk); t.position.y = 2.5; tree.add(t);
    const c = new THREE.Mesh(new THREE.ConeGeometry(4.2, 10, 7), leaf); c.position.y = 9; tree.add(c);
    tree.position.set(x, h, z); scene.add(tree);
  }
  const wall = new THREE.MeshLambertMaterial({ color: 0xf2e3c6 });
  const roof = new THREE.MeshLambertMaterial({ color: 0xc8543e });
  [[-60, -60], [40, 30], [-30, 90], [90, -40], [10, -130]].forEach(([x, z]) => {
    const h = islandHeight(x, z), house = new THREE.Group();
    const b = new THREE.Mesh(new THREE.BoxGeometry(13, 8, 11), wall); b.position.y = 4; house.add(b);
    const r = new THREE.Mesh(new THREE.ConeGeometry(10, 5, 4), roof); r.position.y = 10.5; r.rotation.y = Math.PI / 4; house.add(r);
    house.position.set(x, h, z); scene.add(house);
  });
}
