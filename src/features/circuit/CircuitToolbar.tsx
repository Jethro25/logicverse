import type { BuilderTool } from './types'
import styles from './CircuitToolbar.module.css'

interface CircuitToolbarProps {
  tool: BuilderTool
  canUndo: boolean
  canRedo: boolean
  onTool: (t: BuilderTool) => void
  onUndo: () => void
  onRedo: () => void
  onClear?: () => void
  onCheck?: () => void
  showCheck?: boolean
  checkLabel?: string
}

const TOOLS: Array<{ id: BuilderTool; icon: string; title: string }> = [
  { id: 'select', icon: '↖', title: 'Select / Move (V)' },
  { id: 'wire',   icon: '↗', title: 'Draw Wire (W)' },
  { id: 'delete', icon: '✕', title: 'Delete (D)' },
]

export function CircuitToolbar({
  tool, canUndo, canRedo, onTool, onUndo, onRedo, onClear, onCheck, showCheck, checkLabel = 'Check',
}: CircuitToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.group}>
        {TOOLS.map(t => (
          <button
            key={t.id}
            className={[styles.btn, tool === t.id ? styles.active : ''].join(' ')}
            title={t.title}
            onClick={() => onTool(t.id)}
          >
            {t.icon}
          </button>
        ))}
      </div>

      <div className={styles.divider} />

      <div className={styles.group}>
        <button className={styles.btn} title="Undo (Ctrl+Z)" disabled={!canUndo} onClick={onUndo}>↩</button>
        <button className={styles.btn} title="Redo (Ctrl+Y)" disabled={!canRedo} onClick={onRedo}>↪</button>
      </div>

      {onClear && (
        <>
          <div className={styles.divider} />
          <button className={[styles.btn, styles.danger].join(' ')} title="Clear canvas" onClick={onClear}>🗑</button>
        </>
      )}

      {showCheck && onCheck && (
        <button className={[styles.btn, styles.check].join(' ')} onClick={onCheck}>
          {checkLabel}
        </button>
      )}
    </div>
  )
}
