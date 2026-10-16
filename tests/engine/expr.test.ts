import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { Circuit, Signal } from '@/engine/types'
import { evaluate } from '@/engine/evaluate'
import { exprFromOutput } from '@/engine/expr/fromCircuit'
import { printExpr } from '@/engine/expr/print'
import { evalExpr, collectVars } from '@/engine/expr/ast'
import { generateTruthTable } from '@/engine/truthTable'

function sw(id: string, label: string): Circuit['components'][0] {
  return { id, type: 'SWITCH', x: 0, y: 0, props: { label, value: 0 } }
}

describe('expression: A·B', () => {
  const c: Circuit = {
    schema: 1,
    components: [
      sw('a', 'A'), sw('b', 'B'),
      { id: 'and1', type: 'AND', x: 1, y: 0, props: { inputCount: 2 } },
      { id: 'led', type: 'LED', x: 2, y: 0, props: { label: 'F' } },
    ],
    wires: [
      { id: 'w1', from: { componentId: 'a', pin: 'out' }, to: { componentId: 'and1', pin: 'in0' } },
      { id: 'w2', from: { componentId: 'b', pin: 'out' }, to: { componentId: 'and1', pin: 'in1' } },
      { id: 'w3', from: { componentId: 'and1', pin: 'out' }, to: { componentId: 'led', pin: 'in0' } },
    ],
  }

  it('derives the expression', () => {
    const r = exprFromOutput(c, 'and1')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(printExpr(r.expr)).toBe('A·B')
  })
})

describe('expression: A + B\'', () => {
  const c: Circuit = {
    schema: 1,
    components: [
      sw('a', 'A'), sw('b', 'B'),
      { id: 'not1', type: 'NOT', x: 1, y: 0, props: {} },
      { id: 'or1', type: 'OR', x: 2, y: 0, props: { inputCount: 2 } },
    ],
    wires: [
      { id: 'w1', from: { componentId: 'b', pin: 'out' }, to: { componentId: 'not1', pin: 'in0' } },
      { id: 'w2', from: { componentId: 'a', pin: 'out' }, to: { componentId: 'or1', pin: 'in0' } },
      { id: 'w3', from: { componentId: 'not1', pin: 'out' }, to: { componentId: 'or1', pin: 'in1' } },
    ],
  }

  it("derives A + B'", () => {
    const r = exprFromOutput(c, 'or1')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(printExpr(r.expr)).toBe("A + B'")
  })
})

describe('expression: unconnected input', () => {
  it('returns an error for unconnected pins', () => {
    const c: Circuit = {
      schema: 1,
      components: [
        sw('a', 'A'),
        { id: 'and1', type: 'AND', x: 1, y: 0, props: { inputCount: 2 } },
      ],
      wires: [
        { id: 'w1', from: { componentId: 'a', pin: 'out' }, to: { componentId: 'and1', pin: 'in0' } },
      ],
    }
    const r = exprFromOutput(c, 'and1')
    expect(r.ok).toBe(false)
  })
})

describe('property: expr truth table === circuit truth table', () => {
  it('holds for random 2-input combinational circuits', () => {
    type GateType = 'AND' | 'OR' | 'NAND' | 'NOR' | 'XOR' | 'XNOR'
    const gateTypes: GateType[] = ['AND', 'OR', 'NAND', 'NOR', 'XOR', 'XNOR']

    fc.assert(fc.property(
      fc.constantFrom(...gateTypes),
      (gateType) => {
        const c: Circuit = {
          schema: 1,
          components: [
            sw('a', 'A'), sw('b', 'B'),
            { id: 'g', type: gateType, x: 1, y: 0, props: { inputCount: 2 } },
          ],
          wires: [
            { id: 'w1', from: { componentId: 'a', pin: 'out' }, to: { componentId: 'g', pin: 'in0' } },
            { id: 'w2', from: { componentId: 'b', pin: 'out' }, to: { componentId: 'g', pin: 'in1' } },
          ],
        }

        const exprResult = exprFromOutput(c, 'g')
        if (!exprResult.ok) return false

        const expr = exprResult.expr
        const vars = [...collectVars(expr)]

        // Compare truth tables
        for (let mask = 0; mask < 4; mask++) {
          const A = ((mask >> 1) & 1) as 0 | 1
          const B = (mask & 1) as 0 | 1

          const modC: Circuit = {
            ...c,
            components: c.components.map(comp =>
              comp.id === 'a' ? { ...comp, props: { ...comp.props, value: A } }
              : comp.id === 'b' ? { ...comp, props: { ...comp.props, value: B } }
              : comp
            ),
          }

          const circuitOut = evaluate(modC).signals.get('g:out')
          const exprOut = evalExpr(expr, { A, B })

          if (circuitOut !== exprOut) return false
        }
        return true
      }
    ), { numRuns: 50 })
  })
})
