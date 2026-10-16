import type { Circuit, Signal } from './types'
import { evaluate } from './evaluate'

export interface TruthTableRow {
  inputs: Record<string, Signal>
  outputs: Record<string, Signal>
}

export interface TruthTable {
  inputNames: string[]
  outputNames: string[]
  rows: TruthTableRow[]
  truncated: boolean  // true if > 6 inputs (too many to enumerate)
}

/** Maximum inputs to enumerate (64 rows) */
const MAX_INPUTS = 6

/**
 * Find all SWITCH components (sorted by label then id for determinism).
 * These are the "primary inputs" for truth-table generation.
 */
export function findInputComponents(circuit: Circuit): string[] {
  return circuit.components
    .filter(c => c.type === 'SWITCH' || c.type === 'CONST')
    .filter(c => c.type === 'SWITCH')  // only switches are variable inputs
    .sort((a, b) => {
      const la = String(a.props.label ?? a.id)
      const lb = String(b.props.label ?? b.id)
      return la.localeCompare(lb)
    })
    .map(c => c.id)
}

/**
 * Find all LED/output components.
 */
export function findOutputComponents(circuit: Circuit): string[] {
  return circuit.components
    .filter(c => c.type === 'LED')
    .sort((a, b) => {
      const la = String(a.props.label ?? a.id)
      const lb = String(b.props.label ?? b.id)
      return la.localeCompare(lb)
    })
    .map(c => c.id)
}

/**
 * Generate a truth table for a combinational circuit.
 * Enumerates all 2^n input combinations (max 6 inputs = 64 rows).
 */
export function generateTruthTable(circuit: Circuit): TruthTable {
  const inputIds = findInputComponents(circuit)
  const outputIds = findOutputComponents(circuit)

  const inputNames = inputIds.map(id => {
    const comp = circuit.components.find(c => c.id === id)
    return String(comp?.props?.label ?? id)
  })
  const outputNames = outputIds.map(id => {
    const comp = circuit.components.find(c => c.id === id)
    return String(comp?.props?.label ?? id)
  })

  if (inputIds.length > MAX_INPUTS) {
    return { inputNames, outputNames, rows: [], truncated: true }
  }

  const n = inputIds.length
  const rows: TruthTableRow[] = []

  for (let mask = 0; mask < (1 << n); mask++) {
    // Set switch values
    const modifiedCircuit: Circuit = {
      ...circuit,
      components: circuit.components.map(comp => {
        const idx = inputIds.indexOf(comp.id)
        if (idx === -1) return comp
        const bit = (mask >> (n - 1 - idx)) & 1
        return { ...comp, props: { ...comp.props, value: bit } }
      }),
    }

    const result = evaluate(modifiedCircuit)

    const inputRow: Record<string, Signal> = {}
    for (let i = 0; i < inputIds.length; i++) {
      const bit = (mask >> (n - 1 - i)) & 1
      inputRow[inputNames[i]] = bit as Signal
    }

    const outputRow: Record<string, Signal> = {}
    for (let i = 0; i < outputIds.length; i++) {
      const compId = outputIds[i]
      outputRow[outputNames[i]] = result.signals.get(`${compId}:in0`) ?? null
    }

    rows.push({ inputs: inputRow, outputs: outputRow })
  }

  return { inputNames, outputNames, rows, truncated: false }
}

/**
 * Compare two truth tables for equivalence (same inputs, same outputs on every row).
 * Returns true if they are equivalent.
 */
export function tablesAreEquivalent(a: TruthTable, b: TruthTable): boolean {
  if (a.truncated || b.truncated) return false
  if (a.rows.length !== b.rows.length) return false
  if (a.inputNames.length !== b.inputNames.length) return false
  if (a.outputNames.length !== b.outputNames.length) return false

  for (let i = 0; i < a.rows.length; i++) {
    const ra = a.rows[i]
    const rb = b.rows[i]

    for (const name of a.inputNames) {
      if (ra.inputs[name] !== rb.inputs[name]) return false
    }
    for (const name of a.outputNames) {
      if (ra.outputs[name] !== rb.outputs[name]) return false
    }
  }
  return true
}

/**
 * Compare a circuit against a target truth table.
 * Returns { equivalent, firstFailRow } where firstFailRow is the index of the first mismatch.
 */
export function circuitMatchesTable(circuit: Circuit, target: TruthTable): {
  equivalent: boolean
  firstFailRow: number | null
  actual: TruthTable
} {
  const actual = generateTruthTable(circuit)
  if (actual.truncated || target.truncated) {
    return { equivalent: false, firstFailRow: null, actual }
  }

  for (let i = 0; i < target.rows.length; i++) {
    const targetRow = target.rows[i]
    const actualRow = actual.rows[i]
    if (!actualRow) return { equivalent: false, firstFailRow: i, actual }

    // Check every output column
    for (const name of target.outputNames) {
      const tv = targetRow.outputs[name]
      const av = actualRow.outputs[name]
      if (tv !== av) return { equivalent: false, firstFailRow: i, actual }
    }
  }

  return { equivalent: true, firstFailRow: null, actual }
}

/** Build a truth table directly from a boolean function over N inputs */
export function buildTableFromFn(
  inputNames: string[],
  outputNames: string[],
  fn: (inputs: Record<string, Signal>) => Record<string, Signal>
): TruthTable {
  const n = inputNames.length
  const rows: TruthTableRow[] = []

  for (let mask = 0; mask < (1 << n); mask++) {
    const inputs: Record<string, Signal> = {}
    for (let i = 0; i < n; i++) {
      inputs[inputNames[i]] = ((mask >> (n - 1 - i)) & 1) as Signal
    }
    const outputs = fn(inputs)
    rows.push({ inputs, outputs })
  }

  return { inputNames, outputNames, rows, truncated: n > MAX_INPUTS }
}
