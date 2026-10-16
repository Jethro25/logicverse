import type { Circuit, EvalResult, Signal, SimState } from './types'
import { getComponentDef } from './components/registry'
import { topologicalSort } from './graph'
import { validateCircuit } from './validate'

/**
 * Evaluate a circuit and return signals for every pin.
 * Sequential components are treated as sources: their output is read from `simState`,
 * defaulting to the component's `defaultState()` if not yet set.
 */
export function evaluate(
  circuit: Circuit,
  simState?: Partial<SimState>
): EvalResult {
  const errors = validateCircuit(circuit)
  const { order, cycleError } = topologicalSort(circuit)

  if (cycleError) {
    errors.push(cycleError)
  }

  // Build a quick lookup: "compId:pin" → signal
  const signals = new Map<string, Signal>()

  // Wire lookup: "toCompId:toPin" → signal from the driving output
  const wireValues = new Map<string, Signal>()  // "toCompId:toPin" → signal

  // Pre-populate wire destinations
  const buildWireMap = () => {
    wireValues.clear()
    for (const wire of circuit.wires) {
      const fromKey = `${wire.from.componentId}:${wire.from.pin}`
      const val = signals.get(fromKey) ?? null
      wireValues.set(`${wire.to.componentId}:${wire.to.pin}`, val)
    }
  }

  // Evaluate in topological order, then evaluate remaining (cyclic) ones last
  const allIds = [
    ...order,
    ...circuit.components.map(c => c.id).filter(id => !order.includes(id)),
  ]

  for (const compId of allIds) {
    const comp = circuit.components.find(c => c.id === compId)
    if (!comp) continue

    const def = getComponentDef(comp.type)

    // Rebuild wire map each pass so we see outputs from earlier components
    buildWireMap()

    // Collect input signals (null for unconnected pins)
    const inputSignals: Record<string, Signal> = {}
    for (const pin of def.inputPins(comp.props)) {
      inputSignals[pin] = wireValues.get(`${comp.id}:${pin}`) ?? null
    }

    // For sequential components, use stored state from simState
    const ffStates = simState?.flipFlopStates ?? {}
    const state = ffStates[comp.id] ?? def.defaultState?.()

    // Evaluate the component
    const outputSignals = def.evaluate(inputSignals, comp.props, state)

    // Store output signals
    for (const [pin, sig] of Object.entries(outputSignals)) {
      signals.set(`${comp.id}:${pin}`, sig as Signal)
    }

    // Also store input signals for display (probes, LEDs)
    for (const [pin, sig] of Object.entries(inputSignals)) {
      signals.set(`${comp.id}:${pin}`, sig)
    }
  }

  return { signals, errors, order }
}

/**
 * Advance the simulation by one clock step.
 * 1. Evaluate the circuit with current state.
 * 2. Detect rising edges on every clock component.
 * 3. Compute nextState for every sequential component.
 * 4. Commit new states and toggle clock.
 */
export function step(circuit: Circuit, state: SimState): SimState {
  const result = evaluate(circuit, state)

  // Detect rising edges (clock components going 0→1 on this step)
  const newClockHigh: Record<string, boolean> = {}
  const edges: Record<string, 'rise' | 'fall' | 'none'> = {}

  for (const comp of circuit.components) {
    if (comp.type === 'CLOCK') {
      const wasHigh = state.clockHigh[comp.id] ?? false
      const isHigh = !wasHigh  // toggle on each step
      newClockHigh[comp.id] = isHigh
      edges[comp.id] = isHigh ? 'rise' : 'fall'

      // Update clock signal
      result.signals.set(`${comp.id}:out`, isHigh ? 1 : 0)
    }
  }

  // Re-evaluate with updated clock signals so FF inputs see the right values
  // (In a real circuit all this happens instantaneously; we approximate)
  const result2 = evaluate(circuit, { ...state, clockHigh: newClockHigh })

  // Compute next flip-flop states
  const newFFStates: Record<string, import('./types').FlipFlopState> = { ...state.flipFlopStates }

  for (const comp of circuit.components) {
    const def = getComponentDef(comp.type)
    if (def.kind !== 'sequential') continue

    const inputSignals: Record<string, Signal> = {}
    for (const pin of def.inputPins(comp.props)) {
      inputSignals[pin] = result2.signals.get(`${comp.id}:${pin}`) ?? null
    }

    // Determine clock edge for this component
    // Find which clock is connected to this component's CLK pin
    let edge: 'rise' | 'fall' | 'none' = 'none'
    const clkWire = circuit.wires.find(w =>
      w.to.componentId === comp.id && w.to.pin === 'CLK'
    )
    if (clkWire) {
      const clockCompId = clkWire.from.componentId
      edge = edges[clockCompId] ?? 'none'
    }

    const currentState = state.flipFlopStates[comp.id] ?? def.defaultState?.() ?? { Q: 0, Qbar: 1 }
    const nextSt = def.nextState
      ? def.nextState(inputSignals, comp.props, currentState, edge)
      : currentState

    newFFStates[comp.id] = nextSt
  }

  // Record history frame
  const frameSignals: Record<string, Signal> = {}
  for (const [key, val] of result2.signals) {
    frameSignals[key] = val
  }

  const newHistory = [
    ...state.history,
    { step: state.step, signals: frameSignals },
  ].slice(-64)  // cap at 64 frames

  return {
    flipFlopStates: newFFStates,
    clockHigh: newClockHigh,
    history: newHistory,
    step: state.step + 1,
  }
}

export function initialSimState(): SimState {
  return {
    flipFlopStates: {},
    clockHigh: {},
    history: [],
    step: 0,
  }
}
