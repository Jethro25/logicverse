import type { Circuit, EvalError } from './types'
import { getComponentDef } from './components/registry'

/**
 * Build a dependency graph and return a topological order.
 * Sequential components (flip-flops) are treated as sources in the graph:
 * their outputs depend only on stored state, not on their current inputs.
 * This lets counters / shift-registers work without being flagged as cycles.
 *
 * Returns { order, cycleIds, cycleError }
 */
export function topologicalSort(circuit: Circuit): {
  order: string[]
  cycleIds: string[]
  cycleError: EvalError | null
} {
  // Map: component ID → set of component IDs whose output it needs
  const deps = new Map<string, Set<string>>()
  for (const comp of circuit.components) {
    deps.set(comp.id, new Set())
  }

  // Build wire map: "toCompId:toPin" → fromCompId
  for (const wire of circuit.wires) {
    const fromComp = circuit.components.find(c => c.id === wire.from.componentId)
    const toComp = circuit.components.find(c => c.id === wire.to.componentId)
    if (!fromComp || !toComp) continue

    // Sequential components act as sources — their output doesn't create a
    // combinational dependency on their input, so we skip those edges.
    const fromDef = getComponentDef(fromComp.type)
    if (fromDef.kind === 'sequential') continue

    // Sinks don't drive anything, so only add deps for the component receiving data
    const existing = deps.get(toComp.id)
    if (existing) existing.add(fromComp.id)
  }

  // Kahn's algorithm
  const inDegree = new Map<string, number>()
  for (const [id, d] of deps) {
    inDegree.set(id, d.size)
  }

  const queue: string[] = []
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id)
  }
  // Sort for determinism
  queue.sort()

  const order: string[] = []
  while (queue.length > 0) {
    queue.sort()
    const node = queue.shift()!
    order.push(node)

    // Find all components that depend on this node
    for (const [id, d] of deps) {
      if (d.has(node)) {
        const newDeg = (inDegree.get(id) ?? 0) - 1
        inDegree.set(id, newDeg)
        if (newDeg === 0) queue.push(id)
      }
    }
  }

  // If not all nodes are in the order, there's a cycle among the remaining ones
  const remaining = circuit.components
    .map(c => c.id)
    .filter(id => !order.includes(id))

  if (remaining.length > 0) {
    return {
      order,
      cycleIds: remaining,
      cycleError: {
        code: 'CYCLE',
        cycleIds: remaining,
        message:
          `A combinational loop was detected among these components: ${remaining.join(', ')}. ` +
          `A circuit cannot output a result that feeds directly back into itself — ` +
          `that would require infinite time to settle. ` +
          `If you need feedback, use a flip-flop or latch instead.`,
      },
    }
  }

  return { order, cycleIds: [], cycleError: null }
}
