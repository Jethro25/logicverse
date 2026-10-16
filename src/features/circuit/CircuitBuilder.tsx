import { useCallback, useEffect, useRef, useState } from 'react'
import { CircuitCanvas } from './CircuitCanvas'
import { ComponentPalette } from './ComponentPalette'
import { Inspector } from './Inspector'
import { CircuitToolbar } from './CircuitToolbar'
import { useCircuitBuilder } from './useCircuitBuilder'
import type { CanvasCircuit, PuzzleConstraints, Vec2 } from './types'
import { GRID, COMP_W } from './types'
import { findPinAt, snapToGrid } from './layout'
import type { ComponentType } from '@/engine/types'
import styles from './CircuitBuilder.module.css'

interface CircuitBuilderProps {
  initial?: CanvasCircuit
  readOnly?: boolean
  puzzle?: PuzzleConstraints
  onCheck?: (circuit: CanvasCircuit) => void
  checkLabel?: string
  width?: number
  height?: number
}

export function CircuitBuilder({
  initial, readOnly = false, puzzle, onCheck, checkLabel = 'Check Answer', width = 760, height = 480,
}: CircuitBuilderProps) {
  const [state, actions] = useCircuitBuilder(initial)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const dragComp = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null)
  const pendingType = useRef<ComponentType | null>(null)
  const [, setDropCol] = useState<number | null>(null)

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return
      if (e.key === 'v' || e.key === 'V') actions.setTool('select')
      if (e.key === 'w' || e.key === 'W') actions.setTool('wire')
      if (e.key === 'd' || e.key === 'D') actions.setTool('delete')
      if (e.key === 'Escape') { actions.setTool('select'); actions.cancelWire(); actions.setSelected(null) }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); actions.undo() }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) { e.preventDefault(); actions.redo() }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selected) {
          if (state.selected.type === 'component') actions.deleteComponent(state.selected.id)
          else actions.deleteWire(state.selected.id)
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [actions, state.selected])

  const getSVGPos = useCallback((e: React.MouseEvent): Vec2 => {
    const svg = svgRef.current
    if (!svg) return { x: e.clientX, y: e.clientY }
    // Use getScreenCTM to correctly map screen coords → SVG viewBox coords
    // (handles preserveAspectRatio, scaling, and transforms)
    const ctm = svg.getScreenCTM()
    if (!ctm) {
      const rect = svg.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const svgPt = pt.matrixTransform(ctm.inverse())
    return { x: svgPt.x, y: svgPt.y }
  }, [])

  // ── Canvas mouse events ──
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return
    const pos = getSVGPos(e)
    // Click empty area: deselect
    actions.setSelected(null)

    if (state.tool === 'wire') {
      // Check if near a pin
      const pin = findPinAt(state.circuit.components, pos)
      if (pin) {
        actions.startWire(pin.componentId, pin.pin, pin.pos.x, pin.pos.y)
      }
    }
  }, [getSVGPos, actions, state.tool, state.circuit.components])

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const pos = getSVGPos(e)

    // Dragging a component
    if (dragComp.current) {
      const newX = snapToGrid(pos.x - dragComp.current.offsetX)
      const newY = snapToGrid(pos.y - dragComp.current.offsetY)
      actions.moveComponent(dragComp.current.id, newX, newY)
      return
    }

    // Wiring
    if (state.wireInProgress) {
      actions.updateWirePos(pos.x, pos.y)
    }
  }, [getSVGPos, actions, state.wireInProgress])

  const handleCanvasMouseUp = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    dragComp.current = null

    if (state.wireInProgress) {
      const pos = getSVGPos(e)
      const pin = findPinAt(state.circuit.components, pos)
      if (pin) {
        actions.finishWire(pin.componentId, pin.pin)
      } else {
        actions.cancelWire()
      }
    }
  }, [getSVGPos, state.wireInProgress, state.circuit.components, actions])

  // ── Component mouse events ──
  const handleCompMouseDown = useCallback((e: React.MouseEvent, compId: string) => {
    e.stopPropagation()
    if (state.tool === 'delete') { actions.deleteComponent(compId); return }
    if (state.tool === 'select') {
      actions.setSelected({ type: 'component', id: compId })
      const pos = getSVGPos(e)
      const comp = state.circuit.components.find(c => c.id === compId)
      if (!comp) return
      dragComp.current = {
        id: compId,
        offsetX: pos.x - comp.x * GRID,
        offsetY: pos.y - comp.y * GRID,
      }
    }
  }, [state.tool, state.circuit.components, actions, getSVGPos])

  const handlePinMouseDown = useCallback((e: React.MouseEvent, compId: string, pin: string, pos: Vec2) => {
    e.stopPropagation()
    if (state.tool === 'wire' || state.tool === 'select') {
      actions.setTool('wire')
      actions.startWire(compId, pin, pos.x, pos.y)
    }
  }, [state.tool, actions])

  const handlePinMouseUp = useCallback((e: React.MouseEvent, compId: string, pin: string) => {
    e.stopPropagation()
    // finishWire checks wireRef internally (avoids stale state.wireInProgress closure)
    actions.finishWire(compId, pin)
  }, [actions])

  const handleCompDoubleClick = useCallback((compId: string) => {
    const comp = state.circuit.components.find(c => c.id === compId)
    if (!comp) return
    if (comp.type === 'SWITCH') { actions.toggleSwitch(compId); return }
    actions.setSelected({ type: 'component', id: compId })
  }, [state.circuit.components, actions])

  const handleWireClick = useCallback((id: string) => {
    if (state.tool === 'delete') { actions.deleteWire(id); return }
    actions.setSelected({ type: 'wire', id })
  }, [state.tool, actions])

  // ── Palette drag-to-canvas ──
  const handlePaletteClick = useCallback((type: ComponentType) => {
    // Place near center of canvas
    const col = Math.round(width / 2 / GRID) - Math.round(COMP_W / 2 / GRID)
    const row = Math.round(height / 2 / GRID) - 1
    actions.addComponent(type, col, row)
  }, [actions, width, height])

  const handleLabelChange = useCallback((compId: string, label: string) => {
    // Update component label in circuit
    const comp = state.circuit.components.find(c => c.id === compId)
    if (!comp) return
    const next = {
      ...state.circuit,
      components: state.circuit.components.map(c => c.id === compId ? { ...c, label } : c),
    }
    // direct set without full undo (label edits are lightweight)
    actions.loadCircuit(next)
  }, [state.circuit, actions])

  const handleDelete = useCallback((type: 'component' | 'wire', id: string) => {
    if (type === 'component') actions.deleteComponent(id)
    else actions.deleteWire(id)
  }, [actions])

  return (
    <div className={styles.builder}>
      {!readOnly && (
        <CircuitToolbar
          tool={state.tool}
          canUndo={state.canUndo}
          canRedo={state.canRedo}
          onTool={actions.setTool}
          onUndo={actions.undo}
          onRedo={actions.redo}
          onClear={puzzle ? undefined : actions.clearCircuit}
          onCheck={onCheck ? () => onCheck(state.circuit) : undefined}
          showCheck={!!onCheck}
          checkLabel={checkLabel}
        />
      )}

      <div className={styles.body}>
        {!readOnly && (
          <ComponentPalette
            allowedTypes={puzzle?.allowedTypes as ComponentType[] | undefined}
            onDragStart={type => { pendingType.current = type }}
            onPaletteClick={handlePaletteClick}
          />
        )}

        <div
          className={styles.canvasWrap}
          onDragOver={e => { e.preventDefault(); const rect = (e.currentTarget as HTMLElement).getBoundingClientRect(); setDropCol(snapToGrid(e.clientX - rect.left)) }}
          onDrop={e => {
            if (!pendingType.current) return
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
            const col = snapToGrid(e.clientX - rect.left) - Math.round(COMP_W / 2 / GRID)
            const row = snapToGrid(e.clientY - rect.top) - 1
            actions.addComponent(pendingType.current, Math.max(0, col), Math.max(0, row))
            pendingType.current = null
            setDropCol(null)
          }}
        >
          <CircuitCanvas
            circuit={state.circuit}
            tool={state.tool}
            wireInProgress={state.wireInProgress}
            selected={state.selected}
            signals={state.signals}
            readOnly={readOnly}
            onCanvasMouseDown={handleCanvasMouseDown}
            onCanvasMouseMove={handleCanvasMouseMove}
            onCanvasMouseUp={handleCanvasMouseUp}
            onCompMouseDown={handleCompMouseDown}
            onPinMouseDown={handlePinMouseDown}
            onPinMouseUp={handlePinMouseUp}
            onCompDoubleClick={handleCompDoubleClick}
            onWireClick={handleWireClick}
            width={width}
            height={height}
          />
        </div>

        {!readOnly && (
          <Inspector
            circuit={state.circuit}
            selected={state.selected}
            signals={state.signals}
            onDelete={handleDelete}
            onLabelChange={handleLabelChange}
          />
        )}
      </div>
    </div>
  )
}
