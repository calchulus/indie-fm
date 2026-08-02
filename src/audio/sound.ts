let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

function playNoise(duration: number, volume = 0.08) {
  try {
    const ctx = getCtx();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  } catch {
    // Audio not available
  }
}

export const SoundEffects = {
  whistle() {
    playTone(2200, 0.4, 'sine', 0.12);
    setTimeout(() => playTone(2200, 0.6, 'sine', 0.12), 500);
  },

  goal() {
    playNoise(1.5, 0.15);
    playTone(523, 0.2, 'square', 0.08);
    setTimeout(() => playTone(659, 0.2, 'square', 0.08), 150);
    setTimeout(() => playTone(784, 0.3, 'square', 0.08), 300);
  },

  kick() {
    playTone(150, 0.08, 'triangle', 0.1);
  },

  save() {
    playTone(300, 0.1, 'triangle', 0.08);
    setTimeout(() => playTone(200, 0.15, 'triangle', 0.06), 80);
  },

  card() {
    playTone(440, 0.15, 'square', 0.06);
  },

  click() {
    playTone(800, 0.03, 'sine', 0.05);
  },

  crowdSwell() {
    playNoise(2.0, 0.06);
  },

  fullTime() {
    playTone(2200, 0.3, 'sine', 0.1);
    setTimeout(() => playTone(2200, 0.3, 'sine', 0.1), 400);
    setTimeout(() => playTone(2200, 0.8, 'sine', 0.1), 800);
  },
};

export function initAudio() {
  getCtx();
}
