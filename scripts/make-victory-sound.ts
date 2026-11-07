/**
 * Synthesises STILLNESS's original 16-bit victory fanfare as a WAV file and
 * writes it into both apps (iOS bundle resource + web public folder).
 *
 * Voices mimic a classic console sound chip: 50% square lead, 25% square
 * harmony, triangle bass. Run with: bun scripts/make-victory-sound.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const SAMPLE_RATE = 44_100;
const GAP = 0.018; // tiny staccato gap between notes, very chiptune

type Note = { lead: number; harm: number | null; bass: number; dur: number };

// Original melody: rising arpeggio, bouncing call, triumphant held chord.
const SCORE: Note[] = [
  { lead: 67, harm: null, bass: 48, dur: 0.075 },
  { lead: 72, harm: null, bass: 48, dur: 0.075 },
  { lead: 76, harm: null, bass: 48, dur: 0.075 },
  { lead: 79, harm: null, bass: 48, dur: 0.075 },
  { lead: 84, harm: 79, bass: 48, dur: 0.24 },
  { lead: 79, harm: 76, bass: 43, dur: 0.1 },
  { lead: 84, harm: 79, bass: 43, dur: 0.1 },
  { lead: 88, harm: 84, bass: 43, dur: 0.1 },
  { lead: 86, harm: 83, bass: 43, dur: 0.15 },
  { lead: 88, harm: 84, bass: 43, dur: 0.15 },
  { lead: 91, harm: 88, bass: 48, dur: 0.95 },
];

const midiToHz = (midi: number): number => 440 * Math.pow(2, (midi - 69) / 12);

function square(phase: number, duty: number): number {
  return phase % 1 < duty ? 1 : -1;
}

function triangle(phase: number): number {
  const p = phase % 1;
  return p < 0.5 ? 4 * p - 1 : 3 - 4 * p;
}

function envelope(t: number, dur: number, isFinal: boolean): number {
  const attack = 0.003;
  const release = isFinal ? dur * 0.85 : 0.02;
  if (t < attack) return t / attack;
  const sustainLevel = isFinal ? 1 : 0.8;
  const decayed = t < 0.05 ? 1 - (1 - sustainLevel) * ((t - attack) / 0.05) : sustainLevel;
  const releaseStart = dur - release;
  if (t > releaseStart) return decayed * Math.max(0, (dur - t) / release);
  return decayed;
}

const total = SCORE.reduce((sum, note) => sum + note.dur, 0) + 0.05;
const samples = new Float32Array(Math.ceil(total * SAMPLE_RATE));

let cursor = 0;
SCORE.forEach((note, index) => {
  const isFinal = index === SCORE.length - 1;
  const sounding = isFinal ? note.dur : note.dur - GAP;
  const start = Math.round(cursor * SAMPLE_RATE);
  const count = Math.round(sounding * SAMPLE_RATE);
  let leadPhase = 0;
  let harmPhase = 0;
  let bassPhase = 0;
  for (let i = 0; i < count; i += 1) {
    const t = i / SAMPLE_RATE;
    // Delayed vibrato on the held final note.
    const vibrato = isFinal && t > 0.18 ? 0.25 * Math.sin(2 * Math.PI * 6.5 * t) : 0;
    leadPhase += midiToHz(note.lead + vibrato) / SAMPLE_RATE;
    harmPhase += (note.harm ? midiToHz(note.harm + vibrato) : 0) / SAMPLE_RATE;
    bassPhase += midiToHz(note.bass) / SAMPLE_RATE;
    const env = envelope(t, sounding, isFinal);
    let value = 0.3 * square(leadPhase, 0.5);
    if (note.harm) value += 0.15 * square(harmPhase, 0.25);
    value += 0.32 * triangle(bassPhase);
    samples[start + i] += value * env;
  }
  cursor += note.dur;
});

// Normalise to a comfortable peak.
let peak = 0;
for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
const gain = peak > 0 ? 0.8 / peak : 1;

const dataBytes = samples.length * 2;
const buffer = Buffer.alloc(44 + dataBytes);
buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + dataBytes, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20); // PCM
buffer.writeUInt16LE(1, 22); // mono
buffer.writeUInt32LE(SAMPLE_RATE, 24);
buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
buffer.writeUInt16LE(2, 32);
buffer.writeUInt16LE(16, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(dataBytes, 40);
samples.forEach((sample, index) => {
  const clamped = Math.max(-1, Math.min(1, sample * gain));
  buffer.writeInt16LE(Math.round(clamped * 32767), 44 + index * 2);
});

const root = join(import.meta.dir, "..");
const targets = [
  join(root, "ios-stillness/Stillness/Resources/victory.wav"),
  join(root, "web-stillness/public/sounds/victory.wav"),
];
for (const target of targets) {
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, buffer);
  console.log(`wrote ${target} (${(buffer.length / 1024).toFixed(1)} KB, ${total.toFixed(2)}s)`);
}
