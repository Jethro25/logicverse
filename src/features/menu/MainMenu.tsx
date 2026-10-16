import { useEffect, useRef, useState, useCallback } from 'react'
import { useStore } from '@/state/store'
import { WORLDS } from '@/content/worlds'
import { Bit } from '@/bit/Bit'
import { lva } from '@/lva'
import styles from './MainMenu.module.css'

const LINES_NEW = [
  "Welcome to LOGICVERSE! The digital world needs you! ⚡",
  "Tap me to hear more… or jump in and start repairing!",
  "Every gate you fix lights up the map. Let's go!",
  "XOR is the sneaky one. But you'll figure it out.",
]
const LINES_RETURN = [
  "Welcome back! Gate Gardens is still flickering. 🌿",
  "Ready to restore the Logicverse?",
  "XOR is waiting for you. It's the sneaky one.",
  "Every circuit you fix makes the world brighter!",
]

export function MainMenu() {
  const navigate  = useStore(s => s.navigate)
  const save      = useStore(s => s.save)
  const hasSave   = !!save.playerName
  const containerRef = useRef<HTMLDivElement>(null)

  const [say, setSay]         = useState('')
  const [talking, setTalking] = useState(false)
  const [mood, setMood]       = useState<'excited' | 'happy'>('excited')
  const [lineIdx, setLineIdx] = useState(0)
  const [muted, setMuted]     = useState(false)
  const stopTyper = useRef<(() => void) | null>(null)

  const speak = useCallback((idx: number) => {
    const L = lva()
    if (!L) return
    stopTyper.current?.()
    const lines = hasSave ? LINES_RETURN : LINES_NEW
    const text = lines[idx % lines.length]
    setSay('')
    setTalking(true)
    setLineIdx(idx)
    stopTyper.current = L.type(text, mood, (n, done) => {
      setSay(text.slice(0, n))
      if (done) setTalking(false)
    })
  }, [hasSave, mood])

  useEffect(() => {
    const L = lva()
    if (!L) {
      // Wait for LVA to be available (loaded via script tag)
      const t = setInterval(() => {
        if (window.LVA) {
          clearInterval(t)
          window.LVA.enter('menu')
          setMuted(window.LVA.muted)
          speak(0)
        }
      }, 80)
      return () => clearInterval(t)
    }
    L.enter('menu')
    setMuted(L.muted)
    speak(0)
    const unsub = L.sub(() => setMuted(L.muted))
    return () => { unsub(); stopTyper.current?.() }
  }, [speak])

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const L = lva()
    if (!containerRef.current || L?.rm()) return
    const r = containerRef.current.getBoundingClientRect()
    containerRef.current.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
    containerRef.current.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
  }

  const toggleMute = () => {
    lva()?.toggleMute()
    setMuted(v => !v)
  }

  const hov = () => lva()?.S.hover()
  const click = () => lva()?.S.click()
  const poke = () => {
    click()
    speak(lineIdx + 1)
    setMood(m => m === 'excited' ? 'happy' : 'excited')
  }

  const currentWorld = (() => {
    if (!hasSave) return null
    for (const world of WORLDS) {
      const allDone = world.lessonIds.every(id => save.progress.lessons[id]?.done) &&
                      world.puzzleIds.every(id => (save.progress.puzzles[id]?.stars ?? 0) >= 1)
      if (!allDone) return world.id
    }
    return 'w10'
  })()

  const WORLD_NAMES: Record<string, string> = {
    w1: 'Valley of Signals', w2: 'Number Nexus', w3: 'Gate Gardens',
    w4: 'Boolean Library', w5: 'Karnaugh Caverns', w6: 'Combinational Foundry',
    w7: 'MSI Junction', w8: 'Memory Core', w9: 'State Machine Spire', w10: 'Final Logicverse',
  }

  return (
    <div
      ref={containerRef}
      className={styles.root}
      onMouseMove={handleMouse}
    >
      {/* Parallax starfield layers */}
      <div className={styles.stars1} style={{ transform: 'translate(calc(var(--px,0) * -10px),calc(var(--py,0) * -10px))' }} />
      <div className={styles.stars2} style={{ transform: 'translate(calc(var(--px,0) * -20px),calc(var(--py,0) * -20px))' }} />

      {/* Radial glow */}
      <div className={styles.radialGlow} style={{ transform: 'translate(calc(var(--px,0) * 26px),calc(var(--py,0) * 26px))' }} />

      {/* Circuit traces */}
      <div className={styles.trace1}><div className={styles.traceBeam} /></div>
      <div className={styles.trace2}><div className={styles.traceBeam2} /></div>

      {/* Sound toggle */}
      <button
        className={styles.muteBtn}
        onClick={toggleMute}
        aria-label="Toggle sound"
        style={{ textDecoration: muted ? 'line-through' : 'none', opacity: muted ? 0.55 : 1 }}
      >
        ♪
      </button>

      {/* Main layout */}
      <div className={styles.layout}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoTitle}>
            <span className={styles.logoL}>L</span>
            <span className={styles.logoOGIC}>OGIC</span>
          </div>
          <div className={styles.logoVerse}>VERSE</div>
          <div className={styles.logoSub}>RESTORE THE DIGITAL WORLD</div>
        </div>

        {/* BIT */}
        <div className={styles.bitCol}>
          <div className={styles.speechBubble}>
            <span>{say}</span>
            <span
              className={styles.caret}
              style={{ opacity: talking ? 1 : 0 }}
            />
          </div>
          <div
            className={styles.bitWrap}
            onClick={poke}
            style={{ transform: 'translate(calc(var(--px,0) * -12px),calc(var(--py,0) * -8px))' }}
          >
            <Bit mood={mood} size={110} talking={talking} wave={!hasSave} follow />
          </div>
        </div>

        {/* Buttons */}
        <div className={styles.btns}>
          {/* Primary CTA */}
          <button
            className={styles.primaryBtn}
            onMouseEnter={hov}
            onClick={() => { click(); hasSave ? navigate({ id: 'world-map' }) : navigate({ id: 'intro' }) }}
          >
            <span className={styles.primaryBtnArrow}>▶</span>
            <span className={styles.primaryBtnText}>
              <span className={styles.primaryBtnLabel}>
                {hasSave ? 'Continue Adventure' : 'Play Adventure'}
              </span>
              {hasSave && currentWorld && (
                <span className={styles.primaryBtnSub}>
                  {WORLD_NAMES[currentWorld] ?? currentWorld}
                </span>
              )}
            </span>
          </button>

          {/* Secondary grid */}
          <div className={styles.grid2}>
            {[
              { icon: '◇', label: 'World Map',    nav: 'world-map' },
              { icon: '⊕', label: 'Circuit Lab',  nav: 'circuit-lab' },
              { icon: '★', label: 'Achievements', nav: 'achievements' },
              { icon: '≡', label: 'Glossary',     nav: 'glossary' },
              { icon: '◐', label: 'Settings',     nav: 'settings' },
              { icon: '○', label: 'Credits',      nav: 'credits' },
            ].map(item => (
              <button
                key={item.label}
                className={styles.secondaryBtn}
                onMouseEnter={hov}
                onClick={() => { click(); navigate({ id: item.nav as never }) }}
              >
                <span className={styles.secondaryIcon}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* XP bar */}
          {hasSave && (
            <div className={styles.xpRow}>
              <span className={styles.lvBadge}>Lv {save.level}</span>
              <div className={styles.xpTrack}>
                <div
                  className={styles.xpFill}
                  style={{ width: `${Math.min(100, save.xp % 100)}%` }}
                />
              </div>
              <span className={styles.xpLabel}>{save.playerName} · {save.xp} XP</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
