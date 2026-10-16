import { useState } from 'react'
import { getPuzzle } from '@/content/puzzles'
import { TruthTableMechanic } from './mechanics/TruthTableMechanic'
import { GateSelectorMechanic } from './mechanics/GateSelectorMechanic'
import { NumberConvertMechanic } from './mechanics/NumberConvertMechanic'
import { ComplementMechanic } from './mechanics/ComplementMechanic'
import { CodeConvertMechanic } from './mechanics/CodeConvertMechanic'
import { CircuitBuildMechanic } from './mechanics/CircuitBuildMechanic'
import styles from './PuzzleScreen.module.css'

interface Props {
  puzzleId: string
  onComplete: (stars: number, xp: number) => void
  onBack: () => void
}

function StarDisplay({ count, max = 3 }: { count: number; max?: number }) {
  return (
    <div className={styles.stars} aria-label={`${count} of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < count ? styles.starFilled : styles.starEmpty}>★</span>
      ))}
    </div>
  )
}

export function PuzzleScreen({ puzzleId, onComplete, onBack }: Props) {
  const puzzle = getPuzzle(puzzleId)
  const [solvedStars, setSolvedStars] = useState<number | null>(null)

  if (!puzzle) {
    return (
      <div className={styles.error}>
        <p>Puzzle not found: {puzzleId}</p>
        <button onClick={onBack}>Back</button>
      </div>
    )
  }

  const handleSolve = (stars: number, _attempts: number) => {
    setSolvedStars(stars)
  }

  const { data, hints, stars: starCriteria } = puzzle
  const mechanicProps = { hints: hints ?? [], stars: starCriteria, onSolve: handleSolve }

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Back">←</button>
        <div className={styles.headerInfo}>
          <span className={styles.puzzleIcon}>{puzzle.icon ?? '🧩'}</span>
          <div className={styles.headerText}>
            <span className={styles.puzzleTitle}>{puzzle.title}</span>
            {puzzle.subtitle && <span className={styles.puzzleSub}>{puzzle.subtitle}</span>}
          </div>
        </div>
        <span className={styles.xpBadge}>+{puzzle.xpReward} XP</span>
      </header>

      {puzzle.concept && (
        <div className={styles.conceptBar}>
          <span className={styles.conceptLabel}>Concept:</span> {puzzle.concept}
        </div>
      )}

      <main className={styles.content}>
        {data.mechanic === 'truth-table' && (
          <TruthTableMechanic data={data} {...mechanicProps} />
        )}
        {data.mechanic === 'gate-selector' && (
          <GateSelectorMechanic data={data} {...mechanicProps} />
        )}
        {data.mechanic === 'number-convert' && (
          <NumberConvertMechanic data={data} {...mechanicProps} />
        )}
        {data.mechanic === 'complement' && (
          <ComplementMechanic data={data} {...mechanicProps} />
        )}
        {data.mechanic === 'code-convert' && (
          <CodeConvertMechanic data={data} {...mechanicProps} />
        )}
        {data.mechanic === 'circuit-build' && (
          <CircuitBuildMechanic data={data} {...mechanicProps} />
        )}
        {data.mechanic === 'expression-entry' && (
          <div className={styles.placeholder}>Expression entry coming soon.</div>
        )}
      </main>

      {solvedStars !== null && (
        <div className={styles.solvedPanel}>
          <div className={styles.solvedTitle}>Puzzle Complete!</div>
          <StarDisplay count={solvedStars} />
          <div className={styles.solvedXP}>+{puzzle.xpReward} XP earned</div>
          <button className={styles.continueBtn} onClick={() => onComplete(solvedStars ?? 1, puzzle.xpReward ?? 0)}>
            Continue →
          </button>
        </div>
      )}
    </div>
  )
}
