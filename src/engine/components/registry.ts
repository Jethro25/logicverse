import { AND, OR, NOT, NAND, NOR, XOR, XNOR } from './gates'
import { SWITCH, CONST, CLOCK, LED, PROBE } from './io'
import { SR_LATCH_NOR, SR_LATCH_NAND, D_LATCH, D_FF, JK_FF, T_FF } from './sequential'
import type { ComponentDef, ComponentType } from '../types'

const defs: ComponentDef[] = [
  AND, OR, NOT, NAND, NOR, XOR, XNOR,
  SWITCH, CONST, CLOCK, LED, PROBE,
  SR_LATCH_NOR, SR_LATCH_NAND, D_LATCH, D_FF, JK_FF, T_FF,
]

const registry = new Map<ComponentType, ComponentDef>()
for (const d of defs) registry.set(d.type, d)

export function getComponentDef(type: ComponentType): ComponentDef {
  const def = registry.get(type)
  if (!def) throw new Error(`Unknown component type: ${type}`)
  return def
}

export function getAllComponentDefs(): ComponentDef[] {
  return [...registry.values()]
}
