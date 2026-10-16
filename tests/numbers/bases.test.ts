import { describe, it, expect } from 'vitest'
import { convertBase, decimalFractionToBinary } from '@/engine/numbers/bases'
import { onesComplement, twosComplement, addSigned } from '@/engine/numbers/complement'
import { decimalToBCD, bcdToDecimal, binaryToGray, grayToBinary, decimalToExcess3 } from '@/engine/numbers/codes'

describe('binary ↔ decimal', () => {
  const cases: [string, string][] = [
    ['0', '0'], ['1', '1'], ['1010', '10'], ['1111', '15'],
    ['11001', '25'], ['1111111', '127'], ['11111111', '255'],
  ]
  for (const [bin, dec] of cases) {
    it(`${bin}₂ = ${dec}₁₀`, () => {
      expect(convertBase(bin, 2, 10).value).toBe(dec)
    })
    it(`${dec}₁₀ = ${bin}₂`, () => {
      expect(convertBase(dec, 10, 2).value).toBe(bin === '0' ? '0' : bin)
    })
  }
})

describe('binary ↔ hex', () => {
  const cases: [string, string][] = [
    ['0000', '0'], ['1010', 'A'], ['1111', 'F'],
    ['00101010', '2A'], ['11111111', 'FF'],
  ]
  for (const [bin, hex] of cases) {
    it(`${bin}₂ = ${hex}₁₆`, () => {
      expect(convertBase(bin, 2, 16).value).toBe(hex)
    })
  }
})

describe('hex ↔ decimal', () => {
  const cases: [string, number][] = [
    ['0', 0], ['F', 15], ['1A', 26], ['FF', 255], ['100', 256],
  ]
  for (const [hex, dec] of cases) {
    it(`${hex}₁₆ = ${dec}₁₀`, () => {
      expect(convertBase(hex, 16, 10).value).toBe(String(dec))
    })
  }
})

describe('octal ↔ decimal', () => {
  const cases: [string, number][] = [
    ['0', 0], ['7', 7], ['10', 8], ['77', 63], ['100', 64],
  ]
  for (const [oct, dec] of cases) {
    it(`${oct}₈ = ${dec}₁₀`, () => {
      expect(convertBase(oct, 8, 10).value).toBe(String(dec))
    })
  }
})

describe('decimal fraction to binary', () => {
  it('0.5 = 0.1', () => expect(decimalFractionToBinary(0.5).value).toBe('0.1'))
  it('0.25 = 0.01', () => expect(decimalFractionToBinary(0.25).value).toBe('0.01'))
  it('0.375 = 0.011', () => expect(decimalFractionToBinary(0.375).value).toBe('0.011'))
})

describe("1's complement", () => {
  it('0000 → 1111', () => expect(onesComplement('0000').value).toBe('1111'))
  it('1010 → 0101', () => expect(onesComplement('1010').value).toBe('0101'))
  it('1111 → 0000', () => expect(onesComplement('1111').value).toBe('0000'))
})

describe("2's complement", () => {
  it('0001 → 1111', () => expect(twosComplement('0001').value).toBe('1111'))
  it('0100 → 1100', () => expect(twosComplement('0100').value).toBe('1100'))
  it('1000 → 1000 (min negative)', () => expect(twosComplement('1000').value).toBe('1000'))
  it('1111 → 0001', () => expect(twosComplement('1111').value).toBe('0001'))
})

describe('signed 2s-complement addition', () => {
  it('+3 + +4 = +7 (no overflow)', () => {
    const r = addSigned('0011', '0100', 4)
    expect(r.result).toBe('0111')
    expect(r.overflow).toBe(false)
    expect(r.decimal).toBe(7)
  })
  it('-1 + -1 = -2 (no overflow)', () => {
    const r = addSigned('1111', '1111', 4)
    expect(r.result).toBe('1110')
    expect(r.overflow).toBe(false)
    expect(r.decimal).toBe(-2)
  })
  it('+7 + +1 = overflow', () => {
    const r = addSigned('0111', '0001', 4)
    expect(r.overflow).toBe(true)
  })
  it('-8 + -1 = overflow', () => {
    const r = addSigned('1000', '1111', 4)
    expect(r.overflow).toBe(true)
  })
})

describe('BCD', () => {
  it('5 → 0101', () => expect(decimalToBCD(5).value).toBe('0101'))
  it('9 → 1001', () => expect(decimalToBCD(9).value).toBe('1001'))
  it('25 → 0010 0101', () => expect(decimalToBCD(25).value).toBe('0010 0101'))
  it('0101 → 5', () => expect(bcdToDecimal('0101').value).toBe('5'))
})

describe('Gray code', () => {
  // [gray, binary] — verified from standard 4-bit Gray code table
  const cases: [string, string][] = [
    ['0000', '0000'], ['0001', '0001'], ['0011', '0010'],
    ['0010', '0011'], ['0110', '0100'], ['0111', '0101'],
    ['0101', '0110'], ['0100', '0111'], ['1100', '1000'],
    ['1010', '1100'], ['1000', '1111'],
  ]
  for (const [gray, binary] of cases) {
    it(`binary ${binary} ↔ gray ${gray}`, () => {
      expect(binaryToGray(binary).value).toBe(gray)
      expect(grayToBinary(gray).value).toBe(binary)
    })
  }
})

describe('Excess-3', () => {
  it('3 → 0110', () => expect(decimalToExcess3(3).value).toBe('0110'))
  it('0 → 0011', () => expect(decimalToExcess3(0).value).toBe('0011'))
  it('9 → 1100', () => expect(decimalToExcess3(9).value).toBe('1100'))
})
