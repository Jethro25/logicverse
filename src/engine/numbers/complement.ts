import type { StepTrace, ConversionResult } from './bases'

/** Compute 1's complement of a binary string */
export function onesComplement(binary: string): ConversionResult {
  const trace: StepTrace = []
  const clean = binary.trim().replace(/\s/g, '')
  trace.push({ description: 'Flip every bit (0→1, 1→0):', value: '' })
  const result = clean.split('').map(b => b === '0' ? '1' : '0').join('')
  trace.push({ description: `${clean} → ${result}`, value: result })
  return { value: result, trace }
}

/** Compute 2's complement of a binary string (1's complement + 1) */
export function twosComplement(binary: string): ConversionResult {
  const trace: StepTrace = []
  const clean = binary.trim().replace(/\s/g, '')

  trace.push({ description: 'Step 1: Find 1\'s complement (flip all bits):', value: '' })
  const ones = clean.split('').map(b => b === '0' ? '1' : '0').join('')
  trace.push({ description: `${clean} → ${ones}`, value: ones })

  trace.push({ description: 'Step 2: Add 1:', value: '' })

  // Binary addition with carry
  let carry = 1
  const bits = ones.split('')
  for (let i = bits.length - 1; i >= 0; i--) {
    const sum = parseInt(bits[i]) + carry
    bits[i] = String(sum % 2)
    carry = Math.floor(sum / 2)
  }
  // If there's still a carry, it means the number was 0 (two's complement of 0 is 0)
  const result = bits.join('')
  trace.push({ description: `${ones} + 1 = ${result}`, value: result })

  return { value: result, trace }
}

export interface SignedArithResult {
  result: string      // binary result
  decimal: number     // decimal interpretation
  carryOut: 0 | 1    // final carry out of MSB
  overflow: boolean   // overflow (wrong sign bit)
  trace: StepTrace
}

/**
 * Add two signed 2's-complement binary numbers of `bits` length.
 * Detects overflow: carry into MSB ≠ carry out of MSB.
 */
export function addSigned(aStr: string, bStr: string, bits: number): SignedArithResult {
  const trace: StepTrace = []

  // Pad to `bits` length
  const a = aStr.trim().padStart(bits, aStr[0] ?? '0').slice(-bits)
  const b = bStr.trim().padStart(bits, bStr[0] ?? '0').slice(-bits)

  trace.push({ description: `Add ${a} + ${b} in ${bits}-bit 2's complement:`, value: '' })

  let carry = 0
  const result: string[] = new Array(bits).fill('0')
  let carryIntoMSB = 0

  for (let i = bits - 1; i >= 0; i--) {
    const ai = parseInt(a[i])
    const bi = parseInt(b[i])
    if (i === 0) carryIntoMSB = carry
    const sum = ai + bi + carry
    result[i] = String(sum % 2)
    carry = Math.floor(sum / 2)
  }

  const carryOut = carry as 0 | 1
  const overflow = carryIntoMSB !== carryOut
  const resultStr = result.join('')

  // Decimal value (signed)
  const msb = parseInt(resultStr[0])
  let decVal = 0
  if (msb === 1) {
    // Negative: take 2's complement to get magnitude
    const complement = resultStr.split('').map(b => b === '0' ? '1' : '0').join('')
    let c = 1
    const mag = complement.split('')
    for (let i = mag.length - 1; i >= 0; i--) {
      const s = parseInt(mag[i]) + c
      mag[i] = String(s % 2)
      c = Math.floor(s / 2)
    }
    decVal = -parseInt(mag.join(''), 2)
  } else {
    decVal = parseInt(resultStr, 2)
  }

  trace.push({ description: `Column addition gives: ${resultStr}`, value: resultStr })
  trace.push({ description: `Carry out of MSB: ${carryOut}, Carry into MSB: ${carryIntoMSB}`, value: '' })
  if (overflow) {
    trace.push({ description: '⚠️ OVERFLOW: carry-in ≠ carry-out of sign bit. The result is wrong for signed arithmetic!', value: '' })
  } else {
    trace.push({ description: `Result in decimal: ${decVal}`, value: String(decVal) })
  }

  return { result: resultStr, decimal: decVal, carryOut, overflow, trace }
}
