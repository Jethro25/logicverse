import { registerPuzzle } from '@/content/puzzles'

registerPuzzle({
  id: 'w1-p1',
  worldId: 'w1',
  title: 'The AND Truth',
  subtitle: 'Fill in the AND gate\'s truth table',
  icon: '🔩',
  xpReward: 30,
  difficulty: 1,
  concept: 'The AND gate outputs 1 ONLY when ALL inputs are 1.',
  data: {
    mechanic: 'truth-table',
    gate: 'AND',
    numInputs: 2,
  },
  hints: [
    'Think "both switches must be ON".',
    'If either input is 0, the output is 0.',
    'Only A=1 AND B=1 gives output 1.',
  ],
  stars: { star3: { maxAttempts: 1, maxHints: 0 }, star2: { maxAttempts: 3, maxHints: 1 } },
})

registerPuzzle({
  id: 'w1-p2',
  worldId: 'w1',
  title: 'The OR Choice',
  subtitle: 'Fill in the OR gate\'s truth table',
  icon: '🔀',
  xpReward: 30,
  difficulty: 1,
  concept: 'The OR gate outputs 1 when AT LEAST ONE input is 1.',
  data: {
    mechanic: 'truth-table',
    gate: 'OR',
    numInputs: 2,
  },
  hints: [
    'Output is 0 only when BOTH inputs are 0.',
    'OR is like "inclusive or" — either OR both.',
    'Check: does A=0, B=1 give 0 or 1?',
  ],
  stars: { star3: { maxAttempts: 1, maxHints: 0 }, star2: { maxAttempts: 3, maxHints: 1 } },
})

registerPuzzle({
  id: 'w1-p3',
  worldId: 'w1',
  title: 'The NOT Flip',
  subtitle: 'The inverter always flips',
  icon: '🔄',
  xpReward: 30,
  difficulty: 1,
  concept: 'The NOT gate (inverter) flips its input: 0→1, 1→0.',
  data: {
    mechanic: 'truth-table',
    gate: 'NOT',
    numInputs: 1,
  },
  hints: [
    'NOT has only one input.',
    'The output is ALWAYS the opposite of the input.',
  ],
  stars: { star3: { maxAttempts: 1, maxHints: 0 }, star2: { maxAttempts: 2, maxHints: 0 } },
})

registerPuzzle({
  id: 'w1-p4',
  worldId: 'w1',
  title: 'Gate Name Game',
  subtitle: 'Match the description to the gate',
  icon: '🎯',
  xpReward: 40,
  difficulty: 1,
  concept: 'Every gate has a distinct behavior — learn to recognize them by what they do.',
  data: {
    mechanic: 'gate-selector',
    prompt: 'Which gate outputs 1 ONLY when ALL inputs are 1?',
    options: ['AND', 'OR', 'NOT', 'NAND'],
    answer: 'AND',
    showTruthTable: true,
  },
  hints: [
    'Think about what "AND" means in English.',
    'All conditions must be true.',
  ],
  stars: { star3: { maxAttempts: 1, maxHints: 0 }, star2: { maxAttempts: 2, maxHints: 1 } },
})

registerPuzzle({
  id: 'w1-p5',
  worldId: 'w1',
  title: 'Exclusive OR — What\'s Different?',
  subtitle: 'Meet the XOR gate',
  icon: '⊕',
  xpReward: 50,
  difficulty: 2,
  concept: 'XOR outputs 1 only when inputs are DIFFERENT (not both the same).',
  data: {
    mechanic: 'truth-table',
    gate: 'XOR',
    numInputs: 2,
  },
  hints: [
    'XOR = "one or the other but NOT both".',
    'When A=B (both 0 or both 1), output is 0.',
    'When inputs differ, output is 1.',
  ],
  stars: { star3: { maxAttempts: 1, maxHints: 0 }, star2: { maxAttempts: 3, maxHints: 1 } },
})
