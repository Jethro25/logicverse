import { registerLesson } from '@/content/lessons'

registerLesson({
  id: 'w3-l1',
  worldId: 'w3',
  title: 'All 7 Logic Gates',
  subtitle: 'AND, OR, NOT, NAND, NOR, XOR, XNOR',
  icon: '🌿',
  xpReward: 50,
  pages: [
    {
      type: 'text',
      heading: 'The complete gate family',
      body: 'You\'ve met AND, OR, and NOT. Now meet the full family:\n\n• **NAND** = NOT AND (output is 0 only when ALL inputs are 1)\n• **NOR** = NOT OR (output is 1 only when ALL inputs are 0)\n• **XOR** = Exclusive OR (output is 1 when inputs DIFFER)\n• **XNOR** = Exclusive NOR (output is 1 when inputs are the SAME)\n\nNAND and NOR are called **universal gates** — any logic function can be built with only NAND (or only NOR).',
    },
    {
      type: 'truth-table-demo',
      heading: 'Complete 2-input gate truth table',
      inputs: ['A', 'B'],
      outputs: ['AND', 'OR', 'NAND', 'NOR', 'XOR', 'XNOR'],
      rows: [
        [0, 0, 0, 0, 1, 1, 0, 1],
        [0, 1, 0, 1, 1, 0, 1, 0],
        [1, 0, 0, 1, 1, 0, 1, 0],
        [1, 1, 1, 1, 0, 0, 0, 1],
      ],
      caption: 'Notice: NAND is the opposite of AND, NOR is the opposite of OR, XNOR is the opposite of XOR.',
    },
    {
      type: 'text',
      heading: 'NAND: The Universal Gate',
      body: 'With only NAND gates, you can build:\n• **NOT**: Connect both inputs together: `NAND(A,A) = NOT A`\n• **AND**: `NAND(A,B)` followed by NOT (another NAND)\n• **OR**: Use De Morgan\'s theorem\n\nThis matters in chip manufacturing — it\'s cheaper and faster to produce a single cell type (like NAND) than a mix of all types.',
    },
    {
      type: 'diagram',
      heading: 'NOT from NAND',
      circuit: {
        components: [
          { id: 's1', type: 'SWITCH', x: 1, y: 4, props: { value: 1 }, label: 'A' },
          { id: 'g1', type: 'NAND', x: 5, y: 3 },
          { id: 'led', type: 'LED', x: 9, y: 3, label: 'NOT A' },
        ],
        wires: [
          { id: 'w1', from: { componentId: 's1', pin: 'out' }, to: { componentId: 'g1', pin: 'a' } },
          { id: 'w2', from: { componentId: 's1', pin: 'out' }, to: { componentId: 'g1', pin: 'b' } },
          { id: 'w3', from: { componentId: 'g1', pin: 'out' }, to: { componentId: 'led', pin: 'in' } },
        ],
      },
      explanation: 'Both NAND inputs tied to A: NAND(A,A) = NOT(A AND A) = NOT A. When A=1, output=0.',
    },
  ],
})

registerLesson({
  id: 'w3-l2',
  worldId: 'w3',
  title: 'Boolean Algebra Basics',
  subtitle: 'The math behind logic',
  icon: '📐',
  xpReward: 50,
  pages: [
    {
      type: 'text',
      heading: 'Boolean algebra',
      body: 'Boolean algebra is the algebra of 0 and 1. It gives us rules for simplifying logic expressions — fewer gates, lower cost, faster circuits.\n\n**Key operations:**\n• AND: `A · B` (also written `AB`)\n• OR: `A + B`\n• NOT: `Ā` (A-bar)\n\n**Basic identities:**\n• `A + 0 = A` (OR with 0)\n• `A · 1 = A` (AND with 1)\n• `A + A = A` (idempotency)\n• `A · Ā = 0` (complement)\n• `A + Ā = 1` (complement)',
    },
    {
      type: 'text',
      heading: 'De Morgan\'s Theorems',
      body: 'De Morgan\'s theorems let you convert between AND and OR forms:\n\n**Theorem 1:** `NOT(A · B) = Ā + B̄`\n"NAND equals OR of NOTs"\n\n**Theorem 2:** `NOT(A + B) = Ā · B̄`\n"NOR equals AND of NOTs"\n\n**How to remember**: Break the bar, change the operator (AND↔OR).\n\nThese are essential for simplification and implementing circuits with only NAND or NOR gates.',
    },
    {
      type: 'example',
      heading: 'Simplification example',
      description: 'Simplify: F = A·B + A·B̄',
      steps: [
        'F = A·B + A·B̄',
        'Factor out A: F = A·(B + B̄)',
        'Apply complement: B + B̄ = 1',
        'F = A·1 = A',
        'Conclusion: F = A (the expression simplifies to just A)',
      ],
    },
  ],
})

registerLesson({
  id: 'w3-l3',
  worldId: 'w3',
  title: 'Implementing Functions with Gates',
  subtitle: 'From truth table to circuit',
  icon: '🔧',
  xpReward: 50,
  pages: [
    {
      type: 'text',
      heading: 'From truth table to Boolean expression',
      body: 'Given a truth table, how do we build the circuit?\n\n**Sum of Products (SOP):** For each row where output = 1:\n1. Write a product term (AND) of the inputs\n2. Use complemented form (Ā) for 0 inputs, normal form (A) for 1 inputs\n3. OR all product terms together\n\nThis gives you the SOP expression, which maps directly to a 2-level AND-OR circuit.',
    },
    {
      type: 'example',
      heading: 'Example: Build F(A,B) = XOR',
      description: 'XOR truth table: (0,0)→0, (0,1)→1, (1,0)→1, (1,1)→0',
      steps: [
        'Row (0,1)→1: product term = Ā·B',
        'Row (1,0)→1: product term = A·B̄',
        'F = Ā·B + A·B̄',
        'This is the SOP expression for XOR',
        'Circuit: two AND gates + one OR gate (plus two NOT gates for inputs)',
      ],
    },
    {
      type: 'diagram',
      heading: 'XOR from basic gates',
      circuit: {
        components: [
          { id: 's1', type: 'SWITCH', x: 0, y: 2, props: { value: 1 }, label: 'A' },
          { id: 's2', type: 'SWITCH', x: 0, y: 8, props: { value: 0 }, label: 'B' },
          { id: 'na', type: 'NOT', x: 3, y: 2 },
          { id: 'nb', type: 'NOT', x: 3, y: 8 },
          { id: 'and1', type: 'AND', x: 6, y: 1 },
          { id: 'and2', type: 'AND', x: 6, y: 7 },
          { id: 'or1', type: 'OR', x: 10, y: 4 },
          { id: 'led', type: 'LED', x: 14, y: 4, label: 'F=A⊕B' },
        ],
        wires: [
          { id: 'w1', from: { componentId: 's1', pin: 'out' }, to: { componentId: 'na', pin: 'a' } },
          { id: 'w2', from: { componentId: 's2', pin: 'out' }, to: { componentId: 'nb', pin: 'a' } },
          { id: 'w3', from: { componentId: 'na', pin: 'out' }, to: { componentId: 'and1', pin: 'a' } },
          { id: 'w4', from: { componentId: 's2', pin: 'out' }, to: { componentId: 'and1', pin: 'b' } },
          { id: 'w5', from: { componentId: 's1', pin: 'out' }, to: { componentId: 'and2', pin: 'a' } },
          { id: 'w6', from: { componentId: 'nb', pin: 'out' }, to: { componentId: 'and2', pin: 'b' } },
          { id: 'w7', from: { componentId: 'and1', pin: 'out' }, to: { componentId: 'or1', pin: 'a' } },
          { id: 'w8', from: { componentId: 'and2', pin: 'out' }, to: { componentId: 'or1', pin: 'b' } },
          { id: 'w9', from: { componentId: 'or1', pin: 'out' }, to: { componentId: 'led', pin: 'in' } },
        ],
      },
      explanation: 'A=1, B=0: NOT A=0, NOT B=1; AND1=0·0=0; AND2=1·1=1; OR=0+1=1. Output=1 ✓',
    },
  ],
})
