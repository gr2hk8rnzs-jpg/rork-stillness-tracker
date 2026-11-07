/**
 * Plays the 16-bit victory fanfare.
 *
 * iPhone Safari rules this works around:
 * - Audio may only start inside a real tap ("touchend"/"click"/"keydown");
 *   "pointerdown"/"touchstart" do NOT count. So the audio element is unlocked
 *   with a muted play() on the first real tap, after which it can be played
 *   programmatically (e.g. when the bar fills mid-drag).
 * - Web Audio is muted by the ring/silent switch, but an <audio> element is
 *   not, so we use a plain HTMLAudioElement.
 * - If the bar fills before audio is unlocked (very first drag), the fanfare
 *   is queued and plays the instant the finger lifts.
 */
const SOUND_URL = "/sounds/victory.wav";
const PENDING_WINDOW_MS = 4000;
const UNLOCK_EVENTS: (keyof WindowEventMap)[] = ["touchend", "click", "keydown"];

let audio: HTMLAudioElement | null = null;
let unlocked = false;
let pendingSince: number | null = null;

function getAudio(): HTMLAudioElement | null {
  if (audio) return audio;
  if (typeof Audio === "undefined") return null;
  audio = new Audio(SOUND_URL);
  audio.preload = "auto";
  audio.setAttribute("playsinline", "");
  audio.volume = 0.9;
  return audio;
}

function startPlayback(element: HTMLAudioElement): Promise<void> {
  element.muted = false;
  element.currentTime = 0;
  return element.play();
}

function handleGesture(): void {
  const element = getAudio();
  if (!element) return;

  // The goal was hit before audio was allowed: play it now, inside the tap.
  if (pendingSince !== null && Date.now() - pendingSince < PENDING_WINDOW_MS) {
    pendingSince = null;
    startPlayback(element)
      .then(markUnlocked)
      .catch(() => console.warn("Stillness: victory sound blocked"));
    return;
  }
  pendingSince = null;
  if (unlocked) return;

  // Silent unlock: play muted, then rewind, so later play() calls are allowed.
  element.muted = true;
  element
    .play()
    .then(() => {
      element.pause();
      element.currentTime = 0;
      element.muted = false;
      markUnlocked();
    })
    .catch(() => {
      element.muted = false;
    });
}

function markUnlocked(): void {
  unlocked = true;
}

/** Registers gesture listeners that unlock audio. Call once at startup. */
export function primeVictorySound(): void {
  // Listeners stay registered (they're cheap) so a queued fanfare can always
  // be released on the next tap, even after unlocking.
  UNLOCK_EVENTS.forEach((name) => window.addEventListener(name, handleGesture, true));
}

/** Plays the fanfare once; if the browser isn't ready yet, plays on next tap. */
export function playVictorySound(): void {
  const element = getAudio();
  if (!element) return;
  startPlayback(element)
    .then(() => {
      markUnlocked();
      pendingSince = null;
    })
    .catch(() => {
      // Not unlocked yet — queue it for the moment the finger lifts.
      pendingSince = Date.now();
    });
}
