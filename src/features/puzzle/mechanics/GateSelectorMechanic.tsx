import { useState } from 'react'
import type { GateSelectorData } from '@/content/puzzles'
import styles from './GateSelectorMechanic.module.css'

interface Props {
  data: GateSelectorData
  onSolve: (stars: number, attempts: number) => void
  hints: string[]
  stars?: { star3: { maxAttempts: number; maxHints: number }; star2: { maxAttempts: number; maxHints: number } }
}

const GATE_COLORS: Record<string, string> = {
  AND: '#3b82f6', OR: '#8b5cf6', NOT: '#ec4899',
  NAND: '#f59e0b', NOR: '#ef4444', XOR: '#22c55e', XNOR: '#06b6d4',
}

export function GateSelectorMechanic({ data, onSolve, hints, stars }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [hintIdx, setHintIdx] = useState(-1)
  const [wrongOptions, setWrongOptions] = useState<Set<string>>(new Set())
  const [solved, setSolved] = useState(false)

  function handleSelect(opt: string) {
    if (solved || wrongOptions.has(opt)) return
    setSelected(opt)
  }

  function handleCheck() {
    if (!selected || solved) return
    const newAttempts = attempts + 1
    setAttempts(newAttempts)
    if (selected === data.answer) {
      setSolved(true)
      let starCount = 1
      if (stars) {
        const hintsUsed = hintIdx + 1
        if (newAttempts <= stars.star3.maxAttempts && hintsUsed <= stars.star3.maxHints) starCount = 3
        else if (newAttempts <= stars.star2.maxAttempts && hintsUsed <= stars.star2.maxHints) starCount = 2
      } else {
        starCount = newAttempts === 1 ? 3 : newAttempts <= 2 ? 2 : 1
      }
      onSolve(starCount, newAttempts)
    } else {
      setWrongOptions(prev => new Set([...prev, selected]))
      setSelected(null)
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.prompt}>{data.prompt}</div>

      <div className={styles.options}>
        {data.options.map(opt => {
          const isWrong = wrongOptions.has(opt)
          const isSelected = selected === opt
          const isCorrect = solved && opt === data.answer
          const color = GATE_COLORS[opt] ?? 'var(--color-accent)'
          return (
            <button
              key={opt}
              className={[
                styles.option,
                isSelected ? styles.optionSelected : '',
                isWrong ? styles.optionWrong : '',
                isCorrect ? styles.optionCorrect : '',
              ].join(' ')}
              style={{ '--gate-color': color } as React.CSSProperties}
              onClick={() => handleSelect(opt)}
              disabled={isWrong || solved}
              aria-pressed={isSelected}
            >
              <span className={styles.gateName}>{opt}</span>
            </button>
          )
        })}
      </div>

      {data.showTruthTable && solved && (
        <div className={styles.ttContainer}>
          <div className={styles.ttLabel}>Truth table for {data.answer}:</div>
          <div className={styles.ttNote}>
            {data.answer === 'AND' && 'Output 1 only when ALL inputs are 1.'}
            {data.answer === 'OR' && 'Output 1 when ANY input is 1.'}
            {data.answer === 'NAND' && 'Output 0 only when ALL inputs are 1 (NOT AND).'}
            {data.answer === 'NOR' && 'Output 1 only when ALL inputs are 0 (NOT OR).'}
            {data.answer === 'XOR' && 'Output 1 when inputs DIFFER.'}
            {data.answer === 'XNOR' && 'Output 1 when inputs are the SAME.'}
            {data.answer === 'NOT' && 'Output is the OPPOSITE of input.'}
          </div>
        </div>
      )}

      {solved && (
        <div className={styles.successMsg}>
          ✅ Correct! <strong>{data.answer}</strong> is the right gate.
          {' '}Solved in {attempts} attempt{attempts !== 1 ? 's' : ''}.
        </div>
      )}

      {!solved && wrongOptions.size > 0 && (
        <div className={styles.wrongMsg}>
          Not quite — try another option. ({data.options.length - wrongOptions.size} remaining)
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
          <button className={styles.checkBtn} onClick={handleCheck} disabled={!selected}>
            Confirm
          </button>
        )}
      </div>
    </div>
  )
}
