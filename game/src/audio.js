// audio.js — one job: synthesise engine and wind sound with WebAudio, no audio files.
export function createEngineAudio() {
  let ctx = null, osc = null, gain = null, wind = null, windGain = null;
  function startAudio() {
    if (ctx) { ctx.resume(); return; }
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      osc = ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = 55;
      gain = ctx.createGain(); gain.gain.value = 0.03;
      osc.connect(gain); gain.connect(ctx.destination); osc.start();
      const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      wind = ctx.createBufferSource(); wind.buffer = buffer; wind.loop = true;
      windGain = ctx.createGain(); windGain.gain.value = 0.0;
      wind.connect(windGain); windGain.connect(ctx.destination); wind.start();
    } catch (e) { ctx = null; }
  }
  function updateAudio(throttle, speed) {
    if (!ctx) return;
    osc.frequency.value = 48 + throttle * 75 + speed * 0.25;
    gain.gain.value = 0.02 + throttle * 0.05;
    windGain.gain.value = Math.min(0.09, speed / 1600);
  }
  function beepForRing() {
    if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = 880; g.gain.value = 0.08; o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 0.16);
  }
  return { startAudio, updateAudio, beepForRing };
}
