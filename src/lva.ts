export interface LVASfx {
  hover(): void
  click(): void
  toggle(on: boolean): void
  page(): void
  flip(v: 0 | 1 | null): void
  snap(): void
  unsnap(): void
  place(): void
  chime(): void
  buzz(): void
  ding(): void
  star(n: number): void
  xp(): void
  levelUp(): void
  achieve(): void
  powerOn(): void
  swell(): void
  hop(): void
  blip(mood: string): void
}

export interface LVAEngine {
  S: LVASfx
  muted: boolean
  mv: number
  sv: number
  track: string
  ctx: AudioContext | null
  init(): AudioContext | null
  vol(): void
  setMv(v: number): void
  setSv(v: number): void
  toggleMute(): void
  wake(): void
  play(track: string): void
  stop(): void
  enter(track: string): void
  duck(on: boolean): void
  type(text: string, mood: string, onStep: (n: number, done: boolean) => void): () => void
  sub(fn: (lva: LVAEngine) => void): () => void
  rm(): boolean
}

declare global {
  interface Window {
    LVA: LVAEngine
  }
}

export function lva(): LVAEngine | undefined {
  return typeof window !== 'undefined' ? window.LVA : undefined
}

export function sfx(): LVASfx | undefined {
  return lva()?.S
}
