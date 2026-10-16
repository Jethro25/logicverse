import { useState, useCallback } from 'react'
import type { NumberConvertData } from '@/content/puzzles'
import styles from './NumberConvertMechanic.module.css'

interface Props {
  data: NumberConvertData
  onSolve: (stars: number, attempts: number) => void
  hints: string[]
  stars?: { star3: { maxAttempts: number; maxHints: number }; star2: { maxAttempts: number; maxHints: number } }
}

function baseLabel(b: number): string {
  return { 2: 'Binary (base 2)', 8: 'Octal (base 8)', 10: 'Decimal (base 10)', 16: 'Hexadecimal (base 16)' }[b] ?? `Base ${b}`
}

function baseSubscript(b: number): string {
  return { 2: '₂', 8: '₈', 10: '₁₀', 16: '₁₆' }[b] ?? `₍${b}₎`
}

function formatValue(v: number, base: number, bits?: number): string {
  if (base === 2) {
    const s = v.toString(2)
    if (bits) return s.padStart(bits, '0')
    return s
  }
  if (base === 16) return v.toString(16).toUpperCase()
  if (base === 8) return v.toString(8)
  return v.toString(10)
}

function correctAnswer(value: number, toBase: number, bits?: number): string {
  return formatValue(value, toBase, bits)
}

function normalize(s: string, base: number): string {
  s = s.trim().toUpperCase()
  if (base === 16) return s.replace(/^0X/, '')
  if (base === 2) return s.replace(/^0B/, '').replace(/\s+/g, '')
  if (base === 8) return s.replace(/^0O/, '')
  return s
}

function isCorrect(input: string, value: number, toBase: number, bits?: number): boolean {
  const norm = normalize(input, toBase)
  const expected = correctAnswer(value, toBase, bits)
  // Allow with or without leading zeros for binary
  if (toBase === 2) {
    const parsed = parseInt(norm, 2)
    return !isNaN(parsed) && parsed === value
  }
  if (toBase === 16) return norm === expected
  const parsed = parseInt(norm, toBase)
  return !isNaN(parsed) && parsed === value
}

function StepsGuide({ value, fromBase, toBase, bits }: { value: number; fromBase: number; toBase: number; bits?: number }) {
  if (fromBase === 10 && toBase === 2) {
    // Show division steps
    const steps: { q: number; r: number }[] = []
    let v = value
    while (v > 0) { steps.push({ q: Math.floor(v / 2), r: v % 2 }); v = Math.floor(v / 2) }
    return (
      <div className={styles.steps}>
        <div className={styles.stepsTitle}>Division method (divide by 2):</div>
        {steps.map((s, i) => (
          <div key={i} className={styles.stepRow}>
            <span>{i === 0 ? value : steps[i - 1].q} ÷ 2 = {s.q} remainder <strong>{s.r}</strong></span>
            {i === 0 && <span className={styles.stepNote}> ← LSB</span>}
            {i === steps.length - 1 && <span className={styles.stepNote}> ← MSB</span>}
          </div>
        ))}
        <div className={styles.stepResult}>Read upward: {formatValue(value, 2, bits)}</div>
      </div>
    )
  }
  if (fromBase === 2 && toBase === 10) {
    const bits2 = bits ?? value.toString(2).length
    const binStr = value.toString(2).padStart(bits2, '0')
    const products = binStr.split('').map((b, i) => ({ bit: b, place: 1 << (bits2 - 1 - i), val: parseInt(b) * (1 << (bits2 - 1 - i)) }))
    return (
      <div className={styles.steps}>
        <div className={styles.stepsTitle}>Expansion method:</div>
        {products.map((p, i) => (
          <div key={i} className={styles.stepRow}>
            <span>{p.bit} × 2<sup>{bits2 - 1 - i}</sup> = {p.bit} × {p.place} = {p.val}</span>
          </div>
        ))}
        <div className={styles.stepResult}>Sum: {products.map(p => p.val).join(' + ')} = {value}</div>
      </div>
    )
  }
  return null
}

export function NumberConvertMechanic({ data, onSolve, hints, stars }: Props) {
  const [input, setInput] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [hintIdx, setHintIdx] = useState(-1)
  const [status, setStatus] = useState<'idle' | 'wrong' | 'correct'>('idle')
  const [showSteps, setShowSteps] = useState(false)

  const sourceStr = formatValue(data.value, data.fromBase, data.fromBase === 2 ? data.bits : undefined)

  const handleCheck = useCallback(() => {
    if (!input.trim()) return
    const ok = isCorrect(input, data.value, data.toBase, data.bits)
    const newAttempts = attempts + 1
    setAttempts(newAttempts)
    setStatus(ok ? 'correct' : 'wrong')
    if (ok) {
      let starCount = 1
      if (stars) {
        const hintsUsed = hintIdx + 1
        if (newAttempts <= stars.star3.maxAttempts && hintsUsed <= stars.star3.maxHints) starCount = 3
        else if (newAttempts <= stars.star2.maxAttempts && hintsUsed <= stars.star2.maxHints) starCount = 2
      } else {
        starCount = newAttempts === 1 ? 3 : newAttempts <= 3 ? 2 : 1
      }
      onSolve(starCount, newAttempts)
    } else {
      setTimeout(() => setStatus('idle'), 1200)
    }
  }, [input, data.value, data.toBase, data.bits, attempts, hintIdx, stars, onSolve])

  const isCorrectState = status === 'correct'

  return (
    <div className={styles.root}>
      <div className={styles.conversion}>
        <div className={styles.sourceBox}>
          <div className={styles.boxLabel}>{baseLabel(data.fromBase)}</div>
          <div className={styles.sourceValue}>
            {sourceStr}<sub>{data.fromBase}</sub>
          </div>
        </div>
        <div className={styles.arrow}>→</div>
        <div className={styles.targetBox}>
          <div className={styles.boxLabel}>{baseLabel(data.toBase)}</div>
          <div className={styles.inputWrapper} data-status={status}>
            <input
              type="text"
              className={styles.answerInput}
              value={input}
              onChange={e => { setInput(e.target.value); setStatus('idle') }}
              onKeyDown={e => e.key === 'Enter' && handleCheck()}
              disabled={isCorrectState}
              placeholder={data.toBase === 16 ? 'e.g. A3' : data.toBase === 2 ? 'e.g. 10110011' : '?'}
              aria-label={`Enter value in ${baseLabel(data.toBase)}`}
              spellCheck={false}
              autoComplete="off"
            />
            {isCorrectState && <span className={styles.subscript}>{baseSubscript(data.toBase)}</span>}
          </div>
        </div>
      </div>

      {status === 'wrong' && (
        <div className={styles.wrongMsg}>Incorrect — check your work and try again.</div>
      )}

      {isCorrectState && (
        <div className={styles.successMsg}>
          ✅ Correct! {data.value} in {baseLabel(data.toBase)} is {correctAnswer(data.value, data.toBase, data.bits)}{baseSubscript(data.toBase)}
          <br /><small>Solved in {attempts} attempt{attempts !== 1 ? 's' : ''}.</small>
        </div>
      )}

      {hintIdx >= 0 && hintIdx < hints.length && (
        <div className={styles.hint}>
          <span className={styles.hintLabel}>💡 Hint {hintIdx + 1}:</span> {hints[hintIdx]}
        </div>
      )}

      {data.showSteps && !isCorrectState && (
        <div>
          <button className={styles.stepsToggle} onClick={() => setShowSteps(s => !s)}>
            {showSteps ? '▲ Hide steps' : '▼ Show step-by-step guide'}
          </button>
          {showSteps && (
            <StepsGuide value={data.value} fromBase={data.fromBase} toBase={data.toBase} bits={data.bits} />
          )}
        </div>
      )}

      <div className={styles.actions}>
        {!isCorrectState && hints.length > 0 && hintIdx < hints.length - 1 && (
          <button className={styles.hintBtn} onClick={() => setHintIdx(h => h + 1)}>
            💡 Hint ({hints.length - hintIdx - 1} left)
          </button>
        )}
        {!isCorrectState && (
          <button className={styles.checkBtn} onClick={handleCheck} disabled={!input.trim()}>
            Check Answer
          </button>
        )}
      </div>
    </div>
  )
}
