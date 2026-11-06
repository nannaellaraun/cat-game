// Sounds, made in the browser with Web Audio (no sound files needed).
// Each sound is a small recipe: play(ctx, at, seconds) schedules it on an AudioContext starting at time `at`.

let audioContext = null;

function getAudio() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null; // very old browser: no sound
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

// Random noise, the raw material for purring and brushing.
function makeNoise(ctx, seconds) {
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  return source;
}

const SOUNDS = {
  // "Me-ow": a tone that rises and falls, through a filter that opens and closes like a mouth.
  meow(ctx, at) {
    const length = 0.7;
    const voice = ctx.createOscillator();
    voice.type = "sawtooth";
    voice.frequency.setValueAtTime(520, at);
    voice.frequency.linearRampToValueAtTime(760, at + 0.18);
    voice.frequency.linearRampToValueAtTime(700, at + 0.35);
    voice.frequency.exponentialRampToValueAtTime(430, at + length);

    const mouth = ctx.createBiquadFilter();
    mouth.type = "bandpass";
    mouth.Q.value = 4;
    mouth.frequency.setValueAtTime(900, at); // "m"
    mouth.frequency.linearRampToValueAtTime(1800, at + 0.25); // "e" → "ow"
    mouth.frequency.linearRampToValueAtTime(800, at + length);

    const volume = ctx.createGain();
    volume.gain.setValueAtTime(0.0001, at);
    volume.gain.exponentialRampToValueAtTime(0.5, at + 0.06);
    volume.gain.setValueAtTime(0.5, at + 0.45);
    volume.gain.exponentialRampToValueAtTime(0.0001, at + length);

    voice.connect(mouth).connect(volume).connect(ctx.destination);
    voice.start(at);
    voice.stop(at + length + 0.05);
    return length;
  },

  // Purring: low rumbling noise that pulses about 25 times a second.
  purr(ctx, at, seconds = 2) {
    const rumble = makeNoise(ctx, seconds + 0.2);
    const low = ctx.createBiquadFilter();
    low.type = "lowpass";
    low.frequency.value = 320;

    const pulse = ctx.createGain();
    pulse.gain.value = 0.5;
    const throb = ctx.createOscillator(); // the purr's rhythm
    throb.type = "sine";
    throb.frequency.value = 25;
    const throbDepth = ctx.createGain();
    throbDepth.gain.value = 0.5;
    throb.connect(throbDepth).connect(pulse.gain);

    const volume = ctx.createGain();
    volume.gain.setValueAtTime(0.0001, at);
    volume.gain.exponentialRampToValueAtTime(0.9, at + 0.25);
    volume.gain.setValueAtTime(0.9, at + seconds - 0.4);
    volume.gain.exponentialRampToValueAtTime(0.0001, at + seconds);

    rumble.connect(low).connect(pulse).connect(volume).connect(ctx.destination);
    rumble.start(at);
    rumble.stop(at + seconds + 0.1);
    throb.start(at);
    throb.stop(at + seconds + 0.1);
    return seconds;
  },

  // Brushing: three soft "shh" strokes of bright noise.
  brush(ctx, at) {
    const strokes = 3;
    const stroke = 0.28;
    const gap = 0.12;
    for (let i = 0; i < strokes; i++) {
      const start = at + i * (stroke + gap);
      const hiss = makeNoise(ctx, stroke + 0.05);
      const bristles = ctx.createBiquadFilter();
      bristles.type = "bandpass";
      bristles.Q.value = 1.2;
      bristles.frequency.setValueAtTime(2500, start);
      bristles.frequency.linearRampToValueAtTime(5000, start + stroke); // the stroke sweeps along the fur
      const volume = ctx.createGain();
      volume.gain.setValueAtTime(0.0001, start);
      volume.gain.exponentialRampToValueAtTime(0.8, start + 0.08);
      volume.gain.exponentialRampToValueAtTime(0.0001, start + stroke);
      hiss.connect(bristles).connect(volume).connect(ctx.destination);
      hiss.start(start);
      hiss.stop(start + stroke + 0.05);
    }
    return strokes * (stroke + gap);
  },
};

// Plays a sound now. Never throws: a sound problem must not stop the game.
function playSound(name, seconds) {
  try {
    const ctx = getAudio();
    if (ctx && SOUNDS[name]) SOUNDS[name](ctx, ctx.currentTime + 0.02, seconds);
  } catch {
    // no sound, the game carries on
  }
}
