/**
 * Plays the 16-bit victory fanfare. iPhone Safari only allows audio after a
 * user gesture, so the AudioContext is unlocked on the first tap/drag and the
 * sound is pre-decoded; the fanfare can then fire when the bar fills mid-drag.
 */
const SOUND_URL = "/sounds/victory.wav";

type AudioContextCtor = typeof AudioContext;

let context: AudioContext | null = null;
let buffer: AudioBuffer | null = null;
let loading: Promise<void> | null = null;

function getContext(): AudioContext | null {
  if (context) return context;
  const Ctor: AudioContextCtor | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
  if (!Ctor) return null;
  context = new Ctor();
  return context;
}

function load(ctx: AudioContext): Promise<void> {
  if (buffer) return Promise.resolve();
  if (!loading) {
    loading = fetch(SOUND_URL)
      .then((response) => response.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .then((decoded) => {
        buffer = decoded;
      })
      .catch(() => {
        console.warn("Stillness: victory sound could not be loaded");
        loading = null;
      });
  }
  return loading;
}

function unlock(): void {
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();
  // A silent blip fully unlocks audio output on iOS Safari.
  const silent = ctx.createBuffer(1, 1, 22_050);
  const source = ctx.createBufferSource();
  source.buffer = silent;
  source.connect(ctx.destination);
  source.start(0);
  void load(ctx);
}

/** Registers one-time gesture listeners that unlock audio. Call once at startup. */
export function primeVictorySound(): void {
  const events: (keyof WindowEventMap)[] = ["pointerdown", "touchend", "keydown"];
  const handler = (): void => {
    unlock();
    events.forEach((name) => window.removeEventListener(name, handler, true));
  };
  events.forEach((name) => window.addEventListener(name, handler, true));
}

/** Plays the fanfare once (no-op if audio is unavailable). */
export function playVictorySound(): void {
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();
  void load(ctx).then(() => {
    if (!buffer) return;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = 0.9;
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);
  });
}
