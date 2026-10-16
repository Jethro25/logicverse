/**
 * Number base conversion utilities with step-by-step traces.
 * All functions are pure; they produce traces the UI can render as worked solutions.
 */

export type StepTrace = { description: string; value: string }[]

export interface ConversionResult {
  value: string        // the result as a string in the target base
  trace: StepTrace    // step-by-step explanation
  error?: string
}

const DIGITS = '0123456789ABCDEF'

function digitValue(ch: string): number {
  return DIGITS.indexOf(ch.toUpperCase())
}

/** Convert an integer from any base to decimal (BigInt internally for precision) */
export function baseToDecimal(digits: string, fromBase: 2 | 8 | 10 | 16): ConversionResult {
  const trace: StepTrace = []
  const clean = digits.trim().toUpperCase()

  if (fromBase === 10) {
    return { value: clean, trace: [{ description: 'Already decimal', value: clean }] }
  }

  let result = BigInt(0)
  let power = BigInt(1)
  const baseBig = BigInt(fromBase)

  trace.push({ description: `Write each digit with its place value (base ${fromBase}):`, value: '' })

  const parts: string[] = []
  for (let i = clean.length - 1; i >= 0; i--) {
    const ch = clean[i]
    const dv = digitValue(ch)
    if (dv < 0 || dv >= fromBase) {
      return { value: '', trace, error: `Invalid digit '${ch}' for base ${fromBase}.` }
    }
    const contribution = BigInt(dv) * power
    result += contribution
    parts.unshift(`${ch} × ${fromBase}^${clean.length - 1 - i} = ${contribution}`)
    power *= baseBig
  }

  for (const p of parts) trace.push({ description: p, value: '' })
  trace.push({ description: 'Sum =', value: result.toString() })

  return { value: result.toString(), trace }
}

/** Convert a decimal integer string to the target base */
export function decimalToBase(decimalStr: string, toBase: 2 | 8 | 16): ConversionResult {
  const trace: StepTrace = []
  let n = BigInt(decimalStr.trim())
  if (n < BigInt(0)) {
    return { value: '', trace, error: 'Use complement functions for negative numbers.' }
  }
  if (n === BigInt(0)) {
    return { value: '0', trace: [{ description: 'Result', value: '0' }] }
  }

  const baseBig = BigInt(toBase)
  const remainders: string[] = []

  trace.push({ description: `Divide repeatedly by ${toBase}, recording remainders:`, value: '' })
  let current = n
  while (current > BigInt(0)) {
    const rem = current % baseBig
    const quot = current / baseBig
    const remStr = DIGITS[Number(rem)]
    trace.push({ description: `${current} ÷ ${toBase} = ${quot} remainder ${remStr}`, value: remStr })
    remainders.unshift(remStr)
    current = quot
  }

  const result = remainders.join('')
  trace.push({ description: 'Read remainders bottom-to-top:', value: result })
  return { value: result, trace }
}

/** Group binary string into groups of 3 (octal) or 4 (hex) */
export function binaryToOctalOrHex(binary: string, toBase: 8 | 16): ConversionResult {
  const trace: StepTrace = []
  const groupSize = toBase === 8 ? 3 : 4
  const clean = binary.trim().replace(/\s/g, '')

  // Pad to multiple of groupSize
  const padded = clean.padStart(Math.ceil(clean.length / groupSize) * groupSize, '0')
  trace.push({ description: `Pad to multiple of ${groupSize}: ${padded}`, value: padded })

  const groups: string[] = []
  for (let i = 0; i < padded.length; i += groupSize) {
    groups.push(padded.slice(i, i + groupSize))
  }
  trace.push({ description: 'Split into groups:', value: groups.join(' ') })

  const result = groups.map(g => {
    const val = parseInt(g, 2)
    return DIGITS[val]
  }).join('')

  trace.push({ description: `Each group = one ${toBase === 8 ? 'octal' : 'hex'} digit:`, value: result })
  return { value: result, trace }
}

/** Universal converter: any base to any base (via decimal) */
export function convertBase(
  value: string,
  fromBase: 2 | 8 | 10 | 16,
  toBase: 2 | 8 | 10 | 16
): ConversionResult {
  if (fromBase === toBase) return { value, trace: [{ description: 'Same base', value }] }

  // Handle binary ↔ hex/octal shortcuts
  if (fromBase === 2 && (toBase === 8 || toBase === 16)) {
    return binaryToOctalOrHex(value, toBase)
  }

  const dec = baseToDecimal(value, fromBase)
  if (dec.error) return dec
  if (toBase === 10) return dec

  const out = decimalToBase(dec.value, toBase)
  return { value: out.value, trace: [...dec.trace, ...out.trace], error: out.error }
}

/** Convert decimal fraction to binary (up to maxBits) */
export function decimalFractionToBinary(fraction: number, maxBits = 8): ConversionResult {
  const trace: StepTrace = []
  const bits: string[] = []

  trace.push({ description: 'Multiply by 2 repeatedly, take the integer part:', value: '' })
  let f = fraction
  for (let i = 0; i < maxBits && f !== 0; i++) {
    f *= 2
    const bit = Math.floor(f)
    bits.push(String(bit))
    trace.push({ description: `${(f / 2).toFixed(6)} × 2 = ${f.toFixed(6)}, bit = ${bit}`, value: String(bit) })
    f -= bit
  }

  const result = '0.' + bits.join('')
  trace.push({ description: 'Result:', value: result })
  return { value: result, trace }
}
