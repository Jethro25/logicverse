import { useState } from 'react'
import { useStore } from '@/state/store'
import styles from './SettingsScreen.module.css'

interface Props {
  onBack: () => void
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      className={styles.toggle}
      data-on={checked}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <span className={styles.toggleThumb} />
    </button>
  )
}

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>
        <span className={styles.rowTitle}>{label}</span>
        {sub && <span className={styles.rowSub}>{sub}</span>}
      </div>
      <div className={styles.rowControl}>{children}</div>
    </div>
  )
}

export function SettingsScreen({ onBack }: Props) {
  const settings = useStore(s => s.save.settings)
  const updateSettings = useStore(s => s.updateSettings)
  const save = useStore(s => s.save)
  const exportProgress = useStore(s => s.exportProgress)
  const importProgress = useStore(s => s.importProgress)
  const resetProgress = useStore(s => s.resetProgress)
  const showToast = useStore(s => s.showToast)

  const [importCode, setImportCode] = useState('')
  const [showReset, setShowReset] = useState(false)
  const [showImport, setShowImport] = useState(false)

  function handleExport() {
    const code = exportProgress()
    navigator.clipboard.writeText(code).then(() => {
      showToast({ message: 'Save code copied to clipboard!', type: 'success' })
    }).catch(() => {
      showToast({ message: code, type: 'info', duration: 10000 })
    })
  }

  function handleImport() {
    if (!importCode.trim()) return
    const ok = importProgress(importCode.trim())
    if (ok) {
      showToast({ message: 'Progress imported!', type: 'success' })
      setImportCode('')
      setShowImport(false)
    } else {
      showToast({ message: 'Invalid save code.', type: 'error' })
    }
  }

  function handleReset() {
    resetProgress()
    setShowReset(false)
    showToast({ message: 'Progress reset.', type: 'info' })
    onBack()
  }

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Back">←</button>
        <h1 className={styles.title}>Settings</h1>
      </header>

      <div className={styles.content}>

        {/* ── Display ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Display</h2>
          <Row label="Ambient Effects" sub="Starfield background animation">
            <Toggle
              checked={settings.ambientEffects}
              onChange={v => updateSettings({ ambientEffects: v })}
              label="Ambient Effects"
            />
          </Row>
          <Row label="Reduced Motion" sub="Disable non-essential animations">
            <Toggle
              checked={settings.reducedMotion}
              onChange={v => updateSettings({ reducedMotion: v })}
              label="Reduced Motion"
            />
          </Row>
        </section>

        {/* ── Notation ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Notation</h2>
          <Row label="NOT Notation" sub="How complement is written in formulas">
            <div className={styles.segmented}>
              {(['prime', 'overbar'] as const).map(opt => (
                <button
                  key={opt}
                  className={styles.segBtn}
                  data-active={settings.notNotation === opt}
                  onClick={() => updateSettings({ notNotation: opt })}
                >
                  {opt === 'prime' ? "A′" : "Ā"}
                </button>
              ))}
            </div>
          </Row>
        </section>

        {/* ── Player ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Player</h2>
          <Row label="Player Name" sub={save.playerName || '(not set)'}>
            <span className={styles.statValue}>{save.playerName || '—'}</span>
          </Row>
          <Row label="Total XP" sub={`Level ${save.level}`}>
            <span className={styles.statValue}>{save.xp} XP</span>
          </Row>
          <Row label="Created" sub="">
            <span className={styles.statValue}>{new Date(save.createdAt).toLocaleDateString()}</span>
          </Row>
        </section>

        {/* ── Data ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Save Data</h2>

          <div className={styles.actionRow}>
            <button className={styles.actionBtn} onClick={handleExport}>
              📋 Export Progress
            </button>
            <button className={styles.actionBtn} onClick={() => setShowImport(v => !v)}>
              📥 Import Progress
            </button>
          </div>

          {showImport && (
            <div className={styles.importBox}>
              <textarea
                className={styles.importInput}
                placeholder="Paste your save code here…"
                value={importCode}
                onChange={e => setImportCode(e.target.value)}
                rows={3}
              />
              <button className={styles.importBtn} onClick={handleImport}>Import</button>
            </div>
          )}

          <div className={styles.dangerZone}>
            <button className={styles.resetBtn} onClick={() => setShowReset(true)}>
              ⚠ Reset All Progress
            </button>
          </div>

          {showReset && (
            <div className={styles.confirmBox}>
              <p className={styles.confirmText}>This will erase all XP, lesson progress, and puzzle stars. This cannot be undone.</p>
              <div className={styles.confirmBtns}>
                <button className={styles.confirmCancel} onClick={() => setShowReset(false)}>Cancel</button>
                <button className={styles.confirmReset} onClick={handleReset}>Yes, Reset</button>
              </div>
            </div>
          )}
        </section>

        <p className={styles.version}>LOGICVERSE v1.0 · Logic Circuits &amp; Digital Design</p>
      </div>
    </div>
  )
}
