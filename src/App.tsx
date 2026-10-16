import { useEffect, Component, type ReactNode } from 'react'
import { useStore } from '@/state/store'
import type { Screen } from '@/state/store'
import '@/content/init'
import { Starfield } from '@/ui/Starfield'
import { ToastContainer } from '@/ui/Toast'
import { MainMenu } from '@/features/menu/MainMenu'
import { IntroScreen } from '@/features/intro/IntroScreen'
import { CircuitBuilder } from '@/features/circuit/CircuitBuilder'
import { LessonScreen } from '@/features/lesson/LessonScreen'
import { PuzzleScreen } from '@/features/puzzle/PuzzleScreen'
import { WorldMapScreen } from '@/features/world/WorldMapScreen'
import { WorldHubScreen } from '@/features/world/WorldHubScreen'
import { SettingsScreen } from '@/features/settings/SettingsScreen'
import { GlossaryScreen } from '@/features/glossary/GlossaryScreen'
import { AchievementsScreen } from '@/features/achievements/AchievementsScreen'
import { CreditsScreen } from '@/features/credits/CreditsScreen'

// ── Circuit Lab screen ──
function CircuitLabScreen() {
  const navigate = useStore(s => s.navigate)
  return (
    <div style={{ padding: 'var(--space-4)', height: '100svh', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <button onClick={() => navigate({ id: 'menu' })} style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', color: 'var(--color-text-2)', padding: 'var(--space-1) var(--space-3)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)' }}>← Menu</button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text-heading)', margin: 0 }}>⚗ Circuit Lab</h1>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-3)', margin: 0 }}>Drag from palette · Click pins to wire · Double-click SWITCH to toggle</p>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <CircuitBuilder />
      </div>
    </div>
  )
}


function ScreenView({ screen }: { screen: Screen }) {
  const navigate = useStore(s => s.navigate)
  const completeLesson = useStore(s => s.completeLesson)
  const completePuzzle = useStore(s => s.completePuzzle)

  switch (screen.id) {
    case 'menu':       return <MainMenu />
    case 'intro':      return <IntroScreen />
    case 'world-map':  return <WorldMapScreen />
    case 'world-hub':  return <WorldHubScreen worldId={screen.worldId} />
    case 'lesson':     return (
      <LessonScreen
        lessonId={screen.lessonId}
        onComplete={(_xp) => {
          completeLesson(screen.lessonId)
          navigate({ id: 'world-hub', worldId: screen.worldId })
        }}
        onBack={() => navigate({ id: 'world-hub', worldId: screen.worldId })}
      />
    )
    case 'puzzle':     return (
      <PuzzleScreen
        puzzleId={screen.puzzleId}
        onComplete={(stars, _xp) => {
          completePuzzle(screen.puzzleId, stars ?? 1, false, 0)
          navigate({ id: 'world-hub', worldId: screen.worldId })
        }}
        onBack={() => navigate({ id: 'world-hub', worldId: screen.worldId })}
      />
    )
    case 'circuit-lab':return <CircuitLabScreen />
    case 'achievements':return <AchievementsScreen onBack={() => navigate({ id: 'menu' })} />
    case 'glossary':   return <GlossaryScreen onBack={() => navigate({ id: 'menu' })} initialTermId={screen.termId} />
    case 'settings':   return <SettingsScreen onBack={() => navigate({ id: 'menu' })} />
    case 'credits':    return <CreditsScreen onBack={() => navigate({ id: 'menu' })} />
    default:           return <MainMenu />
  }
}

// ── Error boundary ──
interface EBState { error: Error | null }
class ErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  state: EBState = { error: null }
  static getDerivedStateFromError(error: Error): EBState { return { error } }
  render() {
    if (!this.state.error) return this.props.children
    const { message, stack } = this.state.error
    return (
      <div style={{ padding: '2rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>
        <h2 style={{ color: '#f87171', marginBottom: '1rem' }}>⚡ Runtime Error</h2>
        <pre style={{ fontSize: '0.8rem', background: 'var(--color-bg-2)', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }}>{message}{'\n\n'}{stack}</pre>
        <button onClick={() => { this.setState({ error: null }); window.location.hash = '' }} style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Reload
        </button>
      </div>
    )
  }
}

// ── Hash sync ──
function useHashSync() {
  const navigate = useStore(s => s.navigate)
  const screen = useStore(s => s.screen)

  const screenFromHash = (h: string): Screen | null => {
    switch (h) {
      case 'menu':         return { id: 'menu' }
      case 'intro':        return { id: 'intro' }
      case 'world-map':    return { id: 'world-map' }
      case 'circuit-lab':  return { id: 'circuit-lab' }
      case 'achievements': return { id: 'achievements' }
      case 'glossary':     return { id: 'glossary' }
      case 'settings':     return { id: 'settings' }
      case 'credits':      return { id: 'credits' }
      default:             return null
    }
  }

  // On mount + hashchange: sync URL hash → store
  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.replace('#', '')
      const s = screenFromHash(hash)
      if (s) navigate(s)
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep hash in sync with screen changes
  useEffect(() => {
    const current = window.location.hash.replace('#', '')
    if (current !== screen.id) window.location.hash = screen.id
  }, [screen])
}

export default function App() {
  useHashSync()
  const screen = useStore(s => s.screen)
  const settings = useStore(s => s.save.settings)

  return (
    <div
      className="app-shell"
      data-world={'worldId' in screen ? screen.worldId : undefined}
      style={{ position: 'relative', minHeight: '100svh', background: 'var(--color-bg)', overflow: 'hidden' }}
    >
      {settings.ambientEffects && <Starfield />}

      <main style={{ position: 'relative', zIndex: 1, minHeight: '100svh' }}>
        <ErrorBoundary key={screen.id}>
          <ScreenView screen={screen} />
        </ErrorBoundary>
      </main>

      <ToastContainer />
    </div>
  )
}
