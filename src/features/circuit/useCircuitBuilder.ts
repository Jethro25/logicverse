import { useState, useCallback, useRef } from 'react'
import { evaluate } from '@/engine/evaluate'
import { getComponentDef } from '@/engine/components/registry'
import type { ComponentType } from '@/engine/types'
import type {
  CanvasCircuit, PlacedComponent, CanvasWire,
  BuilderTool, WireInProgress, SelectedItem, SignalMap,
} from './types'
import { GRID } from './types'

const MAX_HISTORY = 40

function emptyCircuit(): CanvasCircuit {
  return { components: [], wires: [] }
}

function toEngineCircuit(canvas: CanvasCircuit) {
  return {
    schema: 1 as const,
    components: canvas.components.map(c => ({ id: c.id, type: c.type, x: c.x, y: c.y, props: c.props ?? {} })),
    wires: canvas.wires.map(w => ({ id: w.id, from: w.from, to: w.to })),
  }
}

function evalCircuit(canvas: CanvasCircuit): SignalMap {
  try {
    const result = evaluate(toEngineCircuit(canvas))
    const map: SignalMap = {}
    for (const [key, sig] of result.signals) {
      const colon = key.lastIndexOf(':')
      if (colon === -1) continue
      const compId = key.slice(0, colon)
      const pin = key.slice(colon + 1)
      if (!map[compId]) map[compId] = {}
      map[compId][pin] = sig
    }
    return map
  } catch {
    return {}
  }
}

let _nextId = 1
function nextId() { return `c${_nextId++}` }

export interface CircuitBuilderState {
  circuit: CanvasCircuit
  tool: BuilderTool
  wireInProgress: WireInProgress | null
  selected: SelectedItem | null
  signals: SignalMap
  canUndo: boolean
  canRedo: boolean
}

export interface CircuitBuilderActions {
  setTool: (t: BuilderTool) => void
  addComponent: (type: ComponentType, col: number, row: number) => void
  moveComponent: (id: string, col: number, row: number) => void
  deleteComponent: (id: string) => void
  deleteWire: (id: string) => void
  toggleSwitch: (id: string) => void
  startWire: (componentId: string, pin: string, posX: number, posY: number) => void
  updateWirePos: (x: number, y: number) => void
  finishWire: (toComponentId: string, toPin: string) => void
  cancelWire: () => void
  setSelected: (item: SelectedItem | null) => void
  undo: () => void
  redo: () => void
  loadCircuit: (c: CanvasCircuit) => void
  clearCircuit: () => void
}

export function useCircuitBuilder(initial?: CanvasCircuit): [CircuitBuilderState, CircuitBuilderActions] {
  const [circuit, setCircuitRaw] = useState<CanvasCircuit>(initial ?? emptyCircuit())
  const [tool, setTool] = useState<BuilderTool>('select')
  const wireRef = useRef<WireInProgress | null>(null)
  const [wireInProgress, setWireState] = useState<WireInProgress | null>(null)
  const [selected, setSelected] = useState<SelectedItem | null>(null)
  const [signals, setSignals] = useState<SignalMap>({})
  const undoStack = useRef<CanvasCircuit[]>([])
  const redoStack = useRef<CanvasCircuit[]>([])

  const pushHistory = useCallback((prev: CanvasCircuit) => {
    undoStack.current = [...undoStack.current.slice(-(MAX_HISTORY - 1)), prev]
    redoStack.current = []
  }, [])

  const setCircuit = useCallback((next: CanvasCircuit, recordHistory = true, prev?: CanvasCircuit) => {
    if (recordHistory) pushHistory(prev ?? circuit)
    setCircuitRaw(next)
    setSignals(evalCircuit(next))
  }, [circuit, pushHistory])

  const addComponent = useCallback((type: ComponentType, col: number, row: number) => {
    const def = getComponentDef(type)
    const comp: PlacedComponent = {
      id: nextId(),
      type,
      label: def.label,
      props: {},
      x: col,
      y: row,
    }
    setCircuit({ ...circuit, components: [...circuit.components, comp] })
  }, [circuit, setCircuit])

  const moveComponent = useCallback((id: string, col: number, row: number) => {
    const prev = circuit
    const next = {
      ...circuit,
      components: circuit.components.map(c =>
        c.id === id ? { ...c, x: Math.round(col), y: Math.round(row) } : c,
      ),
    }
    setCircuit(next, true, prev)
  }, [circuit, setCircuit])

  const deleteComponent = useCallback((id: string) => {
    setCircuit({
      components: circuit.components.filter(c => c.id !== id),
      wires: circuit.wires.filter(w => w.from.componentId !== id && w.to.componentId !== id),
    })
    if (selected?.id === id) setSelected(null)
  }, [circuit, selected, setCircuit])

  const deleteWire = useCallback((id: string) => {
    setCircuit({ ...circuit, wires: circuit.wires.filter(w => w.id !== id) })
    if (selected?.id === id) setSelected(null)
  }, [circuit, selected, setCircuit])

  const toggleSwitch = useCallback((id: string) => {
    const comp = circuit.components.find(c => c.id === id)
    if (!comp || comp.type !== 'SWITCH') return
    const newVal = comp.props?.value === 1 ? 0 : 1
    const next = {
      ...circuit,
      components: circuit.components.map(c =>
        c.id === id ? { ...c, props: { ...c.props, value: newVal } } : c,
      ),
    }
    // don't record toggle as undo step
    setCircuitRaw(next)
    setSignals(evalCircuit(next))
  }, [circuit])

  const startWire = useCallback((componentId: string, pin: string, posX: number, posY: number) => {
    const wip = { fromComponentId: componentId, fromPin: pin, fromPos: { x: posX, y: posY }, currentPos: { x: posX, y: posY } }
    wireRef.current = wip
    setWireState(wip)
  }, [])

  const updateWirePos = useCallback((x: number, y: number) => {
    if (!wireRef.current) return
    const wip = { ...wireRef.current, currentPos: { x, y } }
    wireRef.current = wip
    setWireState(wip)
  }, [])

  const finishWire = useCallback((toComponentId: string, toPin: string) => {
    const wip = wireRef.current  // use ref for synchronous access (avoids stale closure)
    if (!wip) return
    wireRef.current = null
    setWireState(null)
    const { fromComponentId, fromPin } = wip
    if (fromComponentId === toComponentId) return
    // Prevent duplicate wires
    const dup = circuit.wires.some(
      w => w.from.componentId === fromComponentId && w.from.pin === fromPin &&
           w.to.componentId === toComponentId && w.to.pin === toPin,
    )
    if (!dup) {
      const wire: CanvasWire = {
        id: nextId(),
        from: { componentId: fromComponentId, pin: fromPin },
        to: { componentId: toComponentId, pin: toPin },
      }
      setCircuit({ ...circuit, wires: [...circuit.wires, wire] })
    }
  }, [circuit, setCircuit])

  const cancelWire = useCallback(() => { wireRef.current = null; setWireState(null) }, [])

  const undo = useCallback(() => {
    const prev = undoStack.current[undoStack.current.length - 1]
    if (!prev) return
    redoStack.current = [...redoStack.current, circuit]
    undoStack.current = undoStack.current.slice(0, -1)
    setCircuit(prev, false)
  }, [circuit, setCircuit])

  const redo = useCallback(() => {
    const next = redoStack.current[redoStack.current.length - 1]
    if (!next) return
    undoStack.current = [...undoStack.current, circuit]
    redoStack.current = redoStack.current.slice(0, -1)
    setCircuit(next, false)
  }, [circuit, setCircuit])

  const loadCircuit = useCallback((c: CanvasCircuit) => {
    undoStack.current = []
    redoStack.current = []
    setCircuitRaw(c)
    setSignals(evalCircuit(c))
  }, [])

  const clearCircuit = useCallback(() => {
    pushHistory(circuit)
    const empty = emptyCircuit()
    setCircuitRaw(empty)
    setSignals({})
  }, [circuit, pushHistory])

  const state: CircuitBuilderState = {
    circuit,
    tool,
    wireInProgress,  // from useState (for rendering)
    selected,
    signals,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
  }

  const actions: CircuitBuilderActions = {
    setTool, addComponent, moveComponent, deleteComponent, deleteWire,
    toggleSwitch, startWire, updateWirePos, finishWire, cancelWire,
    setSelected, undo, redo, loadCircuit, clearCircuit,
  }

  return [state, actions]
}

export { GRID }
