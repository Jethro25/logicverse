import type { ComponentType } from '@/engine/types'
import type { CanvasCircuit, PuzzleConstraints } from '@/features/circuit/types'

// ── Puzzle mechanic data types ─────────────────────────────────────────────

export interface TruthTableData {
  mechanic: 'truth-table'
  gate: ComponentType
  numInputs?: number          // override (default from gate def)
  multiOutput?: boolean       // show multiple outputs (e.g. half-adder)
}

export interface GateSelectorData {
  mechanic: 'gate-selector'
  prompt: string              // "Which gate produces 1 only when BOTH inputs are 1?"
  options: ComponentType[]
  answer: ComponentType
  showTruthTable?: boolean    // show interactive truth table for selected gate
}

export interface NumberConvertData {
  mechanic: 'number-convert'
  value: number
  fromBase: 2 | 8 | 10 | 16
  toBase: 2 | 8 | 10 | 16
  bits?: number               // bit width for binary display
  showSteps?: boolean         // whether to guide step-by-step
}

export interface ComplementData {
  mechanic: 'complement'
  binary: string              // e.g. "01011010"
  type: '1s' | '2s'
  bits: 4 | 8
}

export interface CodeConvertData {
  mechanic: 'code-convert'
  fromCode: 'BINARY' | 'BCD' | 'GRAY' | 'EXCESS3'
  toCode: 'BINARY' | 'BCD' | 'GRAY' | 'EXCESS3'
  values: number[]            // decimal values 0–9 to convert
}

export interface CircuitBuildData {
  mechanic: 'circuit-build'
  description: string
  initial?: CanvasCircuit
  constraints?: PuzzleConstraints
  // Truth table for grading — all rows must match
  truthTable: {
    inputs: string[]          // input pin names (from SWITCH/CONST components)
    outputs: string[]         // output pin names (from LED/PROBE components)
    rows: (0 | 1)[][]        // each row: [...inputVals, ...outputVals]
  }
}

export interface ExpressionEntryData {
  mechanic: 'expression-entry'
  prompt: string              // e.g. "Enter a SOP expression for F(A,B,C) = Σm(0,3,5,7)"
  variables: string[]         // e.g. ['A','B','C']
  answer: string              // canonical form to compare against
  acceptEquivalent?: boolean  // if true, check logical equivalence (complex)
}

export type PuzzleData =
  | TruthTableData
  | GateSelectorData
  | NumberConvertData
  | ComplementData
  | CodeConvertData
  | CircuitBuildData
  | ExpressionEntryData

export type PuzzleMechanicType = PuzzleData['mechanic']

// ── Star criteria ──────────────────────────────────────────────────────────

export interface StarCriteria {
  star3: { maxAttempts: number; maxHints: number }
  star2: { maxAttempts: number; maxHints: number }
  // 1 star = just completing it
}

// ── Puzzle definition ──────────────────────────────────────────────────────

export interface PuzzleDef {
  id: string
  worldId: string
  title: string
  subtitle?: string
  icon?: string
  xpReward?: number
  difficulty?: 1 | 2 | 3      // 1=easy, 3=hard
  data: PuzzleData
  hints: string[]
  stars?: StarCriteria
  concept?: string             // brief concept reminder shown before puzzle
}

// ── Registry ───────────────────────────────────────────────────────────────

let _reg: Map<string, PuzzleDef> | undefined
function reg(): Map<string, PuzzleDef> {
  if (!_reg) _reg = new Map()
  return _reg
}

export function registerPuzzle(def: PuzzleDef): void {
  reg().set(def.id, def)
}

export function getPuzzle(id: string): PuzzleDef | undefined {
  return reg().get(id)
}

export function getAllPuzzles(): PuzzleDef[] {
  return Array.from(reg().values())
}

