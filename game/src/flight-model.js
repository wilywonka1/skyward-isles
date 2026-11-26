// flight-model.js — one job: advance the aircraft physics each frame.
export function createFlightState() {
  return {
    position: null, velocity: 0, heading: 0, pitch: 0, roll: 0,
    throttle: 0, verticalSpeed: 0, onGround: true, fuel: 100, damage: 0,
    stalled: false, crashed: false, landed: false,
  };
}
export function stepFlightModel(state, input, dt, groundHeight) {
  if (state.crashed) return state;
  state.throttle = Math.max(0, Math.min(1, state.throttle + input.throttleDelta * dt * 0.55));
  const controlAuthority = Math.max(0.25, Math.min(1, state.velocity / 55));
  state.pitch += input.pitch * dt * 0.9 * controlAuthority;
  state.pitch = Math.max(-0.65, Math.min(0.75, state.pitch));
  state.roll += (input.roll * 1.5 - state.roll * 2.2) * dt * 2.4 * (state.onGround ? 0.25 : 1);
  state.heading -= Math.sin(state.roll) * dt * Math.max(0.25, state.velocity / 60) + input.yaw * dt * 0.35;
  const lift = Math.min(1, state.velocity / 48);
  state.stalled = !state.onGround && state.velocity < 34 && state.pitch > 0.18;
  const climb = Math.sin(state.pitch) * state.velocity * (state.stalled ? 0.25 : 1);
  const drag = 0.012 * state.velocity + (state.stalled ? 6 : 0);
  const thrust = state.throttle * 26;
  state.velocity += (thrust - drag - Math.sin(state.pitch) * 7) * dt;
  state.velocity = Math.max(0, Math.min(165, state.velocity));
  if (state.onGround && state.velocity > 52 && state.pitch > 0.12) state.onGround = false;
  if (state.onGround) {
    state.verticalSpeed = 0;
    if (input.brake) state.velocity = Math.max(0, state.velocity - 34 * dt);
  } else {
    const groundEffect = state.position.y - groundHeight < 9 ? 2.2 : 0;
    state.verticalSpeed = (climb - (1 - lift) * 13 + groundEffect) * 3.1;
    state.position.y += state.verticalSpeed * dt * 0.055;
  }
  const forwardX = Math.sin(state.heading), forwardZ = Math.cos(state.heading);
  state.position.x += forwardX * state.velocity * dt * 0.62;
  state.position.z += forwardZ * state.velocity * dt * 0.62;
  state.fuel = Math.max(0, state.fuel - dt * (0.22 + state.throttle * 0.85));
  if (state.fuel <= 0) state.throttle = Math.max(0, state.throttle - dt * 0.4);
  return state;
}
export function knotsFromSpeed(speed) { return Math.round(speed * 1.35); }
export function feetFromY(y) { return Math.max(0, Math.round(y * 11)); }
export function headingDegrees(heading) {
  let d = Math.round((-heading * 180 / Math.PI) % 360); if (d < 0) d += 360; return d;
}
