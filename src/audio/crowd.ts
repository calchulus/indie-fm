// Crowd / tension audio system using Web Audio API
// Generates procedural crowd ambience, tension rises, and goal roars
// without any external audio files.

let audioCtx: AudioContext | null = null;
let crowdNode: AudioBufferSourceNode | null = null;
let crowdGain: GainNode | null = null;
let isRunning = false;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

// Generate a noise buffer that sounds like crowd murmur
function createCrowdBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * seconds;
  const buffer = ctx.createBuffer(2, length, sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    let lastOut = 0;
    for (let i = 0; i < length; i++) {
      // Brown noise (filtered white noise) sounds like crowd murmur
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
      // Add subtle rhythmic swell (crowd waves)
      data[i] *= 0.7 + 0.3 * Math.sin(i / sampleRate * 0.4 * Math.PI * 2);
    }
  }
  return buffer;
}

// Start ambient crowd noise at a given intensity (0-1)
export function startCrowdAmbience(intensity: number = 0.3): void {
  if (isRunning) return;
  const ctx = getCtx();
  if (ctx.state === 'suspended') ctx.resume();

  const buffer = createCrowdBuffer(ctx, 4);
  crowdNode = ctx.createBufferSource();
  crowdNode.buffer = buffer;
  crowdNode.loop = true;

  crowdGain = ctx.createGain();
  crowdGain.gain.value = intensity * 0.15;

  // Low-pass filter to make it sound more like distant crowd
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;

  crowdNode.connect(filter);
  filter.connect(crowdGain);
  crowdGain.connect(ctx.destination);
  crowdNode.start();
  isRunning = true;
}

// Update crowd intensity based on match tension (0-1)
export function setCrowdIntensity(intensity: number): void {
  if (!crowdGain || !audioCtx) return;
  crowdGain.gain.setTargetAtTime(intensity * 0.15, audioCtx.currentTime, 0.5);
}

// Goal roar — a rising swell of noise
export function playGoalRoar(): void {
  const ctx = getCtx();
  if (ctx.state === 'suspended') ctx.resume();

  const duration = 2.5;
  const buffer = createCrowdBuffer(ctx, duration);
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gain = ctx.createGain();
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.05, now);
  gain.gain.linearRampToValueAtTime(0.4, now + 0.3);  // Quick roar
  gain.gain.linearRampToValueAtTime(0.25, now + 1.2); // Sustain
  gain.gain.linearRampToValueAtTime(0.02, now + duration); // Fade

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(600, now);
  filter.frequency.linearRampToValueAtTime(1200, now + 0.3); // Opens up on roar

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
  source.stop(now + duration);
}

// Whistle — a short sine tone
export function playWhistle(double: boolean = false): void {
  const ctx = getCtx();
  if (ctx.state === 'suspended') ctx.resume();

  const blow = (startTime: number, dur: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 2200;
    gain.gain.setValueAtTime(0.12, startTime);
    gain.gain.setValueAtTime(0.12, startTime + dur - 0.03);
    gain.gain.linearRampToValueAtTime(0, startTime + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + dur);
  };

  const now = ctx.currentTime;
  if (double) {
    blow(now, 0.25);
    blow(now + 0.35, 0.5);
  } else {
    blow(now, 0.35);
  }
}

// Card sound — a short click/thud
export function playCardSound(): void {
  const ctx = getCtx();
  if (ctx.state === 'suspended') ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = 400;
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

// Stop all crowd audio
export function stopCrowdAmbience(): void {
  if (crowdNode) {
    crowdNode.stop();
    crowdNode = null;
  }
  isRunning = false;
}

// Get tension level from match state (for crowd intensity)
export function computeTension(minute: number, scoreDiff: number, isCloseMatch: boolean): number {
  let tension = 0.3;
  // Late game = more tension
  if (minute > 75) tension += 0.3;
  else if (minute > 60) tension += 0.15;
  // Close scoreline = more tension
  if (Math.abs(scoreDiff) <= 1) tension += 0.2;
  if (isCloseMatch && minute > 70) tension += 0.15;
  return Math.min(1, tension);
}
