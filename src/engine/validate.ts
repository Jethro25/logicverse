import type { Circuit, EvalError } from './types'
import { getComponentDef } from './components/registry'

export function validateCircuit(circuit: Circuit): EvalError[] {
  const errors: EvalError[] = []

  // Map each input pin to the wires driving it (should be at most 1)
  const inputDrivers = new Map<string, string[]>()  // "compId:pin" → wire IDs

  for (const wire of circuit.wires) {
    const fromComp = circuit.components.find(c => c.id === wire.from.componentId)
    const toComp = circuit.components.find(c => c.id === wire.to.componentId)

    if (!fromComp) {
      errors.push({ code: 'UNKNOWN_COMPONENT', wireId: wire.id,
        message: `Wire ${wire.id} references a missing component "${wire.from.componentId}".` })
      continue
    }
    if (!toComp) {
      errors.push({ code: 'UNKNOWN_COMPONENT', wireId: wire.id,
        message: `Wire ${wire.id} references a missing component "${wire.to.componentId}".` })
      continue
    }

    const fromDef = getComponentDef(fromComp.type)
    const toDef = getComponentDef(toComp.type)

    // Validate that "from" pin is an output pin
    const fromOutputs = fromDef.outputPins(fromComp.props)
    if (!fromOutputs.includes(wire.from.pin)) {
      errors.push({ code: 'UNKNOWN_PIN', wireId: wire.id, componentId: fromComp.id,
        message: `Component "${fromComp.id}" (${fromDef.label}) has no output pin named "${wire.from.pin}". Valid outputs: ${fromOutputs.join(', ')}.` })
    }

    // Validate that "to" pin is an input pin
    const toInputs = toDef.inputPins(toComp.props)
    if (!toInputs.includes(wire.to.pin)) {
      errors.push({ code: 'UNKNOWN_PIN', wireId: wire.id, componentId: toComp.id,
        message: `Component "${toComp.id}" (${toDef.label}) has no input pin named "${wire.to.pin}". Valid inputs: ${toInputs.join(', ')}.` })
    }

    // Track multiple drivers
    const toKey = `${wire.to.componentId}:${wire.to.pin}`
    const existing = inputDrivers.get(toKey) ?? []
    existing.push(wire.id)
    inputDrivers.set(toKey, existing)
  }

  // Check for multiple drivers on one input pin
  for (const [key, wires] of inputDrivers) {
    if (wires.length > 1) {
      const [compId, pin] = key.split(':')
      errors.push({
        code: 'MULTIPLE_DRIVERS',
        componentId: compId,
        message: `Pin "${pin}" on component "${compId}" has ${wires.length} wires driving it. Each input pin can only have one driver.`,
      })
    }
  }

  // Check arity
  for (const comp of circuit.components) {
    const def = getComponentDef(comp.type)
    if (def.minInputCount !== undefined || def.maxInputCount !== undefined) {
      const inputCount = typeof comp.props.inputCount === 'number'
        ? comp.props.inputCount
        : def.inputPins(comp.props).length
      if (def.minInputCount !== undefined && inputCount < def.minInputCount) {
        errors.push({ code: 'INVALID_ARITY', componentId: comp.id,
          message: `${def.label} gate needs at least ${def.minInputCount} inputs (has ${inputCount}).` })
      }
      if (def.maxInputCount !== undefined && inputCount > def.maxInputCount) {
        errors.push({ code: 'INVALID_ARITY', componentId: comp.id,
          message: `${def.label} gate supports at most ${def.maxInputCount} inputs (has ${inputCount}).` })
      }
    }
  }

  return errors
}

/** Returns the set of input pins that are unconnected (not necessarily an error, but flagged) */
export function findUnconnectedInputs(circuit: Circuit): Map<string, string[]> {
  const connected = new Set<string>()
  for (const wire of circuit.wires) {
    connected.add(`${wire.to.componentId}:${wire.to.pin}`)
  }

  const unconnected = new Map<string, string[]>()
  for (const comp of circuit.components) {
    const def = getComponentDef(comp.type)
    const inputs = def.inputPins(comp.props)
    for (const pin of inputs) {
      const key = `${comp.id}:${pin}`
      if (!connected.has(key)) {
        const existing = unconnected.get(comp.id) ?? []
        existing.push(pin)
        unconnected.set(comp.id, existing)
      }
    }
  }
  return unconnected
}
