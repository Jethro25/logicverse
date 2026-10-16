import { create } from 'zustand'
import type { SaveV1, Settings } from './schema'
import { loadSave, writeSave, exportSave, importSave, clearSave } from './save'
import { WORLDS } from '@/content/worlds'

// XP thresholds per level (cumulative)
export const LEVEL_XP: number[] = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000]

export function xpToLevel(xp: number): number {
  let lvl = 1
  for (let i = 1; i < LEVEL_XP.length; i++) {
    if (xp >= LEVEL_XP[i]) lvl = i + 1
    else break
  }
  return Math.min(lvl, LEVEL_XP.length)
}

// Screen navigation
export type Screen =
  | { id: 'menu' }
  | { id: 'intro' }
  | { id: 'world-map' }
  | { id: 'world-hub'; worldId: string }
  | { id: 'lesson'; worldId: string; lessonId: string }
  | { id: 'puzzle'; worldId: string; puzzleId: string }
  | { id: 'circuit-lab' }
  | { id: 'glossary'; termId?: string }
  | { id: 'settings' }
  | { id: 'achievements' }
  | { id: 'credits' }

export interface Toast {
  id: string
  message: string
  type: 'info' | 'success' | 'achievement' | 'error'
  duration?: number
}

interface GameState {
  save: SaveV1
  screen: Screen
  history: Screen[]  // for back navigation
  toasts: Toast[]
  isFirstTime: boolean

  // Actions
  navigate: (screen: Screen) => void
  goBack: () => void

  // Save management
  awardXP: (amount: number) => void
  completeLesson: (lessonId: string) => void
  completePuzzle: (puzzleId: string, stars: number, usedShowSolution: boolean, hintsUsed: number) => void
  unlockAchievement: (id: string, label: string) => void
  updateSettings: (settings: Partial<Settings>) => void
  setPlayerName: (name: string) => void
  markWorldIntroduced: (worldId: string) => void

  exportProgress: () => string
  importProgress: (code: string) => boolean
  resetProgress: () => void

  // Toasts
  showToast: (toast: Omit<Toast, 'id'>) => void
  dismissToast: (id: string) => void

  // Unlock checks
  isWorldUnlocked: (worldId: string) => boolean
  worldProgress: (worldId: string) => number  // 0–100
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

function debouncedSave(save: SaveV1) {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => writeSave(save), 300)
}

export const useStore = create<GameState>()((set, get) => {
  const initialSave = loadSave()
  const isFirstTime = !initialSave.playerName

  return {
    save: initialSave,
    screen: { id: 'menu' },
    history: [],
    toasts: [],
    isFirstTime,

    navigate(screen) {
      set(s => ({
        history: [...s.history.slice(-19), s.screen],
        screen,
      }))
      // Sync to URL hash
      try { window.location.hash = screen.id } catch { /* ignore */ }
    },

    goBack() {
      const { history } = get()
      if (history.length === 0) {
        set({ screen: { id: 'menu' } })
        return
      }
      const prev = history[history.length - 1]
      set(s => ({ screen: prev, history: s.history.slice(0, -1) }))
    },

    awardXP(amount) {
      set(s => {
        const newXP = s.save.xp + amount
        const newLevel = xpToLevel(newXP)
        const leveled = newLevel > s.save.level
        const newSave = { ...s.save, xp: newXP, level: newLevel }
        debouncedSave(newSave)
        return {
          save: newSave,
          toasts: leveled
            ? [...s.toasts, { id: crypto.randomUUID(), message: `⭐ Level ${newLevel}!`, type: 'achievement' as const }]
            : s.toasts,
        }
      })
    },

    completeLesson(lessonId) {
      set(s => {
        const newSave = {
          ...s.save,
          progress: {
            ...s.save.progress,
            lessons: {
              ...s.save.progress.lessons,
              [lessonId]: { done: true, completedAt: new Date().toISOString() },
            },
          },
        }
        debouncedSave(newSave)
        return { save: newSave }
      })
      get().awardXP(50)
    },

    completePuzzle(puzzleId, stars, usedShowSolution, hintsUsed) {
      set(s => {
        const existing = s.save.progress.puzzles[puzzleId]
        const bestStars = Math.max(existing?.stars ?? 0, stars)
        const newSave = {
          ...s.save,
          progress: {
            ...s.save.progress,
            puzzles: {
              ...s.save.progress.puzzles,
              [puzzleId]: {
                stars: bestStars,
                attempts: (existing?.attempts ?? 0) + 1,
                hintsUsed: (existing?.hintsUsed ?? 0) + hintsUsed,
                usedShowSolution: (existing?.usedShowSolution ?? false) || usedShowSolution,
                solvedAt: existing?.solvedAt ?? new Date().toISOString(),
              },
            },
          },
        }
        debouncedSave(newSave)
        return { save: newSave }
      })
      const xpMap = [0, 30, 60, 100]
      get().awardXP(xpMap[stars] ?? 30)
    },

    unlockAchievement(id, label) {
      const { save } = get()
      if (save.achievements[id]) return  // already unlocked

      set(s => {
        const newSave = {
          ...s.save,
          achievements: { ...s.save.achievements, [id]: new Date().toISOString() },
        }
        debouncedSave(newSave)
        return {
          save: newSave,
          toasts: [...s.toasts, { id: crypto.randomUUID(), message: `🏆 ${label}`, type: 'achievement' as const, duration: 4000 }],
        }
      })
    },

    updateSettings(settings) {
      set(s => {
        const newSave = { ...s.save, settings: { ...s.save.settings, ...settings } }
        debouncedSave(newSave)
        return { save: newSave }
      })
    },

    setPlayerName(name) {
      set(s => {
        const newSave = { ...s.save, playerName: name }
        debouncedSave(newSave)
        return { save: newSave, isFirstTime: false }
      })
    },

    markWorldIntroduced(worldId) {
      set(s => {
        if (s.save.worldsIntroduced.includes(worldId)) return s
        const newSave = {
          ...s.save,
          worldsIntroduced: [...s.save.worldsIntroduced, worldId],
        }
        debouncedSave(newSave)
        return { save: newSave }
      })
    },

    exportProgress() {
      return exportSave(get().save)
    },

    importProgress(code) {
      const newSave = importSave(code)
      if (!newSave) return false
      writeSave(newSave)
      set({ save: newSave })
      return true
    },

    resetProgress() {
      clearSave()
      const fresh = { ...loadSave() }
      set({ save: fresh, screen: { id: 'menu' }, history: [], isFirstTime: true })
    },

    showToast(toast) {
      const id = crypto.randomUUID()
      set(s => ({ toasts: [...s.toasts, { ...toast, id }] }))
      const duration = toast.duration ?? 3000
      setTimeout(() => get().dismissToast(id), duration)
    },

    dismissToast(id) {
      set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
    },

    isWorldUnlocked(worldId) {
      const { save } = get()
      const world = WORLDS.find(w => w.id === worldId)
      if (!world) return false
      if (!world.unlocksAfter) return true  // World 1 is always unlocked
      // All puzzles in the prerequisite world must be solved (at least 1 star)
      const prevWorld = WORLDS.find(w => w.id === world.unlocksAfter)
      if (!prevWorld) return true
      return prevWorld.puzzleIds.every(
        pid => (save.progress.puzzles[pid]?.stars ?? 0) >= 1
      )
    },

    worldProgress(worldId) {
      const { save } = get()
      const world = WORLDS.find(w => w.id === worldId)
      if (!world) return 0
      const totalItems = world.lessonIds.length + world.puzzleIds.length
      if (totalItems === 0) return 0
      const doneLessons = world.lessonIds.filter(id => save.progress.lessons[id]?.done).length
      const donePuzzles = world.puzzleIds.filter(id => (save.progress.puzzles[id]?.stars ?? 0) >= 1).length
      return Math.round(((doneLessons + donePuzzles) / totalItems) * 100)
    },
  }
})
