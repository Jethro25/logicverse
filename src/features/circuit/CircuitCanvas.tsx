import type { CSSProperties } from 'react'
import type { CanvasCircuit, PlacedComponent, CanvasWire, BuilderTool, WireInProgress, SelectedItem, SignalMap, Vec2 } from './types'
import { GRID, COMP_W, COMP_H } from './types'
import { getPinLayouts, wirePathD } from './layout'
import { getComponentDef } from '@/engine/components/registry'
import styles from './CircuitCanvas.module.css'

const PIN_R = 6
function signalColor(s: string | number | null | undefined): string {
  if (s === 1) return '#22c55e'
  if (s === 0) return 'var(--color-text-3)'
  return '#94a3b8'
}

// ── Component shapes ──
function GateShape({ type, w, h }: { type: string; w: number; h: number }) {
  const mid = h / 2
  const bx = 8  // body start x (after input stalk)
  const bw = w - 16
  const bh = h - 8
  const by = 4

  const labelMap: Record<string, string> = {
    AND: '&', OR: '≥1', NOT: '1', NAND: '⊼', NOR: '⊽', XOR: '⊕', XNOR: '⊙',
    SWITCH: 'SW', CONST: 'C', CLOCK: 'CLK', LED: 'LED', PROBE: '?',
    D_FF: 'D', JK_FF: 'JK', T_FF: 'T', SR_LATCH_NOR: 'SR', SR_LATCH_NAND: 'SR̄',
    D_LATCH: 'D', MUX: 'MUX', DEMUX: 'DMX', DECODER: 'DEC', ENCODER: 'ENC',
    HALF_ADDER: 'HA', FULL_ADDER: 'FA',
  }
  const label = labelMap[type] ?? type.slice(0, 4)

  if (type === 'NOT') {
    return (
      <>
        <polygon points={`${bx},${by} ${bx+bw-6},${mid} ${bx},${by+bh}`} fill="var(--comp-fill)" stroke="var(--comp-stroke)" strokeWidth="1.5" />
        <circle cx={bx + bw - 4} cy={mid} r={4} fill="var(--comp-fill)" stroke="var(--comp-stroke)" strokeWidth="1.5" />
        <text x={bx + bw * 0.3} y={mid + 4} textAnchor="middle" fontSize="9" fill="var(--comp-text)" fontFamily="monospace">{label}</text>
      </>
    )
  }

  // Curved body for OR-type gates
  if (type === 'OR' || type === 'NOR' || type === 'XOR' || type === 'XNOR') {
    const d = `M ${bx},${by} Q ${bx+bw*0.4},${by} ${bx+bw},${mid} Q ${bx+bw*0.4},${by+bh} ${bx},${by+bh} Q ${bx+bw*0.25},${mid} ${bx},${by}`
    const extra = type === 'XOR' || type === 'XNOR' ? (
      <path d={`M ${bx-4},${by} Q ${bx+bw*0.1},${mid} ${bx-4},${by+bh}`} fill="none" stroke="var(--comp-stroke)" strokeWidth="1.5" />
    ) : null
    return (
      <>
        {extra}
        <path d={d} fill="var(--comp-fill)" stroke="var(--comp-stroke)" strokeWidth="1.5" />
        {(type === 'NOR' || type === 'XNOR') && <circle cx={bx + bw + 4} cy={mid} r={4} fill="var(--comp-fill)" stroke="var(--comp-stroke)" strokeWidth="1.5" />}
        <text x={bx + bw * 0.45} y={mid + 4} textAnchor="middle" fontSize="9" fill="var(--comp-text)" fontFamily="monospace">{label}</text>
      </>
    )
  }

  // SWITCH / IO special rendering
  if (type === 'SWITCH') {
    return (
      <>
        <rect x={bx} y={by} width={bw} height={bh} rx="4" fill="var(--comp-fill)" stroke="var(--comp-stroke)" strokeWidth="1.5" />
        <text x={w / 2} y={mid + 4} textAnchor="middle" fontSize="9" fill="var(--comp-text)" fontFamily="monospace">SW</text>
      </>
    )
  }

  if (type === 'LED') {
    return (
      <>
        <circle cx={w / 2} cy={mid} r={mid - 4} fill="var(--comp-fill)" stroke="var(--comp-stroke)" strokeWidth="1.5" />
        <text x={w / 2} y={mid + 4} textAnchor="middle" fontSize="9" fill="var(--comp-text)" fontFamily="monospace">LED</text>
      </>
    )
  }

  // Default: rounded rectangle
  return (
    <>
      <rect x={bx} y={by} width={bw} height={bh} rx="4" fill="var(--comp-fill)" stroke="var(--comp-stroke)" strokeWidth="1.5" />
      <text x={w / 2} y={mid + 4} textAnchor="middle" fontSize="9" fill="var(--comp-text)" fontFamily="monospace">{label}</text>
    </>
  )
}

// ── Component node ──
interface CompNodeProps {
  comp: PlacedComponent
  selected: boolean
  signals: SignalMap
  tool: BuilderTool
  onMouseDown: (e: React.MouseEvent, compId: string) => void
  onPinMouseDown: (e: React.MouseEvent, compId: string, pin: string, pos: Vec2) => void
  onPinMouseUp: (e: React.MouseEvent, compId: string, pin: string) => void
  onDoubleClick: (compId: string) => void
}

function CompNode({ comp, selected, signals, tool, onMouseDown, onPinMouseDown, onPinMouseUp, onDoubleClick }: CompNodeProps) {
  const def = getComponentDef(comp.type)
  const pins = getPinLayouts(comp)
  const cx = comp.x * GRID
  const cy = comp.y * GRID
  const compSigs = signals[comp.id] ?? {}
  const isSwitch = comp.type === 'SWITCH'
  const switchVal = comp.props?.value === 1 ? 1 : 0
  const compFill = isSwitch ? (switchVal ? '#16532088' : 'var(--color-bg-3)') : 'var(--color-bg-2)'

  return (
    <g
      style={{
        '--comp-fill': compFill,
        '--comp-stroke': selected ? 'var(--color-accent)' : 'var(--color-border)',
        '--comp-text': 'var(--color-text)',
        cursor: tool === 'delete' ? 'pointer' : tool === 'select' ? 'grab' : 'crosshair',
      } as CSSProperties}
      transform={`translate(${cx},${cy})`}
      onMouseDown={e => onMouseDown(e, comp.id)}
      onDoubleClick={() => onDoubleClick(comp.id)}
    >
      {/* Shadow if selected */}
      {selected && (
        <rect x={6} y={4} width={COMP_W} height={COMP_H} rx="6" fill="var(--color-accent)" opacity="0.15" />
      )}

      <GateShape type={comp.type} w={COMP_W} h={COMP_H} />

      {/* Label above */}
      {comp.label && comp.label !== def.label && (
        <text x={COMP_W / 2} y={-4} textAnchor="middle" fontSize="8" fill="var(--color-text-3)" fontFamily="monospace">
          {comp.label}
        </text>
      )}

      {/* Switch value display */}
      {isSwitch && (
        <text x={COMP_W / 2} y={COMP_H / 2 + 4} textAnchor="middle" fontSize="14" fontWeight="700"
          fill={switchVal ? '#22c55e' : 'var(--color-text-3)'} fontFamily="monospace">
          {switchVal}
        </text>
      )}

      {/* Pins */}
      {pins.map(p => {
        const lx = p.pos.x - cx
        const ly = p.pos.y - cy
        const sig = compSigs[p.pin]
        const color = signalColor(sig)
        return (
          <circle
            key={p.pin}
            cx={lx} cy={ly} r={PIN_R}
            fill={color} stroke="var(--color-bg)"
            strokeWidth="1.5" opacity="0.9"
            style={{ cursor: 'crosshair' }}
            onMouseDown={e => { e.stopPropagation(); onPinMouseDown(e, comp.id, p.pin, p.pos) }}
            onMouseUp={e => { e.stopPropagation(); onPinMouseUp(e, comp.id, p.pin) }}
          />
        )
      })}
    </g>
  )
}

// ── Wire ──
interface WireProps {
  wire: CanvasWire
  comps: PlacedComponent[]
  signals: SignalMap
  selected: boolean
  tool: BuilderTool
  onClick: (id: string) => void
}

function WireNode({ wire, comps, signals, selected, tool, onClick }: WireProps) {
  const fromComp = comps.find(c => c.id === wire.from.componentId)
  const toComp = comps.find(c => c.id === wire.to.componentId)
  if (!fromComp || !toComp) return null

  const fromPins = getPinLayouts(fromComp)
  const toPins = getPinLayouts(toComp)
  const fromPin = fromPins.find(p => p.pin === wire.from.pin)
  const toPin = toPins.find(p => p.pin === wire.to.pin)
  if (!fromPin || !toPin) return null

  const sig = signals[wire.from.componentId]?.[wire.from.pin]
  const color = signalColor(sig)
  const d = wirePathD(fromPin.pos, toPin.pos)

  return (
    <g onClick={() => onClick(wire.id)} style={{ cursor: tool === 'delete' ? 'pointer' : 'default' }}>
      {/* Hit area */}
      <path d={d} fill="none" stroke="transparent" strokeWidth="12" />
      <path
        d={d} fill="none"
        stroke={selected ? 'var(--color-accent)' : color}
        strokeWidth={selected ? 2.5 : 2}
        strokeDasharray={sig === null ? '6 3' : undefined}
        opacity={0.9}
      />
    </g>
  )
}

// ── Main canvas ──
interface CircuitCanvasProps {
  circuit: CanvasCircuit
  tool: BuilderTool
  wireInProgress: WireInProgress | null
  selected: SelectedItem | null
  signals: SignalMap
  readOnly?: boolean
  onCanvasMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void
  onCanvasMouseUp: (e: React.MouseEvent<SVGSVGElement>) => void
  onCanvasMouseDown: (e: React.MouseEvent<SVGSVGElement>) => void
  onCompMouseDown: (e: React.MouseEvent, compId: string) => void
  onPinMouseDown: (e: React.MouseEvent, compId: string, pin: string, pos: Vec2) => void
  onPinMouseUp: (e: React.MouseEvent, compId: string, pin: string) => void
  onCompDoubleClick: (compId: string) => void
  onWireClick: (id: string) => void
  width?: number
  height?: number
}

export function CircuitCanvas({
  circuit, tool, wireInProgress, selected, signals, readOnly = false,
  onCanvasMouseMove, onCanvasMouseUp, onCanvasMouseDown,
  onCompMouseDown, onPinMouseDown, onPinMouseUp, onCompDoubleClick, onWireClick,
  width = 800, height = 520,
}: CircuitCanvasProps) {
  // Draw grid dots
  const gridDots: React.ReactNode[] = []
  for (let row = 0; row * GRID < height; row++) {
    for (let col = 0; col * GRID < width; col++) {
      gridDots.push(
        <circle key={`${col}-${row}`} cx={col * GRID} cy={row * GRID} r="1" fill="var(--color-border)" opacity="0.4" />
      )
    }
  }

  return (
    <svg
      className={styles.canvas}
      width={width} height={height}
      viewBox={`0 0 ${width} ${height}`}
      onMouseMove={onCanvasMouseMove}
      onMouseUp={onCanvasMouseUp}
      onMouseDown={onCanvasMouseDown}
      style={{ cursor: wireInProgress ? 'crosshair' : undefined }}
    >
      {/* Grid */}
      <g className={styles.grid}>{gridDots}</g>

      {/* Wires */}
      <g className={styles.wires}>
        {circuit.wires.map(w => (
          <WireNode
            key={w.id}
            wire={w}
            comps={circuit.components}
            signals={signals}
            selected={selected?.type === 'wire' && selected.id === w.id}
            tool={tool}
            onClick={onWireClick}
          />
        ))}
      </g>

      {/* Wire in progress */}
      {wireInProgress && (
        <path
          d={wirePathD(wireInProgress.fromPos, wireInProgress.currentPos)}
          fill="none" stroke="var(--color-accent)" strokeWidth="2"
          strokeDasharray="6 3" opacity="0.8"
        />
      )}

      {/* Components */}
      <g className={styles.components}>
        {circuit.components.map(comp => (
          <CompNode
            key={comp.id}
            comp={comp}
            selected={selected?.type === 'component' && selected.id === comp.id}
            signals={signals}
            tool={tool}
            onMouseDown={readOnly ? () => {} : onCompMouseDown}
            onPinMouseDown={readOnly ? () => {} : onPinMouseDown}
            onPinMouseUp={readOnly ? () => {} : onPinMouseUp}
            onDoubleClick={readOnly ? () => {} : onCompDoubleClick}
          />
        ))}
      </g>
    </svg>
  )
}
