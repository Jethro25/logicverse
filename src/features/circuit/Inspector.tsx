import { getComponentDef } from '@/engine/components/registry'
import type { CanvasCircuit, SelectedItem, SignalMap } from './types'
import styles from './Inspector.module.css'

interface InspectorProps {
  circuit: CanvasCircuit
  selected: SelectedItem | null
  signals: SignalMap
  onDelete: (type: 'component' | 'wire', id: string) => void
  onLabelChange: (compId: string, label: string) => void
}

export function Inspector({ circuit, selected, signals, onDelete, onLabelChange }: InspectorProps) {
  if (!selected) {
    return (
      <div className={styles.panel}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🔍</div>
          <p>Click a component or wire to inspect it.</p>
        </div>
      </div>
    )
  }

  if (selected.type === 'component') {
    const comp = circuit.components.find(c => c.id === selected.id)
    if (!comp) return null
    const def = getComponentDef(comp.type)
    const pins = def.inputPins(comp.props ?? {}).concat(def.outputPins(comp.props ?? {}))
    const compSigs = signals[comp.id] ?? {}

    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.typeBadge}>{comp.type}</span>
          <button className={styles.deleteBtn} onClick={() => onDelete('component', comp.id)} title="Delete">✕</button>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Label</label>
          <input
            className={styles.fieldInput}
            value={comp.label}
            onChange={e => onLabelChange(comp.id, e.target.value)}
            maxLength={12}
          />
        </div>

        {def.description && (
          <p className={styles.desc}>{def.description}</p>
        )}

        {def.ic && (
          <p className={styles.ic}>IC: {def.ic}</p>
        )}

        <div className={styles.signals}>
          <div className={styles.signalsLabel}>Signals</div>
          {pins.map(pin => {
            const sig = compSigs[pin]
            return (
              <div key={pin} className={styles.sigRow}>
                <span className={styles.pinName}>{pin}</span>
                <span className={styles.sigVal} data-sig={String(sig)}>
                  {sig === null ? '?' : String(sig)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Wire selected
  const wire = circuit.wires.find(w => w.id === selected.id)
  if (!wire) return null
  const sig = signals[wire.from.componentId]?.[wire.from.pin]

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.typeBadge}>Wire</span>
        <button className={styles.deleteBtn} onClick={() => onDelete('wire', wire.id)} title="Delete">✕</button>
      </div>
      <div className={styles.sigRow}>
        <span className={styles.pinName}>{wire.from.componentId}:{wire.from.pin}</span>
        <span className={styles.arrow}>→</span>
        <span className={styles.pinName}>{wire.to.componentId}:{wire.to.pin}</span>
      </div>
      <div className={styles.sigRow}>
        <span className={styles.pinName}>Signal</span>
        <span className={styles.sigVal} data-sig={String(sig)}>
          {sig === null ? '?' : String(sig)}
        </span>
      </div>
    </div>
  )
}
