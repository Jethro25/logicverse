import { registerLesson } from '@/content/lessons'

registerLesson({
  id: 'w2-l1',
  worldId: 'w2',
  title: 'Binary Numbers',
  subtitle: 'Base-2: counting with two digits',
  icon: '0️⃣',
  xpReward: 50,
  pages: [
    {
      type: 'text',
      heading: 'Counting in base 2',
      body: 'We normally count in **base 10** (decimal): each digit position is a power of 10.\n\n`347` = 3×100 + 4×10 + 7×1\n\nBinary works the same way but with **powers of 2**. Each digit (bit) is either 0 or 1.\n\n`1011₂` = 1×8 + 0×4 + 1×2 + 1×1 = **11₁₀**',
    },
    {
      type: 'truth-table-demo',
      heading: 'Binary place values',
      inputs: ['Bit position (from right)'],
      outputs: ['Place value'],
      rows: [[0, 1], [1, 2], [2, 4], [3, 8], [4, 16], [5, 32], [6, 64], [7, 128]],
      caption: 'Each bit doubles the value of the position to its right.',
    },
    {
      type: 'example',
      heading: 'Decimal → Binary conversion',
      description: 'Convert 45₁₀ to binary using repeated division by 2:',
      steps: [
        '45 ÷ 2 = 22 remainder 1 ← LSB (rightmost)',
        '22 ÷ 2 = 11 remainder 0',
        '11 ÷ 2 = 5  remainder 1',
        '5  ÷ 2 = 2  remainder 1',
        '2  ÷ 2 = 1  remainder 0',
        '1  ÷ 2 = 0  remainder 1 ← MSB (leftmost)',
        'Read remainders bottom-to-top: 45₁₀ = 101101₂',
      ],
    },
    {
      type: 'example',
      heading: 'Binary → Decimal conversion',
      description: 'Convert 101101₂ to decimal:',
      steps: [
        'Write place values: 32, 16, 8, 4, 2, 1',
        'Multiply each bit: 1×32, 0×16, 1×8, 1×4, 0×2, 1×1',
        'Add the results: 32 + 0 + 8 + 4 + 0 + 1',
        '= 45₁₀ ✓',
      ],
    },
  ],
})

registerLesson({
  id: 'w2-l2',
  worldId: 'w2',
  title: 'Octal & Hexadecimal',
  subtitle: 'Shortcuts for long binary strings',
  icon: '🔢',
  xpReward: 50,
  pages: [
    {
      type: 'text',
      heading: 'Why octal and hex?',
      body: 'Binary is great for computers, but long binary strings are hard for humans to read.\n\n`10110111011001₂` — can you read that at a glance?\n\nHexadecimal (base 16) is the solution: **every 4 bits = 1 hex digit**.\n\n`1011 0111 0110 01` → `0010 1101 1101 1001₂` = `2DD9₁₆`\n\nOctal (base 8) is also used, especially in Unix file permissions.',
    },
    {
      type: 'truth-table-demo',
      heading: 'Hex digit reference',
      inputs: ['Decimal'],
      outputs: ['Binary (4-bit)', 'Hex'],
      rows: [
        [0, 0, 0], [1, 1, 1], [2, 10, 2], [3, 11, 3],
        [4, 100, 4], [5, 101, 5], [6, 110, 6], [7, 111, 7],
        [8, 1000, 8], [9, 1001, 9], [10, 1010, 10],
        [11, 1011, 11], [12, 1100, 12], [13, 1101, 13],
        [14, 1110, 14], [15, 1111, 15],
      ],
      caption: 'Values 10–15 are represented as A–F in hexadecimal.',
    },
    {
      type: 'example',
      heading: 'Binary ↔ Hex conversion',
      description: 'Group binary digits in sets of 4 (right to left), then convert each group:',
      steps: [
        'Binary: 1010 1111 0011 0101',
        '1010 = A₁₆',
        '1111 = F₁₆',
        '0011 = 3₁₆',
        '0101 = 5₁₆',
        'Result: AF35₁₆',
      ],
    },
  ],
})

registerLesson({
  id: 'w2-l3',
  worldId: 'w2',
  title: '1\'s and 2\'s Complement',
  subtitle: 'How computers handle negative numbers',
  icon: '➖',
  xpReward: 50,
  pages: [
    {
      type: 'text',
      heading: 'The problem with negative numbers',
      body: 'Computers only store 0s and 1s — how do we represent −5?\n\nThe standard answer: **two\'s complement**. It lets us add and subtract numbers using the same circuit, with no special cases.\n\nFor an n-bit number:\n• **Positive range**: 0 to 2ⁿ⁻¹ − 1\n• **Negative range**: −2ⁿ⁻¹ to −1',
    },
    {
      type: 'example',
      heading: '1\'s complement of 00101010',
      description: 'Flip every bit (0→1, 1→0):',
      steps: [
        'Original:  0 0 1 0 1 0 1 0',
        'Flip each: 1 1 0 1 0 1 0 1',
        '1\'s complement = 11010101',
      ],
    },
    {
      type: 'example',
      heading: '2\'s complement of 00101010',
      description: '2\'s complement = 1\'s complement + 1',
      steps: [
        '1\'s complement: 11010101',
        'Add 1:          11010101 + 1',
        '2\'s complement: 11010110',
        'Verification: 00101010 + 11010110 = 100000000 (9 bits, drop carry) = 00000000 ✓',
      ],
    },
    {
      type: 'text',
      heading: 'Quick method for 2\'s complement',
      body: 'You don\'t always need to flip then add. There\'s a shortcut:\n\n**Copy bits from right to left up to and including the first 1, then flip all remaining bits.**\n\nExample: `00101010`\n1. Copy from right: `0` (flip), `1` (copy this and stop) → `10`\n2. Flip remaining: `0 0 1 0 1` → `1 1 0 1 0`\n3. Result: `1 1 0 1 0 1 1 0` = `11010110` ✓',
    },
  ],
})

registerLesson({
  id: 'w2-l4',
  worldId: 'w2',
  title: 'BCD and Gray Code',
  subtitle: 'Special binary encodings',
  icon: '📟',
  xpReward: 50,
  pages: [
    {
      type: 'text',
      heading: 'BCD: Binary Coded Decimal',
      body: 'BCD stores **each decimal digit separately** as a 4-bit binary number.\n\nSo 47 in BCD is: **0100 0111** (4 = 0100, 7 = 0111)\n\nThis makes decimal displays easy — each group of 4 bits drives one digit of a 7-segment display. Calculators use BCD internally to avoid rounding errors.',
    },
    {
      type: 'truth-table-demo',
      heading: 'BCD encoding',
      inputs: ['Decimal digit'],
      outputs: ['BCD (4-bit)'],
      rows: [
        [0, 0], [1, 1], [2, 10], [3, 11], [4, 100],
        [5, 101], [6, 110], [7, 111], [8, 1000], [9, 1001],
      ],
      caption: 'Only values 0000–1001 are valid BCD. Codes 1010–1111 are invalid.',
    },
    {
      type: 'text',
      heading: 'Gray Code: Only one bit changes',
      body: 'In Gray code, adjacent numbers differ by **exactly one bit**.\n\nWhy does this matter? Imagine a shaft encoder that reads position: if two bits change at once and the sensor reads between states, you get a wrong value. Gray code eliminates this glitch.\n\nUsed in: shaft encoders, error correction, K-maps.',
    },
    {
      type: 'truth-table-demo',
      heading: 'Binary vs Gray Code',
      inputs: ['Decimal'],
      outputs: ['Binary', 'Gray Code'],
      rows: [
        [0, 0, 0], [1, 1, 1], [2, 10, 11], [3, 11, 10],
        [4, 100, 110], [5, 101, 111], [6, 110, 101], [7, 111, 100],
      ],
      caption: 'Compare adjacent Gray code rows — exactly 1 bit changes each time.',
    },
    {
      type: 'example',
      heading: 'Binary to Gray Code conversion',
      description: 'Rule: MSB stays the same; each subsequent bit = previous binary XOR current binary.',
      steps: [
        'Binary:    1 0 1 1 0',
        'Gray MSB:  1 (copy)',
        'G₁ = B₀ XOR B₁ = 1 XOR 0 = 1',
        'G₂ = B₁ XOR B₂ = 0 XOR 1 = 1',
        'G₃ = B₂ XOR B₃ = 1 XOR 1 = 0',
        'G₄ = B₃ XOR B₄ = 1 XOR 0 = 1',
        'Gray Code: 1 1 1 0 1',
      ],
    },
  ],
})

registerLesson({
  id: 'w2-l5',
  worldId: 'w2',
  title: 'Arithmetic with Binary',
  subtitle: 'Addition, subtraction, and overflow',
  icon: '➕',
  xpReward: 50,
  pages: [
    {
      type: 'text',
      heading: 'Binary addition',
      body: 'Binary addition follows the same rules as decimal, just with base 2:\n\n• 0 + 0 = 0\n• 0 + 1 = 1\n• 1 + 0 = 1\n• 1 + 1 = 10 (0 carry 1)\n• 1 + 1 + 1 = 11 (1 carry 1)',
    },
    {
      type: 'example',
      heading: 'Example: 1011 + 0110',
      description: 'Add bit by bit, right to left, carrying as needed:',
      steps: [
        '  1 0 1 1  (11 decimal)',
        '+ 0 1 1 0  ( 6 decimal)',
        '─────────',
        'Bit 0: 1+0 = 1, carry=0',
        'Bit 1: 1+1 = 0, carry=1',
        'Bit 2: 0+1+carry(1) = 0, carry=1',
        'Bit 3: 1+0+carry(1) = 0, carry=1',
        'Bit 4: carry=1 (new bit)',
        'Result: 1 0 0 0 1 = 17 ✓ (11+6=17)',
      ],
    },
    {
      type: 'text',
      heading: 'Subtraction via 2\'s complement',
      body: 'To subtract A − B, computers calculate **A + (2\'s complement of B)**.\n\nThis lets the ALU use the same adder circuit for both addition and subtraction.\n\n`5 − 3 = 5 + (−3)`\n\nIn 4-bit 2\'s complement:\n`0101 + 1101 = 1 0010` → drop carry → `0010` = 2 ✓',
    },
  ],
})
