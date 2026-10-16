import type { ComponentDef, Signal } from '../types'

function gateInputPins(props: Record<string, unknown>): string[] {
  const count = typeof props.inputCount === 'number' ? props.inputCount : 2
  return Array.from({ length: count }, (_, i) => `in${i}`)
}

function gateInputs(inputs: Record<string, Signal>, props: Record<string, unknown>): Signal[] {
  const pins = gateInputPins(props)
  return pins.map(p => inputs[p] ?? null)
}

// If any input is null (unconnected), output is null unless the gate can
// short-circuit: AND with any 0 input → 0; OR with any 1 input → 1.
function andLogic(sigs: Signal[]): Signal {
  if (sigs.some(s => s === 0)) return 0
  if (sigs.some(s => s === null)) return null
  return 1
}

function orLogic(sigs: Signal[]): Signal {
  if (sigs.some(s => s === 1)) return 1
  if (sigs.some(s => s === null)) return null
  return 0
}

function xorLogic(sigs: Signal[]): Signal {
  if (sigs.some(s => s === null)) return null
  return (sigs as (0|1)[]).reduce<0|1>((acc, s) => (acc ^ s) as (0|1), 0)
}

export const AND: ComponentDef = {
  type: 'AND', label: 'AND', ic: '7408 (Quad 2-input AND)',
  kind: 'combinational',
  description: 'Output is 1 only when ALL inputs are 1.',
  inputPins: gateInputPins,
  outputPins: () => ['out'],
  minInputCount: 2, maxInputCount: 8,
  evaluate(inputs, props) {
    return { out: andLogic(gateInputs(inputs, props)) }
  },
}

export const OR: ComponentDef = {
  type: 'OR', label: 'OR', ic: '7432 (Quad 2-input OR)',
  kind: 'combinational',
  description: 'Output is 1 when AT LEAST ONE input is 1.',
  inputPins: gateInputPins,
  outputPins: () => ['out'],
  minInputCount: 2, maxInputCount: 8,
  evaluate(inputs, props) {
    return { out: orLogic(gateInputs(inputs, props)) }
  },
}

export const NOT: ComponentDef = {
  type: 'NOT', label: 'NOT', ic: '7404 (Hex Inverter)',
  kind: 'combinational',
  description: "Output is the opposite of the input. 0 → 1, 1 → 0.",
  inputPins: () => ['in0'],
  outputPins: () => ['out'],
  evaluate(inputs) {
    const s = inputs['in0']
    return { out: s === null ? null : (s === 0 ? 1 : 0) as Signal }
  },
}

export const NAND: ComponentDef = {
  type: 'NAND', label: 'NAND', ic: '7400 (Quad 2-input NAND)',
  kind: 'combinational',
  description: 'Output is 0 only when ALL inputs are 1. The universal gate!',
  inputPins: gateInputPins,
  outputPins: () => ['out'],
  minInputCount: 2, maxInputCount: 8,
  evaluate(inputs, props) {
    const a = andLogic(gateInputs(inputs, props))
    return { out: a === null ? null : (a === 0 ? 1 : 0) as Signal }
  },
}

export const NOR: ComponentDef = {
  type: 'NOR', label: 'NOR', ic: '7402 (Quad 2-input NOR)',
  kind: 'combinational',
  description: 'Output is 1 only when ALL inputs are 0.',
  inputPins: gateInputPins,
  outputPins: () => ['out'],
  minInputCount: 2, maxInputCount: 8,
  evaluate(inputs, props) {
    const o = orLogic(gateInputs(inputs, props))
    return { out: o === null ? null : (o === 0 ? 1 : 0) as Signal }
  },
}

export const XOR: ComponentDef = {
  type: 'XOR', label: 'XOR', ic: '7486 (Quad 2-input XOR)',
  kind: 'combinational',
  description: 'Output is 1 when an ODD number of inputs are 1.',
  inputPins: gateInputPins,
  outputPins: () => ['out'],
  minInputCount: 2, maxInputCount: 8,
  evaluate(inputs, props) {
    return { out: xorLogic(gateInputs(inputs, props)) }
  },
}

export const XNOR: ComponentDef = {
  type: 'XNOR', label: 'XNOR', ic: '74266 (Quad 2-input XNOR)',
  kind: 'combinational',
  description: 'Output is 1 when an EVEN number of inputs are 1 (including zero).',
  inputPins: gateInputPins,
  outputPins: () => ['out'],
  minInputCount: 2, maxInputCount: 8,
  evaluate(inputs, props) {
    const x = xorLogic(gateInputs(inputs, props))
    return { out: x === null ? null : (x === 0 ? 1 : 0) as Signal }
  },
}
