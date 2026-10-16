import type { ConversionResult, StepTrace } from './bases'

/** Convert decimal digit (0–9) to 4-bit BCD */
export function decimalToBCD(decimal: number): ConversionResult {
  if (decimal < 0 || decimal > 9999) {
    return { value: '', trace: [], error: 'BCD supports 0–9999.' }
  }
  const digits = String(decimal).split('')
  const trace: StepTrace = []
  const groups = digits.map(d => {
    const bits = parseInt(d).toString(2).padStart(4, '0')
    trace.push({ description: `Digit ${d} → ${bits}`, value: bits })
    return bits
  })
  const result = groups.join(' ')
  trace.push({ description: 'BCD:', value: result })
  return { value: result, trace }
}

/** Convert 4-bit BCD groups back to decimal */
export function bcdToDecimal(bcdStr: string): ConversionResult {
  const groups = bcdStr.trim().split(/\s+/)
  const trace: StepTrace = []
  const digits: string[] = []

  for (const g of groups) {
    const val = parseInt(g, 2)
    if (val > 9) {
      return { value: '', trace, error: `Invalid BCD group: ${g} (value ${val} > 9)` }
    }
    trace.push({ description: `${g} → ${val}`, value: String(val) })
    digits.push(String(val))
  }

  const result = digits.join('')
  trace.push({ description: 'Decimal:', value: result })
  return { value: result, trace }
}

/** Convert 4-bit binary to Gray code */
export function binaryToGray(binary: string): ConversionResult {
  const trace: StepTrace = []
  const b = binary.trim().padStart(4, '0').slice(-4)
  const gray: string[] = []

  gray.push(b[0])  // MSB is the same
  trace.push({ description: `MSB (G3) = B3 = ${b[0]}`, value: b[0] })

  for (let i = 1; i < b.length; i++) {
    const bit = String(parseInt(b[i - 1]) ^ parseInt(b[i]))
    gray.push(bit)
    trace.push({ description: `G${b.length - 1 - i} = B${b.length - i} ⊕ B${b.length - 1 - i} = ${b[i - 1]} ⊕ ${b[i]} = ${bit}`, value: bit })
  }

  const result = gray.join('')
  trace.push({ description: 'Gray code:', value: result })
  return { value: result, trace }
}

/** Convert Gray code to binary */
export function grayToBinary(gray: string): ConversionResult {
  const trace: StepTrace = []
  const g = gray.trim().padStart(4, '0').slice(-4)
  const b: string[] = []

  b.push(g[0])
  trace.push({ description: `MSB (B3) = G3 = ${g[0]}`, value: g[0] })

  for (let i = 1; i < g.length; i++) {
    const bit = String(parseInt(b[i - 1]) ^ parseInt(g[i]))
    b.push(bit)
    trace.push({ description: `B${g.length - 1 - i} = B${g.length - i} ⊕ G${g.length - 1 - i} = ${b[i - 1]} ⊕ ${g[i]} = ${bit}`, value: bit })
  }

  const result = b.join('')
  trace.push({ description: 'Binary:', value: result })
  return { value: result, trace }
}

/** Convert to Excess-3 (BCD + 3 for each digit) */
export function decimalToExcess3(decimal: number): ConversionResult {
  const trace: StepTrace = []
  const digits = String(decimal).split('')
  const groups = digits.map(d => {
    const val = parseInt(d) + 3
    const bits = val.toString(2).padStart(4, '0')
    trace.push({ description: `Digit ${d}: ${d} + 3 = ${val} → ${bits}`, value: bits })
    return bits
  })
  const result = groups.join(' ')
  trace.push({ description: 'Excess-3:', value: result })
  return { value: result, trace }
}
