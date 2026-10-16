import { useStore } from '@/state/store'
import { Bit } from '@/bit/Bit'
import { Button } from '@/ui/Button'
import { Map, FlaskConical, Trophy, BookOpen, BookMarked, Settings, Info } from 'lucide-react'
import styles from './MainMenu.module.css'

export function MainMenu() {
  const navigate = useStore(s => s.navigate)
  const save = useStore(s => s.save)
  const hasSave = !!save.playerName

  const menuItems = [
    {
      label: hasSave ? 'Continue Adventure' : 'Play Adventure',
      icon: null,
      onClick: () => {
        if (!hasSave) navigate({ id: 'intro' })
        else navigate({ id: 'world-map' })
      },
      primary: true,
    },
    { label: 'World Map', icon: <Map size={18} />, onClick: () => navigate({ id: 'world-map' }) },
    { label: 'Circuit Lab', icon: <FlaskConical size={18} />, onClick: () => navigate({ id: 'circuit-lab' }) },
    { label: 'Achievements', icon: <Trophy size={18} />, onClick: () => navigate({ id: 'achievements' }) },
    { label: 'Glossary', icon: <BookOpen size={18} />, onClick: () => navigate({ id: 'glossary' }) },
    { label: 'Journal', icon: <BookMarked size={18} />, onClick: () => navigate({ id: 'achievements' }) },
    { label: 'Settings', icon: <Settings size={18} />, onClick: () => navigate({ id: 'settings' }) },
    { label: 'Credits', icon: <Info size={18} />, onClick: () => navigate({ id: 'credits' }) },
  ]

  return (
    <div className={styles.container}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoGlow} />
        <div className={styles.logoText}>
          <span className={styles.logoL}>L</span>
          <span className={styles.logoOGIC}>OGIC</span>
          <span className={styles.logoVerse}>VERSE</span>
        </div>
        <div className={styles.logoSub}>Restore the Digital World</div>
      </div>

      {/* Bit mascot */}
      <div className={styles.bitContainer}>
        <Bit mood={hasSave ? 'happy' : 'excited'} size={100} />
        {hasSave && (
          <div className={styles.greeting}>
            Welcome back, <strong>{save.playerName}</strong>! ⚡
          </div>
        )}
      </div>

      {/* Menu buttons */}
      <nav className={styles.nav} aria-label="Main menu">
        {menuItems.map((item, i) => (
          <Button
            key={item.label}
            variant={item.primary ? 'primary' : 'secondary'}
            size={item.primary ? 'lg' : 'md'}
            onClick={item.onClick}
            className={styles.menuBtn}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {item.icon}
            {item.label}
          </Button>
        ))}
      </nav>

      {/* XP/level badge */}
      {hasSave && (
        <div className={styles.levelBadge}>
          <span className={styles.levelLabel}>Lv.{save.level}</span>
          <div className={styles.xpBar}>
            <div
              className={styles.xpFill}
              style={{ width: `${Math.min(100, (save.xp % 100))}%` }}
            />
          </div>
          <span className={styles.xpLabel}>{save.xp} XP</span>
        </div>
      )}

      {/* Tagline */}
      <p className={styles.tagline}>CPE 10 · Logic Circuits &amp; Design</p>
    </div>
  )
}
