import { registerPuzzle } from '@/content/puzzles'

registerPuzzle({
  id: 'w3-p1',
  worldId: 'w3',
  title: 'NAND: Not So Fast',
  subtitle: 'Complete the NAND truth table',
  icon: '⊼',
  xpReward: 30,
  difficulty: 1,
  concept: 'NAND = NOT(AND). Output is 0 only when ALL inputs are 1.',
  data: { mechanic: 'truth-table', gate: 'NAND', numInputs: 2 },
  hints: [
    'NAND is the opposite of AND.',
    'Start with the AND truth table and flip all outputs.',
    'NAND(1,1) = NOT(1) = 0; all other combinations give 1.',
  ],
  stars: { star3: { maxAttempts: 1, maxHints: 0 }, star2: { maxAttempts: 2, maxHints: 0 } },
})

registerPuzzle({
  id: 'w3-p2',
  worldId: 'w3',
  title: 'NOR: The Quiet Gate',
  subtitle: 'Complete the NOR truth table',
  icon: '⊽',
  xpReward: 30,
  difficulty: 1,
  concept: 'NOR = NOT(OR). Output is 1 only when ALL inputs are 0.',
  data: { mechanic: 'truth-table', gate: 'NOR', numInputs: 2 },
  hints: [
    'NOR is the opposite of OR.',
    'Start with the OR truth table and flip all outputs.',
    'Only NOR(0,0) = 1; all other combinations give 0.',
  ],
  stars: { star3: { maxAttempts: 1, maxHints: 0 }, star2: { maxAttempts: 2, maxHints: 0 } },
})

registerPuzzle({
  id: 'w3-p3',
  worldId: 'w3',
  title: 'XNOR: Equality Check',
  subtitle: 'Complete the XNOR truth table',
  icon: '⊙',
  xpReward: 30,
  difficulty: 1,
  concept: 'XNOR = NOT(XOR). Output is 1 when both inputs are the SAME.',
  data: { mechanic: 'truth-table', gate: 'XNOR', numInputs: 2 },
  hints: [
    'XNOR checks equality: output 1 when A equals B.',
    'XNOR(0,0)=1, XNOR(1,1)=1 (same = true)',
    'XNOR(0,1)=0, XNOR(1,0)=0 (different = false)',
  ],
  stars: { star3: { maxAttempts: 1, maxHints: 0 }, star2: { maxAttempts: 2, maxHints: 0 } },
})

registerPuzzle({
  id: 'w3-p4',
  worldId: 'w3',
  title: 'Gate Identifier',
  subtitle: 'Which gate has output 0 only when ALL inputs are 1?',
  icon: '🎯',
  xpReward: 35,
  difficulty: 1,
  concept: 'Each gate has a unique "personality" — learn to identify them by their output pattern.',
  data: {
    mechanic: 'gate-selector',
    prompt: 'Which gate produces output 0 ONLY when all inputs are 1?',
    options: ['NAND', 'AND', 'NOR', 'XOR'],
    answer: 'NAND',
    showTruthTable: true,
  },
  hints: ['This is the opposite of AND.', 'NAND = NOT AND.'],
  stars: { star3: { maxAttempts: 1, maxHints: 0 }, star2: { maxAttempts: 2, maxHints: 1 } },
})

registerPuzzle({
  id: 'w3-p5',
  worldId: 'w3',
  title: 'Build a NOT from NAND',
  subtitle: 'NAND is universal',
  icon: '🔧',
  xpReward: 60,
  difficulty: 2,
  concept: 'A NAND gate with both inputs connected to the same signal acts as a NOT gate.',
  data: {
    mechanic: 'circuit-build',
    description: 'Build a NOT gate using only one NAND gate and a SWITCH. The LED should output NOT A.',
    constraints: { allowedTypes: ['SWITCH', 'NAND', 'LED'] },
    truthTable: {
      inputs: ['A'],
      outputs: ['F'],
      rows: [[0, 1], [1, 0]],
    },
  },
  hints: [
    'Connect both NAND inputs to the same switch.',
    'NAND(A, A) = NOT(A AND A) = NOT A.',
  ],
  stars: { star3: { maxAttempts: 1, maxHints: 0 }, star2: { maxAttempts: 3, maxHints: 1 } },
})

registerPuzzle({
  id: 'w3-p6',
  worldId: 'w3',
  title: 'AND from NAND',
  subtitle: 'Two NANDs make an AND',
  icon: '🔧',
  xpReward: 60,
  difficulty: 2,
  concept: 'AND = NAND then NOT. Use two NAND gates: first NAND(A,B), then NAND the result with itself.',
  data: {
    mechanic: 'circuit-build',
    description: 'Build an AND gate using only NAND gates. The LED should output A AND B.',
    constraints: { allowedTypes: ['SWITCH', 'NAND', 'LED'], maxComponents: 5 },
    truthTable: {
      inputs: ['A', 'B'],
      outputs: ['F'],
      rows: [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 1]],
    },
  },
  hints: [
    'Step 1: NAND(A, B) gives NOT(AND(A,B))',
    'Step 2: NOT of the previous output = AND(A, B)',
    'To NOT a NAND output: connect both inputs of a second NAND together.',
  ],
  stars: { star3: { maxAttempts: 1, maxHints: 0 }, star2: { maxAttempts: 4, maxHints: 2 } },
})

registerPuzzle({
  id: 'w3-p7',
  worldId: 'w3',
  title: 'De Morgan: NAND to OR',
  subtitle: 'Prove De Morgan\'s first theorem',
  icon: '📐',
  xpReward: 50,
  difficulty: 2,
  concept: 'De Morgan #1: NOT(A·B) = Ā + B̄. A NAND gate equals an OR gate with inverted inputs.',
  data: {
    mechanic: 'truth-table',
    gate: 'NAND',
    numInputs: 2,
  },
  hints: [
    'Fill in the NAND truth table.',
    'Compare with: OR gate where both inputs are NOTted (Ā + B̄).',
    'They should be identical — that\'s De Morgan\'s theorem!',
  ],
  stars: { star3: { maxAttempts: 1, maxHints: 0 }, star2: { maxAttempts: 2, maxHints: 1 } },
})

registerPuzzle({
  id: 'w3-p8',
  worldId: 'w3',
  title: '3-Input AND Gate',
  subtitle: 'Gates can have more than 2 inputs',
  icon: '🔩',
  xpReward: 40,
  difficulty: 2,
  concept: 'A 3-input AND gate outputs 1 only when A=1 AND B=1 AND C=1.',
  data: {
    mechanic: 'truth-table',
    gate: 'AND',
    numInputs: 3,
  },
  hints: [
    'A 3-input AND has 2³ = 8 rows.',
    'Only the last row (A=B=C=1) gives output 1.',
    'All others give 0.',
  ],
  stars: { star3: { maxAttempts: 1, maxHints: 0 }, star2: { maxAttempts: 2, maxHints: 1 } },
})
