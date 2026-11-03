import { audio } from "./audioEngine";

/**
 * Read-aloud (TTS) for the games' 🔊 buttons — speechSynthesis with BGM ducked while it talks
 * (docs/software/11 ข้อ 6.5). Always go through here instead of calling speechSynthesis directly.
 */

let active: SpeechSynthesisUtterance | null = null;

function release(utterance: SpeechSynthesisUtterance) {
  if (active !== utterance) return;
  active = null;
  audio.unduck("tts");
}

/** Speaks `text` (stopping whatever was being read). Returns false when the browser has no TTS. */
export function speak(text: string, opts: { rate?: number; lang?: string; onEnd?: () => void } = {}): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  cancelSpeech();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = opts.lang ?? "th-TH";
  if (opts.rate !== undefined) utterance.rate = opts.rate;
  const done = () => {
    release(utterance);
    opts.onEnd?.();
  };
  utterance.onend = done;
  utterance.onerror = done;
  // ducked from the call, not onstart — iOS doesn't fire onstart reliably
  active = utterance;
  audio.duck("tts");
  window.speechSynthesis.speak(utterance);
  return true;
}

/** Stops reading — onend doesn't always fire after cancel(), so the duck is released here. */
export function cancelSpeech() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  if (active) release(active);
  window.speechSynthesis.cancel();
}
