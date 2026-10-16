import { SaveV1Schema, defaultSave, type SaveV1 } from './schema'

const KEY = 'logicverse.save'
const BACKUP_KEY = 'logicverse.save.bak'

function parseAndValidate(raw: string): SaveV1 | null {
  try {
    const json = JSON.parse(raw)
    const result = SaveV1Schema.safeParse(json)
    if (result.success) return result.data
    console.warn('[Save] Validation failed:', result.error.issues)
    return null
  } catch {
    console.warn('[Save] JSON parse failed')
    return null
  }
}

export function loadSave(): SaveV1 {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const save = parseAndValidate(raw)
      if (save) return save
      // Try backup
      const bak = localStorage.getItem(BACKUP_KEY)
      if (bak) {
        const backup = parseAndValidate(bak)
        if (backup) {
          console.warn('[Save] Loaded from backup.')
          return backup
        }
      }
    }
  } catch {
    // localStorage unavailable (private mode, etc.)
  }
  return defaultSave()
}

export function writeSave(save: SaveV1): void {
  try {
    // Keep previous as backup before overwriting
    const prev = localStorage.getItem(KEY)
    if (prev) localStorage.setItem(BACKUP_KEY, prev)

    const updated: SaveV1 = { ...save, updatedAt: new Date().toISOString() }
    localStorage.setItem(KEY, JSON.stringify(updated))
  } catch {
    console.warn('[Save] Could not write to localStorage.')
  }
}

export function exportSave(save: SaveV1): string {
  return btoa(JSON.stringify(save))
}

export function importSave(code: string): SaveV1 | null {
  try {
    const json = atob(code)
    return parseAndValidate(json)
  } catch {
    return null
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(KEY)
    localStorage.removeItem(BACKUP_KEY)
  } catch { /* ignore */ }
}
