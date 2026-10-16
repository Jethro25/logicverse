import { useStore } from '@/state/store'
import { getWorld } from '@/content/worlds'
import { getLesson } from '@/content/lessons'
import { getPuzzle } from '@/content/puzzles'
import styles from './WorldHubScreen.module.css'

interface Props {
  worldId: string
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className={styles.progressTrack} aria-label={`${value}% complete`}>
      <div className={styles.progressFill} style={{ width: `${value}%` }} />
    </div>
  )
}

function StarRow({ stars, max = 3 }: { stars: number; max?: number }) {
  return (
    <span className={styles.stars} aria-label={`${stars} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < stars ? styles.starFilled : styles.starEmpty}>★</span>
      ))}
    </span>
  )
}

export function WorldHubScreen({ worldId }: Props) {
  const navigate = useStore(s => s.navigate)
  const save = useStore(s => s.save)
  const worldProgress = useStore(s => s.worldProgress)
  const world = getWorld(worldId)

  if (!world) {
    return (
      <div className={styles.error}>
        <p>World not found: {worldId}</p>
        <button onClick={() => navigate({ id: 'world-map' })}>Back to Map</button>
      </div>
    )
  }

  const progress = worldProgress(worldId)

  // Build ordered content list: interleave lessons + puzzles in curriculum order
  // Convention: lessons come before puzzles within a world, presented sequentially
  type ContentItem =
    | { kind: 'lesson'; id: string }
    | { kind: 'puzzle'; id: string }

  const items: ContentItem[] = [
    ...world.lessonIds.map(id => ({ kind: 'lesson' as const, id })),
    ...world.puzzleIds.map(id => ({ kind: 'puzzle' as const, id })),
  ]

  return (
    <div className={styles.root} data-world={worldId}>
      <header className={styles.header} style={{ '--world-accent': world.palette.accent } as React.CSSProperties}>
        <button
          className={styles.backBtn}
          onClick={() => navigate({ id: 'world-map' })}
          aria-label="Back to World Map"
        >
          ←
        </button>
        <div className={styles.worldIcon}>{world.icon}</div>
        <div className={styles.headerText}>
          <h1 className={styles.worldName}>{world.name}</h1>
          <p className={styles.worldSub}>{world.subtitle}</p>
        </div>
      </header>

      <div className={styles.progressSection}>
        <div className={styles.progressLabel}>
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <ProgressBar value={progress} />
      </div>

      <p className={styles.description}>{world.description}</p>

      <section className={styles.contentList}>
        {items.map((item, idx) => {
          if (item.kind === 'lesson') {
            const lesson = getLesson(item.id)
            if (!lesson) return null
            const done = save.progress.lessons[item.id]?.done ?? false
            return (
              <button
                key={item.id}
                className={styles.card}
                data-done={done}
                data-kind="lesson"
                onClick={() => navigate({ id: 'lesson', worldId, lessonId: item.id })}
              >
                <span className={styles.itemIndex}>{idx + 1}</span>
                <span className={styles.itemIcon}>{lesson.icon ?? '📖'}</span>
                <div className={styles.itemBody}>
                  <span className={styles.kindBadge} data-kind="lesson">LESSON</span>
                  <span className={styles.itemTitle}>{lesson.title}</span>
                  {lesson.subtitle && <span className={styles.itemSub}>{lesson.subtitle}</span>}
                </div>
                <div className={styles.itemStatus}>
                  {done ? (
                    <span className={styles.doneCheck} aria-label="Completed">✓</span>
                  ) : (
                    <span className={styles.xpBadge}>+{lesson.xpReward} XP</span>
                  )}
                </div>
              </button>
            )
          } else {
            const puzzle = getPuzzle(item.id)
            if (!puzzle) return null
            const puzzleProgress = save.progress.puzzles[item.id]
            const stars = puzzleProgress?.stars ?? 0
            const done = stars >= 1
            return (
              <button
                key={item.id}
                className={styles.card}
                data-done={done}
                data-kind="puzzle"
                onClick={() => navigate({ id: 'puzzle', worldId, puzzleId: item.id })}
              >
                <span className={styles.itemIndex}>{idx + 1}</span>
                <span className={styles.itemIcon}>{puzzle.icon ?? '🧩'}</span>
                <div className={styles.itemBody}>
                  <span className={styles.kindBadge} data-kind="puzzle">PUZZLE</span>
                  <span className={styles.itemTitle}>{puzzle.title}</span>
                  {puzzle.subtitle && <span className={styles.itemSub}>{puzzle.subtitle}</span>}
                </div>
                <div className={styles.itemStatus}>
                  {done ? (
                    <StarRow stars={stars} />
                  ) : (
                    <span className={styles.xpBadge}>+{puzzle.xpReward ?? 30} XP</span>
                  )}
                </div>
              </button>
            )
          }
        })}
      </section>
    </div>
  )
}
