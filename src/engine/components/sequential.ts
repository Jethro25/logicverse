import type { ComponentDef, FlipFlopState, Signal } from '../types'

const defaultFFState = (): FlipFlopState => ({ Q: 0, Qbar: 1 })

// SR Latch built from NOR gates
// Inputs: S (Set), R (Reset)
// R=0, S=0: hold; R=0, S=1: Q=1; R=1, S=0: Q=0; R=1, S=1: forbidden (outputs null)
export const SR_LATCH_NOR: ComponentDef = {
  type: 'SR_LATCH_NOR', label: 'SR Latch (NOR)',
  kind: 'sequential',
  description: 'SR latch built from NOR gates. S=Set Q=1, R=Reset Q=0. S=R=1 is forbidden.',
  inputPins: () => ['S', 'R'],
  outputPins: () => ['Q', 'Qbar'],
  defaultState: defaultFFState,
  evaluate(inputs, _props, state) {
    const S = inputs['S']
    const R = inputs['R']
    if (S === null || R === null) return { Q: null, Qbar: null }
    if (S === 1 && R === 1) return { Q: null, Qbar: null }  // forbidden
    if (S === 1) return { Q: 1, Qbar: 0 }
    if (R === 1) return { Q: 0, Qbar: 1 }
    // Hold: return current state
    return { Q: state?.Q ?? 0, Qbar: state?.Qbar ?? 1 }
  },
  nextState(inputs, _props, state) {
    const S = inputs['S']
    const R = inputs['R']
    if (S === null || R === null) return state
    if (S === 1 && R === 1) return state  // forbidden: hold
    if (S === 1) return { Q: 1, Qbar: 0 }
    if (R === 1) return { Q: 0, Qbar: 1 }
    return state  // hold
  },
}

// SR Latch built from NAND gates (active-low inputs)
// S'=0, R'=1: Q=1 (set); S'=1, R'=0: Q=0 (reset); S'=R'=1: hold; S'=R'=0: forbidden
export const SR_LATCH_NAND: ComponentDef = {
  type: 'SR_LATCH_NAND', label: "SR Latch (NAND, active-low)",
  kind: 'sequential',
  description: "SR latch from NAND gates. Inputs are active-LOW: S'=0 sets, R'=0 resets.",
  inputPins: () => ["S'", "R'"],
  outputPins: () => ['Q', 'Qbar'],
  defaultState: defaultFFState,
  evaluate(inputs, _props, state) {
    const S = inputs["S'"]
    const R = inputs["R'"]
    if (S === null || R === null) return { Q: null, Qbar: null }
    if (S === 0 && R === 0) return { Q: null, Qbar: null }  // forbidden
    if (S === 0) return { Q: 1, Qbar: 0 }
    if (R === 0) return { Q: 0, Qbar: 1 }
    return { Q: state?.Q ?? 0, Qbar: state?.Qbar ?? 1 }
  },
  nextState(inputs, _props, state) {
    const S = inputs["S'"]
    const R = inputs["R'"]
    if (S === null || R === null) return state
    if (S === 0 && R === 0) return state
    if (S === 0) return { Q: 1, Qbar: 0 }
    if (R === 0) return { Q: 0, Qbar: 1 }
    return state
  },
}

// Gated D Latch — transparent when EN=1
export const D_LATCH: ComponentDef = {
  type: 'D_LATCH', label: 'D Latch (Gated)',
  kind: 'sequential',
  description: 'Transparent when Enable=1. Q follows D when enabled; holds when disabled.',
  inputPins: () => ['D', 'EN'],
  outputPins: () => ['Q', 'Qbar'],
  defaultState: defaultFFState,
  evaluate(inputs, _props, state) {
    if (inputs['EN'] === 1) {
      const d = inputs['D']
      if (d === null) return { Q: null, Qbar: null }
      return { Q: d, Qbar: (d === 0 ? 1 : 0) as Signal }
    }
    return { Q: state?.Q ?? 0, Qbar: state?.Qbar ?? 1 }
  },
  nextState(inputs, _props, state) {
    if (inputs['EN'] === 1) {
      const d = inputs['D']
      if (d === null) return state
      return { Q: d, Qbar: (d === 0 ? 1 : 0) as Signal }
    }
    return state
  },
}

// D Flip-Flop — positive edge triggered
export const D_FF: ComponentDef = {
  type: 'D_FF', label: 'D Flip-Flop',
  ic: '7474 (Dual D Flip-Flop)',
  kind: 'sequential',
  description: 'Q captures the value of D on the rising edge of CLK.',
  inputPins: () => ['D', 'CLK'],
  outputPins: () => ['Q', 'Qbar'],
  defaultState: defaultFFState,
  evaluate(_inputs, _props, state) {
    // Output is held state; nextState() updates on rising edge
    return { Q: state?.Q ?? 0, Qbar: state?.Qbar ?? 1 }
  },
  nextState(inputs, _props, state, edge) {
    if (edge !== 'rise') return state
    const d = inputs['D']
    if (d === null) return state
    return { Q: d, Qbar: (d === 0 ? 1 : 0) as Signal }
  },
}

// JK Flip-Flop — positive edge triggered
export const JK_FF: ComponentDef = {
  type: 'JK_FF', label: 'JK Flip-Flop',
  ic: '7476 (Dual JK Flip-Flop)',
  kind: 'sequential',
  description: 'J=K=0: hold; J=1,K=0: set; J=0,K=1: reset; J=K=1: toggle.',
  inputPins: () => ['J', 'K', 'CLK'],
  outputPins: () => ['Q', 'Qbar'],
  defaultState: defaultFFState,
  evaluate(_inputs, _props, state) {
    return { Q: state?.Q ?? 0, Qbar: state?.Qbar ?? 1 }
  },
  nextState(inputs, _props, state, edge) {
    if (edge !== 'rise') return state
    const J = inputs['J']
    const K = inputs['K']
    const Q = state?.Q ?? 0
    if (J === null || K === null) return state
    if (J === 1 && K === 1) {
      const newQ: Signal = Q === 0 ? 1 : 0
      return { Q: newQ, Qbar: (newQ === 0 ? 1 : 0) as Signal }
    }
    if (J === 1) return { Q: 1, Qbar: 0 }
    if (K === 1) return { Q: 0, Qbar: 1 }
    return state
  },
}

// T Flip-Flop — positive edge triggered
export const T_FF: ComponentDef = {
  type: 'T_FF', label: 'T Flip-Flop',
  kind: 'sequential',
  description: 'T=0: hold; T=1: toggle Q on every rising clock edge.',
  inputPins: () => ['T', 'CLK'],
  outputPins: () => ['Q', 'Qbar'],
  defaultState: defaultFFState,
  evaluate(_inputs, _props, state) {
    return { Q: state?.Q ?? 0, Qbar: state?.Qbar ?? 1 }
  },
  nextState(inputs, _props, state, edge) {
    if (edge !== 'rise') return state
    const T = inputs['T']
    const Q = state?.Q ?? 0
    if (T === null) return state
    if (T === 1) {
      const newQ: Signal = Q === 0 ? 1 : 0
      return { Q: newQ, Qbar: (newQ === 0 ? 1 : 0) as Signal }
    }
    return state
  },
}
