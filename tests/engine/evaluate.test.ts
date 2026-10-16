import { describe, it, expect } from 'vitest'
import type { Circuit } from '@/engine/types'
import { evaluate, initialSimState, step } from '@/engine/evaluate'
import { generateTruthTable, circuitMatchesTable, buildTableFromFn } from '@/engine/truthTable'

// Helper to build a simple circuit
function makeCircuit(components: Circuit['components'], wires: Circuit['wires']): Circuit {
  return { schema: 1, components, wires }
}

// AND circuit: switch_a AND switch_b → LED
const andCircuit: Circuit = makeCircuit(
  [
    { id: 'a', type: 'SWITCH', x: 0, y: 0, props: { label: 'A', value: 0 } },
    { id: 'b', type: 'SWITCH', x: 0, y: 1, props: { label: 'B', value: 0 } },
    { id: 'and1', type: 'AND', x: 1, y: 0, props: { inputCount: 2 } },
    { id: 'led', type: 'LED', x: 2, y: 0, props: { label: 'F' } },
  ],
  [
    { id: 'w1', from: { componentId: 'a', pin: 'out' }, to: { componentId: 'and1', pin: 'in0' } },
    { id: 'w2', from: { componentId: 'b', pin: 'out' }, to: { componentId: 'and1', pin: 'in1' } },
    { id: 'w3', from: { componentId: 'and1', pin: 'out' }, to: { componentId: 'led', pin: 'in0' } },
  ]
)

describe('evaluate: AND circuit', () => {
  it('produces correct signals for A=0,B=0', () => {
    const c = { ...andCircuit, components: andCircuit.components.map(c => c.id === 'a' ? { ...c, props: { ...c.props, value: 0 } } : c.id === 'b' ? { ...c, props: { ...c.props, value: 0 } } : c) }
    const r = evaluate(c)
    expect(r.errors.filter(e => e.code !== 'MISSING_INPUT')).toHaveLength(0)
    expect(r.signals.get('led:in0')).toBe(0)
  })

  it('produces correct signals for A=1,B=1', () => {
    const c = { ...andCircuit, components: andCircuit.components.map(c => c.id === 'a' ? { ...c, props: { ...c.props, value: 1 } } : c.id === 'b' ? { ...c, props: { ...c.props, value: 1 } } : c) }
    const r = evaluate(c)
    expect(r.signals.get('led:in0')).toBe(1)
  })

  it('generates correct truth table', () => {
    const tt = generateTruthTable(andCircuit)
    expect(tt.rows).toHaveLength(4)
    expect(tt.rows[0].outputs['F']).toBe(0)
    expect(tt.rows[1].outputs['F']).toBe(0)
    expect(tt.rows[2].outputs['F']).toBe(0)
    expect(tt.rows[3].outputs['F']).toBe(1)
  })

  it('matches against a correct target table', () => {
    const target = buildTableFromFn(['A', 'B'], ['F'], ({ A, B }) => ({ F: (A && B ? 1 : 0) as import('@/engine/types').Signal }))
    const result = circuitMatchesTable(andCircuit, target)
    expect(result.equivalent).toBe(true)
  })

  it('detects mismatch against OR target', () => {
    const orTarget = buildTableFromFn(['A', 'B'], ['F'], ({ A, B }) => ({ F: (A || B ? 1 : 0) as import('@/engine/types').Signal }))
    const result = circuitMatchesTable(andCircuit, orTarget)
    expect(result.equivalent).toBe(false)
    expect(result.firstFailRow).toBe(1)  // row A=0,B=1: AND gives 0, OR expects 1
  })
})

describe('evaluate: series gates (NOT → LED)', () => {
  it('NOT gate inverts signal', () => {
    const c: Circuit = makeCircuit(
      [
        { id: 'sw', type: 'SWITCH', x: 0, y: 0, props: { label: 'A', value: 1 } },
        { id: 'not1', type: 'NOT', x: 1, y: 0, props: {} },
        { id: 'led', type: 'LED', x: 2, y: 0, props: { label: 'F' } },
      ],
      [
        { id: 'w1', from: { componentId: 'sw', pin: 'out' }, to: { componentId: 'not1', pin: 'in0' } },
        { id: 'w2', from: { componentId: 'not1', pin: 'out' }, to: { componentId: 'led', pin: 'in0' } },
      ]
    )
    const r = evaluate(c)
    expect(r.signals.get('led:in0')).toBe(0)
  })
})

describe('evaluate: unconnected input = null', () => {
  it('unconnected AND input propagates null', () => {
    const c: Circuit = makeCircuit(
      [
        { id: 'sw', type: 'SWITCH', x: 0, y: 0, props: { label: 'A', value: 1 } },
        { id: 'and1', type: 'AND', x: 1, y: 0, props: { inputCount: 2 } },
        { id: 'led', type: 'LED', x: 2, y: 0, props: { label: 'F' } },
      ],
      [
        { id: 'w1', from: { componentId: 'sw', pin: 'out' }, to: { componentId: 'and1', pin: 'in0' } },
        { id: 'w2', from: { componentId: 'and1', pin: 'out' }, to: { componentId: 'led', pin: 'in0' } },
      ]
    )
    const r = evaluate(c)
    // in1 is null → AND with 1 and null = null
    expect(r.signals.get('led:in0')).toBeNull()
  })
})

describe('evaluate: cycle detection', () => {
  it('detects a combinational cycle and reports it', () => {
    // NOT gate feeding itself
    const c: Circuit = makeCircuit(
      [
        { id: 'not1', type: 'NOT', x: 0, y: 0, props: {} },
      ],
      [
        { id: 'w1', from: { componentId: 'not1', pin: 'out' }, to: { componentId: 'not1', pin: 'in0' } },
      ]
    )
    const r = evaluate(c)
    expect(r.errors.some(e => e.code === 'CYCLE')).toBe(true)
  })
})

describe('evaluate: validation errors', () => {
  it('detects multiple drivers on one input', () => {
    const c: Circuit = makeCircuit(
      [
        { id: 'a', type: 'SWITCH', x: 0, y: 0, props: { value: 0 } },
        { id: 'b', type: 'SWITCH', x: 0, y: 1, props: { value: 1 } },
        { id: 'led', type: 'LED', x: 1, y: 0, props: {} },
      ],
      [
        { id: 'w1', from: { componentId: 'a', pin: 'out' }, to: { componentId: 'led', pin: 'in0' } },
        { id: 'w2', from: { componentId: 'b', pin: 'out' }, to: { componentId: 'led', pin: 'in0' } },
      ]
    )
    const r = evaluate(c)
    expect(r.errors.some(e => e.code === 'MULTIPLE_DRIVERS')).toBe(true)
  })
})

describe('sequential: D flip-flop', () => {
  it('captures D on rising edge', () => {
    const c: Circuit = makeCircuit(
      [
        { id: 'clk', type: 'CLOCK', x: 0, y: 0, props: {} },
        { id: 'd_sw', type: 'SWITCH', x: 0, y: 1, props: { value: 1 } },
        { id: 'dff', type: 'D_FF', x: 1, y: 0, props: {} },
        { id: 'led', type: 'LED', x: 2, y: 0, props: { label: 'Q' } },
      ],
      [
        { id: 'w1', from: { componentId: 'clk', pin: 'out' }, to: { componentId: 'dff', pin: 'CLK' } },
        { id: 'w2', from: { componentId: 'd_sw', pin: 'out' }, to: { componentId: 'dff', pin: 'D' } },
        { id: 'w3', from: { componentId: 'dff', pin: 'Q' }, to: { componentId: 'led', pin: 'in0' } },
      ]
    )

    let state = initialSimState()
    // Initial state: Q=0
    const r0 = evaluate(c, state)
    expect(r0.signals.get('dff:Q')).toBe(0)

    // Step once: CLK goes high (rise edge) → D=1 captured
    state = step(c, state)
    const r1 = evaluate(c, state)
    expect(r1.signals.get('dff:Q')).toBe(1)
  })
})

describe('sequential: T flip-flop counter', () => {
  it('toggles on every rising edge with T=1', () => {
    const c: Circuit = makeCircuit(
      [
        { id: 'clk', type: 'CLOCK', x: 0, y: 0, props: {} },
        { id: 't_sw', type: 'SWITCH', x: 0, y: 1, props: { value: 1 } },
        { id: 'tff', type: 'T_FF', x: 1, y: 0, props: {} },
      ],
      [
        { id: 'w1', from: { componentId: 'clk', pin: 'out' }, to: { componentId: 'tff', pin: 'CLK' } },
        { id: 'w2', from: { componentId: 't_sw', pin: 'out' }, to: { componentId: 'tff', pin: 'T' } },
      ]
    )

    let state = initialSimState()
    expect(evaluate(c, state).signals.get('tff:Q')).toBe(0)

    // Rising edge: toggle to 1
    state = step(c, state)
    expect(evaluate(c, state).signals.get('tff:Q')).toBe(1)

    // Falling edge: no change
    state = step(c, state)
    expect(evaluate(c, state).signals.get('tff:Q')).toBe(1)

    // Rising edge: toggle to 0
    state = step(c, state)
    expect(evaluate(c, state).signals.get('tff:Q')).toBe(0)
  })
})

describe('sequential: JK flip-flop', () => {
  it('J=K=1 toggles on rising edge', () => {
    const c: Circuit = makeCircuit(
      [
        { id: 'clk', type: 'CLOCK', x: 0, y: 0, props: {} },
        { id: 'j', type: 'SWITCH', x: 0, y: 1, props: { value: 1 } },
        { id: 'k', type: 'SWITCH', x: 0, y: 2, props: { value: 1 } },
        { id: 'jkff', type: 'JK_FF', x: 1, y: 0, props: {} },
      ],
      [
        { id: 'w1', from: { componentId: 'clk', pin: 'out' }, to: { componentId: 'jkff', pin: 'CLK' } },
        { id: 'w2', from: { componentId: 'j', pin: 'out' }, to: { componentId: 'jkff', pin: 'J' } },
        { id: 'w3', from: { componentId: 'k', pin: 'out' }, to: { componentId: 'jkff', pin: 'K' } },
      ]
    )

    let state = initialSimState()
    state = step(c, state)  // rise: J=K=1, Q=0 → toggle → Q=1
    expect(evaluate(c, state).signals.get('jkff:Q')).toBe(1)
    state = step(c, state)  // fall: no change
    state = step(c, state)  // rise: J=K=1, Q=1 → toggle → Q=0
    expect(evaluate(c, state).signals.get('jkff:Q')).toBe(0)
  })

  it('J=1,K=0 sets Q', () => {
    const c: Circuit = makeCircuit(
      [
        { id: 'clk', type: 'CLOCK', x: 0, y: 0, props: {} },
        { id: 'j', type: 'SWITCH', x: 0, y: 1, props: { value: 1 } },
        { id: 'k', type: 'SWITCH', x: 0, y: 2, props: { value: 0 } },
        { id: 'jkff', type: 'JK_FF', x: 1, y: 0, props: {} },
      ],
      [
        { id: 'w1', from: { componentId: 'clk', pin: 'out' }, to: { componentId: 'jkff', pin: 'CLK' } },
        { id: 'w2', from: { componentId: 'j', pin: 'out' }, to: { componentId: 'jkff', pin: 'J' } },
        { id: 'w3', from: { componentId: 'k', pin: 'out' }, to: { componentId: 'jkff', pin: 'K' } },
      ]
    )
    let state = initialSimState()
    state = step(c, state)  // rise: J=1,K=0 → Q=1
    expect(evaluate(c, state).signals.get('jkff:Q')).toBe(1)
    state = step(c, state)  // fall
    state = step(c, state)  // rise: J=1,K=0 → Q stays 1
    expect(evaluate(c, state).signals.get('jkff:Q')).toBe(1)
  })
})
