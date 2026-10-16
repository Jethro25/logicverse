import { registerPuzzle } from '@/content/puzzles'

// ── Number conversion puzzles ──────────────────────────────────────────────

registerPuzzle({
  id: 'w2-p1',
  worldId: 'w2',
  title: 'Binary to Decimal',
  subtitle: 'Convert your first binary number',
  icon: '0️⃣',
  xpReward: 30,
  difficulty: 1,
  concept: 'Binary uses powers of 2. Sum up the positions where a bit is 1.',
  data: {
    mechanic: 'number-convert',
    value: 0b01011010,
    fromBase: 2,
    toBase: 10,
    bits: 8,
    showSteps: true,
  },
  hints: [
    'Write out the place values: 128, 64, 32, 16, 8, 4, 2, 1',
    'Multiply each bit by its place value',
    '0×128 + 1×64 + 0×32 + 1×16 + 1×8 + 0×4 + 1×2 + 0×1',
    '= 64 + 16 + 8 + 2 = ?',
  ],
  stars: { star3: { maxAttempts: 1, maxHints: 0 }, star2: { maxAttempts: 2, maxHints: 1 } },
})

registerPuzzle({
  id: 'w2-p2',
  worldId: 'w2',
  title: 'Decimal to Binary',
  subtitle: 'Divide and conquer',
  icon: '🔄',
  xpReward: 30,
  difficulty: 1,
  concept: 'Divide by 2 repeatedly. Read remainders from bottom to top.',
  data: {
    mechanic: 'number-convert',
    value: 45,
    fromBase: 10,
    toBase: 2,
    bits: 8,
    showSteps: true,
  },
  hints: [
    '45 ÷ 2 = 22 remainder 1 (LSB)',
    '22 ÷ 2 = 11 remainder 0',
    '11 ÷ 2 = 5  remainder 1',
    '5  ÷ 2 = 2  remainder 1',
    '2  ÷ 2 = 1  remainder 0',
    '1  ÷ 2 = 0  remainder 1 (MSB)',
    'Read bottom to top: 101101',
  ],
  stars: { star3: { maxAttempts: 1, maxHints: 0 }, star2: { maxAttempts: 3, maxHints: 2 } },
})

registerPuzzle({
  id: 'w2-p3',
  worldId: 'w2',
  title: 'Binary to Hex',
  subtitle: 'Group by fours',
  icon: '🔷',
  xpReward: 35,
  difficulty: 1,
  concept: 'Every 4 binary bits = 1 hex digit. Group from the right.',
  data: {
    mechanic: 'number-convert',
    value: 0b10110111,
    fromBase: 2,
    toBase: 16,
    bits: 8,
  },
  hints: [
    'Split 10110111 into groups of 4: 1011 | 0111',
    '1011 in decimal = 11 = B in hex',
    '0111 in decimal = 7',
    'Answer: B7₁₆',
  ],
  stars: { star3: { maxAttempts: 1, maxHints: 0 }, star2: { maxAttempts: 2, maxHints: 1 } },
})

registerPuzzle({
  id: 'w2-p4',
  worldId: 'w2',
  title: 'Hex to Binary',
  subtitle: 'Expand each digit',
  icon: '🔷',
  xpReward: 35,
  difficulty: 1,
  concept: 'Each hex digit expands to exactly 4 binary bits.',
  data: {
    mechanic: 'number-convert',
    value: 0x3F,
    fromBase: 16,
    toBase: 2,
    bits: 8,
  },
  hints: [
    '3F₁₆: expand each digit to 4 bits',
    '3 = 0011',
    'F = 1111',
    'Answer: 00111111₂',
  ],
  stars: { star3: { maxAttempts: 1, maxHints: 0 }, star2: { maxAttempts: 2, maxHints: 1 } },
})

registerPuzzle({
  id: 'w2-p5',
  worldId: 'w2',
  title: '1\'s Complement',
  subtitle: 'Flip every bit',
  icon: '🔃',
  xpReward: 40,
  difficulty: 2,
  concept: '1\'s complement: invert all bits (0→1, 1→0).',
  data: {
    mechanic: 'complement',
    binary: '01011010',
    type: '1s',
    bits: 8,
  },
  hints: [
    'Flip every single bit.',
    '0→1, 1→0 for each of the 8 positions.',
    '01011010 → 10100101',
  ],
  stars: { star3: { maxAttempts: 1, maxHints: 0 }, star2: { maxAttempts: 2, maxHints: 0 } },
})

registerPuzzle({
  id: 'w2-p6',
  worldId: 'w2',
  title: '2\'s Complement',
  subtitle: 'The negative number trick',
  icon: '➖',
  xpReward: 50,
  difficulty: 2,
  concept: '2\'s complement = 1\'s complement + 1. Used to represent negative numbers.',
  data: {
    mechanic: 'complement',
    binary: '00110101',
    type: '2s',
    bits: 8,
  },
  hints: [
    'Step 1: Find the 1\'s complement (flip all bits).',
    '00110101 → 11001010',
    'Step 2: Add 1 to the result.',
    '11001010 + 1 = 11001011',
  ],
  stars: { star3: { maxAttempts: 1, maxHints: 0 }, star2: { maxAttempts: 3, maxHints: 1 } },
})

registerPuzzle({
  id: 'w2-p7',
  worldId: 'w2',
  title: 'BCD Encoding',
  subtitle: 'Decimal digit by digit',
  icon: '📟',
  xpReward: 40,
  difficulty: 2,
  concept: 'BCD: each decimal digit (0–9) gets its own 4-bit binary code.',
  data: {
    mechanic: 'code-convert',
    fromCode: 'BINARY',
    toCode: 'BCD',
    values: [3, 7, 9],
  },
  hints: [
    'Encode each digit 0–9 as its 4-bit binary equivalent.',
    '3 = 0011, 7 = 0111, 9 = 1001',
    'BCD only uses patterns 0000–1001 (values 10–15 are invalid in BCD)',
  ],
  stars: { star3: { maxAttempts: 1, maxHints: 0 }, star2: { maxAttempts: 2, maxHints: 1 } },
})

registerPuzzle({
  id: 'w2-p8',
  worldId: 'w2',
  title: 'Binary to Gray Code',
  subtitle: 'One-bit-at-a-time change',
  icon: '🔢',
  xpReward: 50,
  difficulty: 2,
  concept: 'Gray code: adjacent values differ by exactly 1 bit. MSB copies; each next Gray bit = previous binary XOR current binary.',
  data: {
    mechanic: 'code-convert',
    fromCode: 'BINARY',
    toCode: 'GRAY',
    values: [0, 1, 2, 3, 4, 5, 6, 7],
  },
  hints: [
    'Gray MSB = Binary MSB (copy it).',
    'Each subsequent Gray bit = previous binary bit XOR current binary bit.',
    'For 0110: G₀=0, G₁=0 XOR 1=1, G₂=1 XOR 1=0, G₃=1 XOR 0=1 → 0101',
  ],
  stars: { star3: { maxAttempts: 1, maxHints: 0 }, star2: { maxAttempts: 3, maxHints: 2 } },
})

registerPuzzle({
  id: 'w2-p9',
  worldId: 'w2',
  title: 'Octal Challenge',
  subtitle: 'Base-8 quick conversion',
  icon: '8️⃣',
  xpReward: 45,
  difficulty: 2,
  concept: 'Octal uses digits 0–7. Group binary by 3 bits.',
  data: {
    mechanic: 'number-convert',
    value: 0b010110111,
    fromBase: 2,
    toBase: 8,
    bits: 9,
  },
  hints: [
    'Group bits into triples from the right: 010 | 110 | 111',
    '010 = 2, 110 = 6, 111 = 7',
    'Answer: 267₈',
  ],
  stars: { star3: { maxAttempts: 1, maxHints: 0 }, star2: { maxAttempts: 2, maxHints: 1 } },
})
