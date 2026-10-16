import { useState, useEffect, useCallback, useRef } from 'react'
import { lva } from '@/lva'
import styles from './Bit.module.css'

export type BitMood = 'happy' | 'excited' | 'curious' | 'confused' | 'thinking' | 'celebrate' | 'idle'

const MOOD_COLORS: Record<BitMood, [body: string, screen: string]> = {
  idle:      ['#1e40af', '#0ea5e9'],
  happy:     ['#166534', '#22c55e'],
  excited:   ['#7e22ce', '#a855f7'],
  curious:   ['#0e7490', '#06b6d4'],
  confused:  ['#92400e', '#f59e0b'],
  thinking:  ['#1e3a5f', '#3b82f6'],
  celebrate: ['#9d174d', '#ec4899'],
}

const MOUTH: Record<string, string> = {
  smile: 'M40 66 Q50 74 60 66',
  big:   'M38 64 Q50 78 62 64',
  flat:  'M42 69 L58 69',
  wobble:'M40 69 Q45 64 50 69 Q55 74 60 69',
}

function getMouth(mood: BitMood) {
  if (mood === 'confused') return MOUTH.wobble
  if (mood === 'thinking') return MOUTH.flat
  if (mood === 'celebrate' || mood === 'excited' || mood === 'happy') return MOUTH.big
  return MOUTH.smile
}

interface BitProps {
  mood?: BitMood
  size?: number
  animate?: boolean
  talking?: boolean
  wave?: boolean
  follow?: boolean
  still?: boolean
  className?: string
}

export function Bit({
  mood = 'idle',
  size = 96,
  animate = true,
  talking = false,
  wave = false,
  follow = false,
  still = false,
  className = '',
}: BitProps) {
  const [pupil, setPupil] = useState({ x: 0, y: 0 })
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!follow) return
    const mm = (e: MouseEvent) => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      const d = Math.hypot(dx, dy) || 1
      const k = Math.min(1, d / 220)
      setPupil({ x: (dx / d) * 3.2 * k, y: (dy / d) * 2.6 * k })
    }
    window.addEventListener('mousemove', mm)
    return () => window.removeEventListener('mousemove', mm)
  }, [follow])

  const [b, s] = MOOD_COLORS[mood]
  const mouth = getMouth(mood)
  const sparkle = mood === 'celebrate'
  const floatClass = still || !animate ? '' : styles.float

  let lx = pupil.x
  let ly = pupil.y
  if (mood === 'confused') { lx = 3.2; ly = 0 }
  if (mood === 'thinking') { lx = 2; ly = -2.5 }

  const w = size
  const h = Math.round(size * 1.1)

  return (
    <div
      className={[styles.wrapper, floatClass, className].join(' ')}
      style={{ width: w, height: h, position: 'relative', display: 'inline-block' }}
    >
      <svg
        ref={ref}
        viewBox="0 0 100 110"
        width={w}
        height={h}
        style={{ overflow: 'visible', display: 'block' }}
        role="img"
        aria-label={`BIT is ${mood}`}
      >
        {/* Shadow */}
        <ellipse cx="50" cy="107" rx="24" ry="3" fill="#000" opacity={0.35} />

        {/* Antenna stem */}
        <line x1="50" y1="24" x2="50" y2="10" stroke={b} strokeWidth="4" strokeLinecap="round"
          style={{ transition: 'stroke .4s' }} />

        {/* Antenna tip */}
        {(mood === 'excited' || mood === 'celebrate')
          ? <polygon points="50,6 53,12 47,12" fill={s} style={{ filter: `drop-shadow(0 0 6px ${s})` }} />
          : <circle cx="50" cy="8" r="5.5" fill={s}
              style={{ filter: `drop-shadow(0 0 6px ${s})`, animation: `${styles.pulseDot || 'lvPulse'} 1.8s ease-in-out infinite`, transition: 'fill .4s' }} />
        }

        {/* Left arm */}
        <rect x="2" y="54" width="11" height="20" rx="5.5" fill={b} style={{ transition: 'fill .4s' }} />

        {/* Right arm (waves) */}
        <rect x="87" y="54" width="11" height="20" rx="5.5" fill={b}
          style={{
            transformOrigin: '92px 72px',
            animation: wave ? 'bitWave 1.4s ease-in-out infinite' : 'none',
            transition: 'fill .4s',
          }} />

        {/* Body */}
        <rect x="10" y="22" width="80" height="78" rx="20" fill={b} style={{ transition: 'fill .4s' }} />

        {/* Body highlight */}
        <rect x="18" y="26" width="36" height="5" rx="2.5" fill="#fff" opacity={0.14} />

        {/* Screen */}
        <rect x="19" y="33" width="62" height="48" rx="12" fill="#0a1222" stroke={s} strokeWidth="2"
          style={{ transition: 'stroke .4s' }} />

        {/* Eyes group */}
        <g style={{ transformOrigin: '50px 49px', animation: 'bitBlink 4.3s infinite' }}>
          <rect x="29" y="42" width="16" height="16" rx="5" fill="#fff" />
          <rect x="55" y="42" width="16" height="16" rx="5" fill="#fff" />
          {/* Pupils */}
          <g style={{ transform: `translate(${lx}px,${ly}px)`, transition: 'transform .15s ease-out' }}>
            <rect x="33.5" y="46" width="7" height="8" rx="2.5" fill={s} />
            <rect x="59.5" y="46" width="7" height="8" rx="2.5" fill={s} />
          </g>
        </g>

        {/* Talking mouth (animated ellipse) */}
        {talking && (
          <ellipse cx="50" cy="70" rx="6" ry="4" fill={s} opacity={1}
            style={{ transformOrigin: '50px 70px', animation: 'bitTalk .2s infinite' }} />
        )}

        {/* Static mouth */}
        {!talking && (
          <path d={mouth} fill="none" stroke={s} strokeWidth="3" strokeLinecap="round" />
        )}

        {/* Chest panel */}
        <rect x="34" y="88" width="32" height="5" rx="2.5" fill="#000" opacity={0.22} />
      </svg>

      {/* Sparkles */}
      {sparkle && (
        <>
          <div style={{ position:'absolute',left:'-6%',top:'18%',width:10,height:10,background:'#fbbf24',animation:'bitSpark 1.2s ease-out infinite' }} />
          <div style={{ position:'absolute',right:'-8%',top:'6%',width:8,height:8,background:'#f9a8d4',animation:'bitSpark 1.2s .4s ease-out infinite' }} />
          <div style={{ position:'absolute',right:'-2%',top:'62%',width:9,height:9,background:'#fde68a',animation:'bitSpark 1.2s .8s ease-out infinite' }} />
          <div style={{ position:'absolute',left:'2%',top:'70%',width:7,height:7,background:'#ec4899',animation:'bitSpark 1.2s .6s ease-out infinite' }} />
        </>
      )}
    </div>
  )
}

// ── Dialogue bubble ──────────────────────────────────────────────────────────

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
  const [talking, setTalking] = useState(false)

  const speeds = { fast: 20, normal: 40, slow: 70 }
  const delay = speeds[textSpeed]
  const currentLine = lines[lineIdx] ?? ''
  const displayed = done ? currentLine : currentLine.slice(0, charIdx)

  useEffect(() => {
    setCharIdx(0)
    setDone(false)
    setTalking(true)
  }, [lineIdx])

  useEffect(() => {
    if (done) { setTalking(false); return }
    if (charIdx >= currentLine.length) { setDone(true); setTalking(false); return }
    const t = setTimeout(() => {
      setCharIdx(i => i + 1)
      if (charIdx % 3 === 0) lva()?.S.blip(mood)
    }, delay)
    return () => clearTimeout(t)
  }, [charIdx, currentLine.length, delay, done, mood])

  const advance = useCallback(() => {
    if (!done) {
      setDone(true)
      setCharIdx(currentLine.length)
      setTalking(false)
      return
    }
    lva()?.S.click()
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
        <Bit mood={mood} size={72} talking={talking} />
      </div>
      <div
        className={styles.bubble}
        onClick={advance}
        role="button"
        aria-label="Advance dialogue"
        tabIndex={0}
        onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') advance() }}
      >
        <p className={styles.dialogueText}>
          {displayed}
          {!done && <span className={styles.cursor}>▋</span>}
        </p>
        <div className={styles.dialogueFooter}>
          <span className={styles.lineCount}>{lineIdx + 1} / {lines.length}</span>
          <div className={styles.dialogueActions}>
            {onSkip && (
              <button className={styles.skipBtn} onClick={e => { e.stopPropagation(); onSkip() }}>Skip</button>
            )}
            <button className={styles.nextBtn} onClick={e => { e.stopPropagation(); advance() }}>
              {lineIdx < lines.length - 1 ? 'Next →' : done ? 'Continue' : '...'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
