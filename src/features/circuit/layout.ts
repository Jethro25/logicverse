import { getComponentDef } from '@/engine/components/registry'
import { GRID, COMP_W, COMP_H } from './types'
import type { PlacedComponent, PinLayout, Vec2 } from './types'

export function compToCanvas(col: number, row: number): Vec2 {
  return { x: col * GRID, y: row * GRID }
}

export function snapToGrid(px: number): number {
  return Math.round(px / GRID)
}

export function compRect(comp: PlacedComponent): { x: number; y: number; w: number; h: number } {
  return { x: comp.x * GRID, y: comp.y * GRID, w: COMP_W, h: COMP_H }
}

export function getPinLayouts(comp: PlacedComponent): PinLayout[] {
  const def = getComponentDef(comp.type)
  const inputs = def.inputPins(comp.props ?? {})
  const outputs = def.outputPins(comp.props ?? {})
  const { x, y, h } = compRect(comp)
  const layouts: PinLayout[] = []

  inputs.forEach((pin, i) => {
    const yOffset = inputs.length === 1 ? h / 2 : (h / (inputs.length + 1)) * (i + 1)
    layouts.push({ componentId: comp.id, pin, side: 'left', pos: { x, y: y + yOffset } })
  })

  outputs.forEach((pin, i) => {
    const yOffset = outputs.length === 1 ? h / 2 : (h / (outputs.length + 1)) * (i + 1)
    layouts.push({ componentId: comp.id, pin, side: 'right', pos: { x: x + COMP_W, y: y + yOffset } })
  })

  return layouts
}

export function allPinLayouts(comps: PlacedComponent[]): PinLayout[] {
  return comps.flatMap(getPinLayouts)
}

export function findPinAt(
  comps: PlacedComponent[],
  pos: Vec2,
  radius = 10,
): PinLayout | null {
  const pins = allPinLayouts(comps)
  let best: PinLayout | null = null
  let bestDist = radius
  for (const p of pins) {
    const d = Math.hypot(p.pos.x - pos.x, p.pos.y - pos.y)
    if (d <= bestDist) { best = p; bestDist = d }
  }
  return best
}

export function wirePathD(from: Vec2, to: Vec2): string {
  const dx = Math.abs(to.x - from.x)
  const cx = Math.max(40, dx * 0.5)
  return `M ${from.x} ${from.y} C ${from.x + cx} ${from.y}, ${to.x - cx} ${to.y}, ${to.x} ${to.y}`
}
