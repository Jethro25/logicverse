import { useState } from 'react'
import { getLesson } from '@/content/lessons'
import type { LessonPage, DiagramPage, TruthTablePage, ExamplePage } from '@/content/lessons'
import { CircuitBuilder } from '@/features/circuit/CircuitBuilder'
import type { CanvasCircuit } from '@/features/circuit/types'
import styles from './LessonScreen.module.css'

interface Props {
  lessonId: string
  onComplete: (xp: number) => void
  onBack: () => void
}

function parseMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\n)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className={styles.inlineCode}>{part.slice(1, -1)}</code>
    if (part === '\n') return <br key={i} />
    return part
  })
}

function TextPageView({ page }: { page: Extract<LessonPage, { type: 'text' }> }) {
  return (
    <div className={styles.textPage}>
      {page.heading && <h2 className={styles.pageHeading}>{page.heading}</h2>}
      <div className={styles.pageBody}>{parseMarkdown(page.body)}</div>
    </div>
  )
}

function ExamplePageView({ page }: { page: ExamplePage }) {
  return (
    <div className={styles.examplePage}>
      {page.heading && <h2 className={styles.pageHeading}>{page.heading}</h2>}
      <p className={styles.exampleDesc}>{page.description}</p>
      <ol className={styles.stepsList}>
        {page.steps.map((s, i) => (
          <li key={i} className={styles.stepItem}>{parseMarkdown(s)}</li>
        ))}
      </ol>
    </div>
  )
}

function DiagramPageView({ page }: { page: DiagramPage }) {
  const circuit: CanvasCircuit = {
    components: page.circuit.components.map(c => ({
      id: c.id, type: c.type,
      x: c.x * 40, y: c.y * 40,
      props: c.props ?? {},
      label: c.label ?? '',
    })),
    wires: page.circuit.wires,
  }
  return (
    <div className={styles.diagramPage}>
      {page.heading && <h2 className={styles.pageHeading}>{page.heading}</h2>}
      <div className={styles.diagramWrap}>
        <CircuitBuilder initial={circuit} readOnly />
      </div>
      {page.explanation && <p className={styles.explanation}>{page.explanation}</p>}
      {page.caption && <p className={styles.caption}>{page.caption}</p>}
    </div>
  )
}

function TruthTableDemoView({ page }: { page: TruthTablePage }) {
  const [highlighted, setHighlighted] = useState<number | null>(page.highlight ?? null)
  return (
    <div className={styles.ttPage}>
      {page.heading && <h2 className={styles.pageHeading}>{page.heading}</h2>}
      <div className={styles.ttWrap}>
        <table className={styles.ttTable}>
          <thead>
            <tr>
              {page.inputs.map(h => <th key={h} className={styles.ttInputHead}>{h}</th>)}
              {page.outputs.map(h => <th key={h} className={styles.ttOutputHead}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {page.rows.map((row, ri) => (
              <tr
                key={ri}
                className={highlighted === ri ? styles.ttRowHighlight : styles.ttRow}
                onClick={() => setHighlighted(ri === highlighted ? null : ri)}
              >
                {row.slice(0, page.inputs.length).map((v, ci) => (
                  <td key={ci} className={styles.ttInputCell}>{v}</td>
                ))}
                {row.slice(page.inputs.length).map((v, ci) => (
                  <td key={ci} className={styles.ttOutputCell}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {page.caption && <p className={styles.caption}>{page.caption}</p>}
    </div>
  )
}

function PageView({ page }: { page: LessonPage }) {
  if (page.type === 'text') return <TextPageView page={page} />
  if (page.type === 'example') return <ExamplePageView page={page} />
  if (page.type === 'diagram') return <DiagramPageView page={page} />
  if (page.type === 'truth-table-demo') return <TruthTableDemoView page={page} />
  return null
}

export function LessonScreen({ lessonId, onComplete, onBack }: Props) {
  const lesson = getLesson(lessonId)
  const [pageIdx, setPageIdx] = useState(0)

  if (!lesson) {
    return (
      <div className={styles.error}>
        <p>Lesson not found: {lessonId}</p>
        <button onClick={onBack}>Back</button>
      </div>
    )
  }

  const totalPages = lesson.pages.length
  const isLast = pageIdx === totalPages - 1

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Back">←</button>
        <div className={styles.headerInfo}>
          <span className={styles.lessonIcon}>{lesson.icon ?? '📖'}</span>
          <span className={styles.lessonTitle}>{lesson.title}</span>
        </div>
        <span className={styles.pageCount}>{pageIdx + 1} / {totalPages}</span>
      </header>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${((pageIdx + 1) / totalPages) * 100}%` }} />
      </div>

      <main className={styles.content}>
        <PageView page={lesson.pages[pageIdx]} />
      </main>

      <footer className={styles.footer}>
        <button
          className={styles.prevBtn}
          onClick={() => setPageIdx(p => p - 1)}
          disabled={pageIdx === 0}
        >
          ← Back
        </button>

        <div className={styles.dots}>
          {lesson.pages.map((_, i) => (
            <button
              key={i}
              className={[styles.dot, i === pageIdx ? styles.dotActive : i < pageIdx ? styles.dotDone : ''].join(' ')}
              onClick={() => setPageIdx(i)}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>

        {isLast ? (
          <button className={styles.completeBtn} onClick={() => onComplete(lesson.xpReward)}>
            Complete +{lesson.xpReward} XP ✓
          </button>
        ) : (
          <button className={styles.nextBtn} onClick={() => setPageIdx(p => p + 1)}>
            Next →
          </button>
        )}
      </footer>
    </div>
  )
}
