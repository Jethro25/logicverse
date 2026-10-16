import { useState, useCallback } from 'react'
import type { CircuitBuildData } from '@/content/puzzles'
import type { CanvasCircuit } from '@/features/circuit/types'
import { CircuitBuilder } from '@/features/circuit/CircuitBuilder'
import { evaluate } from '@/engine/evaluate'
import styles from './CircuitBuildMechanic.module.css'

interface Props {
  data: CircuitBuildData
  onSolve: (stars: number, attempts: number) => void
  hints: string[]
  stars?: { star3: { maxAttempts: number; maxHints: number }; star2: { maxAttempts: number; maxHints: number } }
}

interface CheckResult {
  passed: boolean
  failedRows: number[]
  errorMsg?: string
}

function canvasToEngine(canvas: CanvasCircuit): import('@/engine/types').Circuit {
  return {
    schema: 1,
    components: canvas.components.map(c => ({
      id: c.id, type: c.type, x: c.x, y: c.y, props: c.props,
    })),
    wires: canvas.wires.map(w => ({
      id: w.id, from: w.from, to: w.to,
    })),
  }
}

function checkCircuit(circuit: CanvasCircuit, truthTable: CircuitBuildData['truthTable']): CheckResult {
  const { inputs, outputs, rows } = truthTable

  // Find SWITCH/CONST components for inputs — in order, matched by label or index
  const switches = circuit.components
    .filter(c => c.type === 'SWITCH' || c.type === 'CONST')
    .sort((a, b) => (a.label || a.id).localeCompare(b.label || b.id))

  // Find LED/PROBE components for outputs — in order
  const leds = circuit.components
    .filter(c => c.type === 'LED' || c.type === 'PROBE')
    .sort((a, b) => (a.label || a.id).localeCompare(b.label || b.id))

  if (switches.length < inputs.length) {
    return { passed: false, failedRows: [], errorMsg: `Circuit needs at least ${inputs.length} input(s) (SWITCH). Found ${switches.length}.` }
  }
  if (leds.length < outputs.length) {
    return { passed: false, failedRows: [], errorMsg: `Circuit needs at least ${outputs.length} output(s) (LED). Found ${leds.length}.` }
  }

  const failedRows: number[] = []

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r]
    const inputVals = row.slice(0, inputs.length) as (0 | 1)[]
    const expectedOutputs = row.slice(inputs.length) as (0 | 1)[]

    // Build circuit with input values set on SWITCH components
    const patchedCircuit: CanvasCircuit = {
      ...circuit,
      components: circuit.components.map(c => {
        const switchIdx = switches.findIndex(s => s.id === c.id)
        if (switchIdx >= 0 && switchIdx < inputVals.length) {
          return { ...c, props: { ...c.props, value: inputVals[switchIdx] } }
        }
        return c
      }),
    }

    const engineCircuit = canvasToEngine(patchedCircuit)
    const result = evaluate(engineCircuit)

    // Read LED outputs
    let rowFailed = false
    for (let o = 0; o < outputs.length; o++) {
      const led = leds[o]
      const ledSignal = result.signals.get(`${led.id}:in`) ?? null
      if (ledSignal !== expectedOutputs[o]) {
        rowFailed = true
        break
      }
    }

    if (rowFailed) failedRows.push(r)
  }

  return { passed: failedRows.length === 0, failedRows }
}

export function CircuitBuildMechanic({ data, onSolve, hints, stars }: Props) {
  const [attempts, setAttempts] = useState(0)
  const [hintIdx, setHintIdx] = useState(-1)
  const [result, setResult] = useState<CheckResult | null>(null)
  const [solved, setSolved] = useState(false)

  const handleCheck = useCallback((c: CanvasCircuit) => {
    const r = checkCircuit(c, data.truthTable)
    const newAttempts = attempts + 1
    setAttempts(newAttempts)
    setResult(r)
    if (r.passed) {
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
    }
  }, [data.truthTable, attempts, hintIdx, stars, onSolve])

  return (
    <div className={styles.root}>
      <div className={styles.description}>{data.description}</div>

      <div className={styles.targetTable}>
        <div className={styles.tableLabel}>Target truth table:</div>
        <table className={styles.table}>
          <thead>
            <tr>
              {data.truthTable.inputs.map(h => <th key={h} className={styles.inputHead}>{h}</th>)}
              {data.truthTable.outputs.map(h => <th key={h} className={styles.outputHead}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.truthTable.rows.map((row, ri) => {
              const failed = result && !result.passed && result.failedRows.includes(ri)
              return (
                <tr key={ri} className={failed ? styles.failRow : undefined}>
                  {row.map((v, ci) => (
                    <td key={ci} className={ci < data.truthTable.inputs.length ? styles.inputCell : styles.outputCell}>
                      {v}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.builderWrap}>
        <CircuitBuilder
          initial={data.initial ?? { components: [], wires: [] }}
          puzzle={data.constraints}
          onCheck={handleCheck}
          checkLabel={solved ? '✅ Solved!' : 'Check Circuit'}
          readOnly={solved}
        />
      </div>

      {result && !result.passed && (
        <div className={styles.failMsg}>
          {result.errorMsg
            ? result.errorMsg
            : `${result.failedRows.length} row(s) don't match. Check rows: ${result.failedRows.map(r => r + 1).join(', ')}.`}
        </div>
      )}

      {solved && (
        <div className={styles.successMsg}>
          ✅ Circuit works! Solved in {attempts} attempt{attempts !== 1 ? 's' : ''}.
        </div>
      )}

      {hintIdx >= 0 && hintIdx < hints.length && (
        <div className={styles.hint}>
          <span className={styles.hintLabel}>💡 Hint {hintIdx + 1}:</span> {hints[hintIdx]}
        </div>
      )}

      {!solved && hints.length > 0 && hintIdx < hints.length - 1 && (
        <div className={styles.hintRow}>
          <button className={styles.hintBtn} onClick={() => setHintIdx(h => h + 1)}>
            💡 Hint ({hints.length - hintIdx - 1} left)
          </button>
        </div>
      )}
    </div>
  )
}
