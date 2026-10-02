/**
 * Rest-timer cues. The audio context is started from the tap that begins the
 * rest, so the tone at the end is allowed to play. Vibration needs the
 * Android VIBRATE permission.
 */

import { vibratePhone } from './nativeAppActions'

let audio: AudioContext | null = null

function context(): AudioContext | null {
  const Ctor =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!audio) audio = new Ctor()
  return audio
}

/** Call from the tap that starts the rest so the later tone is not blocked. */
export function primeRestAlert() {
  const ctx = context()
  if (!ctx) return
  void ctx.resume()
}

function tone(ctx: AudioContext, start: number, frequency: number) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(0.22, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.2)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(start)
  osc.stop(start + 0.22)
}

function buzz(pattern: number[]) {
  void vibratePhone(pattern)
}

/** One short buzz as the last 10 seconds begin. */
export function warnRestEnding() {
  buzz([120])
}

/** Two tones and a longer buzz when the rest is over. */
export function finishRestAlert() {
  buzz([0, 400, 120, 400, 120, 700])
  const ctx = context()
  if (!ctx) return
  void ctx.resume().then(() => {
    const now = ctx.currentTime
    tone(ctx, now, 880)
    tone(ctx, now + 0.28, 1175)
  })
}
