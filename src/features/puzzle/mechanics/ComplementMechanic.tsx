import { useState, useCallback } from 'react'
import type { ComplementData } from '@/content/puzzles'
import styles from './ComplementMechanic.module.css'

interface Props {
  data: ComplementData
  onSolve: (stars: number, attempts: number) => void
  hints: string[]
  stars?: { star3: { maxAttempts: number; maxHints: number }; star2: { maxAttempts: number; maxHints: number } }
}

function onesComplement(bin: string): string {
  return bin.split('').map(b => b === '0' ? '1' : '0').join('')
}

function twosComplement(bin: string): string {
  const ones = onesComplement(bin)
  // Add 1 to the ones complement
  let carry = 1
  const bits = ones.split('').reverse()
  const result = bits.map(b => {
    const sum = parseInt(b) + carry
    carry = sum >> 1
    return (sum & 1).toString()
  })
  return result.reverse().join('')
}

function computeAnswer(bin: string, type: '1s' | '2s'): string {
  return type === '1s' ? onesComplement(bin) : twosComplement(bin)
}

function normalize(s: string): string {
  return s.trim().replace(/\s+/g, '')
}

interface StepProps { bin: string; type: '1s' | '2s' }

function StepsView({ bin, type }: StepProps) {
  if (type === '1s') {
    return (
      <div className={styles.steps}>
        <div className={styles.stepsTitle}>1's Complement: flip every bit</div>
        <div className={styles.stepRow}>
          Original: <span className={styles.mono}>{bin}</span>
        </div>
        <div className={styles.stepRow}>
          Flip each: {bin.split('').map((b, i) => (
            <span key={i} className={styles.flipCell}>
              <span className={styles.flipFrom}>{b}</span>→<span className={styles.flipTo}>{b === '0' ? '1' : '0'}</span>
            </span>
          ))}
        </div>
        <div className={styles.stepResult}>Result: <span className={styles.mono}>{onesComplement(bin)}</span></div>
      </div>
    )
  }
  const ones = onesComplement(bin)
  return (
    <div className={styles.steps}>
      <div className={styles.stepsTitle}>2's Complement: flip bits, then add 1</div>
      <div className={styles.stepRow}>Step 1 — Original: <span className={styles.mono}>{bin}</span></div>
      <div className={styles.stepRow}>Step 2 — 1's complement: <span className={styles.mono}>{ones}</span></div>
      <div className={styles.stepRow}>Step 3 — Add 1: <span className={styles.mono}>{ones}</span> + 1</div>
      <div className={styles.stepResult}>Result: <span className={styles.mono}>{twosComplement(bin)}</span></div>
    </div>
  )
}

export function ComplementMechanic({ data, onSolve, hints, stars }: Props) {
  const [input, setInput] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [hintIdx, setHintIdx] = useState(-1)
  const [status, setStatus] = useState<'idle' | 'wrong' | 'correct'>('idle')
  const [showSteps, setShowSteps] = useState(false)

  const expected = computeAnswer(data.binary, data.type)
  const typeLabel = data.type === '1s' ? "1's" : "2's"

  const handleCheck = useCallback(() => {
    const norm = normalize(input)
    if (!norm) return
    const ok = norm === expected
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
  }, [input, expected, attempts, hintIdx, stars, onSolve])

  const isCorrectState = status === 'correct'

  return (
    <div className={styles.root}>
      <div className={styles.question}>
        <div className={styles.qLabel}>Find the <strong>{typeLabel} complement</strong> of:</div>
        <div className={styles.binaryDisplay}>{data.binary}<sub>2</sub></div>
        <div className={styles.bits}>{data.binary.length} bits</div>
      </div>

      <div className={styles.inputRow} data-status={status}>
        <span className={styles.inputLabel}>{typeLabel} complement =</span>
        <input
          type="text"
          className={styles.answerInput}
          value={input}
          onChange={e => { setInput(e.target.value); setStatus('idle') }}
          onKeyDown={e => e.key === 'Enter' && handleCheck()}
          disabled={isCorrectState}
          placeholder={'0'.repeat(data.binary.length)}
          aria-label={`Enter ${typeLabel} complement`}
          spellCheck={false}
          autoComplete="off"
          maxLength={data.binary.length + 1}
        />
        <sub>2</sub>
      </div>

      {status === 'wrong' && (
        <div className={styles.wrongMsg}>
          Incorrect — got {normalize(input)}, expected {expected}. Try again.
        </div>
      )}

      {isCorrectState && (
        <div className={styles.successMsg}>
          ✅ Correct! The {typeLabel} complement of {data.binary} is <strong>{expected}</strong>.
          <br /><small>Solved in {attempts} attempt{attempts !== 1 ? 's' : ''}.</small>
        </div>
      )}

      {hintIdx >= 0 && hintIdx < hints.length && (
        <div className={styles.hint}>
          <span className={styles.hintLabel}>💡 Hint {hintIdx + 1}:</span> {hints[hintIdx]}
        </div>
      )}

      {!isCorrectState && (
        <div>
          <button className={styles.stepsToggle} onClick={() => setShowSteps(s => !s)}>
            {showSteps ? '▲ Hide steps' : '▼ Show step-by-step'}
          </button>
          {showSteps && <StepsView bin={data.binary} type={data.type} />}
        </div>
      )}

      <div className={styles.actions}>
        {!isCorrectState && hints.length > 0 && hintIdx < hints.length - 1 && (
          <button className={styles.hintBtn} onClick={() => setHintIdx(h => h + 1)}>
            💡 Hint ({hints.length - hintIdx - 1} left)
          </button>
        )}
        {!isCorrectState && (
          <button className={styles.checkBtn} onClick={handleCheck} disabled={!normalize(input)}>
            Check Answer
          </button>
        )}
      </div>
    </div>
  )
}
