import type { ComponentType } from '@/engine/types'

// ── Lesson page content types ──────────────────────────────────────────────

export interface TextPage {
  type: 'text'
  heading?: string
  body: string  // Markdown-lite: **bold**, `code`, \n for newline
}

export interface ExamplePage {
  type: 'example'
  heading?: string
  description: string
  steps: string[]
}

export interface DiagramPage {
  type: 'diagram'
  heading?: string
  caption?: string
  // A pre-wired circuit displayed in read-only mode
  circuit: {
    components: { id: string; type: ComponentType; x: number; y: number; props?: Record<string, unknown>; label?: string }[]
    wires: { id: string; from: { componentId: string; pin: string }; to: { componentId: string; pin: string } }[]
  }
  explanation?: string
}

export interface TruthTablePage {
  type: 'truth-table-demo'
  heading?: string
  inputs: string[]
  outputs: string[]
  rows: number[][]  // each row: [...inputValues, ...outputValues]
  highlight?: number  // row index to highlight
  caption?: string
}

export type LessonPage = TextPage | ExamplePage | DiagramPage | TruthTablePage

// ── Lesson definition ──────────────────────────────────────────────────────

export interface LessonDef {
  id: string
  worldId: string
  title: string
  subtitle?: string
  icon?: string
  xpReward: number
  pages: LessonPage[]
}

// ── Registry ───────────────────────────────────────────────────────────────

let _reg: Map<string, LessonDef> | undefined
function reg(): Map<string, LessonDef> {
  if (!_reg) _reg = new Map()
  return _reg
}

export function registerLesson(def: LessonDef): void {
  reg().set(def.id, def)
}

export function getLesson(id: string): LessonDef | undefined {
  return reg().get(id)
}

export function getAllLessons(): LessonDef[] {
  return Array.from(reg().values())
}

