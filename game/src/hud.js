// hud.js — one job: paint altitude, speed, heading and mission state onto the HUD.
import { knotsFromSpeed, feetFromY, headingDegrees } from './flight-model.js';
export function createHud() {
  const el = (id) => document.getElementById(id);
  return {
    speed: el('speedReadout'), throttle: el('throttleReadout'), alt: el('altReadout'),
    heading: el('headingReadout'), missionTitle: el('missionTitle'), missionText: el('missionText'),
    score: el('scoreReadout'), fuelText: el('fuelText'), fuelFill: el('fuelFill'),
    damageText: el('damageText'), damageFill: el('damageFill'), view: el('viewReadout'),
    center: el('centerMsg'), instruments: el('cockpitInstruments'),
    dialSpeed: el('dialSpeed'), dialAlt: el('dialAlt'), dialHdg: el('dialHdg'),
    speedNeedle: el('speedNeedle'), altNeedle: el('altNeedle'), hdgNeedle: el('hdgNeedle'),
  };
}
export function updateHud(hud, state, mission, score, ringsPassed, ringTotal, viewName) {
  const kt = knotsFromSpeed(state.velocity), ft = feetFromY(state.position.y), hdg = headingDegrees(state.heading);
  const vs = Math.round(state.verticalSpeed * 60);
  hud.speed.textContent = 'IAS ' + kt + ' kt' + (state.stalled ? '  ⚠ STALL' : '');
  hud.throttle.textContent = 'Throttle ' + Math.round(state.throttle * 100) + '%';
  hud.alt.textContent = 'ALT ' + ft + ' ft';
  hud.heading.textContent = 'HDG ' + String(hdg).padStart(3, '0') + '°  VS ' + vs + ' fpm';
  hud.missionTitle.textContent = mission.title;
  hud.missionText.textContent = mission.text;
  hud.score.textContent = 'Score ' + Math.round(score) + '  Rings ' + ringsPassed + '/' + ringTotal + '  Fuel matters';
  hud.fuelText.textContent = Math.round(state.fuel) + '%';
  hud.fuelFill.style.width = state.fuel + '%';
  hud.damageText.textContent = Math.round(100 - state.damage) + '%';
  hud.damageFill.style.width = (100 - state.damage) + '%';
  hud.view.textContent = viewName;
  hud.instruments.style.display = viewName === 'COCKPIT' ? 'flex' : 'none';
  hud.dialSpeed.textContent = kt; hud.dialAlt.textContent = ft; hud.dialHdg.textContent = String(hdg).padStart(3, '0');
  hud.speedNeedle.style.transform = 'rotate(' + (-120 + kt * 1.4) + 'deg)';
  hud.altNeedle.style.transform = 'rotate(' + (-120 + Math.min(240, ft / 9)) + 'deg)';
  hud.hdgNeedle.style.transform = 'rotate(' + hdg + 'deg)';
}
export function showCenterMessage(hud, text) { hud.center.textContent = text; }
