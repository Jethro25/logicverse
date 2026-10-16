import { useState } from 'react'
import { useStore } from '@/state/store'
import { BitDialogue } from '@/bit/Bit'
import { Button } from '@/ui/Button'
import type { BitMood } from '@/bit/Bit'
import styles from './IntroScreen.module.css'

type Phase = 'name' | 'dialogue-1' | 'mini-puzzle' | 'done'

const INTRO_DIALOGUE: Array<{ text: string; mood: BitMood }> = [
  { mood: 'excited', text: "Beep boop! Oh no — the ENTIRE Logicverse is malfunctioning! 😱" },
  { mood: 'confused', text: "The AND gates are arguing, the OR gates are confused, and somebody connected the NOT gate backward. Again." },
  { mood: 'curious', text: "I'm BIT — your digital companion! I know everything about logic circuits, and I'll teach you everything I know." },
  { mood: 'happy', text: "Together we'll restore the Logicverse, one tiny circuit at a time. Don't worry if you've never seen a logic gate before — we start from zero!" },
]

export function IntroScreen() {
  const setPlayerName = useStore(s => s.setPlayerName)
  const navigate = useStore(s => s.navigate)
  const completeLesson = useStore(s => s.completeLesson)
  const [phase, setPhase] = useState<Phase>('name')
  const [nameInput, setNameInput] = useState('')
  const [dialogueIdx, setDialogueIdx] = useState(0)
  const [miniSwitchA, setMiniSwitchA] = useState(false)
  const [miniSwitchB, setMiniSwitchB] = useState(false)
  const [miniChecked, setMiniChecked] = useState(false)
  const [miniPassed, setMiniPassed] = useState(false)

  const handleNameSubmit = () => {
    const name = nameInput.trim() || 'Explorer'
    setPlayerName(name)
    setPhase('dialogue-1')
  }

  const handleDialogueDone = () => {
    setPhase('mini-puzzle')
  }

  const handleMiniCheck = () => {
    // Puzzle: turn both switches ON
    const passed = miniSwitchA && miniSwitchB
    setMiniChecked(true)
    setMiniPassed(passed)
  }

  const handleFinish = () => {
    completeLesson('intro-mini')
    navigate({ id: 'world-map' })
  }

  const doorOpen = miniSwitchA && miniSwitchB

  if (phase === 'name') {
    return (
      <div className={styles.container}>
        <div className={styles.nameCard}>
          <div className={styles.nameTop}>
            <div className={styles.bitRow}>
              <svg viewBox="0 0 80 80" width="80" height="80" className={styles.bitFloat}>
                {/* Simplified Bit inline */}
                <line x1="40" y1="14" x2="40" y2="24" stroke="#00d4ff" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="40" cy="10" r="4" fill="#00d4ff" />
                <rect x="16" y="24" width="48" height="40" rx="10" fill="#1e40af" />
                <rect x="20" y="28" width="40" height="28" rx="6" fill="#0a1628" />
                <rect x="26" y="34" width="12" height="14" rx="4" fill="#fff" />
                <rect x="42" y="34" width="12" height="14" rx="4" fill="#fff" />
                <circle cx="32" cy="41" r="3.5" fill="#00d4ff" />
                <circle cx="48" cy="41" r="3.5" fill="#00d4ff" />
                <path d="M 28 50 Q 40 62 52 50" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <h1 className={styles.nameHeading}>Welcome to LOGICVERSE!</h1>
            <p className={styles.nameSub}>
              Before we begin — what should Bit call you?
            </p>
          </div>
          <div className={styles.nameForm}>
            <input
              type="text"
              className={styles.nameInput}
              placeholder="Your name…"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleNameSubmit() }}
              maxLength={24}
              autoFocus
            />
            <Button size="lg" onClick={handleNameSubmit}>
              Let's go! ⚡
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'dialogue-1') {
    const current = INTRO_DIALOGUE[dialogueIdx]
    if (!current) return null
    return (
      <div className={styles.container}>
        <div className={styles.dialogueArea}>
          <BitDialogue
            mood={current.mood}
            lines={[current.text]}
            onDone={() => {
              if (dialogueIdx < INTRO_DIALOGUE.length - 1) {
                setDialogueIdx(i => i + 1)
              } else {
                handleDialogueDone()
              }
            }}
          />
        </div>
      </div>
    )
  }

  if (phase === 'mini-puzzle') {
    return (
      <div className={styles.container}>
        <div className={styles.miniPuzzle}>
          <div className={styles.miniHeader}>
            <h2>Your first puzzle!</h2>
            <p className={styles.miniDesc}>
              This door only opens when <strong>both switches</strong> are ON.
              <br />Try flipping them — what happens?
            </p>
          </div>

          <div className={styles.miniCircuit}>
            {/* Switches */}
            <div className={styles.switches}>
              <button
                className={[styles.switch, miniSwitchA ? styles.switchOn : ''].join(' ')}
                onClick={() => { setMiniSwitchA(v => !v); setMiniChecked(false) }}
                aria-pressed={miniSwitchA}
              >
                <span className={styles.switchLabel}>Switch A</span>
                <span className={styles.switchState}>{miniSwitchA ? '1' : '0'}</span>
              </button>
              <button
                className={[styles.switch, miniSwitchB ? styles.switchOn : ''].join(' ')}
                onClick={() => { setMiniSwitchB(v => !v); setMiniChecked(false) }}
                aria-pressed={miniSwitchB}
              >
                <span className={styles.switchLabel}>Switch B</span>
                <span className={styles.switchState}>{miniSwitchB ? '1' : '0'}</span>
              </button>
            </div>

            {/* Wire visual */}
            <svg className={styles.miniWires} viewBox="0 0 120 80" aria-hidden="true">
              <line x1="0" y1="20" x2="60" y2="20" stroke={miniSwitchA ? '#22c55e' : '#475569'} strokeWidth="3" />
              <line x1="0" y1="60" x2="60" y2="60" stroke={miniSwitchB ? '#22c55e' : '#475569'} strokeWidth="3" />
              <rect x="55" y="10" width="20" height="60" rx="4" fill={doorOpen ? '#22c55e22' : '#47556922'} stroke={doorOpen ? '#22c55e' : '#475569'} strokeWidth="2" />
              <text x="65" y="42" textAnchor="middle" fill={doorOpen ? '#22c55e' : '#94a3b8'} fontSize="8" fontFamily="monospace">AND</text>
              <line x1="75" y1="40" x2="120" y2="40" stroke={doorOpen ? '#22c55e' : '#475569'} strokeWidth="3" />
            </svg>

            {/* Door */}
            <div className={[styles.door, doorOpen ? styles.doorOpen : ''].join(' ')} aria-label={doorOpen ? 'Door is open' : 'Door is closed'}>
              <span className={styles.doorEmoji}>{doorOpen ? '🚪✅' : '🚪🔒'}</span>
              <span className={styles.doorLabel}>{doorOpen ? 'OPEN' : 'LOCKED'}</span>
              <span className={styles.doorSignal}>{doorOpen ? '1' : '0'}</span>
            </div>
          </div>

          {/* Truth table hint */}
          <div className={styles.truthHint}>
            <table className={styles.miniTable}>
              <thead>
                <tr><th>A</th><th>B</th><th>Door</th></tr>
              </thead>
              <tbody>
                {[[0,0,0],[0,1,0],[1,0,0],[1,1,1]].map(([a,b,out]) => (
                  <tr
                    key={`${a}${b}`}
                    className={miniSwitchA === !!a && miniSwitchB === !!b ? styles.activeRow : ''}
                  >
                    <td>{a}</td><td>{b}</td>
                    <td className={out ? styles.tdOne : styles.tdZero}>{out}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Feedback */}
          {miniChecked && (
            <div className={[styles.feedback, miniPassed ? styles.feedbackOk : styles.feedbackHint].join(' ')}>
              {miniPassed
                ? "🎉 Both switches ON → output is 1 → door opens! That's an AND gate!"
                : "Almost! Both switches need to be ON (1) at the same time. Try turning both on!"}
            </div>
          )}

          <div className={styles.miniActions}>
            {!miniChecked ? (
              <Button size="lg" onClick={handleMiniCheck}>
                Check my answer ✓
              </Button>
            ) : miniPassed ? (
              <Button size="lg" onClick={handleFinish}>
                Begin adventure! 🚀
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => setMiniChecked(false)}>
                Try again
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
