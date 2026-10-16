// Core signal type: null means unknown/unconnected (shown as "?" in the UI)
export type Signal = 0 | 1 | null

export interface PinRef {
  componentId: string
  pin: string
}

export interface Wire {
  id: string
  from: PinRef  // always an output pin
  to: PinRef    // always an input pin
}

export interface ComponentInstance {
  id: string
  type: ComponentType
  x: number
  y: number
  props: Record<string, unknown>
  // e.g. { inputCount: 3, value: 1, label: 'A' }
}

export interface Circuit {
  schema: 1
  components: ComponentInstance[]
  wires: Wire[]
}

// Component types available in the engine
export type ComponentType =
  // Gates
  | 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR'
  // I/O
  | 'SWITCH' | 'CONST' | 'CLOCK' | 'LED' | 'PROBE'
  // Sequential
  | 'SR_LATCH_NOR' | 'SR_LATCH_NAND' | 'D_LATCH' | 'D_FF' | 'JK_FF' | 'T_FF'
  // MSI (Milestone 2)
  | 'HALF_ADDER' | 'FULL_ADDER' | 'DECODER_2_4' | 'DECODER_3_8'
  | 'ENCODER_4_2' | 'MUX_2_1' | 'MUX_4_1' | 'DEMUX_1_2'
  | 'COMPARATOR_1' | 'BCD_7SEG'

export interface EvalError {
  code:
    | 'CYCLE'
    | 'MISSING_INPUT'
    | 'MULTIPLE_DRIVERS'
    | 'INVALID_ARITY'
    | 'OUTPUT_TO_OUTPUT'
    | 'UNKNOWN_PIN'
    | 'UNKNOWN_COMPONENT'
  componentId?: string
  wireId?: string
  message: string
  // For cycle errors, the IDs of components in the loop
  cycleIds?: string[]
}

export interface EvalResult {
  signals: Map<string, Signal>  // key: "componentId:pin"
  errors: EvalError[]
  order: string[]               // evaluation order (component IDs)
}

export interface SimState {
  // Per-sequential-component state: component ID → component-specific state
  flipFlopStates: Record<string, FlipFlopState>
  clockHigh: Record<string, boolean>  // per clock component
  history: HistoryFrame[]             // timing diagram, capped at 64
  step: number
}

export interface FlipFlopState {
  Q: Signal
  Qbar: Signal
}

export interface HistoryFrame {
  step: number
  signals: Record<string, Signal>  // key: "componentId:pin"
}

// Component definition (the registry entry)
export interface ComponentDef {
  type: ComponentType
  label: string
  ic?: string                      // e.g. "7408 (Quad 2-input AND)"
  kind: 'source' | 'combinational' | 'sequential' | 'sink'
  inputPins(props: Record<string, unknown>): string[]
  outputPins(props: Record<string, unknown>): string[]
  minInputCount?: number
  maxInputCount?: number
  // Pure evaluation: given input signals → output signals
  evaluate(inputs: Record<string, Signal>, props: Record<string, unknown>, state?: FlipFlopState): Record<string, Signal>
  // Sequential only: given inputs, current state, clock edge → next state
  nextState?(inputs: Record<string, Signal>, props: Record<string, unknown>, state: FlipFlopState, edge: 'rise' | 'fall' | 'none'): FlipFlopState
  // Default state for sequential components
  defaultState?(): FlipFlopState
  // For display
  description: string
  truthTable?: Array<Record<string, Signal>>
}
