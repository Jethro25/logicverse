import { useState, useCallback } from 'react'
import { getComponentDef } from '@/engine/components/registry'
import type { TruthTableData } from '@/content/puzzles'
import type { ComponentType } from '@/engine/types'
import styles from './TruthTableMechanic.module.css'

interface Props {
  data: TruthTableData
  onSolve: (stars: number, attempts: number) => void
  hints: string[]
  stars?: { star3: { maxAttempts: number; maxHints: number }; star2: { maxAttempts: number; maxHints: number } }
}

function generateTruthTable(gate: ComponentType, numInputs: number): { inputs: string[]; outputs: string[]; rows: (0 | 1)[][] } {
  const def = getComponentDef(gate)
  const props = {}
  const inputPins = def.inputPins(props).slice(0, numInputs)
  const outputPins = def.outputPins(props)
  const rowCount = 1 << inputPins.length

  const rows: (0 | 1)[][] = []
  for (let i = 0; i < rowCount; i++) {
    const inputVals: Record<string, 0 | 1> = {}
    for (let b = 0; b < inputPins.length; b++) {
      inputVals[inputPins[b]] = ((i >> (inputPins.length - 1 - b)) & 1) as 0 | 1
    }
    const result = def.evaluate(inputVals, props)
    const row: (0 | 1)[] = inputPins.map(p => inputVals[p])
    outputPins.forEach(p => row.push((result[p] as (0 | 1)) ?? 0))
    rows.push(row)
  }

  return { inputs: inputPins, outputs: outputPins, rows }
}

function bitLabel(b: number): string {
  const names = ['A', 'B', 'C', 'D', 'E', 'F']
  return names[b] ?? `I${b}`
}

export function TruthTableMechanic({ data, onSolve, hints, stars }: Props) {
  const numInputs = data.numInputs ?? 2
  const table = generateTruthTable(data.gate, numInputs)
  const numOutputs = table.outputs.length
  const numRows = table.rows.length

  // Player answers: indexed [rowIndex][outputIndex], null = unanswered
  const [answers, setAnswers] = useState<(0 | 1 | null)[][]>(() =>
    Array.from({ length: numRows }, () => Array(numOutputs).fill(null))
  )
  const [submitted, setSubmitted] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [hintIdx, setHintIdx] = useState(-1)
  const [wrongRows, setWrongRows] = useState<Set<number>>(new Set())

  const toggleCell = useCallback((row: number, col: number) => {
    if (submitted && correct) return
    setAnswers(prev => {
      const next = prev.map(r => [...r])
      const cur = next[row][col]
      next[row][col] = cur === null ? 0 : cur === 0 ? 1 : null
      return next
    })
  }, [submitted, correct])

  const handleCheck = useCallback(() => {
    const wrong = new Set<number>()
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numOutputs; c++) {
        if (answers[r][c] !== table.rows[r][table.inputs.length + c]) {
          wrong.add(r)
        }
      }
    }
    const newAttempts = attempts + 1
    setAttempts(newAttempts)
    setWrongRows(wrong)
    setSubmitted(true)
    if (wrong.size === 0) {
      setCorrect(true)
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
      // Allow retry — reset submission state after short delay
      setTimeout(() => setSubmitted(false), 400)
    }
  }, [answers, attempts, hintIdx, numRows, numOutputs, stars, table, onSolve])

  const allFilled = answers.every(row => row.every(v => v !== null))

  const inputLabels = table.inputs.map((_, i) => bitLabel(i))
  const outputLabels = table.outputs.map(p => {
    const label = data.gate === 'NOT' ? 'NOT A' : `${data.gate}(${inputLabels.join(',')})`
    return table.outputs.length === 1 ? label : p
  })

  return (
    <div className={styles.root}>
      <div className={styles.gateInfo}>
        <span className={styles.gateType}>{data.gate}</span>
        <span className={styles.gateDesc}>Fill in the output column(s). Click a cell to cycle: blank → 0 → 1 → blank</span>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {inputLabels.map(h => <th key={h} className={styles.inputHead}>{h}</th>)}
              {outputLabels.map(h => <th key={h} className={styles.outputHead}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => {
              const isWrong = submitted && wrongRows.has(ri)
              const isCorrect = submitted && correct
              return (
                <tr key={ri} className={isWrong ? styles.wrongRow : isCorrect ? styles.correctRow : undefined}>
                  {inputLabels.map((_, ci) => (
                    <td key={ci} className={styles.inputCell}>{row[ci]}</td>
                  ))}
                  {outputLabels.map((_, ci) => {
                    const val = answers[ri][ci]
                    const showCorrect = correct
                    const expected = table.rows[ri][table.inputs.length + ci]
                    return (
                      <td
                        key={ci}
                        className={[
                          styles.outputCell,
                          val !== null ? styles.filled : '',
                          showCorrect ? (val === expected ? styles.cellCorrect : styles.cellWrong) : '',
                        ].join(' ')}
                        onClick={() => !correct && toggleCell(ri, ci)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') toggleCell(ri, ci) }}
                        aria-label={`Row ${ri + 1} output ${ci + 1}: ${val ?? 'empty'}`}
                      >
                        {val !== null ? val : '?'}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {correct && (
        <div className={styles.successBanner}>
          ✅ Correct! You filled the truth table in {attempts} attempt{attempts !== 1 ? 's' : ''}.
        </div>
      )}

      {!correct && hintIdx >= 0 && hintIdx < hints.length && (
        <div className={styles.hint}>
          <span className={styles.hintLabel}>💡 Hint {hintIdx + 1}:</span> {hints[hintIdx]}
        </div>
      )}

      <div className={styles.actions}>
        {!correct && hints.length > 0 && hintIdx < hints.length - 1 && (
          <button className={styles.hintBtn} onClick={() => setHintIdx(h => h + 1)}>
            💡 Hint ({hints.length - hintIdx - 1} left)
          </button>
        )}
        {!correct && (
          <button
            className={styles.checkBtn}
            onClick={handleCheck}
            disabled={!allFilled}
          >
            Check Answer
          </button>
        )}
      </div>
    </div>
  )
}
