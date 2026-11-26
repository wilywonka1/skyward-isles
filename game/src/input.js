// input.js — one job: read keyboard and mouse into a single input frame.
export function createInput() {
  const keys = new Set();
  const input = { throttleDelta: 0, pitch: 0, roll: 0, yaw: 0, brake: false, toggleCamera: false, pause: false };
  addEventListener('keydown', (e) => {
    keys.add(e.code);
    if (e.code === 'KeyC') input.toggleCamera = true;
    if (e.code === 'KeyP') input.pause = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  });
  addEventListener('keyup', (e) => keys.delete(e.code));
  let dragging = false, lastX = 0, lastY = 0, mousePitch = 0, mouseRoll = 0;
  addEventListener('mousedown', (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; });
  addEventListener('mouseup', () => { dragging = false; mousePitch = 0; mouseRoll = 0; });
  addEventListener('mousemove', (e) => {
    if (!dragging) return;
    mouseRoll = Math.max(-1, Math.min(1, (e.clientX - lastX) / 60));
    mousePitch = Math.max(-1, Math.min(1, (e.clientY - lastY) / 60));
  });
  input.readFrame = function readFrame() {
    input.throttleDelta = (keys.has('KeyW') ? 1 : 0) - (keys.has('KeyS') ? 1 : 0);
    input.pitch = (keys.has('ArrowUp') ? 1 : 0) - (keys.has('ArrowDown') ? 1 : 0) + mousePitch;
    input.roll = (keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0) + mouseRoll;
    input.yaw = (keys.has('KeyA') ? 1 : 0) - (keys.has('KeyD') ? 1 : 0);
    input.brake = keys.has('Space');
    const frame = { ...input };
    input.toggleCamera = false; input.pause = false;
    return frame;
  };
  return input;
}
