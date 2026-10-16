import type { Circuit } from '../types'
import type { ExprNode, ExprResult } from './ast'
import { getComponentDef } from '../components/registry'

/**
 * Walk back from an output pin to build a Boolean expression.
 * Returns { ok: true, expr } or { ok: false, reason }.
 *
 * Sequential components are treated as opaque variables (they hold state).
 */
export function exprFromOutput(
  circuit: Circuit,
  outputCompId: string,
  visited = new Set<string>()
): ExprResult {
  if (visited.has(outputCompId)) {
    return { ok: false, reason: `Cycle detected at component "${outputCompId}". Expressions cannot be derived for cyclic circuits.` }
  }
  visited = new Set([...visited, outputCompId])

  const comp = circuit.components.find(c => c.id === outputCompId)
  if (!comp) return { ok: false, reason: `Component "${outputCompId}" not found.` }

  const def = getComponentDef(comp.type)

  // Sources
  if (comp.type === 'SWITCH') {
    const label = String(comp.props?.label ?? comp.id)
    return { ok: true, expr: { kind: 'var', name: label } }
  }
  if (comp.type === 'CONST') {
    return { ok: true, expr: { kind: 'const', value: comp.props?.value === 1 ? 1 : 0 } }
  }

  // Sequential: treat as an opaque variable (e.g. "Q_ff1")
  if (def.kind === 'sequential') {
    const label = String(comp.props?.label ?? comp.id)
    return { ok: true, expr: { kind: 'var', name: `Q_${label}` } }
  }

  // Combinational: find all input wires and recurse
  const inputPins = def.inputPins(comp.props)
  const childExprs: ExprNode[] = []

  for (const pin of inputPins) {
    const wire = circuit.wires.find(
      w => w.to.componentId === comp.id && w.to.pin === pin
    )
    if (!wire) {
      // Unconnected input: show as a constant "?"
      return { ok: false, reason: `Pin "${pin}" on "${comp.id}" (${def.label}) is unconnected. Connect all inputs before generating an expression.` }
    }

    const driverComp = circuit.components.find(c => c.id === wire.from.componentId)
    if (!driverComp) return { ok: false, reason: `Wire source not found.` }

    const childResult = exprFromOutput(circuit, driverComp.id, visited)
    if (!childResult.ok) return childResult
    childExprs.push(childResult.expr)
  }

  if (childExprs.length === 0) {
    return { ok: false, reason: `No inputs found for "${comp.id}" (${def.label}).` }
  }

  switch (comp.type) {
    case 'AND':  return { ok: true, expr: { kind: 'and', children: childExprs } }
    case 'OR':   return { ok: true, expr: { kind: 'or', children: childExprs } }
    case 'NOT':  return { ok: true, expr: { kind: 'not', child: childExprs[0] } }
    case 'NAND': return { ok: true, expr: { kind: 'nand', children: childExprs } }
    case 'NOR':  return { ok: true, expr: { kind: 'nor', children: childExprs } }
    case 'XOR':  return { ok: true, expr: { kind: 'xor', children: childExprs } }
    case 'XNOR': return { ok: true, expr: { kind: 'xnor', children: childExprs } }
    default:
      return { ok: false, reason: `Cannot derive expression for component type "${comp.type}".` }
  }
}
