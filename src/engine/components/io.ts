import type { ComponentDef, Signal } from '../types'

export const SWITCH: ComponentDef = {
  type: 'SWITCH', label: 'Switch',
  kind: 'source',
  description: 'An input that you can set to 0 or 1.',
  inputPins: () => [],
  outputPins: () => ['out'],
  evaluate(_inputs, props) {
    const value = props.value === 1 ? 1 : 0
    return { out: value as Signal }
  },
}

export const CONST: ComponentDef = {
  type: 'CONST', label: 'Constant',
  kind: 'source',
  description: 'A fixed value of 0 or 1.',
  inputPins: () => [],
  outputPins: () => ['out'],
  evaluate(_inputs, props) {
    const value = props.value === 1 ? 1 : 0
    return { out: value as Signal }
  },
}

export const CLOCK: ComponentDef = {
  type: 'CLOCK', label: 'Clock',
  kind: 'source',
  description: 'A clock signal. Toggled by the simulation stepper.',
  inputPins: () => [],
  outputPins: () => ['out'],
  evaluate(_inputs, props) {
    // props.high is set by the simulator
    return { out: props.high === true ? 1 : 0 }
  },
}

export const LED: ComponentDef = {
  type: 'LED', label: 'LED Output',
  kind: 'sink',
  description: 'Shows the value of its input: lit = 1, dark = 0.',
  inputPins: () => ['in0'],
  outputPins: () => [],
  evaluate(_inputs) {
    return {}  // sink: no outputs, but callers can read _inputs['in0'] for display
  },
}

export const PROBE: ComponentDef = {
  type: 'PROBE', label: 'Probe',
  kind: 'sink',
  description: 'Shows the signal value on a wire. Useful for inspecting intermediate signals.',
  inputPins: () => ['in0'],
  outputPins: () => [],
  evaluate() {
    return {}
  },
}
