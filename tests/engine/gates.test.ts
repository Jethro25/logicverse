import { describe, it, expect } from 'vitest'
import { AND, OR, NOT, NAND, NOR, XOR, XNOR } from '@/engine/components/gates'

const p2 = { inputCount: 2 }

describe('AND gate', () => {
  it('0·0=0', () => expect(AND.evaluate({ in0: 0, in1: 0 }, p2).out).toBe(0))
  it('0·1=0', () => expect(AND.evaluate({ in0: 0, in1: 1 }, p2).out).toBe(0))
  it('1·0=0', () => expect(AND.evaluate({ in0: 1, in1: 0 }, p2).out).toBe(0))
  it('1·1=1', () => expect(AND.evaluate({ in0: 1, in1: 1 }, p2).out).toBe(1))
  it('returns 0 if any input is 0 (short-circuit, even with null)', () => {
    expect(AND.evaluate({ in0: 0, in1: null }, p2).out).toBe(0)
  })
  it('returns null if unknown input (not short-circuit)', () => {
    expect(AND.evaluate({ in0: 1, in1: null }, p2).out).toBeNull()
  })
  it('3-input AND', () => {
    const p3 = { inputCount: 3 }
    expect(AND.evaluate({ in0: 1, in1: 1, in2: 1 }, p3).out).toBe(1)
    expect(AND.evaluate({ in0: 1, in1: 0, in2: 1 }, p3).out).toBe(0)
  })
})

describe('OR gate', () => {
  it('0+0=0', () => expect(OR.evaluate({ in0: 0, in1: 0 }, p2).out).toBe(0))
  it('0+1=1', () => expect(OR.evaluate({ in0: 0, in1: 1 }, p2).out).toBe(1))
  it('1+0=1', () => expect(OR.evaluate({ in0: 1, in1: 0 }, p2).out).toBe(1))
  it('1+1=1', () => expect(OR.evaluate({ in0: 1, in1: 1 }, p2).out).toBe(1))
  it('returns 1 if any input is 1 (short-circuit, even with null)', () => {
    expect(OR.evaluate({ in0: 1, in1: null }, p2).out).toBe(1)
  })
  it('returns null if unknown input (not short-circuit)', () => {
    expect(OR.evaluate({ in0: 0, in1: null }, p2).out).toBeNull()
  })
})

describe('NOT gate', () => {
  it('NOT 0 = 1', () => expect(NOT.evaluate({ in0: 0 }, {}).out).toBe(1))
  it('NOT 1 = 0', () => expect(NOT.evaluate({ in0: 1 }, {}).out).toBe(0))
  it('NOT null = null', () => expect(NOT.evaluate({ in0: null }, {}).out).toBeNull())
})

describe('NAND gate', () => {
  it('NAND 0,0 = 1', () => expect(NAND.evaluate({ in0: 0, in1: 0 }, p2).out).toBe(1))
  it('NAND 0,1 = 1', () => expect(NAND.evaluate({ in0: 0, in1: 1 }, p2).out).toBe(1))
  it('NAND 1,0 = 1', () => expect(NAND.evaluate({ in0: 1, in1: 0 }, p2).out).toBe(1))
  it('NAND 1,1 = 0', () => expect(NAND.evaluate({ in0: 1, in1: 1 }, p2).out).toBe(0))
})

describe('NOR gate', () => {
  it('NOR 0,0 = 1', () => expect(NOR.evaluate({ in0: 0, in1: 0 }, p2).out).toBe(1))
  it('NOR 0,1 = 0', () => expect(NOR.evaluate({ in0: 0, in1: 1 }, p2).out).toBe(0))
  it('NOR 1,0 = 0', () => expect(NOR.evaluate({ in0: 1, in1: 0 }, p2).out).toBe(0))
  it('NOR 1,1 = 0', () => expect(NOR.evaluate({ in0: 1, in1: 1 }, p2).out).toBe(0))
})

describe('XOR gate', () => {
  it('0⊕0=0', () => expect(XOR.evaluate({ in0: 0, in1: 0 }, p2).out).toBe(0))
  it('0⊕1=1', () => expect(XOR.evaluate({ in0: 0, in1: 1 }, p2).out).toBe(1))
  it('1⊕0=1', () => expect(XOR.evaluate({ in0: 1, in1: 0 }, p2).out).toBe(1))
  it('1⊕1=0', () => expect(XOR.evaluate({ in0: 1, in1: 1 }, p2).out).toBe(0))
  it('3-input XOR (odd parity)', () => {
    const p3 = { inputCount: 3 }
    expect(XOR.evaluate({ in0: 1, in1: 1, in2: 1 }, p3).out).toBe(1)
    expect(XOR.evaluate({ in0: 1, in1: 1, in2: 0 }, p3).out).toBe(0)
  })
})

describe('XNOR gate', () => {
  it('0⊙0=1', () => expect(XNOR.evaluate({ in0: 0, in1: 0 }, p2).out).toBe(1))
  it('0⊙1=0', () => expect(XNOR.evaluate({ in0: 0, in1: 1 }, p2).out).toBe(0))
  it('1⊙0=0', () => expect(XNOR.evaluate({ in0: 1, in1: 0 }, p2).out).toBe(0))
  it('1⊙1=1', () => expect(XNOR.evaluate({ in0: 1, in1: 1 }, p2).out).toBe(1))
})
