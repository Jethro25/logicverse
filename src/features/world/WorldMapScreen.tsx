import { useState, useEffect, useRef } from 'react'
import { useStore } from '@/state/store'
import { WORLDS } from '@/content/worlds'
import { Bit } from '@/bit/Bit'
import { lva } from '@/lva'
import styles from './WorldMapScreen.module.css'

// Mobile positions for each of the 10 worlds (x from design, y = 160 + i*128 + DJ[i])
const XS = [96, 272, 112, 266, 104, 262, 110, 268, 116, 188]
const DJ = [0,   12,  -22,  0,  10,  -12,  22,  0, -10,  6]

function worldPos(i: number): [number, number] {
  return [XS[i], 160 + i * 128 + DJ[i]]
}

function buildPath(upTo: number): string {
  const [x0, y0] = worldPos(0)
  let d = `M${x0} ${y0}`
  for (let i = 1; i <= upTo; i++) {
    const [px, py] = worldPos(i - 1)
    const [cx, cy] = worldPos(i)
    d += ` C${px} ${py + 77} ${cx} ${cy - 77} ${cx} ${cy}`
  }
  return d
}

const FULL_PATH = buildPath(9)
const GID = 'lvMapGrad'

const TRACK_MAP: Record<string, string> = {
  w1: 'valley', w2: 'nexus', w3: 'gardens', w4: 'library',
  w5: 'caverns', w6: 'foundry', w7: 'memory', w8: 'memory',
  w9: 'memory', w10: 'memory',
}

export function WorldMapScreen() {
  const navigate       = useStore(s => s.navigate)
  const isWorldUnlocked = useStore(s => s.isWorldUnlocked)
  const worldProgress  = useStore(s => s.worldProgress)

  const [muted, setMuted]     = useState(false)
  const [toast, setToast]     = useState('')
  const [bitAt, setBitAt]     = useState(0)
  const [powering]            = useState(-1)
  const scrollRef = useRef<HTMLDivElement>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Find furthest unlocked world index
  const repaired = WORLDS.filter((_, i) => isWorldUnlocked(WORLDS[i]?.id ?? '')).length

  useEffect(() => {
    const L = lva()
    const setup = (l: typeof L) => {
      if (!l) return
      l.enter('map')
      setMuted(l.muted)
      const unsub = l.sub(() => setMuted(l.muted))
      return unsub
    }
    if (L) return setup(L)
    const t = setInterval(() => {
      if (window.LVA) { clearInterval(t); setup(window.LVA) }
    }, 80)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    // Scroll to current world position
    if (scrollRef.current) {
      const [, y] = worldPos(Math.max(0, repaired - 1))
      scrollRef.current.scrollTop = Math.max(0, y - 300)
    }
    setBitAt(Math.max(0, repaired - 1))
  }, [repaired])

  const showToast = (msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2200)
  }

  const handleNodeClick = (i: number) => {
    const world = WORLDS[i]
    if (!world) return
    if (!isWorldUnlocked(world.id)) {
      lva()?.S.buzz()
      const prev = WORLDS[i - 1]
      showToast(prev ? `Repair ${prev.name} to unlock` : 'Locked')
      return
    }
    if (i === bitAt) {
      lva()?.S.click()
      navigate({ id: 'world-hub', worldId: world.id })
      lva()?.enter(TRACK_MAP[world.id] ?? 'valley')
      return
    }
    lva()?.S.hop()
    setBitAt(i)
  }

  const [bx, by] = worldPos(bitAt)
  const litPath = buildPath(Math.max(0, repaired - 1))


  return (
    <div className={styles.root} onMouseEnter={() => lva()?.enter('map')}>
      {/* Scrollable map area */}
      <div ref={scrollRef} className={styles.scrollArea}>
        <div className={styles.mapCanvas}>

          {/* Starfield bg */}
          <div className={styles.stars} />

          {/* SVG path */}
          <svg className={styles.pathSvg} width="375" height="1440" style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
            <defs>
              <linearGradient id={GID} gradientUnits="userSpaceOnUse" x1="0" y1="160" x2="0" y2="1310">
                <stop offset="0"    stopColor="#00d4ff" />
                <stop offset=".111" stopColor="#a855f7" />
                <stop offset=".222" stopColor="#10b981" />
                <stop offset=".333" stopColor="#f59e0b" />
                <stop offset=".444" stopColor="#ec4899" />
                <stop offset=".555" stopColor="#f97316" />
                <stop offset=".666" stopColor="#06b6d4" />
                <stop offset=".777" stopColor="#8b5cf6" />
                <stop offset=".888" stopColor="#14b8a6" />
                <stop offset="1"    stopColor="#fbbf24" />
              </linearGradient>
            </defs>
            {/* Track shadow */}
            <path d={FULL_PATH} fill="none" stroke="#131c30" strokeWidth="10" strokeLinecap="round" />
            {/* Track dashes */}
            <path d={FULL_PATH} fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="3 9" strokeLinecap="round" />
            {/* Lit portion */}
            <path d={litPath} fill="none" stroke={`url(#${GID})`} strokeWidth="5" strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 0 6px rgba(0,212,255,.8))', transition: 'd .9s ease' }} />
            {/* Flowing electricity */}
            <path d={litPath} fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="2 18"
              strokeLinecap="round" style={{ animation: 'lvFlow .9s linear infinite', opacity: .9 }} />
          </svg>

          {/* MIDTERM / FINALS divider */}
          <div className={styles.divider}>
            <span className={styles.divMidterm}>▲ MIDTERM</span>
            <span className={styles.divFinals}>FINALS ▼</span>
          </div>

          {/* World nodes */}
          {WORLDS.map((world, i) => {
            const [x, y] = worldPos(i)
            const unlocked = isWorldUnlocked(world.id)
            const done = worldProgress(world.id) === 100
            const isCurrent = !done && unlocked
            const locked = !unlocked
            const isPowering = powering === i

            return (
              <div
                key={world.id}
                style={{ position: 'absolute', left: x - 42, top: y - 42, width: 84, height: 84 }}
              >
                {/* Ambient glow */}
                <div style={{
                  position: 'absolute', left: -90, top: -90,
                  width: 264, height: 264, borderRadius: '50%', pointerEvents: 'none',
                  transition: 'background 1s',
                  background: locked
                    ? 'radial-gradient(circle,rgba(51,65,85,.15),transparent 60%)'
                    : `radial-gradient(circle,${world.palette.accent}${done ? '2a' : '3a'},transparent 64%)`,
                }} />

                {/* Decorative label */}
                <div className={styles.decoLabel} style={{
                  left: x < 187 ? 96 : 'auto',
                  right: x >= 187 ? -92 : 'auto',
                  textAlign: x < 187 ? 'left' : 'right',
                  color: world.palette.accent,
                  opacity: locked ? .18 : .6,
                  animationDelay: `${i * .4}s`,
                }}>
                  {world.icon}
                </div>

                {/* Orbit dot */}
                {!locked && (
                  <div className={styles.orbit} style={{ animation: `lvOrbit ${5 + i % 4}s linear infinite` }}>
                    <div style={{ position:'absolute',left:'50%',top:0,width:7,height:7,marginLeft:-3.5,borderRadius:'50%',background:world.palette.accent,boxShadow:`0 0 10px ${world.palette.accent}` }} />
                  </div>
                )}

                {/* Ring pulse on current */}
                {isCurrent && (
                  <div style={{ position:'absolute',inset:0,borderRadius:'50%',border:`2px solid ${world.palette.accent}`,animation:'lvRing 1.8s ease-out infinite',pointerEvents:'none' }} />
                )}

                {/* Node button */}
                <button
                  className={styles.nodeBtn}
                  onClick={() => handleNodeClick(i)}
                  aria-label={world.name}
                  style={{
                    background: locked
                      ? 'radial-gradient(circle at 35% 30%,#1e293b,#0b1222 70%)'
                      : `radial-gradient(circle at 35% 30%,${world.palette.accent}66,#0f172a 72%)`,
                    borderStyle: locked ? 'dashed' : 'solid',
                    borderColor: locked ? '#334155' : world.palette.accent,
                    boxShadow: locked ? 'none'
                      : done ? `0 0 22px ${world.palette.accent}77,inset 0 0 16px ${world.palette.accent}44`
                             : `0 0 34px ${world.palette.accent}aa,inset 0 0 22px ${world.palette.accent}66`,
                    filter: locked ? 'grayscale(1)' : 'none',
                    color: locked ? '#475569' : '#f8fafc',
                    animation: isPowering ? 'lvPower 1.2s ease-out'
                      : locked ? `lvBroken ${3 + i % 3}s infinite` : 'none',
                  }}
                >
                  {locked ? '🔒' : world.icon}
                </button>

                {/* Label under node */}
                <div className={styles.nodeLabel}>
                  <div style={{ color: locked ? '#475569' : world.palette.accent, font: '700 10px "JetBrains Mono",monospace', letterSpacing: '.14em' }}>
                    WORLD {String(i + 1).padStart(2, '0')}
                  </div>
                  <div style={{ color: locked ? '#64748b' : '#f8fafc', font: '800 13px/1.2 Nunito,sans-serif', marginTop: 2 }}>
                    {world.name}
                  </div>
                  <div style={{
                    color: done ? world.palette.accent : isCurrent ? '#f8fafc' : '#64748b',
                    font: '600 10px/1.3 "JetBrains Mono",monospace', marginTop: 3,
                  }}>
                    {done ? '● REPAIRED' : isCurrent ? '◐ IN PROGRESS' : '⊘ OFFLINE'}
                  </div>
                </div>
              </div>
            )
          })}

          {/* BIT on map */}
          <div
            className={styles.bitOnMap}
            style={{ left: bx - 23, top: by - 42 - 52 }}
          >
            <Bit mood={powering >= 0 ? 'excited' : 'happy'} size={46} still />
          </div>
        </div>
      </div>

      {/* Top header */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => { lva()?.S.click(); navigate({ id: 'menu' }) }} aria-label="Back">←</button>
        <div className={styles.headerInfo}>
          <div className={styles.headerTitle}>World Map</div>
          <div className={styles.headerProgress}>
            <div className={styles.progTrack}>
              <div className={styles.progFill} style={{ width: `${repaired * 10}%` }} />
            </div>
            <span className={styles.progText}>{repaired} / 10 repaired</span>
          </div>
        </div>
      </div>

      {/* Mute button */}
      <button
        className={styles.muteBtn}
        onClick={() => { lva()?.toggleMute(); setMuted(v => !v) }}
        aria-label="Toggle sound"
        style={{ textDecoration: muted ? 'line-through' : 'none', opacity: muted ? .55 : 1 }}
      >
        ♪
      </button>

      {/* Toast */}
      {toast && (
        <div className={styles.toast}>{toast}</div>
      )}

      {/* Bottom CTA */}
      <div className={styles.bottomBar}>
        <button
          className={styles.enterBtn}
          onMouseEnter={() => lva()?.S.hover()}
          onClick={() => {
            lva()?.S.click()
            const world = WORLDS[bitAt]
            if (world) navigate({ id: 'world-hub', worldId: world.id })
          }}
          style={{
            background: `linear-gradient(100deg,${WORLDS[bitAt]?.palette.accent ?? '#00d4ff'} 0 38%,#ffffff 50%,${WORLDS[bitAt]?.palette.accent ?? '#00d4ff'} 62% 100%)`,
            backgroundSize: '260% 100%',
            backgroundPosition: '100% 0',
            boxShadow: `0 0 22px ${WORLDS[bitAt]?.palette.accent ?? '#00d4ff'}66`,
          }}
        >
          Enter {WORLDS[bitAt]?.name ?? 'World'} →
        </button>
      </div>
    </div>
  )
}
