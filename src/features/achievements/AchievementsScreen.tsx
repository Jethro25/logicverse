import { useMemo } from 'react'
import { useStore } from '@/state/store'
import { WORLDS } from '@/content/worlds'
import styles from './AchievementsScreen.module.css'

interface AchievementDef {
  id: string
  icon: string
  title: string
  description: string
  category: 'progress' | 'mastery' | 'explorer' | 'speed'
}

const ACHIEVEMENTS: AchievementDef[] = [
  // Progress
  { id: 'first-puzzle', icon: '🔩', title: 'First Circuit', description: 'Complete your first puzzle.', category: 'progress' },
  { id: 'first-lesson', icon: '📖', title: 'Student of Signals', description: 'Complete your first lesson.', category: 'progress' },
  { id: 'w1-complete', icon: '⚡', title: 'Valley Cleared', description: 'Complete all content in Valley of Signals.', category: 'progress' },
  { id: 'w2-complete', icon: '🔢', title: 'Number Master', description: 'Complete all content in Number Nexus.', category: 'progress' },
  { id: 'w3-complete', icon: '🌿', title: 'Gate Gardener', description: 'Complete all content in Gate Gardens.', category: 'progress' },
  { id: 'midterm-ready', icon: '🎓', title: 'Midterm Ready', description: 'Complete worlds 1–6.', category: 'progress' },
  { id: 'logicverse-restored', icon: '🏆', title: 'Logicverse Restored', description: 'Complete all 10 worlds.', category: 'progress' },

  // Mastery
  { id: 'perfect-puzzle', icon: '⭐', title: 'Perfectionist', description: 'Earn 3 stars on any puzzle.', category: 'mastery' },
  { id: 'perfect-5', icon: '🌟', title: 'Star Collector', description: 'Earn 3 stars on 5 different puzzles.', category: 'mastery' },
  { id: 'no-hints', icon: '🧠', title: 'No Help Needed', description: 'Complete 10 puzzles without using any hints.', category: 'mastery' },
  { id: 'level-5', icon: '🔥', title: 'Rising Engineer', description: 'Reach Level 5.', category: 'mastery' },
  { id: 'level-10', icon: '💎', title: 'Logic Virtuoso', description: 'Reach Level 10.', category: 'mastery' },
  { id: 'xp-1000', icon: '✨', title: 'XP Milestone', description: 'Earn 1,000 total XP.', category: 'mastery' },

  // Explorer
  { id: 'circuit-lab', icon: '⚗', title: 'Lab Rat', description: 'Visit the Circuit Lab.', category: 'explorer' },
  { id: 'glossary-reader', icon: '📚', title: 'Bookworm', description: 'Open the Glossary.', category: 'explorer' },
  { id: 'all-worlds-visited', icon: '🗺', title: 'World Traveler', description: 'Visit every world hub.', category: 'explorer' },
]

const CATEGORY_LABELS: Record<string, string> = {
  progress: '📈 Progress',
  mastery: '⭐ Mastery',
  explorer: '🗺 Explorer',
  speed: '⚡ Speed',
}

interface Props {
  onBack: () => void
}

export function AchievementsScreen({ onBack }: Props) {
  const save = useStore(s => s.save)
  const worldProgress = useStore(s => s.worldProgress)

  // Compute which achievements are unlocked based on save state
  const unlocked = useMemo<Set<string>>(() => {
    const set = new Set<string>(Object.keys(save.achievements))

    // Auto-derive from save state (for achievements not explicitly stored)
    const puzzleDone = Object.values(save.progress.puzzles)
    const lessonDone = Object.values(save.progress.lessons)

    if (puzzleDone.length >= 1) set.add('first-puzzle')
    if (lessonDone.some(l => l.done)) set.add('first-lesson')
    if (puzzleDone.some(p => p.stars >= 3)) set.add('perfect-puzzle')
    if (puzzleDone.filter(p => p.stars >= 3).length >= 5) set.add('perfect-5')
    if (save.xp >= 1000) set.add('xp-1000')
    if (save.level >= 5) set.add('level-5')
    if (save.level >= 10) set.add('level-10')

    // World completions
    if (worldProgress('w1') === 100) set.add('w1-complete')
    if (worldProgress('w2') === 100) set.add('w2-complete')
    if (worldProgress('w3') === 100) set.add('w3-complete')

    const midtermWorlds = ['w1', 'w2', 'w3', 'w4', 'w5', 'w6']
    if (midtermWorlds.every(id => worldProgress(id) === 100)) set.add('midterm-ready')

    const allWorlds = WORLDS.map(w => w.id)
    if (allWorlds.every(id => worldProgress(id) === 100)) set.add('logicverse-restored')

    // Hints: count puzzles with 0 hints used
    const noHintPuzzles = puzzleDone.filter(p => (p.hintsUsed ?? 0) === 0 && p.stars >= 1).length
    if (noHintPuzzles >= 10) set.add('no-hints')

    return set
  }, [save, worldProgress])

  const categories = Array.from(new Set(ACHIEVEMENTS.map(a => a.category)))
  const unlockedCount = ACHIEVEMENTS.filter(a => unlocked.has(a.id)).length

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Back">←</button>
        <h1 className={styles.title}>Achievements</h1>
        <span className={styles.counter}>{unlockedCount}/{ACHIEVEMENTS.length}</span>
      </header>

      <div className={styles.content}>
        {categories.map(cat => {
          const items = ACHIEVEMENTS.filter(a => a.category === cat)
          return (
            <section key={cat} className={styles.section}>
              <h2 className={styles.catTitle}>{CATEGORY_LABELS[cat] ?? cat}</h2>
              <div className={styles.grid}>
                {items.map(a => {
                  const done = unlocked.has(a.id)
                  const date = save.achievements[a.id]
                  return (
                    <div key={a.id} className={styles.card} data-done={done}>
                      <span className={styles.icon} aria-hidden>{done ? a.icon : '🔒'}</span>
                      <div className={styles.cardBody}>
                        <span className={styles.achTitle}>{a.title}</span>
                        <span className={styles.achDesc}>{done ? a.description : '???'}</span>
                        {done && date && (
                          <span className={styles.achDate}>{new Date(date).toLocaleDateString()}</span>
                        )}
                      </div>
                      {done && <span className={styles.doneCheck}>✓</span>}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
