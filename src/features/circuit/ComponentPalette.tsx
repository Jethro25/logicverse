import type { ComponentType } from '@/engine/types'
import { getComponentDef } from '@/engine/components/registry'
import styles from './ComponentPalette.module.css'

interface PaletteGroup {
  label: string
  types: ComponentType[]
}

const ALL_GROUPS: PaletteGroup[] = [
  { label: 'I/O', types: ['SWITCH', 'CONST', 'CLOCK', 'LED', 'PROBE'] },
  { label: 'Gates', types: ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'] },
  { label: 'Latches', types: ['SR_LATCH_NOR', 'SR_LATCH_NAND', 'D_LATCH'] },
  { label: 'Flip-Flops', types: ['D_FF', 'JK_FF', 'T_FF'] },
]

interface ComponentPaletteProps {
  allowedTypes?: ComponentType[]
  onDragStart: (type: ComponentType) => void
  onPaletteClick: (type: ComponentType) => void
}

export function ComponentPalette({ allowedTypes, onDragStart, onPaletteClick }: ComponentPaletteProps) {
  const groups = allowedTypes
    ? ALL_GROUPS.map(g => ({ ...g, types: g.types.filter(t => allowedTypes.includes(t)) })).filter(g => g.types.length > 0)
    : ALL_GROUPS

  return (
    <div className={styles.palette}>
      {groups.map(group => (
        <div key={group.label} className={styles.group}>
          <div className={styles.groupLabel}>{group.label}</div>
          <div className={styles.chips}>
            {group.types.map(type => {
              const def = getComponentDef(type)
              return (
                <button
                  key={type}
                  className={styles.chip}
                  title={def.description ?? def.label}
                  draggable
                  onDragStart={() => onDragStart(type)}
                  onClick={() => onPaletteClick(type)}
                >
                  {def.label}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
