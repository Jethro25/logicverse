import type { ComponentInstance, Signal } from '@/engine/types'

export const GRID = 40  // px per grid cell
export const COMP_W = 80
export const COMP_H = 48

export interface Vec2 { x: number; y: number }

// PlacedComponent = engine ComponentInstance + display label
export interface PlacedComponent extends ComponentInstance {
  label: string
}

export interface CanvasWire {
  id: string
  from: { componentId: string; pin: string }
  to:   { componentId: string; pin: string }
}

export interface CanvasCircuit {
  components: PlacedComponent[]
  wires: CanvasWire[]
}

export type BuilderTool = 'select' | 'wire' | 'delete'

export interface WireInProgress {
  fromComponentId: string
  fromPin: string
  fromPos: Vec2
  currentPos: Vec2
}

export interface SelectedItem {
  type: 'component' | 'wire'
  id: string
}

export interface PinLayout {
  componentId: string
  pin: string
  side: 'left' | 'right'
  pos: Vec2
}

export interface PuzzleConstraints {
  allowedTypes?: string[]
  lockedComponents?: string[]
  maxComponents?: number
  requiredOutputs?: string[]
}

export type SignalMap = Record<string, Record<string, Signal>>
