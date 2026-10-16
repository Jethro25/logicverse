import { useState, useEffect, useCallback } from 'react'
import styles from './Bit.module.css'

export type BitMood = 'happy' | 'excited' | 'curious' | 'confused' | 'thinking' | 'celebrate' | 'idle'

interface BitProps {
  mood?: BitMood
  size?: number
  animate?: boolean
  className?: string
}

export function Bit({ mood = 'idle', size = 80, animate = true, className = '' }: BitProps) {
  const [blinking, setBlinking] = useState(false)

  useEffect(() => {
    if (!animate) return
    const interval = setInterval(() => {
      setBlinking(true)
      setTimeout(() => setBlinking(false), 150)
    }, 3000 + Math.random() * 2000)
    return () => clearInterval(interval)
  }, [animate])

  const eyeHeight = blinking ? 2 : 14

  // Colors based on mood
  const moodColors: Record<BitMood, { body: string; screen: string; antenna: string }> = {
    idle:      { body: '#1e40af', screen: '#0ea5e9', antenna: '#00d4ff' },
    happy:     { body: '#166534', screen: '#22c55e', antenna: '#4ade80' },
    excited:   { body: '#7e22ce', screen: '#a855f7', antenna: '#d946ef' },
    curious:   { body: '#0e7490', screen: '#06b6d4', antenna: '#22d3ee' },
    confused:  { body: '#92400e', screen: '#f59e0b', antenna: '#fbbf24' },
    thinking:  { body: '#1e3a5f', screen: '#3b82f6', antenna: '#60a5fa' },
    celebrate: { body: '#9d174d', screen: '#ec4899', antenna: '#f472b6' },
  }
  const c = moodColors[mood]

  // Mouth shape based on mood
  const mouthPaths: Record<BitMood, string> = {
    idle:      'M 30 52 Q 40 58 50 52',
    happy:     'M 28 50 Q 40 62 52 50',
    excited:   'M 26 48 Q 40 66 54 48',
    curious:   'M 32 52 Q 40 56 48 52',
    confused:  'M 30 56 Q 40 50 50 56',
    thinking:  'M 32 54 L 48 54',
    celebrate: 'M 24 48 Q 40 68 56 48',
  }

  // Antenna decoration
  const antennaTip = mood === 'excited' || mood === 'celebrate'
    ? <polygon points="40,8 43,14 37,14" fill={c.antenna} />
    : <circle cx="40" cy="10" r="4" fill={c.antenna} />

  return (
    <svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      className={[styles.bit, styles[mood], animate ? styles.animateFloat : '', className].join(' ')}
      role="img"
      aria-label={`Bit is feeling ${mood}`}
    >
      {/* Antenna */}
      <line x1="40" y1="14" x2="40" y2="24" stroke={c.antenna} strokeWidth="2.5" strokeLinecap="round" />
      {antennaTip}

      {/* Body */}
      <rect x="16" y="24" width="48" height="40" rx="10" fill={c.body} />

      {/* Screen / face */}
      <rect x="20" y="28" width="40" height="28" rx="6" fill="#0a1628" />
      <rect x="21" y="29" width="38" height="26" rx="5" fill={c.screen} opacity="0.15" />

      {/* Eyes */}
      <rect x="26" y="34" width="12" height={eyeHeight} rx="4" fill="#fff" />
      <rect x="42" y="34" width="12" height={eyeHeight} rx="4" fill="#fff" />

      {/* Pupils */}
      {!blinking && (
        <>
          <circle cx={mood === 'confused' ? 36 : 32} cy="41" r="3.5" fill={c.antenna} />
          <circle cx={mood === 'confused' ? 52 : 48} cy="41" r="3.5" fill={c.antenna} />
          {/* Shine */}
          <circle cx={mood === 'confused' ? 34 : 30} cy="39" r="1.2" fill="#fff" opacity="0.8" />
          <circle cx={mood === 'confused' ? 50 : 46} cy="39" r="1.2" fill="#fff" opacity="0.8" />
        </>
      )}

      {/* Mouth */}
      <path d={mouthPaths[mood]} stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Body details */}
      <rect x="26" y="60" width="8" height="4" rx="2" fill={c.antenna} opacity="0.6" />
      <rect x="46" y="60" width="8" height="4" rx="2" fill={c.antenna} opacity="0.6" />

      {/* Sparkles for celebrate/excited */}
      {(mood === 'celebrate' || mood === 'excited') && (
        <>
          <circle cx="10" cy="28" r="2" fill={c.antenna} opacity="0.8" />
          <circle cx="70" cy="32" r="1.5" fill={c.antenna} opacity="0.7" />
          <circle cx="68" cy="20" r="1" fill="#fff" opacity="0.6" />
          <circle cx="12" cy="20" r="1" fill="#fff" opacity="0.6" />
        </>
      )}
    </svg>
  )
}

// Dialogue bubble component
interface BitDialogueProps {
  mood?: BitMood
  lines: string[]
  onDone?: () => void
  onSkip?: () => void
  textSpeed?: 'fast' | 'normal' | 'slow'
}

export function BitDialogue({ mood = 'happy', lines, onDone, onSkip, textSpeed = 'normal' }: BitDialogueProps) {
  const [lineIdx, setLineIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [done, setDone] = useState(false)

  const speeds = { fast: 20, normal: 40, slow: 70 }
  const delay = speeds[textSpeed]

  const currentLine = lines[lineIdx] ?? ''
  const displayed = done ? currentLine : currentLine.slice(0, charIdx)

  useEffect(() => {
    setCharIdx(0)
    setDone(false)
  }, [lineIdx])

  useEffect(() => {
    if (done) return
    if (charIdx >= currentLine.length) { setDone(true); return }
    const t = setTimeout(() => setCharIdx(i => i + 1), delay)
    return () => clearTimeout(t)
  }, [charIdx, currentLine.length, delay, done])

  const advance = useCallback(() => {
    if (!done) {
      setDone(true)
      setCharIdx(currentLine.length)
      return
    }
    if (lineIdx < lines.length - 1) {
      setLineIdx(i => i + 1)
    } else {
      onDone?.()
    }
  }, [done, lineIdx, lines.length, currentLine.length, onDone])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); advance() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [advance])

  return (
    <div className={styles.dialogueContainer}>
      <div className={styles.bitSide}>
        <Bit mood={mood} size={72} />
      </div>
      <div className={styles.bubble} onClick={advance} role="button" aria-label="Advance dialogue" tabIndex={0} onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') advance() }}>
        <p className={styles.dialogueText}>
          {displayed}
          {!done && <span className={styles.cursor}>▋</span>}
        </p>
        <div className={styles.dialogueFooter}>
          <span className={styles.lineCount}>{lineIdx + 1} / {lines.length}</span>
          <div className={styles.dialogueActions}>
            {onSkip && <button className={styles.skipBtn} onClick={e => { e.stopPropagation(); onSkip() }}>Skip</button>}
            <button className={styles.nextBtn} onClick={advance}>
              {lineIdx < lines.length - 1 ? 'Next →' : done ? 'Continue' : '...'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
