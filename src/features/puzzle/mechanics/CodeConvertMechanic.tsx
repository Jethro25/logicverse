import { useState, useCallback } from 'react'
import type { CodeConvertData } from '@/content/puzzles'
import styles from './CodeConvertMechanic.module.css'

interface Props {
  data: CodeConvertData
  onSolve: (stars: number, attempts: number) => void
  hints: string[]
  stars?: { star3: { maxAttempts: number; maxHints: number }; star2: { maxAttempts: number; maxHints: number } }
}

const CODE_LABELS: Record<string, string> = {
  BINARY: 'Binary',
  BCD: 'BCD (8421)',
  GRAY: 'Gray Code',
  EXCESS3: 'Excess-3',
}

function decToBCD(n: number): string {
  return n.toString(2).padStart(4, '0')
}

function decToBin(n: number, bits = 4): string {
  return n.toString(2).padStart(bits, '0')
}

function computeAnswer(value: number, fromCode: string, toCode: string, allValues: number[]): string {
  const maxVal = Math.max(...allValues)
  const bits = Math.max(4, Math.ceil(Math.log2(maxVal + 1)))
  if (toCode === 'BCD') return decToBCD(value)
  if (toCode === 'GRAY') {
    const grayBits = Math.max(3, Math.ceil(Math.log2(maxVal + 2)))
    const gray = value ^ (value >> 1)
    return gray.toString(2).padStart(grayBits, '0')
  }
  if (toCode === 'BINARY') {
    if (fromCode === 'BCD') return decToBin(value, bits)
    if (fromCode === 'GRAY') {
      // gray to binary
      let mask = value
      let b = value
      while ((mask >>= 1)) b ^= mask
      return b.toString(2).padStart(bits, '0')
    }
    return decToBin(value, bits)
  }
  if (toCode === 'EXCESS3') return decToBin(value + 3, 4)
  return value.toString(2)
}

function normalize(s: string): string {
  return s.trim().replace(/\s+/g, '')
}

export function CodeConvertMechanic({ data, onSolve, hints, stars }: Props) {
  const fromLabel = CODE_LABELS[data.fromCode] ?? data.fromCode
  const toLabel = CODE_LABELS[data.toCode] ?? data.toCode

  const expectedAnswers = data.values.map(v => computeAnswer(v, data.fromCode, data.toCode, data.values))

  const [answers, setAnswers] = useState<string[]>(() => data.values.map(() => ''))
  const [attempts, setAttempts] = useState(0)
  const [hintIdx, setHintIdx] = useState(-1)
  const [checked, setChecked] = useState(false)
  const [wrongIndices, setWrongIndices] = useState<Set<number>>(new Set())
  const [solved, setSolved] = useState(false)

  const handleCheck = useCallback(() => {
    const wrong = new Set<number>()
    answers.forEach((a, i) => {
      if (normalize(a) !== expectedAnswers[i]) wrong.add(i)
    })
    const newAttempts = attempts + 1
    setAttempts(newAttempts)
    setChecked(true)
    setWrongIndices(wrong)
    if (wrong.size === 0) {
      setSolved(true)
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
      setTimeout(() => setChecked(false), 1200)
    }
  }, [answers, expectedAnswers, attempts, hintIdx, stars, onSolve])

  const allFilled = answers.every(a => a.trim() !== '')

  const maxVal = Math.max(...data.values)
  const grayBits = Math.max(3, Math.ceil(Math.log2(maxVal + 2)))

  function getPlaceholder(): string {
    if (data.toCode === 'BCD') return '0000'
    if (data.toCode === 'GRAY') return '0'.repeat(grayBits)
    if (data.toCode === 'BINARY') return '0000'
    return '????'
  }

  function getSourceLabel(value: number): string {
    if (data.fromCode === 'BINARY') return value.toString(2).padStart(Math.ceil(Math.log2(maxVal + 2)), '0')
    if (data.fromCode === 'BCD') return `${value} → ${decToBCD(value)}`
    return value.toString(10)
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.fromLabel}>{fromLabel}</span>
        <span className={styles.arrow}>→</span>
        <span className={styles.toLabel}>{toLabel}</span>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thSource}>{fromLabel}</th>
              <th className={styles.thTarget}>{toLabel}</th>
              {checked && !solved && <th className={styles.thStatus}>Status</th>}
            </tr>
          </thead>
          <tbody>
            {data.values.map((v, i) => {
              const isWrong = checked && wrongIndices.has(i)
              const isCorrect = solved
              return (
                <tr key={i} className={isWrong ? styles.wrongRow : isCorrect ? styles.correctRow : undefined}>
                  <td className={styles.sourceCell}>{getSourceLabel(v)}</td>
                  <td className={styles.targetCell}>
                    <input
                      type="text"
                      className={[styles.answerInput, isWrong ? styles.inputWrong : '', isCorrect ? styles.inputCorrect : ''].join(' ')}
                      value={answers[i]}
                      onChange={e => {
                        const next = [...answers]
                        next[i] = e.target.value
                        setAnswers(next)
                        setChecked(false)
                      }}
                      onKeyDown={e => e.key === 'Enter' && handleCheck()}
                      disabled={solved}
                      placeholder={getPlaceholder()}
                      spellCheck={false}
                      autoComplete="off"
                      aria-label={`Answer for ${v}`}
                    />
                  </td>
                  {checked && !solved && (
                    <td className={styles.statusCell}>
                      {isWrong ? <span className={styles.statusWrong}>✗ {expectedAnswers[i]}</span> : <span className={styles.statusOk}>✓</span>}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {solved && (
        <div className={styles.successMsg}>
          ✅ All correct! Solved in {attempts} attempt{attempts !== 1 ? 's' : ''}.
        </div>
      )}

      {hintIdx >= 0 && hintIdx < hints.length && (
        <div className={styles.hint}>
          <span className={styles.hintLabel}>💡 Hint {hintIdx + 1}:</span> {hints[hintIdx]}
        </div>
      )}

      <div className={styles.actions}>
        {!solved && hints.length > 0 && hintIdx < hints.length - 1 && (
          <button className={styles.hintBtn} onClick={() => setHintIdx(h => h + 1)}>
            💡 Hint ({hints.length - hintIdx - 1} left)
          </button>
        )}
        {!solved && (
          <button className={styles.checkBtn} onClick={handleCheck} disabled={!allFilled}>
            Check All
          </button>
        )}
      </div>
    </div>
  )
}
