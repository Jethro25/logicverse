import { useStore } from '@/state/store'
import { WORLDS } from '@/content/worlds'
import styles from './WorldMapScreen.module.css'

export function WorldMapScreen() {
  const navigate = useStore(s => s.navigate)
  const isWorldUnlocked = useStore(s => s.isWorldUnlocked)
  const worldProgress = useStore(s => s.worldProgress)
  const save = useStore(s => s.save)

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => navigate({ id: 'menu' })}
          aria-label="Back to Menu"
        >
          ←
        </button>
        <div className={styles.headerText}>
          <h1 className={styles.title}>World Map</h1>
          <p className={styles.subtitle}>LOGICVERSE: Restore the Digital World</p>
        </div>
        <div className={styles.playerInfo}>
          <span className={styles.levelBadge}>Lv. {save.level}</span>
          <span className={styles.xpLabel}>{save.xp} XP</span>
        </div>
      </header>

      <div className={styles.grid}>
        {WORLDS.map((world) => {
          const unlocked = isWorldUnlocked(world.id)
          const progress = worldProgress(world.id)
          const complete = progress === 100
          return (
            <button
              key={world.id}
              className={styles.worldCard}
              data-unlocked={unlocked}
              data-complete={complete}
              style={{ '--world-accent': world.palette.accent } as React.CSSProperties}
              onClick={() => unlocked && navigate({ id: 'world-hub', worldId: world.id })}
              aria-disabled={!unlocked}
              aria-label={unlocked ? `${world.name} — ${progress}% complete` : `${world.name} — locked`}
            >
              <div className={styles.cardGlow} />
              <div className={styles.cardIcon}>{unlocked ? world.icon : '🔒'}</div>
              <div className={styles.cardBody}>
                <span className={styles.termBadge} data-term={world.term}>
                  {world.term === 'midterm' ? 'MIDTERM' : 'FINALS'}
                </span>
                <span className={styles.worldName}>{world.name}</span>
                <span className={styles.worldSub}>{world.subtitle}</span>
              </div>
              {unlocked && (
                <div className={styles.cardFooter}>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                  </div>
                  <span className={styles.progressLabel}>{progress}%</span>
                </div>
              )}
              {!unlocked && (
                <div className={styles.lockedMsg}>
                  {world.unlocksAfter
                    ? `Complete ${WORLDS.find(w => w.id === world.unlocksAfter)?.name ?? world.unlocksAfter} to unlock`
                    : 'Locked'}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
