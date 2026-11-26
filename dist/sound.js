"use strict";

const glassSound = (() => {
  const storageKey = "glass-garden-audio";
  let level = 75;
  let muted = false;
  let context, dry, wet, output;
  const samples = [];
  const Audio = window.AudioContext || window.webkitAudioContext;
  let lastPreview = -Infinity;
  let warming = false;

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (Number.isInteger(saved?.level)) level = Math.min(100, Math.max(0, saved.level));
    muted = saved?.muted === true;
  } catch {
    // The game can play sound when browser storage is unavailable.
  }

  function updateGain() {
    if (output) {
      const gain = muted ? 0 : (level / 100) ** 1.45;
      output.gain.setTargetAtTime(gain, context.currentTime, .025);
    }
  }

  function setPreferences(newLevel, newMuted) {
    level = newLevel;
    muted = newMuted;
    updateGain();
    try {
      localStorage.setItem(storageKey, JSON.stringify({ level, muted }));
    } catch {
      // Keep preferences for the current session.
    }
  }

  function makeRoom() {
    const rate = context.sampleRate;
    const impulse = context.createBuffer(2, Math.floor(rate * .64), rate);
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      const delay = Math.floor(rate * (channel === 0 ? .019 : .031));
      let low = 0;
      let envelope = 1;
      const decay = Math.exp(-9 / rate);
      for (let index = delay; index < data.length; index++) {
        low += .19 * (Math.random() * 2 - 1 - low);
        const time = (index - delay) / rate;
        data[index] = low * Math.min(1, time * 80) * envelope;
        envelope *= decay;
      }
      for (const [time, strength] of channel === 0
        ? [[.043, .24], [.074, -.13], [.129, .09]]
        : [[.052, .22], [.091, .13], [.151, -.08]]) {
        data[Math.floor(rate * time)] += strength;
      }
    }
    return impulse;
  }

  function setup() {
    context = new Audio();
    dry = context.createGain();
    wet = context.createGain();
    output = context.createGain();
    const room = context.createConvolver();
    const softener = context.createBiquadFilter();
    const compressor = context.createDynamicsCompressor();
    dry.gain.value = .92;
    wet.gain.value = .24;
    room.buffer = makeRoom();
    softener.type = "lowpass";
    softener.frequency.value = 4600;
    compressor.threshold.value = -20;
    compressor.ratio.value = 3;
    compressor.attack.value = .006;
    compressor.release.value = .18;
    dry.connect(compressor);
    wet.connect(room).connect(softener).connect(compressor);
    compressor.connect(output).connect(context.destination);
    output.gain.value = muted ? 0 : (level / 100) ** 1.45;
  }

  async function unlock() {
    if (!Audio || muted || !level) return false;
    try {
      if (!context) setup();
      if (context.state !== "running") await context.resume();
      if (context.state !== "running") return false;
      warmSamples();
      return true;
    } catch {
      return false;
    }
  }

  function makeShard() {
    const rate = context.sampleRate;
    const buffer = context.createBuffer(1, Math.ceil(rate * .52), rate);
    const data = buffer.getChannelData(0);
    const tuning = .93 + Math.random() * .13;
    const resonances = [
      [670, .17, 12],
      [1260, .19, 11],
      [1920, .13, 17],
      [2870, .11, 23],
      [4170, .058, 38],
      [5600, .025, 56]
    ];
    // A damped sine can advance with two multiplies per sample.
    const voices = resonances.map(([frequency, strength, decay]) => {
      const phase = 2 * Math.PI * frequency * tuning / rate;
      const damping = Math.exp(-decay / rate);
      return {
        current: 0,
        previous: -strength * Math.sin(phase) / damping,
        feedback: 2 * damping * Math.cos(phase),
        dampingSquared: damping * damping
      };
    });
    let low = 0;
    let high = 0;
    let transient = .27;
    const transientDecay = Math.exp(-88 / rate);
    for (let index = 0; index < data.length; index++) {
      const t = index / rate;
      const noise = Math.random() * 2 - 1;
      low += .08 * (noise - low);
      high += .5 * (noise - high);
      let value = (high - low) * transient;
      transient *= transientDecay;
      for (const voice of voices) {
        value += voice.current;
        const next = voice.feedback * voice.current - voice.dampingSquared * voice.previous;
        voice.previous = voice.current;
        voice.current = next;
      }
      data[index] = value * Math.min(1, t * 1100) * Math.min(1, (.52 - t) * 32);
    }
    return buffer;
  }

  function warmSamples() {
    if (warming || samples.length >= 3) return;
    warming = true;
    const prepare = () => {
      warming = false;
      if (muted || !level) return;
      if (samples.length < 3) samples.push(makeShard());
      warmSamples();
    };
    if (window.requestIdleCallback) window.requestIdleCallback(prepare);
    else setTimeout(prepare, 0);
  }

  function play(positions, chain = 1) {
    if (muted || !level || context?.state !== "running") return;
    if (!samples.length) samples.push(makeShard());
    const now = context.currentTime;
    const center = positions.reduce((sum, position) => sum + position, 0) / positions.length;
    const fragments = Math.min(5, positions.length + 1);
    for (let index = 0; index < fragments; index++) {
      const source = context.createBufferSource();
      const voice = context.createGain();
      source.buffer = samples[index % samples.length];
      source.playbackRate.value = .87 + index * .11 + Math.min(chain - 1, 5) * .045;
      voice.gain.value = index === 0 ? .84 : .43 * Math.exp(-.26 * index);
      source.connect(voice);
      const pan = context.createStereoPanner?.();
      if (pan) {
        const position = index === 0 ? center : positions[(index - 1) % positions.length];
        const spread = index === 0 ? 0 : (index % 2 ? -.29 : .29);
        pan.pan.value = Math.max(-.88, Math.min(.88, position * .69 + spread));
        voice.connect(pan);
      }
      const branch = pan || voice;
      branch.connect(dry);
      branch.connect(wet);
      source.onended = () => {
        source.disconnect();
        voice.disconnect();
        pan?.disconnect();
      };
      source.start(now + index * .026 + (index ? Math.random() * .012 : 0));
    }
  }

  async function preview() {
    if (await unlock() && context.currentTime - lastPreview > .35) {
      lastPreview = context.currentTime;
      play([-.76, -.14, .42, .78]);
    }
  }

  return {
    supported: Boolean(Audio),
    get level() { return level; },
    get muted() { return muted; },
    setPreferences,
    unlock,
    play,
    preview
  };
})();
